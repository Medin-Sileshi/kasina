import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createAuth } from "../auth";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import { unwrapAuthUser } from "../lib/auth-signup";
import { clientKey, rateLimit } from "../lib/rate-limit";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

const signupSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  accessCode: z.string().min(1).max(64),
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

  const secret = c.env.TEACHER_SIGNUP_SECRET;
  if (!secret) {
    return c.json(
      { error: "Teacher signup is not configured on this server." },
      503,
    );
  }

  const body = c.req.valid("json");
  if (body.accessCode.trim() !== secret) {
    return c.json({ error: "Invalid teacher access code." }, 403);
  }

  const auth = createAuth(c.env);
  const db = createDb(c.env);

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

    const { error: roleErr } = await db
      .from("user")
      .update({ role: "teacher" })
      .eq("id", userId);
    if (roleErr) return c.json({ error: roleErr.message }, 500);

    const res = c.json({
      user: { id: userId, email: body.email, name: body.name, role: "teacher" },
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
