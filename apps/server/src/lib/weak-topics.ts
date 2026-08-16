/**
 * M3 weak-topic algorithm (shared by student + teacher).
 *
 * accuracy[topic] = correct / attempted
 * Weak = attempts >= MIN_ATTEMPTS AND accuracy < WEAK_THRESHOLD
 * Class aggregation = pooled member answers (MVP).
 */

export const MIN_ATTEMPTS = 3;
export const WEAK_THRESHOLD = 0.7; // 70%
export const WEAK_TOPICS_LIMIT = 10;
export const PRACTICE_BOTTOM_N = 3;

export type AnswerFact = {
  questionId: string;
  isCorrect: boolean;
};

export type QuestionTopicMeta = {
  id: string;
  topic: string;
  unit: string;
};

export type WeakTopic = {
  topic: string;
  unit: string;
  attempts: number;
  correct: number;
  accuracy: number; // 0–100 integer
};

export function computeTopicStats(
  answers: AnswerFact[],
  questions: QuestionTopicMeta[],
): Map<string, { topic: string; unit: string; correct: number; total: number }> {
  const qMeta = new Map(
    questions.map((q) => [q.id, { topic: q.topic, unit: q.unit }]),
  );
  const topicStats = new Map<
    string,
    { topic: string; unit: string; correct: number; total: number }
  >();

  for (const a of answers) {
    const meta = qMeta.get(a.questionId);
    if (!meta) continue;
    const key = `${meta.unit}::${meta.topic}`;
    const cur = topicStats.get(key) ?? {
      topic: meta.topic,
      unit: meta.unit,
      correct: 0,
      total: 0,
    };
    cur.total += 1;
    if (a.isCorrect) cur.correct += 1;
    topicStats.set(key, cur);
  }
  return topicStats;
}

export function computeWeakTopics(
  answers: AnswerFact[],
  questions: QuestionTopicMeta[],
  opts?: {
    minAttempts?: number;
    threshold?: number;
    limit?: number;
  },
): WeakTopic[] {
  const minAttempts = opts?.minAttempts ?? MIN_ATTEMPTS;
  const threshold = opts?.threshold ?? WEAK_THRESHOLD;
  const limit = opts?.limit ?? WEAK_TOPICS_LIMIT;

  const topicStats = computeTopicStats(answers, questions);

  return [...topicStats.values()]
    .map((t) => ({
      topic: t.topic,
      unit: t.unit,
      attempts: t.total,
      correct: t.correct,
      accuracy: t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0,
    }))
    .filter(
      (t) => t.attempts >= minAttempts && t.accuracy / 100 < threshold,
    )
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)
    .slice(0, limit);
}

/** Round-robin pick across bottom N weak topics' question pools. */
export function pickWeakTopicQuestions<T extends { id: string; topic: string; unit: string }>(
  weakTopics: WeakTopic[],
  pools: Map<string, T[]>,
  count: number,
  bottomN = PRACTICE_BOTTOM_N,
): T[] {
  const targets = weakTopics.slice(0, bottomN);
  if (!targets.length) return [];

  const queues = targets.map((t) => {
    const key = `${t.unit}::${t.topic}`;
    return [...(pools.get(key) ?? [])];
  });

  const picked: T[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (picked.length < count && guard < count * 20) {
    guard += 1;
    let progressed = false;
    for (const queue of queues) {
      while (queue.length) {
        const next = queue.shift()!;
        if (seen.has(next.id)) continue;
        seen.add(next.id);
        picked.push(next);
        progressed = true;
        break;
      }
      if (picked.length >= count) break;
    }
    if (!progressed) break;
  }
  return picked;
}
