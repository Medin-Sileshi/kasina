import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import { isAuthUser, requireAdmin } from "../lib/auth-user";
import { sendSms } from "../lib/sms";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

const notesSchema = z.object({
  notes: z.string().max(2000).optional(),
});

async function writeAudit(
  db: ReturnType<typeof createDb>,
  opts: {
    adminId: string;
    action: string;
    targetUserId?: string | null;
    signupRequestId?: string | null;
    meta?: Record<string, unknown>;
  },
) {
  await db.from("admin_audit_log").insert({
    id: randomUUID(),
    admin_id: opts.adminId,
    action: opts.action,
    target_user_id: opts.targetUserId ?? null,
    signup_request_id: opts.signupRequestId ?? null,
    meta_json: opts.meta ?? null,
  });
}

export const adminApp = new Hono<HonoEnv>();

adminApp.use("*", async (c, next) => {
  const admin = await requireAdmin(c);
  if (!isAuthUser(admin)) return admin;
  c.set("user", {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
  await next();
});

adminApp.get("/overview", async (c) => {
  const db = createDb(c.env);

  const { data: schools, error: sErr } = await db
    .from("schools")
    .select("id, name")
    .order("name", { ascending: true });
  if (sErr) return c.json({ error: sErr.message }, 500);

  const { data: users, error: uErr } = await db
    .from("user")
    .select("id, school_id, approval_status");
  if (uErr) return c.json({ error: uErr.message }, 500);

  const bySchool = new Map<
    string,
    { schoolId: string; schoolName: string; approved: number; pending: number; rejected: number; revoked: number }
  >();

  for (const s of schools ?? []) {
    bySchool.set(s.id, {
      schoolId: s.id,
      schoolName: s.name,
      approved: 0,
      pending: 0,
      rejected: 0,
      revoked: 0,
    });
  }

  let unassigned = { approved: 0, pending: 0, rejected: 0, revoked: 0 };

  for (const u of users ?? []) {
    const status = (u.approval_status ?? "approved") as
      | "approved"
      | "pending"
      | "rejected"
      | "revoked";
    if (!u.school_id || !bySchool.has(u.school_id)) {
      unassigned[status] = (unassigned[status] ?? 0) + 1;
      continue;
    }
    const row = bySchool.get(u.school_id)!;
    row[status] += 1;
  }

  return c.json({
    bySchool: [...bySchool.values()],
    unassigned,
    totals: {
      approved: (users ?? []).filter((u) => u.approval_status === "approved").length,
      pending: (users ?? []).filter((u) => u.approval_status === "pending").length,
      rejected: (users ?? []).filter((u) => u.approval_status === "rejected").length,
      revoked: (users ?? []).filter((u) => u.approval_status === "revoked").length,
    },
  });
});

adminApp.get("/signup-requests", async (c) => {
  const db = createDb(c.env);
  const status = c.req.query("status") ?? "pending";

  let query = db
    .from("signup_requests")
    .select(
      "id, user_id, role, name, phone, email, school_id, status, notes, decided_at, decided_by, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);

  const schoolIds = [...new Set((data ?? []).map((r) => r.school_id))];
  const schoolMeta = new Map<
    string,
    { name: string; schoolType: string; verified: boolean }
  >();
  if (schoolIds.length) {
    const { data: schools } = await db
      .from("schools")
      .select("id, name, school_type, verified")
      .in("id", schoolIds);
    for (const s of schools ?? []) {
      schoolMeta.set(s.id, {
        name: s.name,
        schoolType: s.school_type,
        verified: Boolean(s.verified),
      });
    }
  }

  return c.json({
    requests: (data ?? []).map((r) => {
      const school = schoolMeta.get(r.school_id);
      return {
        id: r.id,
        userId: r.user_id,
        role: r.role,
        name: r.name,
        phone: r.phone,
        email: r.email,
        schoolId: r.school_id,
        schoolName: school?.name ?? null,
        schoolType: school?.schoolType ?? null,
        schoolVerified: school?.verified ?? null,
        status: r.status,
        notes: r.notes,
        decidedAt: r.decided_at,
        decidedBy: r.decided_by,
        createdAt: r.created_at,
      };
    }),
  });
});

adminApp.post("/signup-requests/:id/approve", async (c) => {
    const admin = c.get("user");
    if (!admin) return c.json({ error: "Unauthorized" }, 401);
    const db = createDb(c.env);
    const id = c.req.param("id");

    const { data: req, error } = await db
      .from("signup_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    if (!req) return c.json({ error: "Signup request not found" }, 404);
    if (req.status !== "pending") {
      return c.json({ error: `Request already ${req.status}` }, 400);
    }

    const now = new Date().toISOString();
    if (req.user_id) {
      const { error: uErr } = await db
        .from("user")
        .update({
          approval_status: "approved",
          school_id: req.school_id,
          role: req.role,
        })
        .eq("id", req.user_id);
      if (uErr) return c.json({ error: uErr.message }, 500);
    }

    const { error: rErr } = await db
      .from("signup_requests")
      .update({
        status: "approved",
        decided_at: now,
        decided_by: admin.id,
      })
      .eq("id", id);
    if (rErr) return c.json({ error: rErr.message }, 500);

    await writeAudit(db, {
      adminId: admin.id,
      action: "signup_approve",
      targetUserId: req.user_id,
      signupRequestId: id,
    });

    if (req.phone) {
      void sendSms(c.env, {
        to: req.phone,
        message: "Kasina: your account was approved. You can sign in now.",
      });
    }

    return c.json({ ok: true, status: "approved" });
  });

adminApp.post("/signup-requests/:id/reject", async (c) => {
    const admin = c.get("user");
    if (!admin) return c.json({ error: "Unauthorized" }, 401);
    const db = createDb(c.env);
    const id = c.req.param("id");
    let body: z.infer<typeof notesSchema> = {};
    try {
      const raw = await c.req.json();
      body = notesSchema.parse(raw ?? {});
    } catch {
      body = {};
    }

    const { data: req, error } = await db
      .from("signup_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    if (!req) return c.json({ error: "Signup request not found" }, 404);
    if (req.status !== "pending") {
      return c.json({ error: `Request already ${req.status}` }, 400);
    }

    const now = new Date().toISOString();
    if (req.user_id) {
      const { error: uErr } = await db
        .from("user")
        .update({ approval_status: "rejected" })
        .eq("id", req.user_id);
      if (uErr) return c.json({ error: uErr.message }, 500);
    }

    const { error: rErr } = await db
      .from("signup_requests")
      .update({
        status: "rejected",
        notes: body.notes ?? null,
        decided_at: now,
        decided_by: admin.id,
      })
      .eq("id", id);
    if (rErr) return c.json({ error: rErr.message }, 500);

    await writeAudit(db, {
      adminId: admin.id,
      action: "signup_reject",
      targetUserId: req.user_id,
      signupRequestId: id,
      meta: body.notes ? { notes: body.notes } : undefined,
    });

    if (req.phone) {
      void sendSms(c.env, {
        to: req.phone,
        message: "Kasina: your signup request was not approved.",
      });
    }

    return c.json({ ok: true, status: "rejected" });
  });

adminApp.post("/users/:id/revoke", async (c) => {
  const admin = c.get("user");
  if (!admin) return c.json({ error: "Unauthorized" }, 401);
  const db = createDb(c.env);
  const userId = c.req.param("id");

  const { data: target, error } = await db
    .from("user")
    .select("id, phone, approval_status")
    .eq("id", userId)
    .maybeSingle();
  if (error) return c.json({ error: error.message }, 500);
  if (!target) return c.json({ error: "User not found" }, 404);

  const { error: uErr } = await db
    .from("user")
    .update({ approval_status: "revoked" })
    .eq("id", userId);
  if (uErr) return c.json({ error: uErr.message }, 500);

  await writeAudit(db, {
    adminId: admin.id,
    action: "user_revoke",
    targetUserId: userId,
  });

  if (target.phone) {
    void sendSms(c.env, {
      to: target.phone,
      message: "Kasina: your account access was revoked.",
    });
  }

  return c.json({ ok: true, status: "revoked" });
});

adminApp.get("/activity", async (c) => {
  const db = createDb(c.env);

  const [{ data: signups }, { data: sessions }, { count: melakCount }] =
    await Promise.all([
      db
        .from("signup_requests")
        .select("id, name, role, phone, school_id, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      db
        .from("practice_sessions")
        .select("id, user_id, subject, mode, score, total, completed_at, sync_status, started_at")
        .order("started_at", { ascending: false })
        .limit(20),
      db
        .from("melak_messages")
        .select("id", { count: "exact", head: true })
        .eq("role", "user"),
    ]);

  return c.json({
    recentSignups: signups ?? [],
    recentSessions: sessions ?? [],
    melakUserMessageCount: melakCount ?? 0,
  });
});

adminApp.get("/audit", async (c) => {
  const db = createDb(c.env);
  const { data, error } = await db
    .from("admin_audit_log")
    .select(
      "id, admin_id, action, target_user_id, signup_request_id, meta_json, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return c.json({ error: error.message }, 500);

  return c.json({
    entries: (data ?? []).map((e) => ({
      id: e.id,
      adminId: e.admin_id,
      action: e.action,
      targetUserId: e.target_user_id,
      signupRequestId: e.signup_request_id,
      meta: e.meta_json,
      createdAt: e.created_at,
    })),
  });
});

adminApp.get("/otp-queue", async (c) => {
  const db = createDb(c.env);
  const { data, error } = await db
    .from("otp_send_log")
    .select("id, phone, purpose, status, code_hint, error, created_at, updated_at")
    .in("status", ["pending", "failed"])
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return c.json({ error: error.message }, 500);

  return c.json({
    items: (data ?? []).map((row) => ({
      id: row.id,
      phone: row.phone,
      purpose: row.purpose,
      status: row.status,
      codeHint: row.code_hint,
      error: row.error,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
});

adminApp.post("/otp-queue/:id/manual", async (c) => {
  const admin = c.get("user");
  if (!admin) return c.json({ error: "Unauthorized" }, 401);
  const db = createDb(c.env);
  const id = c.req.param("id");

  const { data, error } = await db
    .from("otp_send_log")
    .update({
      status: "manual",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, phone, status")
    .maybeSingle();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "OTP log not found" }, 404);

  await writeAudit(db, {
    adminId: admin.id,
    action: "otp_manual",
    meta: { otpSendLogId: id, phone: data.phone },
  });

  return c.json({ ok: true, item: { id: data.id, phone: data.phone, status: data.status } });
});

const schoolJoinApproveSchema = z.object({
  schoolType: z.enum(["government", "private", "other"]).default("government"),
  verified: z.boolean().default(true),
  schoolName: z.string().min(2).max(200).optional(),
  notes: z.string().max(2000).optional(),
});

adminApp.get("/school-join-requests", async (c) => {
  const db = createDb(c.env);
  const status = c.req.query("status") ?? "pending";
  let query = db
    .from("school_join_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);
  return c.json({
    requests: (data ?? []).map((r) => ({
      id: r.id,
      schoolName: r.school_name,
      subCity: r.sub_city,
      woreda: r.woreda,
      region: r.region,
      declaredSchoolType: r.declared_school_type,
      contactName: r.contact_name,
      contactPhone: r.contact_phone,
      contactEmail: r.contact_email,
      estimatedTeachers: r.estimated_teachers,
      estimatedStudents: r.estimated_students,
      status: r.status,
      notes: r.notes,
      schoolId: r.school_id,
      decidedAt: r.decided_at,
      decidedBy: r.decided_by,
      createdAt: r.created_at,
    })),
  });
});

adminApp.post(
  "/school-join-requests/:id/approve",
  zValidator("json", schoolJoinApproveSchema),
  async (c) => {
    const admin = c.get("user");
    if (!admin) return c.json({ error: "Unauthorized" }, 401);
    const db = createDb(c.env);
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const { data: req, error } = await db
      .from("school_join_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    if (!req) return c.json({ error: "Request not found" }, 404);
    if (req.status !== "pending") {
      return c.json({ error: `Request already ${req.status}` }, 400);
    }

    const { createInvitedUser, randomInviteCode } = await import(
      "../lib/invite-user"
    );

    const schoolId = randomUUID();
    const invite = randomInviteCode("SCH");
    const schoolName = (body.schoolName?.trim() || req.school_name).trim();

    const { error: sErr } = await db.from("schools").insert({
      id: schoolId,
      name: schoolName,
      sub_city: req.sub_city,
      woreda: req.woreda,
      region: req.region || "Addis Ababa",
      school_type: body.schoolType,
      verified: body.verified,
      teacher_invite_code: invite,
    });
    if (sErr) return c.json({ error: sErr.message }, 500);

    let schoolAdminId: string | null = null;
    try {
      const invited = await createInvitedUser(db, c.env, {
        name: req.contact_name,
        phone: req.contact_phone,
        email: req.contact_email,
        role: "school_admin",
        schoolId,
      });
      schoolAdminId = invited.userId;
      if (!invited.created) {
        await db
          .from("user")
          .update({
            role: "school_admin",
            school_id: schoolId,
            approval_status: "invited",
            name: req.contact_name,
          })
          .eq("id", invited.userId);
      }
    } catch (err) {
      return c.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Could not provision school admin",
        },
        400,
      );
    }

    const now = new Date().toISOString();
    const { error: uErr } = await db
      .from("school_join_requests")
      .update({
        status: "approved",
        school_id: schoolId,
        notes: body.notes ?? req.notes,
        decided_at: now,
        decided_by: admin.id,
      })
      .eq("id", id);
    if (uErr) return c.json({ error: uErr.message }, 500);

    await writeAudit(db, {
      adminId: admin.id,
      action: "school_join_approve",
      targetUserId: schoolAdminId,
      meta: {
        schoolJoinRequestId: id,
        schoolId,
        schoolType: body.schoolType,
        verified: body.verified,
      },
    });

    return c.json({
      ok: true,
      schoolId,
      schoolAdminId,
      teacherInviteCode: invite,
    });
  },
);

adminApp.post(
  "/school-join-requests/:id/reject",
  zValidator("json", notesSchema),
  async (c) => {
    const admin = c.get("user");
    if (!admin) return c.json({ error: "Unauthorized" }, 401);
    const db = createDb(c.env);
    const id = c.req.param("id");
    const body = c.req.valid("json");

    const { data: req, error } = await db
      .from("school_join_requests")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return c.json({ error: error.message }, 500);
    if (!req) return c.json({ error: "Request not found" }, 404);
    if (req.status !== "pending") {
      return c.json({ error: `Request already ${req.status}` }, 400);
    }

    const now = new Date().toISOString();
    const { error: uErr } = await db
      .from("school_join_requests")
      .update({
        status: "rejected",
        notes: body.notes ?? req.notes,
        decided_at: now,
        decided_by: admin.id,
      })
      .eq("id", id);
    if (uErr) return c.json({ error: uErr.message }, 500);

    await writeAudit(db, {
      adminId: admin.id,
      action: "school_join_reject",
      meta: { schoolJoinRequestId: id },
    });

    if (req.contact_phone) {
      void sendSms(c.env, {
        to: req.contact_phone,
        message: "Kasina: your school join request was not approved.",
      });
    }

    return c.json({ ok: true, status: "rejected" });
  },
);

adminApp.get("/roster-audit", async (c) => {
  const db = createDb(c.env);
  const { data, error } = await db
    .from("roster_audit_log")
    .select(
      "id, actor_user_id, actor_role, school_id, action, target_user_id, class_id, meta_json, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return c.json({ error: error.message }, 500);

  const schoolIds = [...new Set((data ?? []).map((e) => e.school_id))];
  const names = new Map<string, string>();
  if (schoolIds.length) {
    const { data: schools } = await db
      .from("schools")
      .select("id, name")
      .in("id", schoolIds);
    for (const s of schools ?? []) names.set(s.id, s.name);
  }

  return c.json({
    entries: (data ?? []).map((e) => ({
      id: e.id,
      actorUserId: e.actor_user_id,
      actorRole: e.actor_role,
      schoolId: e.school_id,
      schoolName: names.get(e.school_id) ?? null,
      action: e.action,
      targetUserId: e.target_user_id,
      classId: e.class_id,
      meta: e.meta_json,
      createdAt: e.created_at,
      source: "roster" as const,
    })),
  });
});
