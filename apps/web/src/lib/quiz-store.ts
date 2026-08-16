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
  correctOptionId: string;
  explanation: string;
  explanationAm?: string | null;
};

type LocalAnswer = {
  selectedOptionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  explanation: string;
  explanationAm?: string | null;
};

type QuizState = {
  sessionId: string | null;
  questions: QuizQuestion[];
  index: number;
  selectedOptionId: string | null;
  submitted: boolean;
  answers: Record<string, LocalAnswer>;
  contextLabel: string;
  reset: (payload: {
    sessionId: string;
    questions: QuizQuestion[];
    contextLabel?: string;
  }) => void;
  selectOption: (id: string) => void;
  markSubmitted: (answer: LocalAnswer) => void;
  next: () => void;
  clearSelection: () => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  sessionId: null,
  questions: [],
  index: 0,
  selectedOptionId: null,
  submitted: false,
  answers: {},
  contextLabel: "Practice",
  reset: ({ sessionId, questions, contextLabel }) =>
    set({
      sessionId,
      questions,
      index: 0,
      selectedOptionId: null,
      submitted: false,
      answers: {},
      contextLabel: contextLabel ?? "Practice",
    }),
  selectOption: (id) => {
    if (get().submitted) return;
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
  next: () => {
    const { index, questions } = get();
    if (index >= questions.length - 1) return;
    set({
      index: index + 1,
      selectedOptionId: null,
      submitted: false,
    });
  },
  clearSelection: () => set({ selectedOptionId: null, submitted: false }),
}));
