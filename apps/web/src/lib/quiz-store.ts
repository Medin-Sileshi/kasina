"use client";

import { create } from "zustand";

export type QuizQuestion = {
  id: string;
  stem: string;
  stemAm?: string | null;
  unit: string;
  topic: string;
  difficulty?: string | null;
  options: Array<{ id: string; label: string; text: string }>;
  correctOptionId?: string;
  explanation?: string;
  explanationAm?: string | null;
};

type LocalAnswer = {
  selectedOptionId: string;
  isCorrect?: boolean;
  correctOptionId?: string;
  explanation?: string;
  explanationAm?: string | null;
  saved?: boolean;
};

type QuizState = {
  sessionId: string | null;
  questions: QuizQuestion[];
  index: number;
  selectedOptionId: string | null;
  submitted: boolean;
  answers: Record<string, LocalAnswer>;
  contextLabel: string;
  mode: "practice" | "cbt";
  flagged: Record<string, boolean>;
  timerSeconds: number | null;
  reset: (payload: {
    sessionId: string;
    questions: QuizQuestion[];
    contextLabel?: string;
    mode?: "practice" | "cbt";
    flagged?: Record<string, boolean>;
    timerSeconds?: number | null;
  }) => void;
  selectOption: (id: string) => void;
  markSubmitted: (answer: LocalAnswer) => void;
  markCbtSaved: (questionId: string, selectedOptionId: string) => void;
  toggleFlag: (questionId: string) => void;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  clearSelection: () => void;
  tickTimer: () => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  sessionId: null,
  questions: [],
  index: 0,
  selectedOptionId: null,
  submitted: false,
  answers: {},
  contextLabel: "Practice",
  mode: "practice",
  flagged: {},
  timerSeconds: null,
  reset: ({
    sessionId,
    questions,
    contextLabel,
    mode,
    flagged,
    timerSeconds,
  }) =>
    set({
      sessionId,
      questions,
      index: 0,
      selectedOptionId: null,
      submitted: false,
      answers: {},
      contextLabel: contextLabel ?? "Practice",
      mode: mode ?? "practice",
      flagged: flagged ?? {},
      timerSeconds: timerSeconds ?? null,
    }),
  selectOption: (id) => {
    if (get().submitted && get().mode === "practice") return;
    set({ selectedOptionId: id });
  },
  markSubmitted: (answer) => {
    const q = get().questions[get().index];
    if (!q) return;
    set((s) => ({
      submitted: true,
      answers: { ...s.answers, [q.id]: answer },
    }));
  },
  markCbtSaved: (questionId, selectedOptionId) => {
    set((s) => ({
      answers: {
        ...s.answers,
        [questionId]: { selectedOptionId, saved: true },
      },
      selectedOptionId,
      submitted: true,
    }));
  },
  toggleFlag: (questionId) => {
    set((s) => ({
      flagged: {
        ...s.flagged,
        [questionId]: !s.flagged[questionId],
      },
    }));
  },
  goTo: (index) => {
    const { questions, answers } = get();
    if (index < 0 || index >= questions.length) return;
    const q = questions[index];
    const existing = q ? answers[q.id] : null;
    set({
      index,
      selectedOptionId: existing?.selectedOptionId ?? null,
      submitted: Boolean(existing),
    });
  },
  next: () => {
    const { index, questions } = get();
    if (index >= questions.length - 1) return;
    get().goTo(index + 1);
  },
  prev: () => {
    const { index } = get();
    if (index <= 0) return;
    get().goTo(index - 1);
  },
  clearSelection: () => set({ selectedOptionId: null, submitted: false }),
  tickTimer: () => {
    const t = get().timerSeconds;
    if (t == null || t <= 0) return;
    set({ timerSeconds: t - 1 });
  },
}));

export function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
