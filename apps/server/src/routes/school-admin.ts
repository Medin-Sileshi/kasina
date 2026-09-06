import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import {
  createInvitedUser,
  writeRosterAudit,
} from "../lib/invite-user";
import { isAuthUser, requireSchoolAdmin } from "../lib/auth-user";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

const teacherSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(7).max(32),
});

export const schoolAdminApp = new Hono<HonoEnv>();

schoolAdminApp.get("/me", async (c) => {
  const admin = await requireSchoolAdmin(c);
  if (!isAuthUser(admin)) return admin;
  const db = createDb(c.env);
  const { data: school } = await db
    .from("schools")
    .select("id, name, sub_city, woreda, region, school_type, verified")
    .eq("id", admin.schoolId!)
    .maybeSingle();
  return c.json({
    user: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      schoolId: admin.schoolId,
    },
    school: school
      ? {
          id: school.id,
          name: school.name,
          subCity: school.sub_city,
          woreda: school.woreda,
          region: school.region,
          schoolType: school.school_type,
          verified: school.verified,
        }
      : null,
  });
});

schoolAdminApp.get("/teachers", async (c) => {
  const admin = await requireSchoolAdmin(c);
  if (!isAuthUser(admin)) return admin;
  const db = createDb(c.env);
  const { data, error } = await db
    .from("user")
    .select("id, name, phone, email, approval_status, createdAt")
    .eq("school_id", admin.schoolId!)
    .eq("role", "teacher")
    .order("createdAt", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);
  return c.json({
    teachers: (data ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      phone: t.phone,
      email: t.email,
      approvalStatus: t.approval_status,
      createdAt: t.createdAt,
    })),
  });
});

schoolAdminApp.post(
  "/teachers",
  zValidator("json", teacherSchema),
  async (c) => {
    const admin = await requireSchoolAdmin(c);
    if (!isAuthUser(admin)) return admin;
    const body = c.req.valid("json");
    const db = createDb(c.env);
    const schoolId = admin.schoolId!;

    try {
      const result = await createInvitedUser(db, c.env, {
        name: body.name,
        phone: body.phone,
        role: "teacher",
        schoolId,
      });

      if (!result.created) {
        const { data: existing } = await db
          .from("user")
          .select("id, role, school_id, approval_status")
          .eq("id", result.userId)
          .maybeSingle();
        if (existing?.school_id && existing.school_id !== schoolId) {
          return c.json(
            { error: "This phone is already registered to another school." },
            409,
          );
        }
        if (
          existing &&
          existing.role !== "teacher" &&
          existing.role !== "school_admin" &&
          existing.role !== "admin"
        ) {
          await db
            .from("user")
            .update({
              role: "teacher",
              school_id: schoolId,
              approval_status:
                existing.approval_status === "approved"
                  ? "approved"
                  : "invited",
            })
            .eq("id", existing.id);
        }
      }

      await writeRosterAudit(db, {
        actorUserId: admin.id,
        actorRole: "school_admin",
        schoolId,
        action: "teacher_rostered",
        targetUserId: result.userId,
        meta: { phone: result.phone, created: result.created },
      });

      return c.json({
        teacher: {
          id: result.userId,
          phone: result.phone,
          created: result.created,
          approvalStatus: "invited",
        },
      });
    } catch (err) {
      return c.json(
        {
          error: err instanceof Error ? err.message : "Could not add teacher",
        },
        400,
      );
    }
  },
);
