import { apiFetch } from "@/lib/auth-client";
import type { QuizQuestion } from "@/lib/quiz-store";
import {
  getOfflineDb,
  getSyncMeta,
  setSyncMeta,
  type LocalSessionMode,
  type LocalSessionRecord,
  type OfflineQuestion,
  type SyncQueueItem,
} from "./db";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function localSessionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function isLocalSessionId(id: string) {
  return id.startsWith("local-");
}

export async function pullOfflinePack(opts?: {
  subject?: string;
  grade?: number;
}) {
  const subject = opts?.subject ?? "mathematics";
  const grade = opts?.grade ?? 12;
  const data = await apiFetch<{
    subject: string;
    grade: number;
    count: number;
    questions: OfflineQuestion[];
    syncedAt: string;
  }>(
    `/sessions/offline-pack?subject=${encodeURIComponent(subject)}&grade=${grade}`,
  );

  const db = await getOfflineDb();
  const tx = db.transaction("question_bank", "readwrite");
  await Promise.all(
    data.questions.map((q) =>
      tx.store.put({
        ...q,
        subject: data.subject,
        grade: data.grade,
      }),
    ),
  );
  await tx.done;

  await setSyncMeta("lastSyncedAt", data.syncedAt);
  await setSyncMeta("questionBankCount", data.count);
  await setSyncMeta("questionBankSubject", data.subject);
  return data;
}

export async function getQuestionBankCount() {
  const db = await getOfflineDb();
  return db.count("question_bank");
}

export async function getLastSyncedAt(): Promise<string | null> {
  const meta = await getSyncMeta("lastSyncedAt");
  return meta?.value != null ? String(meta.value) : null;
}

export async function startLocalSession(opts: {
  mode?: LocalSessionMode;
  subject?: string;
  grade?: number;
  unit?: string;
  topic?: string;
  year?: number;
  count?: number;
  contextLabel?: string;
}): Promise<{ session: LocalSessionRecord; questions: QuizQuestion[] }> {
  const db = await getOfflineDb();
  const all = await db.getAll("question_bank");
  if (!all.length) {
    throw new Error(
      "No offline questions yet. Sync for offline while online first.",
    );
  }

  const subject = opts.subject ?? "mathematics";
  const grade = opts.grade ?? 12;
  const mode = opts.mode ?? "random";
  const count = opts.count ?? 10;

  let pool = all.filter(
    (q) =>
      (q.subject == null || q.subject === subject) &&
      (q.grade == null || q.grade === grade),
  );

  if (mode === "topic" && opts.topic) {
    pool = pool.filter(
      (q) =>
        q.topic === opts.topic &&
        (opts.unit == null || q.unit === opts.unit),
    );
  } else if (mode === "year" && opts.year != null) {
    pool = pool.filter((q) => q.year === opts.year);
  }

  if (!pool.length) {
    throw new Error("No matching offline questions for this practice mode.");
  }

  const picked = shuffle(pool).slice(0, Math.min(count, pool.length));
  const clientSessionId = localSessionId();
  const record: LocalSessionRecord = {
    clientSessionId,
    mode,
    subject,
    grade,
    unit: opts.unit,
    topic: opts.topic,
    year: opts.year,
    questionIds: picked.map((q) => q.id),
    questions: picked,
    answers: [],
    startedAt: new Date().toISOString(),
    syncStatus: "local",
    contextLabel: opts.contextLabel,
    total: picked.length,
  };

  await db.put("local_sessions", record);
  return { session: record, questions: picked };
}

export async function getLocalSession(
  clientSessionId: string,
): Promise<LocalSessionRecord | null> {
  const db = await getOfflineDb();
  return (await db.get("local_sessions", clientSessionId)) ?? null;
}

export async function recordLocalAnswer(
  clientSessionId: string,
  answer: {
    questionId: string;
    selectedOptionId: string;
    timeTakenSeconds?: number;
  },
) {
  const db = await getOfflineDb();
  const session = await db.get("local_sessions", clientSessionId);
  if (!session) throw new Error("Local session not found");

  const question = session.questions.find((q) => q.id === answer.questionId);
  const isCorrect =
    question?.correctOptionId != null
      ? question.correctOptionId === answer.selectedOptionId
      : undefined;

  const nextAnswers = [
    ...session.answers.filter((a) => a.questionId !== answer.questionId),
    {
      questionId: answer.questionId,
      selectedOptionId: answer.selectedOptionId,
      timeTakenSeconds: answer.timeTakenSeconds,
      isCorrect,
    },
  ];

  const updated: LocalSessionRecord = {
    ...session,
    answers: nextAnswers,
  };
  await db.put("local_sessions", updated);

  return {
    selectedOptionId: answer.selectedOptionId,
    isCorrect,
    correctOptionId: question?.correctOptionId,
    explanation: question?.explanation,
    explanationAm: question?.explanationAm,
    saved: true,
  };
}

export async function completeLocalSession(clientSessionId: string) {
  const db = await getOfflineDb();
  const session = await db.get("local_sessions", clientSessionId);
  if (!session) throw new Error("Local session not found");

  let score = 0;
  for (const a of session.answers) {
    const q = session.questions.find((qq) => qq.id === a.questionId);
    if (q?.correctOptionId && q.correctOptionId === a.selectedOptionId) {
      score += 1;
    }
  }

  const completedAt = new Date().toISOString();
  const updated: LocalSessionRecord = {
    ...session,
    completedAt,
    score,
    total: session.questionIds.length,
    syncStatus: "queued",
  };
  await db.put("local_sessions", updated);

  const queueItem: SyncQueueItem = {
    id: clientSessionId,
    clientSessionId,
    createdAt: completedAt,
    payload: {
      clientSessionId,
      mode: session.mode,
      subject: session.subject,
      grade: session.grade,
      unit: session.unit,
      topic: session.topic,
      year: session.year,
      assignmentId: session.assignmentId,
      questionIds: session.questionIds,
      answers: session.answers.map((a) => ({
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
        timeTakenSeconds: a.timeTakenSeconds,
      })),
      completedAt,
      score,
      total: session.questionIds.length,
    },
  };
  await db.put("answer_queue", queueItem);

  if (typeof navigator !== "undefined" && navigator.onLine) {
    void flushSyncQueue().catch(() => {
      /* will retry on online */
    });
  }

  return updated;
}

export async function flushSyncQueue() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { flushed: 0, remaining: -1 };
  }

  const db = await getOfflineDb();
  const items = await db.getAll("answer_queue");
  let flushed = 0;

  for (const item of items) {
    try {
      await apiFetch("/sessions/sync", {
        method: "POST",
        body: JSON.stringify(item.payload),
      });
      await db.delete("answer_queue", item.id);
      const session = await db.get("local_sessions", item.clientSessionId);
      if (session) {
        await db.put("local_sessions", {
          ...session,
          syncStatus: "synced",
        });
      }
      flushed += 1;
    } catch {
      break;
    }
  }

  if (flushed > 0) {
    await setSyncMeta("lastSyncedAt", new Date().toISOString());
  }

  const remaining = await db.count("answer_queue");
  return { flushed, remaining };
}
