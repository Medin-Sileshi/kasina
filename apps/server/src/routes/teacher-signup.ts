import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createAuth } from "../auth";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import { unwrapAuthUser } from "../lib/auth-signup";
import { clientKey, rateLimit } from "../lib/rate-limit";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

const signupSchema = z
  .object({
    name: z.string().min(1).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    phone: z.string().min(7).max(32).optional(),
    /** Per-school teacher invite code */
    schoolInviteCode: z.string().min(1).max(64).optional(),
    /** Alias for schoolInviteCode, or TEACHER_SIGNUP_SECRET override */
    accessCode: z.string().min(1).max(64).optional(),
    /** Required when using TEACHER_SIGNUP_SECRET unless a verified school exists */
    schoolId: z.string().min(1).optional(),
  })
  .refine((b) => Boolean(b.schoolInviteCode?.trim() || b.accessCode?.trim()), {
    message: "schoolInviteCode or accessCode is required",
    path: ["schoolInviteCode"],
  });

export const teacherSignupApp = new Hono<HonoEnv>();

teacherSignupApp.post("/", zValidator("json", signupSchema), async (c) => {
  const rl = rateLimit({
    key: `teacher-signup:${clientKey(c)}`,
    limit: 10,
    windowMs: 60 * 60_000,
  });
  if (!rl.ok) {
    return c.json(
      { error: `Too many signup attempts. Try again in ${rl.retryAfterSec}s.` },
      429,
    );
  }

  const body = c.req.valid("json");
  const code = (body.schoolInviteCode ?? body.accessCode ?? "").trim();
  const secret = c.env.TEACHER_SIGNUP_SECRET?.trim();
  const db = createDb(c.env);

  let schoolId: string | null = null;
  let usedAdminOverride = false;

  if (secret && code === secret) {
    usedAdminOverride = true;
    if (body.schoolId) {
      const { data: school } = await db
        .from("schools")
        .select("id")
        .eq("id", body.schoolId)
        .maybeSingle();
      if (!school) return c.json({ error: "School not found" }, 404);
      schoolId = school.id;
    } else {
      const { data: verified } = await db
        .from("schools")
        .select("id")
        .eq("verified", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (!verified) {
        return c.json(
          {
            error:
              "Admin override requires schoolId when no verified school exists.",
          },
          400,
        );
      }
      schoolId = verified.id;
    }
  } else {
    const { data: school, error } = await db
      .from("schools")
      .select("id, teacher_invite_code")
      .ilike("teacher_invite_code", code)
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    if (!school) {
      return c.json({ error: "Invalid teacher invite code." }, 403);
    }
    schoolId = school.id;
  }

  const auth = createAuth(c.env);

  try {
    const signUp = await auth.api.signUpEmail({
      body: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
      headers: c.req.raw.headers,
      asResponse: false,
      returnHeaders: true,
    });
    const { userId, headers } = unwrapAuthUser(signUp);

    const phone = body.phone?.trim() || null;
    const { error: roleErr } = await db
      .from("user")
      .update({
        role: "teacher",
        approval_status: "pending",
        school_id: schoolId,
        ...(phone ? { phone } : {}),
      })
      .eq("id", userId);
    if (roleErr) return c.json({ error: roleErr.message }, 500);

    const { error: reqErr } = await db.from("signup_requests").insert({
      id: randomUUID(),
      user_id: userId,
      role: "teacher",
      name: body.name,
      phone: phone ?? body.email,
      email: body.email,
      school_id: schoolId,
      status: "pending",
    });
    if (reqErr) return c.json({ error: reqErr.message }, 500);

    const res = c.json({
      user: {
        id: userId,
        email: body.email,
        name: body.name,
        role: "teacher" as const,
        approvalStatus: "pending" as const,
        schoolId,
        phone,
      },
      pendingApproval: true,
      usedAdminOverride,
    });
    if (headers) {
      for (const [key, value] of headers.entries()) {
        if (key.toLowerCase() === "set-cookie") {
          res.headers.append("set-cookie", value);
        }
      }
    }
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Sign up failed";
    if (/already exists|duplicate/i.test(message)) {
      return c.json({ error: "An account with this email already exists." }, 409);
    }
    return c.json({ error: message }, 400);
  }
});
