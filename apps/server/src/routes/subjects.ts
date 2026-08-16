import { Hono } from "hono";
import { createDb } from "../db";
import type { AppVariables, ServerEnv } from "../env";
import { isAuthUser, requireUser } from "../lib/auth-user";

type HonoEnv = {
  Bindings: ServerEnv;
  Variables: AppVariables;
};

export const subjectsApp = new Hono<HonoEnv>();

subjectsApp.get("/mathematics/meta", async (c) => {
  const user = await requireUser(c);
  if (!isAuthUser(user)) return user;

  const db = createDb(c.env);
  const grade = 12;
  const subject = "mathematics";

  const { data: questions, error } = await db
    .from("questions")
    .select("id, unit, topic, year")
    .eq("subject", subject)
    .eq("grade", grade);

  if (error) return c.json({ error: error.message }, 500);

  const rows = questions ?? [];
  const years = [
    ...new Set(rows.map((q) => q.year).filter((y): y is number => y != null)),
  ].sort((a, b) => b - a);

  const unitMap = new Map<
    string,
    Map<string, { topic: string; questionCount: number }>
  >();

  for (const q of rows) {
    if (!unitMap.has(q.unit)) unitMap.set(q.unit, new Map());
    const topics = unitMap.get(q.unit)!;
    const cur = topics.get(q.topic) ?? { topic: q.topic, questionCount: 0 };
    cur.questionCount += 1;
    topics.set(q.topic, cur);
  }

  // Per-topic accuracy for this user
  const { data: sessions } = await db
    .from("practice_sessions")
    .select("id")
    .eq("user_id", user.id)
    .not("completed_at", "is", null);

  const sessionIds = (sessions ?? []).map((s) => s.id);
  const accuracyByTopic = new Map<string, { correct: number; total: number }>();

  if (sessionIds.length) {
    const { data: answers } = await db
      .from("answers")
      .select("question_id, is_correct")
      .in("session_id", sessionIds);

    const qIds = [...new Set((answers ?? []).map((a) => a.question_id))];
    if (qIds.length) {
      const { data: qmeta } = await db
        .from("questions")
        .select("id, topic")
        .in("id", qIds);
      const topicOf = new Map((qmeta ?? []).map((q) => [q.id, q.topic]));
      for (const a of answers ?? []) {
        const topic = topicOf.get(a.question_id);
        if (!topic) continue;
        const cur = accuracyByTopic.get(topic) ?? { correct: 0, total: 0 };
        cur.total += 1;
        if (a.is_correct) cur.correct += 1;
        accuracyByTopic.set(topic, cur);
      }
    }
  }

  let overallCorrect = 0;
  let overallTotal = 0;
  for (const v of accuracyByTopic.values()) {
    overallCorrect += v.correct;
    overallTotal += v.total;
  }

  const units = [...unitMap.entries()].map(([unit, topics]) => ({
    unit,
    topics: [...topics.values()].map((t) => {
      const acc = accuracyByTopic.get(t.topic);
      return {
        topic: t.topic,
        questionCount: t.questionCount,
        accuracy:
          acc && acc.total > 0
            ? Math.round((acc.correct / acc.total) * 100)
            : null,
      };
    }),
  }));

  return c.json({
    subject,
    grade,
    questionCount: rows.length,
    overallAccuracy:
      overallTotal > 0 ? Math.round((overallCorrect / overallTotal) * 100) : null,
    years,
    units,
  });
});
