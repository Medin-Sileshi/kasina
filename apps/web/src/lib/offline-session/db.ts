import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { QuizQuestion } from "@/lib/quiz-store";

export type OfflineQuestion = QuizQuestion & {
  subject?: string;
  grade?: number;
  year?: number | null;
};

export type LocalSessionMode =
  | "random"
  | "topic"
  | "year"
  | "weak_topics"
  | "cbt";

export type LocalSessionAnswer = {
  questionId: string;
  selectedOptionId: string;
  timeTakenSeconds?: number;
  isCorrect?: boolean;
};

export type LocalSessionRecord = {
  clientSessionId: string;
  mode: LocalSessionMode;
  subject: string;
  grade: number;
  unit?: string;
  topic?: string;
  year?: number;
  assignmentId?: string;
  questionIds: string[];
  questions: OfflineQuestion[];
  answers: LocalSessionAnswer[];
  startedAt: string;
  completedAt?: string;
  score?: number;
  total?: number;
  syncStatus: "local" | "queued" | "synced";
  contextLabel?: string;
};

export type SyncQueueItem = {
  id: string;
  clientSessionId: string;
  payload: {
    clientSessionId: string;
    mode: LocalSessionMode;
    subject: string;
    grade: number;
    unit?: string;
    topic?: string;
    year?: number;
    assignmentId?: string;
    questionIds: string[];
    answers: Array<{
      questionId: string;
      selectedOptionId: string;
      timeTakenSeconds?: number;
    }>;
    completedAt: string;
    score?: number;
    total?: number;
  };
  createdAt: string;
};

export type SyncMetaRecord = {
  key: string;
  value: string | number | null;
  updatedAt: string;
};

interface KasinaOfflineDB extends DBSchema {
  question_bank: {
    key: string;
    value: OfflineQuestion;
    indexes: { "by-subject": string };
  };
  local_sessions: {
    key: string;
    value: LocalSessionRecord;
  };
  answer_queue: {
    key: string;
    value: SyncQueueItem;
  };
  sync_meta: {
    key: string;
    value: SyncMetaRecord;
  };
}

const DB_NAME = "kasina-offline";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<KasinaOfflineDB>> | null = null;

export function getOfflineDb() {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"));
  }
  if (!dbPromise) {
    dbPromise = openDB<KasinaOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("question_bank")) {
          const store = db.createObjectStore("question_bank", {
            keyPath: "id",
          });
          store.createIndex("by-subject", "subject");
        }
        if (!db.objectStoreNames.contains("local_sessions")) {
          db.createObjectStore("local_sessions", {
            keyPath: "clientSessionId",
          });
        }
        if (!db.objectStoreNames.contains("answer_queue")) {
          db.createObjectStore("answer_queue", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("sync_meta")) {
          db.createObjectStore("sync_meta", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}

export async function setSyncMeta(
  key: string,
  value: string | number | null,
) {
  const db = await getOfflineDb();
  await db.put("sync_meta", {
    key,
    value,
    updatedAt: new Date().toISOString(),
  });
}

export async function getSyncMeta(key: string): Promise<SyncMetaRecord | null> {
  const db = await getOfflineDb();
  return (await db.get("sync_meta", key)) ?? null;
}
