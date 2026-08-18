import { Hono } from "hono";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import { isAuthUser, requireUser } from "../lib/auth-user";
import {
  MIN_ATTEMPTS,
  WEAK_THRESHOLD,
  weakTopicsForUser,
} from "../lib/weak-topics-db";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

export const progressApp = new Hono<HonoEnv>();

progressApp.get("/weak-topics", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;
  const db = createDb(c.env);
  try {
    const weakTopics = await weakTopicsForUser(db, user.id);
    return c.json({
      minAttempts: MIN_ATTEMPTS,
      threshold: Math.round(WEAK_THRESHOLD * 100),
      weakTopics: weakTopics.map((t) => ({
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

progressApp.get("/", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const db = createDb(c.env);

  const { data: sessions, error } = await db
    .from("practice_sessions")
    .select("id, subject, score, total, started_at, completed_at, mode, topic, unit")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);

  const all = sessions ?? [];
  const completed = all.filter((s) => s.completed_at != null);
  const inProgress = all.filter((s) => s.completed_at == null);
  const questionsAnswered = completed.reduce(
    (sum, s) => sum + (s.total ?? 0),
    0,
  );
  const scored = completed.filter((s) => s.total && s.total > 0);
  const averageScore = scored.length
    ? Math.round(
        scored.reduce(
          (sum, s) => sum + ((s.score ?? 0) / (s.total as number)) * 100,
          0,
        ) / scored.length,
      )
    : 0;

  const daySet = new Set(
    completed.map((s) => (s.completed_at as string).slice(0, 10)),
  );
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (!daySet.has(key)) break;
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  let weakTopics: Array<{
    topic: string;
    unit: string;
    accuracy: number;
    attempts: number;
  }> = [];
  try {
    const weak = await weakTopicsForUser(db, user.id);
    weakTopics = weak.map((t) => ({
      topic: t.topic,
      unit: t.unit,
      accuracy: t.accuracy,
      attempts: t.attempts,
    }));
  } catch (err) {
    return c.json(
      { error: err instanceof Error ? err.message : "Failed" },
      500,
    );
  }

  return c.json({
    stats: {
      questionsAnswered,
      averageScore,
      dayStreak: streak,
    },
    subjects: [
      {
        id: "mathematics",
        name: "Mathematics",
        questionsAnswered,
        averageScore,
        active: true,
      },
    ],
    weakTopics,
    thresholds: {
      minAttempts: MIN_ATTEMPTS,
      accuracyPercent: Math.round(WEAK_THRESHOLD * 100),
    },
    recentSessions: completed.slice(0, 5).map((s) => ({
      id: s.id,
      subject: s.subject,
      topic: s.topic,
      unit: s.unit,
      mode: s.mode,
      score: s.score,
      total: s.total,
      percent:
        s.total && s.total > 0
          ? Math.round(((s.score ?? 0) / s.total) * 100)
          : 0,
      completedAt: s.completed_at,
    })),
    inProgressSessions: inProgress.slice(0, 5).map((s) => ({
      id: s.id,
      subject: s.subject,
      topic: s.topic,
      unit: s.unit,
      mode: s.mode,
      total: s.total,
      startedAt: s.started_at,
    })),
  });
});
