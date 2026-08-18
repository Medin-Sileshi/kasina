import type { MelakQuestionContext } from "@kasina/melak-core";

const QUESTION_PREFIX = "kasina:melak:q:";
const HISTORY_KEY = "kasina:melak:history";

export function cacheMelakQuestion(question: MelakQuestionContext): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      `${QUESTION_PREFIX}${question.id}`,
      JSON.stringify(question),
    );
  } catch {
    /* quota */
  }
}

export function getCachedMelakQuestion(
  id: string | undefined,
): MelakQuestionContext | null {
  if (!id || typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${QUESTION_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as MelakQuestionContext;
  } catch {
    return null;
  }
}

export type LocalMelakMessage = {
  role: "user" | "assistant";
  content: string;
  mode?: "offline" | "online";
  at: string;
};

export function loadLocalMelakHistory(): LocalMelakMessage[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalMelakMessage[];
  } catch {
    return [];
  }
}

export function saveLocalMelakHistory(messages: LocalMelakMessage[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-40)));
  } catch {
    /* quota */
  }
}

export function appendLocalMelakHistory(
  user: string,
  assistant: string,
  mode: "offline" | "online",
): LocalMelakMessage[] {
  const now = new Date().toISOString();
  const next = [
    ...loadLocalMelakHistory(),
    { role: "user" as const, content: user, at: now },
    { role: "assistant" as const, content: assistant, mode, at: now },
  ];
  saveLocalMelakHistory(next);
  return next;
}
