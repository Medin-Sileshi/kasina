"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Flag, X } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { cacheMelakQuestion } from "@/lib/melak-cache";
import { formatTimer, useQuizStore } from "@/lib/quiz-store";
import {
  clearQuizUi,
  loadQuizUi,
  remainingTimerSeconds,
  saveQuizUi,
} from "@/lib/quiz-session-storage";
import {
  AnswerOption,
  type AnswerOptionState,
} from "@/components/answer-option";
import { MathText } from "@/components/math-text";
import {
  DifficultyBadge,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  EmptyState,
  ContentSkeleton,
} from "@/components/ui";
import { WifiOff } from "lucide-react";

type AnswerResponse = {
  answer: {
    selectedOptionId: string;
    isCorrect?: boolean;
    correctOptionId?: string;
    explanation?: string;
    explanationAm?: string | null;
    saved?: boolean;
  };
};

export default function QuizPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const sessionId = params.sessionId;

  const {
    questions,
    index,
    selectedOptionId,
    submitted,
    answers,
    contextLabel,
    sessionId: storeSessionId,
    mode,
    flagged,
    timerSeconds,
    selectOption,
    markSubmitted,
    markCbtSaved,
    toggleFlag,
    goTo,
    next,
    reset,
    tickTimer,
  } = useQuizStore();

  const [loading, setLoading] = useState(questions.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [showSubmitAll, setShowSubmitAll] = useState(false);

  const isCbt = mode === "cbt";

  useEffect(() => {
    if (storeSessionId === sessionId && questions.length > 0) {
      setLoading(false);
      return;
    }
    apiFetch<{
      session: {
        id: string;
        mode: string;
        topic?: string | null;
        unit?: string | null;
        year?: number | null;
        completedAt?: string | null;
      };
      questions: typeof questions;
      answers: Array<{
        questionId: string;
        selectedOptionId: string;
        isCorrect: boolean;
      }>;
    }>(`/sessions/${sessionId}`)
      .then((data) => {
        const cbt = data.session.mode === "cbt";
        const label =
          data.session.topic ||
          (data.session.year ? `${data.session.year} Exam` : "Practice");
        const restoredAnswers = Object.fromEntries(
          data.answers.map((a) => [
            a.questionId,
            cbt
              ? { selectedOptionId: a.selectedOptionId, saved: true }
              : {
                  selectedOptionId: a.selectedOptionId,
                  isCorrect: a.isCorrect,
                },
          ]),
        );
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
        const savedUi = loadQuizUi(data.session.id);
        const timerDuration = cbt && !data.session.completedAt ? 40 * 60 : null;
        const timerSeconds =
          cbt && !data.session.completedAt
            ? remainingTimerSeconds(
                savedUi?.timerStartedAt ?? Date.now(),
                savedUi?.timerDurationSec ?? timerDuration,
              )
            : null;
        reset({
          sessionId: data.session.id,
          questions: data.questions as never,
          contextLabel: label,
          mode: cbt ? "cbt" : "practice",
          flagged: savedUi?.flagged ?? {},
          timerSeconds,
        });
        if (Object.keys(restoredAnswers).length) {
          useQuizStore.setState({ answers: restoredAnswers });
        }
        if (savedUi != null) {
          useQuizStore.getState().goTo(savedUi.index);
        }
        if (cbt && !data.session.completedAt && !savedUi?.timerStartedAt) {
          saveQuizUi(data.session.id, {
            index: savedUi?.index ?? 0,
            flagged: savedUi?.flagged ?? {},
            timerStartedAt: Date.now(),
            timerDurationSec: timerDuration,
          });
        }
        if (data.session.completedAt) {
          router.replace(`/quiz/${sessionId}/results`);
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId, storeSessionId, questions.length, reset, router]);

  useEffect(() => {
    if (!sessionId || !questions.length) return;
    saveQuizUi(sessionId, {
      index,
      flagged,
      timerStartedAt:
        loadQuizUi(sessionId)?.timerStartedAt ??
        (isCbt ? Date.now() : null),
      timerDurationSec: isCbt ? 40 * 60 : null,
    });
  }, [sessionId, index, flagged, questions.length, isCbt]);

  useEffect(() => {
    if (!isCbt || timerSeconds == null) return;
    const id = window.setInterval(() => {
      tickTimer();
    }, 1000);
    return () => window.clearInterval(id);
  }, [isCbt, timerSeconds, tickTimer]);

  useEffect(() => {
    if (isCbt && timerSeconds === 0) {
      void finishExam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCbt, timerSeconds]);

  const question = questions[index];
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPct = total ? Math.round((answeredCount / total) * 100) : 0;

  const optionState = useCallback(
    (optionId: string): AnswerOptionState => {
      if (isCbt) {
        return selectedOptionId === optionId ? "selected" : "default";
      }
      if (!submitted || !question) {
        return selectedOptionId === optionId ? "selected" : "default";
      }
      const ans = answers[question.id];
      if (!ans?.correctOptionId) return "default";
      if (optionId === ans.correctOptionId) {
        return optionId === ans.selectedOptionId
          ? "correct"
          : "correctUnselected";
      }
      if (optionId === ans.selectedOptionId) return "wrong";
      return "default";
    },
    [isCbt, submitted, selectedOptionId, answers, question],
  );

  async function saveCbtAnswer(andAdvance = false) {
    if (!question || !selectedOptionId) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiFetch<AnswerResponse>(`/sessions/${sessionId}/answers`, {
        method: "POST",
        body: JSON.stringify({
          questionId: question.id,
          selectedOptionId,
        }),
      });
      markCbtSaved(question.id, selectedOptionId);
      if (andAdvance && index < total - 1) next();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save answer");
    } finally {
      setSubmitting(false);
    }
  }

  const onSubmit = async () => {
    if (!question || !selectedOptionId || submitted) return;
    if (isCbt) {
      await saveCbtAnswer(false);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const data = await apiFetch<AnswerResponse>(
        `/sessions/${sessionId}/answers`,
        {
          method: "POST",
          body: JSON.stringify({
            questionId: question.id,
            selectedOptionId,
          }),
        },
      );
      markSubmitted(data.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save answer");
    } finally {
      setSubmitting(false);
    }
  };

  async function finishExam() {
    setSubmitting(true);
    try {
      if (question && selectedOptionId && !answers[question.id]) {
        await saveCbtAnswer(false);
      }
      await apiFetch(`/sessions/${sessionId}/complete`, { method: "POST" });
      clearQuizUi(sessionId);
      router.push(`/quiz/${sessionId}/results`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete session");
      setSubmitting(false);
    }
  }

  const onNext = async () => {
    if (isCbt) {
      if (selectedOptionId && !answers[question?.id ?? ""]) {
        await saveCbtAnswer(true);
        return;
      }
      if (index >= total - 1) {
        setShowSubmitAll(true);
        return;
      }
      next();
      return;
    }
    if (index >= total - 1) {
      try {
        await apiFetch(`/sessions/${sessionId}/complete`, { method: "POST" });
        router.push(`/quiz/${sessionId}/results`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not complete session");
      }
      return;
    }
    next();
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!question || showExit || showSubmitAll) return;
      const key = e.key.toLowerCase();
      if (!submitted && ["a", "b", "c", "d"].includes(key)) {
        const opt = question.options.find(
          (o) => o.label.toLowerCase() === key || o.id === key,
        );
        if (opt) selectOption(opt.id);
      }
      if (e.key === "Enter") {
        if (isCbt && selectedOptionId) void saveCbtAnswer(true);
        else if (!submitted && selectedOptionId) void onSubmit();
        else if (submitted) void onNext();
      }
      if (e.key === "Escape") setShowExit(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, submitted, selectedOptionId, showExit, showSubmitAll, index, isCbt]);

  const explanation = useMemo(() => {
    if (!question || isCbt) return null;
    return answers[question.id];
  }, [answers, question, isCbt]);

  if (loading) {
    return (
      <main className="mx-auto max-w-[680px] px-5 py-12">
        <ContentSkeleton rows={3} />
      </main>
    );
  }

  if (error && !question) {
    return (
      <EmptyState
        icon={<WifiOff className="h-12 w-12" />}
        title="Couldn't load questions"
        body={error}
        action={
          <SecondaryButton
            onClick={() => router.push(isCbt ? "/cbt" : "/subjects/mathematics")}
          >
            Back
          </SecondaryButton>
        }
      />
    );
  }

  if (!question) {
    return (
      <EmptyState
        icon={<WifiOff className="h-12 w-12" />}
        title="No questions in this session"
        body="Try starting a new practice session."
        action={
          <SecondaryButton onClick={() => router.push("/subjects/mathematics")}>
            Back to Mathematics
          </SecondaryButton>
        }
      />
    );
  }

  return (
    <main className="relative min-h-full overflow-hidden bg-primary-800 pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(64,145,108,0.35),transparent_55%)]"
      />
      <div className="sticky top-0 z-50 text-white">
        <div className="mx-auto flex h-14 max-w-[680px] items-center justify-between gap-2 px-4 sm:px-5">
          <button
            type="button"
            aria-label="Exit quiz"
            onClick={() => setShowExit(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="min-w-0 truncate text-center text-sm">
            <span className="mr-2 hidden rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:inline">
              {isCbt ? "CBT" : "Practice"}
            </span>
            <span className="text-white/90">Mathematics</span>
            <span className="text-white/40"> · </span>
            <span className="text-white/70">{contextLabel}</span>
          </p>
          <div className="flex shrink-0 items-center gap-2 font-mono text-sm font-semibold tabular-nums">
            {isCbt && timerSeconds != null ? (
              <span
                className={
                  timerSeconds < 300 ? "text-amber-300" : "text-white/90"
                }
              >
                {formatTimer(timerSeconds)}
              </span>
            ) : null}
            <span>
              {index + 1}/{total}
            </span>
          </div>
        </div>
        <div className="h-1 w-full bg-white/15">
          <div
            className="h-full bg-accent-500 transition-all duration-400"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[680px] overflow-x-hidden px-0 pt-3 sm:px-4 sm:pt-4">
        <div className="rounded-t-[2rem] bg-gray-50 px-4 pb-8 pt-5 shadow-[0_-16px_48px_rgba(0,44,27,0.35)] sm:rounded-[1.75rem] sm:px-5 sm:pt-6">
          <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200 sm:hidden" />
          {isCbt ? (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {questions.map((q, i) => {
                const answered = Boolean(answers[q.id]);
                const isFlagged = flagged[q.id];
                const isCurrent = i === index;
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => goTo(i)}
                    className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold ${
                      isCurrent
                        ? "bg-primary-800 text-white"
                        : answered
                          ? "bg-primary-100 text-primary-800"
                          : isFlagged
                            ? "bg-amber-100 text-amber-800"
                            : "bg-white text-gray-600 ring-1 ring-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          ) : null}
          <div className="rounded-[1.25rem] border border-gray-200/70 bg-white p-5 sm:p-7 sm:pb-6">
            <div className="mb-4 flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.06em] text-gray-400">
                Question {index + 1}
              </p>
              <div className="flex items-center gap-2">
                {isCbt ? (
                  <button
                    type="button"
                    onClick={() => toggleFlag(question.id)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      flagged[question.id]
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Flag className="h-3 w-3" />
                    {flagged[question.id] ? "Flagged" : "Flag"}
                  </button>
                ) : null}
                <DifficultyBadge difficulty={question.difficulty} />
              </div>
            </div>
            <div className="break-words text-lg leading-relaxed text-gray-950">
              <MathText text={question.stem} />
            </div>
            {question.stemAm ? (
              <p
                lang="am"
                className="font-ethiopic mt-3 break-words text-lg leading-[1.9] text-gray-700"
              >
                {question.stemAm}
              </p>
            ) : null}
          </div>

          <div className="mt-4 overflow-x-hidden">
            {question.options.map((opt) => (
              <AnswerOption
                key={opt.id}
                letter={opt.label}
                text={opt.text}
                state={optionState(opt.id)}
                disabled={(submitted && !isCbt) || submitting}
                onClick={() => selectOption(opt.id)}
              />
            ))}
          </div>

          {submitted && explanation ? (
            <div className="mt-2 -mt-2 rounded-b-[1.25rem] border border-t-0 border-gray-100 bg-white px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex items-center gap-2">
                {explanation.isCorrect ? (
                  <p className="font-semibold text-success-text">Correct!</p>
                ) : (
                  <p className="font-semibold text-error-text">
                    The correct answer is{" "}
                    {question.options.find(
                      (o) => o.id === explanation.correctOptionId,
                    )?.label ?? explanation.correctOptionId?.toUpperCase()}
                  </p>
                )}
              </div>
              {explanation.explanation ? (
                <div className="mt-3 break-words text-base leading-relaxed text-gray-700">
                  <MathText text={explanation.explanation} />
                </div>
              ) : null}
              {explanation.explanationAm ? (
                <p
                  lang="am"
                  className="font-ethiopic mt-2 break-words text-base text-gray-600"
                >
                  {explanation.explanationAm}
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="mt-3 text-sm text-error-text">{error}</p>
          ) : null}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-md safe-pb">
        <div className="mx-auto flex max-w-[680px] flex-col gap-2">
          {isCbt ? (
            <>
              {selectedOptionId ? (
                <PrimaryButton
                  className="min-h-12"
                  disabled={submitting}
                  onClick={() => void saveCbtAnswer(true)}
                >
                  {submitting ? "Saving…" : "Save & next →"}
                </PrimaryButton>
              ) : null}
              <SecondaryButton
                className="min-h-12"
                disabled={submitting}
                onClick={() => setShowSubmitAll(true)}
              >
                Submit exam ({answeredCount}/{total} answered)
              </SecondaryButton>
            </>
          ) : (
            <>
              {selectedOptionId && !submitted ? (
                <PrimaryButton
                  className="min-h-12"
                  disabled={submitting}
                  onClick={() => void onSubmit()}
                >
                  {submitting ? "Saving…" : "Submit Answer"}
                </PrimaryButton>
              ) : null}
              {submitted ? (
                <PrimaryButton className="min-h-12" onClick={() => void onNext()}>
                  {index >= total - 1 ? "See Results →" : "Next Question →"}
                </PrimaryButton>
              ) : null}
            </>
          )}
        </div>
      </div>

      {showSubmitAll ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-t-[2rem] bg-white p-6 sm:rounded-[1.75rem]">
            <h2 className="text-lg font-semibold text-gray-950">Submit exam?</h2>
            <p className="mt-2 text-sm text-gray-500">
              You answered {answeredCount} of {total} questions.
              {answeredCount < total
                ? " Unanswered questions will be marked wrong."
                : ""}
            </p>
            <PrimaryButton
              className="mt-6 min-h-12"
              disabled={submitting}
              onClick={() => void finishExam()}
            >
              {submitting ? "Submitting…" : "Submit all →"}
            </PrimaryButton>
            <GhostButton
              className="mt-2 min-h-12"
              onClick={() => setShowSubmitAll(false)}
            >
              Keep working
            </GhostButton>
          </div>
        </div>
      ) : null}

      {showExit ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-t-[2rem] bg-white p-6 shadow-[0_-16px_48px_rgba(0,44,27,0.25)] sm:rounded-[1.75rem]">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-gray-200 sm:hidden" />
            <h2 className="text-lg font-semibold text-gray-950">
              Exit this {isCbt ? "exam" : "quiz"}?
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Your progress in this session will be saved. You can resume later
              from your progress page.
            </p>
            <PrimaryButton className="mt-6 min-h-12" onClick={() => setShowExit(false)}>
              Keep {isCbt ? "exam" : "practicing"}
            </PrimaryButton>
            <GhostButton
              className="mt-2 min-h-12"
              onClick={() => router.push(isCbt ? "/cbt" : "/subjects/mathematics")}
            >
              Exit
            </GhostButton>
          </div>
        </div>
      ) : null}
    </main>
  );
}
