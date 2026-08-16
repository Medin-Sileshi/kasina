import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import { isAuthUser, requireUser } from "../lib/auth-user";
import { mapQuestion, shuffle, type QuestionRow } from "../lib/questions";
import {
  pickWeakTopicQuestions,
  PRACTICE_BOTTOM_N,
  MIN_ATTEMPTS,
} from "../lib/weak-topics";
import { weakTopicsForUser } from "../lib/weak-topics-db";
import { rateLimit } from "../lib/rate-limit";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

const startSchema = z.object({
  mode: z.enum(["random", "topic", "year", "weak_topics"]).default("random"),
  subject: z.string().default("mathematics"),
  grade: z.number().int().default(12),
  unit: z.string().optional(),
  topic: z.string().optional(),
  year: z.number().int().optional(),
  count: z.number().int().min(1).max(50).default(10),
  assignmentId: z.string().min(1).optional(),
});

const answerSchema = z.object({
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1),
  timeTakenSeconds: z.number().int().nonnegative().optional(),
});

const QUESTION_SELECT =
  "id, grade, subject, stream, year, unit, topic, stem, stem_am, options_json, correct_option_id, explanation, explanation_am, difficulty, tags_json";

export const sessionsApp = new Hono<HonoEnv>();

sessionsApp.post("/", zValidator("json", startSchema), async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const body = c.req.valid("json");
  const db = createDb(c.env);

  let selected: QuestionRow[] = [];
  let subject = body.subject;
  let grade = body.grade;
  let mode = body.mode;
  let unit = body.unit ?? null;
  let topic = body.topic ?? null;
  let year = body.year ?? null;
  let assignmentId: string | null = null;

  if (body.assignmentId) {
    const { data: assignment, error: aErr } = await db
      .from("assignments")
      .select("id, class_id, title, unit, topic, question_ids, question_count")
      .eq("id", body.assignmentId)
      .maybeSingle();
    if (aErr) return c.json({ error: aErr.message }, 500);
    if (!assignment) return c.json({ error: "Assignment not found" }, 404);

    const { data: member } = await db
      .from("class_members")
      .select("student_id")
      .eq("class_id", assignment.class_id)
      .eq("student_id", user.id)
      .maybeSingle();
    if (!member) {
      return c.json({ error: "Not a member of this class" }, 403);
    }

    const questionIds = (assignment.question_ids as string[]) ?? [];
    if (!questionIds.length) {
      return c.json({ error: "Assignment has no questions" }, 404);
    }

    const { data, error } = await db
      .from("questions")
      .select(QUESTION_SELECT)
      .in("id", questionIds);
    if (error) return c.json({ error: error.message }, 500);

    const byId = new Map((data ?? []).map((q) => [q.id, q as QuestionRow]));
    selected = questionIds
      .map((qid) => byId.get(qid))
      .filter((q): q is QuestionRow => Boolean(q));
    if (!selected.length) {
      return c.json({ error: "No questions available" }, 404);
    }

    const { data: klass } = await db
      .from("classes")
      .select("subject, grade")
      .eq("id", assignment.class_id)
      .maybeSingle();

    subject = klass?.subject ?? "mathematics";
    grade = klass?.grade ?? 12;
    mode = "topic";
    unit = assignment.unit;
    topic = assignment.topic;
    year = null;
    assignmentId = assignment.id;
  } else if (body.mode === "weak_topics") {
    mode = "weak_topics";
    let weak = await weakTopicsForUser(db, user.id);

    // Session-level fallback: if global threshold not met yet, use optional topic hint
    if (!weak.length && body.topic) {
      weak = [
        {
          topic: body.topic,
          unit: body.unit ?? "",
          attempts: MIN_ATTEMPTS,
          correct: 0,
          accuracy: 0,
        },
      ];
    }

    if (!weak.length) {
      return c.json(
        {
          error:
            "No weak topics yet. Complete more practice (at least 3 attempts per topic) first.",
        },
        404,
      );
    }

    const targets = weak.slice(0, PRACTICE_BOTTOM_N);
    const topicNames = targets.map((t) => t.topic);

    const { data, error } = await db
      .from("questions")
      .select(QUESTION_SELECT)
      .eq("subject", body.subject)
      .eq("grade", body.grade)
      .in("topic", topicNames);
    if (error) return c.json({ error: error.message }, 500);

    const pools = new Map<string, QuestionRow[]>();
    for (const q of (data ?? []) as QuestionRow[]) {
      const key = `${q.unit}::${q.topic}`;
      const list = pools.get(key) ?? [];
      list.push(q);
      pools.set(key, list);
    }
    for (const [key, list] of pools) {
      pools.set(key, shuffle(list));
    }

    selected = pickWeakTopicQuestions(targets, pools, body.count);
    if (!selected.length) {
      return c.json({ error: "No questions available for weak topics" }, 404);
    }

    topic = targets.map((t) => t.topic).join(", ");
    unit = targets[0]?.unit ?? null;
    year = null;
  } else {
    let query = db
      .from("questions")
      .select(QUESTION_SELECT)
      .eq("subject", body.subject)
      .eq("grade", body.grade);

    if (body.mode === "topic" && body.topic) {
      query = query.eq("topic", body.topic);
      if (body.unit) query = query.eq("unit", body.unit);
    }
    if (body.mode === "year" && body.year) {
      query = query.eq("year", body.year);
    }

    const { data, error } = await query;
    if (error) return c.json({ error: error.message }, 500);

    const pool = shuffle((data ?? []) as QuestionRow[]);
    selected = pool.slice(0, Math.min(body.count, pool.length));
    if (selected.length === 0) {
      return c.json({ error: "No questions available" }, 404);
    }
  }

  const sessionId = randomUUID();
  const questionIds = selected.map((q) => q.id);

  const { error: insertErr } = await db.from("practice_sessions").insert({
    id: sessionId,
    user_id: user.id,
    assignment_id: assignmentId,
    subject,
    grade,
    mode,
    unit,
    topic,
    year,
    question_ids: questionIds,
    total: questionIds.length,
  });

  if (insertErr) return c.json({ error: insertErr.message }, 500);

  return c.json({
    session: {
      id: sessionId,
      assignmentId,
      subject,
      grade,
      mode,
      unit,
      topic,
      year,
      questionIds,
      total: questionIds.length,
      startedAt: new Date().toISOString(),
    },
    questions: selected.map(mapQuestion),
  });
});

sessionsApp.get("/:id", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const id = c.req.param("id");
  const db = createDb(c.env);

  const { data: session, error } = await db
    .from("practice_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return c.json({ error: error.message }, 500);
  if (!session) return c.json({ error: "Session not found" }, 404);

  const questionIds = (session.question_ids ?? []) as string[];
  const { data: questions, error: qErr } = await db
    .from("questions")
    .select(QUESTION_SELECT)
    .in("id", questionIds);

  if (qErr) return c.json({ error: qErr.message }, 500);

  const { data: answers, error: aErr } = await db
    .from("answers")
    .select("*")
    .eq("session_id", id);

  if (aErr) return c.json({ error: aErr.message }, 500);

  const questionMap = new Map(
    ((questions ?? []) as QuestionRow[]).map((q) => [q.id, mapQuestion(q)]),
  );
  const orderedQuestions = questionIds
    .map((qid) => questionMap.get(qid))
    .filter(Boolean);

  return c.json({
    session: {
      id: session.id,
      subject: session.subject,
      grade: session.grade,
      mode: session.mode,
      unit: session.unit,
      topic: session.topic,
      year: session.year,
      questionIds,
      total: session.total,
      score: session.score,
      startedAt: session.started_at,
      completedAt: session.completed_at,
    },
    questions: orderedQuestions,
    answers: (answers ?? []).map((a) => ({
      id: a.id,
      questionId: a.question_id,
      selectedOptionId: a.selected_option_id,
      isCorrect: a.is_correct,
      timeTakenSeconds: a.time_taken_seconds,
      answeredAt: a.answered_at,
    })),
  });
});

sessionsApp.post(
  "/:id/answers",
  zValidator("json", answerSchema),
  async (c) => {
    const user = await requireUser(c);
    if (!isAuthUser(user)) return user;

    const rl = rateLimit({
      key: `answer:${user.id}`,
      limit: 120,
      windowMs: 60_000,
    });
    if (!rl.ok) {
      return c.json(
        { error: `Too many answers. Slow down (${rl.retryAfterSec}s).` },
        429,
      );
    }

    const id = c.req.param("id");
    const body = c.req.valid("json");
    const db = createDb(c.env);

    const { data: session, error } = await db
      .from("practice_sessions")
      .select("id, user_id, question_ids, completed_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) return c.json({ error: error.message }, 500);
    if (!session) return c.json({ error: "Session not found" }, 404);
    if (session.completed_at) {
      return c.json({ error: "Session already completed" }, 400);
    }

    const questionIds = (session.question_ids ?? []) as string[];
    if (!questionIds.includes(body.questionId)) {
      return c.json({ error: "Question not in session" }, 400);
    }

    const { data: question, error: qErr } = await db
      .from("questions")
      .select("id, correct_option_id, explanation, explanation_am, options_json, topic, unit")
      .eq("id", body.questionId)
      .maybeSingle();

    if (qErr || !question) {
      return c.json({ error: qErr?.message ?? "Question not found" }, 404);
    }

    const isCorrect = question.correct_option_id === body.selectedOptionId;
    const answerId = randomUUID();

    await db.from("answers").delete().eq("session_id", id).eq("question_id", body.questionId);

    const { error: aErr } = await db.from("answers").insert({
      id: answerId,
      session_id: id,
      question_id: body.questionId,
      selected_option_id: body.selectedOptionId,
      is_correct: isCorrect,
      time_taken_seconds: body.timeTakenSeconds ?? null,
    });

    if (aErr) return c.json({ error: aErr.message }, 500);

    return c.json({
      answer: {
        id: answerId,
        questionId: body.questionId,
        selectedOptionId: body.selectedOptionId,
        isCorrect,
        correctOptionId: question.correct_option_id,
        explanation: question.explanation,
        explanationAm: question.explanation_am,
      },
    });
  },
);

sessionsApp.post("/:id/complete", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const id = c.req.param("id");
  const db = createDb(c.env);

  const { data: session, error } = await db
    .from("practice_sessions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return c.json({ error: error.message }, 500);
  if (!session) return c.json({ error: "Session not found" }, 404);

  const { data: answers, error: aErr } = await db
    .from("answers")
    .select("is_correct")
    .eq("session_id", id);

  if (aErr) return c.json({ error: aErr.message }, 500);

  const total = ((session.question_ids ?? []) as string[]).length;
  const score = (answers ?? []).filter((a) => a.is_correct).length;
  const completedAt = new Date().toISOString();

  const { error: uErr } = await db
    .from("practice_sessions")
    .update({
      completed_at: completedAt,
      score,
      total,
    })
    .eq("id", id);

  if (uErr) return c.json({ error: uErr.message }, 500);

  return c.json({
    session: {
      id,
      score,
      total,
      completedAt,
      percent: total ? Math.round((score / total) * 100) : 0,
    },
  });
});
