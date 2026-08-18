const PREFIX = "kasina:quiz-ui:";

export type PersistedQuizUi = {
  index: number;
  flagged: Record<string, boolean>;
  timerStartedAt: number | null;
  timerDurationSec: number | null;
};

export function loadQuizUi(sessionId: string): PersistedQuizUi | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${sessionId}`);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedQuizUi;
  } catch {
    return null;
  }
}

export function saveQuizUi(sessionId: string, ui: PersistedQuizUi): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(`${PREFIX}${sessionId}`, JSON.stringify(ui));
  } catch {
    /* quota */
  }
}

export function clearQuizUi(sessionId: string): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem(`${PREFIX}${sessionId}`);
}

export function remainingTimerSeconds(
  startedAt: number | null,
  durationSec: number | null,
): number | null {
  if (startedAt == null || durationSec == null) return durationSec;
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  return Math.max(0, durationSec - elapsed);
}
