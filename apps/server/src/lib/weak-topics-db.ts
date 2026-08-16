import type { SupabaseClient } from "@supabase/supabase-js";
import {
  computeWeakTopics,
  type AnswerFact,
  type QuestionTopicMeta,
  type WeakTopic,
  MIN_ATTEMPTS,
  WEAK_THRESHOLD,
  PRACTICE_BOTTOM_N,
} from "./weak-topics";

export { MIN_ATTEMPTS, WEAK_THRESHOLD, PRACTICE_BOTTOM_N };

export async function loadAnswersForSessions(
  db: SupabaseClient,
  sessionIds: string[],
): Promise<AnswerFact[]> {
  if (!sessionIds.length) return [];
  const { data, error } = await db
    .from("answers")
    .select("question_id, is_correct")
    .in("session_id", sessionIds);
  if (error) throw new Error(error.message);
  return (data ?? []).map((a) => ({
    questionId: a.question_id,
    isCorrect: a.is_correct,
  }));
}

export async function loadQuestionMeta(
  db: SupabaseClient,
  questionIds: string[],
): Promise<QuestionTopicMeta[]> {
  if (!questionIds.length) return [];
  const { data, error } = await db
    .from("questions")
    .select("id, topic, unit")
    .in("id", questionIds);
  if (error) throw new Error(error.message);
  return (data ?? []).map((q) => ({
    id: q.id,
    topic: q.topic,
    unit: q.unit,
  }));
}

export async function weakTopicsForUser(
  db: SupabaseClient,
  userId: string,
): Promise<WeakTopic[]> {
  const { data: sessions, error } = await db
    .from("practice_sessions")
    .select("id")
    .eq("user_id", userId)
    .not("completed_at", "is", null);
  if (error) throw new Error(error.message);
  const sessionIds = (sessions ?? []).map((s) => s.id);
  const answers = await loadAnswersForSessions(db, sessionIds);
  const qIds = [...new Set(answers.map((a) => a.questionId))];
  const questions = await loadQuestionMeta(db, qIds);
  return computeWeakTopics(answers, questions, {
    minAttempts: MIN_ATTEMPTS,
    threshold: WEAK_THRESHOLD,
  });
}

export async function weakTopicsForClass(
  db: SupabaseClient,
  studentIds: string[],
  completedSessionIds?: string[],
): Promise<WeakTopic[]> {
  if (!studentIds.length) return [];
  let sessionIds = completedSessionIds;
  if (!sessionIds) {
    const { data: sessions, error } = await db
      .from("practice_sessions")
      .select("id")
      .in("user_id", studentIds)
      .not("completed_at", "is", null);
    if (error) throw new Error(error.message);
    sessionIds = (sessions ?? []).map((s) => s.id);
  }
  if (!sessionIds.length) return [];
  const answers = await loadAnswersForSessions(db, sessionIds);
  const qIds = [...new Set(answers.map((a) => a.questionId))];
  const questions = await loadQuestionMeta(db, qIds);
  return computeWeakTopics(answers, questions, {
    minAttempts: MIN_ATTEMPTS,
    threshold: WEAK_THRESHOLD,
  });
}
