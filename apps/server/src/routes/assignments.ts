import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import { isAuthUser, requireTeacher, requireUser } from "../lib/auth-user";
import { assertClassOwner, getClassAccess } from "../lib/classes";
import { shuffle, type QuestionRow } from "../lib/questions";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

const createSchema = z.object({
  classId: z.string().min(1),
  title: z.string().min(1).max(200),
  mode: z.enum(["random", "topic"]).default("random"),
  unit: z.string().optional(),
  topic: z.string().optional(),
  count: z.number().int().min(1).max(50).default(10),
  dueAt: z.string().optional().nullable(),
});

export const assignmentsApp = new Hono<HonoEnv>();

assignmentsApp.post("/", zValidator("json", createSchema), async (c) => {
  const user = await requireTeacher(c);
  if (!isAuthUser(user)) return user;

  const body = c.req.valid("json");
  const db = createDb(c.env);

  const owned = await assertClassOwner(db, body.classId, user.id);
  if (owned.error || !owned.klass) {
    const status = owned.error === "Forbidden" ? 403 : 404;
    return c.json({ error: owned.error ?? "Not found" }, status);
  }

  if (body.mode === "topic" && !body.topic) {
    return c.json({ error: "topic is required for topic mode" }, 400);
  }

  let query = db
    .from("questions")
    .select("id, unit, topic")
    .eq("subject", owned.klass.subject)
    .eq("grade", owned.klass.grade);

  if (body.mode === "topic" && body.topic) {
    query = query.eq("topic", body.topic);
    if (body.unit) query = query.eq("unit", body.unit);
  }

  const { data, error } = await query;
  if (error) return c.json({ error: error.message }, 500);

  const pool = shuffle((data ?? []) as Array<Pick<QuestionRow, "id" | "unit" | "topic">>);
  const selected = pool.slice(0, Math.min(body.count, pool.length));
  if (selected.length === 0) {
    return c.json({ error: "No questions available for this selection" }, 404);
  }

  const id = randomUUID();
  const questionIds = selected.map((q) => q.id);
  const { error: insertErr } = await db.from("assignments").insert({
    id,
    class_id: body.classId,
    title: body.title,
    unit: body.unit ?? null,
    topic: body.topic ?? null,
    question_ids: questionIds,
    question_count: questionIds.length,
    due_at: body.dueAt ?? null,
  });
  if (insertErr) return c.json({ error: insertErr.message }, 500);

  return c.json({
    assignment: {
      id,
      classId: body.classId,
      title: body.title,
      unit: body.unit ?? null,
      topic: body.topic ?? null,
      questionIds,
      questionCount: questionIds.length,
      dueAt: body.dueAt ?? null,
      createdAt: new Date().toISOString(),
    },
  });
});

assignmentsApp.get("/mine", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;
  const db = createDb(c.env);

  const { data: memberships, error: mErr } = await db
    .from("class_members")
    .select("class_id")
    .eq("student_id", user.id);
  if (mErr) return c.json({ error: mErr.message }, 500);
  const classIds = (memberships ?? []).map((m) => m.class_id);
  if (!classIds.length) return c.json({ assignments: [] });

  const { data: classes } = await db
    .from("classes")
    .select("id, name")
    .in("id", classIds);
  const className = new Map((classes ?? []).map((k) => [k.id, k.name]));

  const { data: assignments, error } = await db
    .from("assignments")
    .select("id, class_id, title, unit, topic, question_count, due_at, created_at")
    .in("class_id", classIds)
    .order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  const latestByAssignment = new Map<
    string,
    { score: number | null; total: number | null; completedAt: string }
  >();

  if (assignmentIds.length) {
    const { data: sessions } = await db
      .from("practice_sessions")
      .select("assignment_id, score, total, completed_at")
      .eq("user_id", user.id)
      .in("assignment_id", assignmentIds)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    for (const s of sessions ?? []) {
      if (!s.assignment_id || latestByAssignment.has(s.assignment_id)) continue;
      latestByAssignment.set(s.assignment_id, {
        score: s.score,
        total: s.total,
        completedAt: s.completed_at!,
      });
    }
  }

  return c.json({
    assignments: (assignments ?? []).map((a) => {
      const latest = latestByAssignment.get(a.id);
      return {
        id: a.id,
        classId: a.class_id,
        className: className.get(a.class_id) ?? "Class",
        title: a.title,
        unit: a.unit,
        topic: a.topic,
        questionCount: a.question_count,
        dueAt: a.due_at,
        createdAt: a.created_at,
        status: latest ? ("done" as const) : ("todo" as const),
        score: latest?.score ?? null,
        total: latest?.total ?? null,
      };
    }),
  });
});

assignmentsApp.get("/", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;
  const classId = c.req.query("classId");
  if (!classId) return c.json({ error: "classId is required" }, 400);

  const db = createDb(c.env);
  const access = await getClassAccess(db, classId, user.id, user.role);
  if (access.error || !access.klass) {
    const status = access.error === "Forbidden" ? 403 : 404;
    return c.json({ error: access.error ?? "Not found" }, status);
  }

  const { data, error } = await db
    .from("assignments")
    .select("id, class_id, title, unit, topic, question_count, due_at, created_at")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });
  if (error) return c.json({ error: error.message }, 500);

  return c.json({
    assignments: (data ?? []).map((a) => ({
      id: a.id,
      classId: a.class_id,
      title: a.title,
      unit: a.unit,
      topic: a.topic,
      questionCount: a.question_count,
      dueAt: a.due_at,
      createdAt: a.created_at,
    })),
  });
});

assignmentsApp.get("/:id", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;
  const id = c.req.param("id");
  const db = createDb(c.env);

  const { data: assignment, error } = await db
    .from("assignments")
    .select(
      "id, class_id, title, unit, topic, question_ids, question_count, due_at, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) return c.json({ error: error.message }, 500);
  if (!assignment) return c.json({ error: "Assignment not found" }, 404);

  const access = await getClassAccess(
    db,
    assignment.class_id,
    user.id,
    user.role,
  );
  if (access.error || !access.klass) {
    const status = access.error === "Forbidden" ? 403 : 404;
    return c.json({ error: access.error ?? "Not found" }, status);
  }

  const { data: members } = await db
    .from("class_members")
    .select("student_id")
    .eq("class_id", assignment.class_id);
  const studentIds = (members ?? []).map((m) => m.student_id);

  const usersById = new Map<string, { name: string; email: string }>();
  if (studentIds.length) {
    const { data: users } = await db
      .from("user")
      .select("id, name, email")
      .in("id", studentIds);
    for (const u of users ?? []) {
      usersById.set(u.id, { name: u.name, email: u.email });
    }
  }

  const { data: sessions } = studentIds.length
    ? await db
        .from("practice_sessions")
        .select("user_id, score, total, completed_at")
        .eq("assignment_id", id)
        .in("user_id", studentIds)
        .not("completed_at", "is", null)
        .order("completed_at", { ascending: false })
    : { data: [] as Array<{
        user_id: string;
        score: number | null;
        total: number | null;
        completed_at: string;
      }> };

  const latestByStudent = new Map<
    string,
    { score: number | null; total: number | null; completedAt: string }
  >();
  for (const s of sessions ?? []) {
    if (latestByStudent.has(s.user_id)) continue;
    latestByStudent.set(s.user_id, {
      score: s.score,
      total: s.total,
      completedAt: s.completed_at,
    });
  }

  const membersStatus = studentIds.map((studentId) => {
    const latest = latestByStudent.get(studentId);
    return {
      studentId,
      name: usersById.get(studentId)?.name ?? "Student",
      email: usersById.get(studentId)?.email ?? "",
      status: latest ? ("done" as const) : ("todo" as const),
      score: latest?.score ?? null,
      total: latest?.total ?? null,
      completedAt: latest?.completedAt ?? null,
    };
  });

  // Students only see their own status row when fetching detail
  const status =
    access.as === "teacher"
      ? membersStatus
      : membersStatus.filter((m) => m.studentId === user.id);

  return c.json({
    assignment: {
      id: assignment.id,
      classId: assignment.class_id,
      className: access.klass.name,
      title: assignment.title,
      unit: assignment.unit,
      topic: assignment.topic,
      questionCount: assignment.question_count,
      dueAt: assignment.due_at,
      createdAt: assignment.created_at,
    },
    members: status,
  });
});
