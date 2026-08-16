import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createAuth } from "../auth";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import {
  isAuthUser,
  requireTeacher,
  requireUser,
} from "../lib/auth-user";
import {
  assertClassOwner,
  generateInviteCode,
  getClassAccess,
} from "../lib/classes";
import {
  MIN_ATTEMPTS,
  WEAK_THRESHOLD,
  weakTopicsForClass,
} from "../lib/weak-topics-db";
import { clientKey, rateLimit } from "../lib/rate-limit";
import { buildClassOverviewEntry } from "../lib/class-overview";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

function unwrapAuthUser(result: unknown): {
  userId: string;
  headers: Headers | null;
} {
  if (result && typeof result === "object") {
    if (
      "response" in result &&
      result.response &&
      typeof result.response === "object" &&
      "user" in result.response &&
      result.response.user &&
      typeof result.response.user === "object" &&
      "id" in result.response.user
    ) {
      return {
        userId: String(result.response.user.id),
        headers:
          "headers" in result && result.headers instanceof Headers
            ? result.headers
            : null,
      };
    }
    if (
      "user" in result &&
      result.user &&
      typeof result.user === "object" &&
      "id" in result.user
    ) {
      return { userId: String(result.user.id), headers: null };
    }
  }
  throw new Error("Auth did not return a user");
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
});

const joinSchema = z.object({
  inviteCode: z.string().min(3),
  displayName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const classesApp = new Hono<HonoEnv>();

classesApp.post("/", zValidator("json", createSchema), async (c) => {
  const user = await requireTeacher(c);
  if (!isAuthUser(user)) return user;

  const { name } = c.req.valid("json");
  const db = createDb(c.env);
  const id = randomUUID();
  let invite = generateInviteCode();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { error } = await db.from("classes").insert({
      id,
      teacher_id: user.id,
      name,
      grade: 12,
      subject: "mathematics",
      invite_code: invite,
    });
    if (!error) {
      return c.json({
        class: {
          id,
          name,
          grade: 12,
          subject: "mathematics",
          inviteCode: invite,
          teacherId: user.id,
        },
      });
    }
    if (error.message.toLowerCase().includes("unique")) {
      invite = generateInviteCode();
      continue;
    }
    return c.json({ error: error.message }, 500);
  }
  return c.json({ error: "Could not generate unique invite code" }, 500);
});

classesApp.get("/", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;
  const db = createDb(c.env);

  if (user.role === "teacher" || user.role === "admin") {
    const { data, error } = await db
      .from("classes")
      .select("id, name, grade, subject, invite_code, created_at, teacher_id")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });
    if (error) return c.json({ error: error.message }, 500);
    return c.json({
      classes: (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        grade: row.grade,
        subject: row.subject,
        inviteCode: row.invite_code,
        createdAt: row.created_at,
      })),
    });
  }

  const { data: memberships, error: mErr } = await db
    .from("class_members")
    .select("class_id, joined_at")
    .eq("student_id", user.id);
  if (mErr) return c.json({ error: mErr.message }, 500);
  const ids = (memberships ?? []).map((m) => m.class_id);
  if (!ids.length) return c.json({ classes: [] });

  const { data, error } = await db
    .from("classes")
    .select("id, name, grade, subject, invite_code, created_at")
    .in("id", ids);
  if (error) return c.json({ error: error.message }, 500);

  return c.json({
    classes: (data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      grade: row.grade,
      subject: row.subject,
      inviteCode: row.invite_code,
      createdAt: row.created_at,
    })),
  });
});

classesApp.post("/join", zValidator("json", joinSchema), async (c) => {
  const rl = rateLimit({
    key: `join:${clientKey(c)}`,
    limit: 10,
    windowMs: 60_000,
  });
  if (!rl.ok) {
    return c.json(
      { error: `Too many join attempts. Try again in ${rl.retryAfterSec}s.` },
      429,
    );
  }

  const auth = createAuth(c.env);
  const db = createDb(c.env);
  const body = c.req.valid("json");
  const inviteCode = body.inviteCode.trim().toUpperCase();

  const { data: klass, error: classErr } = await db
    .from("classes")
    .select("id, name, grade, subject, invite_code")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (classErr || !klass) {
    return c.json({ error: "Invalid invite code" }, 404);
  }

  let userId: string | null = null;
  let authHeaders: Headers | null = null;

  const existingSession = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  if (existingSession?.user) {
    userId = existingSession.user.id;
    await db
      .from("user")
      .update({ name: body.displayName, role: "student" })
      .eq("id", userId);
  } else {
    try {
      const signUp = await auth.api.signUpEmail({
        body: {
          email: body.email,
          password: body.password,
          name: body.displayName,
          role: "student",
        } as never,
        headers: c.req.raw.headers,
        asResponse: false,
        returnHeaders: true,
      });
      const signed = unwrapAuthUser(signUp);
      userId = signed.userId;
      authHeaders = signed.headers;
      await db.from("user").update({ role: "student" }).eq("id", userId);
    } catch {
      try {
        const signedIn = await auth.api.signInEmail({
          body: { email: body.email, password: body.password },
          headers: c.req.raw.headers,
          asResponse: false,
          returnHeaders: true,
        });
        const signed = unwrapAuthUser(signedIn);
        userId = signed.userId;
        authHeaders = signed.headers;
        await db
          .from("user")
          .update({ name: body.displayName, role: "student" })
          .eq("id", userId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not join class";
        return c.json({ error: message }, 400);
      }
    }
  }

  if (!userId) return c.json({ error: "Could not resolve student" }, 400);

  const { error: memberErr } = await db.from("class_members").upsert({
    class_id: klass.id,
    student_id: userId,
  });
  if (memberErr) return c.json({ error: memberErr.message }, 500);

  const res = c.json({
    user: {
      id: userId,
      email: body.email,
      name: body.displayName,
      role: "student" as const,
    },
    class: {
      id: klass.id,
      name: klass.name,
      grade: klass.grade,
      subject: klass.subject,
      inviteCode: klass.invite_code,
    },
  });

  if (authHeaders) {
    const cookies =
      typeof authHeaders.getSetCookie === "function"
        ? authHeaders.getSetCookie()
        : [];
    for (const cookie of cookies) {
      res.headers.append("Set-Cookie", cookie);
    }
    if (cookies.length === 0) {
      const single = authHeaders.get("set-cookie");
      if (single) res.headers.append("Set-Cookie", single);
    }
  }

  return res;
});

classesApp.get("/overview", async (c) => {
  const user = await requireTeacher(c);
  if (!isAuthUser(user)) return user;
  const db = createDb(c.env);

  const { data, error } = await db
    .from("classes")
    .select("id, name, grade, subject, invite_code, created_at, teacher_id")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);

  try {
    const classes = await Promise.all(
      (data ?? []).map((row) => buildClassOverviewEntry(db, row)),
    );
    return c.json({ classes });
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Failed" },
      500,
    );
  }
});

classesApp.get("/:id", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;
  const classId = c.req.param("id");
  const db = createDb(c.env);

  const access = await getClassAccess(db, classId, user.id, user.role);
  if (access.error || !access.klass) {
    const status = access.error === "Forbidden" ? 403 : 404;
    return c.json({ error: access.error ?? "Not found" }, status);
  }

  const { data: members, error: mErr } = await db
    .from("class_members")
    .select("student_id, joined_at")
    .eq("class_id", classId)
    .order("joined_at", { ascending: true });
  if (mErr) return c.json({ error: mErr.message }, 500);

  const studentIds = (members ?? []).map((m) => m.student_id);
  const usersById = new Map<string, { id: string; name: string; email: string }>();
  if (studentIds.length) {
    const { data: users } = await db
      .from("user")
      .select("id, name, email")
      .in("id", studentIds);
    for (const u of users ?? []) usersById.set(u.id, u);
  }

  const lastActivity = new Map<string, string>();
  if (studentIds.length) {
    const { data: sessions } = await db
      .from("practice_sessions")
      .select("user_id, started_at, completed_at")
      .in("user_id", studentIds)
      .order("started_at", { ascending: false });
    for (const s of sessions ?? []) {
      if (!lastActivity.has(s.user_id)) {
        lastActivity.set(s.user_id, s.completed_at ?? s.started_at);
      }
    }
  }

  return c.json({
    class: {
      id: access.klass.id,
      name: access.klass.name,
      grade: access.klass.grade,
      subject: access.klass.subject,
      inviteCode: access.klass.invite_code,
      createdAt: access.klass.created_at,
      teacherId: access.klass.teacher_id,
    },
    role: access.as,
    roster: (members ?? []).map((m) => {
      const u = usersById.get(m.student_id);
      return {
        studentId: m.student_id,
        name: u?.name ?? "Student",
        email: u?.email ?? "",
        joinedAt: m.joined_at,
        lastActivityAt: lastActivity.get(m.student_id) ?? null,
      };
    }),
  });
});

classesApp.get("/:id/results", async (c) => {
  const user = await requireTeacher(c);
  if (!isAuthUser(user)) return user;
  const classId = c.req.param("id");
  const db = createDb(c.env);

  const owned = await assertClassOwner(db, classId, user.id);
  if (owned.error || !owned.klass) {
    const status = owned.error === "Forbidden" ? 403 : 404;
    return c.json({ error: owned.error ?? "Not found" }, status);
  }

  try {
    const entry = await buildClassOverviewEntry(db, owned.klass);
    return c.json({
      class: {
        id: entry.id,
        name: entry.name,
        inviteCode: entry.inviteCode,
      },
      assignments: entry.assignments,
      students: entry.students,
      weakTopics: entry.weakTopics,
      thresholds: entry.thresholds,
    });
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Failed" },
      500,
    );
  }
});

classesApp.get("/:id/weak-topics", async (c) => {
  const user = await requireTeacher(c);
  if (!isAuthUser(user)) return user;
  const classId = c.req.param("id");
  const db = createDb(c.env);

  const owned = await assertClassOwner(db, classId, user.id);
  if (owned.error || !owned.klass) {
    const status = owned.error === "Forbidden" ? 403 : 404;
    return c.json({ error: owned.error ?? "Not found" }, status);
  }

  const { data: members } = await db
    .from("class_members")
    .select("student_id")
    .eq("class_id", classId);
  const studentIds = (members ?? []).map((m) => m.student_id);

  try {
    const weak = await weakTopicsForClass(db, studentIds);
    return c.json({
      classId,
      minAttempts: MIN_ATTEMPTS,
      threshold: Math.round(WEAK_THRESHOLD * 100),
      weakTopics: weak.map((t) => ({
        topic: t.topic,
        unit: t.unit,
        accuracy: t.accuracy,
        attempts: t.attempts,
      })),
    });
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Failed" },
      500,
    );
  }
});
