"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MessageCircle, Trophy, X } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { cacheMelakQuestion } from "@/lib/melak-cache";
import type { QuizQuestion } from "@/lib/quiz-store";
import {
  AnswerOption,
  type AnswerOptionState,
} from "@/components/answer-option";
import { MathText } from "@/components/math-text";
import { GhostButton, EmptyState, ContentSkeleton } from "@/components/ui";

type SessionPayload = {
  questions: QuizQuestion[];
  answers: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
};

export default function ReviewPage() {
  return (
    <Suspense fallback={<ContentSkeleton rows={4} />}>
      <ReviewContent />
    </Suspense>
  );
}

function ReviewContent() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const [activeId, setActiveId] = useState<string | null>(
    searchParams.get("q"),
  );

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["session", params.sessionId, "review"],
    queryFn: () =>
      apiFetch<SessionPayload>(`/sessions/${params.sessionId}`),
  });

  useEffect(() => {
    if (!data?.questions) return;
    for (const q of data.questions) {
      if (q.explanation) {
        cacheMelakQuestion({
          id: q.id,
          stem: q.stem,
          stemAm: q.stemAm,
          unit: q.unit,
          topic: q.topic,
          explanation: q.explanation,
          explanationAm: q.explanationAm,
        });
      }
    }
  }, [data?.questions]);

  if (isPending) return <ContentSkeleton rows={4} />;

  if (isError || !data) {
    return (
      <p className="text-error-text">
        {error instanceof Error ? error.message : "Could not load review"}
      </p>
    );
  }

  const wrong = data.answers.filter((a) => !a.isCorrect);
  const qMap = new Map(data.questions.map((q) => [q.id, q]));
  const activeQ = activeId ? qMap.get(activeId) : null;
  const activeA = activeId
    ? data.answers.find((a) => a.questionId === activeId)
    : null;

  if (wrong.length === 0) {
    return (
      <EmptyState
        icon={<Trophy className="h-12 w-12 text-accent-500" />}
        title="Perfect score!"
        body="You got every question right. Nothing to review."
        action={
          <Link href={`/quiz/${params.sessionId}/results`}>
            <GhostButton type="button">Back to results</GhostButton>
          </Link>
        }
      />
    );
  }

  function optionState(optionId: string): AnswerOptionState {
    if (!activeA || !activeQ) return "default";
    if (optionId === activeQ.correctOptionId) {
      return optionId === activeA.selectedOptionId
        ? "correct"
        : "correctUnselected";
    }
    if (optionId === activeA.selectedOptionId) return "wrong";
    return "default";
  }

  return (
    <>
      <header className="mb-6 text-center sm:text-left">
        <Link
          href={`/quiz/${params.sessionId}/results`}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-primary-700"
        >
          <ChevronLeft className="h-4 w-4" /> Back to results
        </Link>
        <h1 className="mt-4 text-[1.65rem] font-bold tracking-tight text-gray-950">
          Review wrong answers
        </h1>
        <p className="mt-2 text-[15px] text-gray-500">
          {wrong.length} question{wrong.length === 1 ? "" : "s"} to revisit
        </p>
      </header>

      <ul className="space-y-2.5">
        {wrong.map((a) => {
          const q = qMap.get(a.questionId);
          if (!q) return null;
          const qIndex = data.questions.findIndex((x) => x.id === q.id) + 1;
          const selected = q.options.find((o) => o.id === a.selectedOptionId);
          const correct = q.options.find((o) => o.id === q.correctOptionId);
          return (
            <li key={a.questionId}>
              <button
                type="button"
                onClick={() => setActiveId(a.questionId)}
                className="w-full rounded-lg border border-gray-200 border-l-[3px] border-l-error bg-white px-5 py-4 text-left hover:border-primary-400 hover:bg-primary-50"
              >
                <div className="flex items-start gap-2">
                  <span className="min-w-7 text-xs font-bold text-gray-400">
                    Q{qIndex}
                  </span>
                  <p className="flex-1 truncate text-sm text-gray-800">
                    {q.stem}
                  </p>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
                <p className="mt-1.5 pl-7 text-xs">
                  <span className="text-error-text">
                    You answered: {selected?.label ?? "—"}
                  </span>
                  <span className="text-gray-400"> · </span>
                  <span className="font-semibold text-success-text">
                    Correct: {correct?.label ?? "—"}
                  </span>
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      {activeQ && activeA ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
          <div className="max-h-[95vh] w-full max-w-[600px] overflow-y-auto rounded-t-xl bg-white sm:rounded-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <h2 className="font-semibold text-gray-950">
                Question{" "}
                {data.questions.findIndex((q) => q.id === activeQ.id) + 1}
              </h2>
              <button type="button" onClick={() => setActiveId(null)}>
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="text-lg text-gray-950">
                <MathText text={activeQ.stem} />
              </div>
              <div className="mt-4">
                {activeQ.options.map((opt) => (
                  <AnswerOption
                    key={opt.id}
                    letter={opt.label}
                    text={opt.text}
                    state={optionState(opt.id)}
                    disabled
                  />
                ))}
              </div>
              <div className="mt-2 border-t border-gray-100 pt-4">
                <p className="font-semibold text-error-text">
                  The correct answer is{" "}
                  {activeQ.options.find((o) => o.id === activeQ.correctOptionId)
                    ?.label}
                </p>
                <div className="mt-2 text-base text-gray-700">
                  <MathText text={activeQ.explanation ?? ""} />
                </div>
                <Link
                  href={`/melak?q=${encodeURIComponent(activeQ.id)}&session=${params.sessionId}`}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-800 hover:bg-primary-100"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask Melak about this
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
