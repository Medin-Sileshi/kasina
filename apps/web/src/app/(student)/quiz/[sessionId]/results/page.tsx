"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Trophy, TrendingUp, Target } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { useQuizStore, type QuizQuestion } from "@/lib/quiz-store";
import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  SectionLabel,
  ContentSkeleton,
} from "@/components/ui";

type SessionPayload = {
  session: {
    id: string;
    score: number | null;
    total: number | null;
    completedAt: string | null;
    topic?: string | null;
    unit?: string | null;
    mode: string;
  };
  questions: QuizQuestion[];
  answers: Array<{
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
  }>;
};

export default function ResultsPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const [displayPct, setDisplayPct] = useState(0);
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["session", params.sessionId, "results"],
    queryFn: async () => {
      let payload = await apiFetch<SessionPayload>(
        `/sessions/${params.sessionId}`,
      );
      if (!payload.session.completedAt) {
        await apiFetch(`/sessions/${params.sessionId}/complete`, {
          method: "POST",
        });
        payload = await apiFetch<SessionPayload>(
          `/sessions/${params.sessionId}`,
        );
      }
      return payload;
    },
  });

  const score = data?.session.score ?? 0;
  const total = data?.session.total ?? data?.questions.length ?? 0;
  const percent = total ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    if (!data) return;
    let frame = 0;
    const start = performance.now();
    const duration = 900;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      setDisplayPct(Math.round(percent * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [data, percent]);

  const topicBreakdown = useMemo(() => {
    if (!data) return [];
    const qMap = new Map(data.questions.map((q) => [q.id, q]));
    const stats = new Map<
      string,
      { topic: string; correct: number; total: number }
    >();
    for (const a of data.answers) {
      const q = qMap.get(a.questionId);
      if (!q) continue;
      const cur = stats.get(q.topic) ?? { topic: q.topic, correct: 0, total: 0 };
      cur.total += 1;
      if (a.isCorrect) cur.correct += 1;
      stats.set(q.topic, cur);
    }
    return [...stats.values()];
  }, [data]);

  const weakest = [...topicBreakdown].sort(
    (a, b) => a.correct / a.total - b.correct / b.total,
  )[0];

  const stars = percent >= 80 ? 3 : percent >= 60 ? 2 : 1;

  async function practiceWeak() {
    setStarting(true);
    setActionError(null);
    try {
      let body: Record<string, unknown> = {
        mode: "weak_topics",
        subject: "mathematics",
        grade: 12,
        count: 10,
      };
      let label = "Weak topics";

      try {
        const weak = await apiFetch<{
          weakTopics: Array<{ topic: string; unit: string }>;
        }>("/progress/weak-topics");
        if (weak.weakTopics[0]) {
          label = weak.weakTopics
            .slice(0, 3)
            .map((t) => t.topic)
            .join(", ");
        } else if (weakest) {
          body = {
            mode: "weak_topics",
            topic: weakest.topic,
            subject: "mathematics",
            grade: 12,
            count: 10,
          };
          label = weakest.topic;
        } else {
          body = {
            mode: "random",
            subject: "mathematics",
            grade: 12,
            count: 10,
          };
          label = "Practice";
        }
      } catch {
        if (weakest) {
          body = {
            mode: "weak_topics",
            topic: weakest.topic,
            subject: "mathematics",
            grade: 12,
            count: 10,
          };
          label = weakest.topic;
        }
      }

      const res = await apiFetch<{
        session: { id: string };
        questions: QuizQuestion[];
      }>("/sessions", { method: "POST", body: JSON.stringify(body) });
      useQuizStore.getState().reset({
        sessionId: res.session.id,
        questions: res.questions,
        contextLabel: label,
      });
      router.push(`/quiz/${res.session.id}`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not start");
      setStarting(false);
    }
  }

  async function retry() {
    setStarting(true);
    setActionError(null);
    try {
      const res = await apiFetch<{
        session: { id: string };
        questions: QuizQuestion[];
      }>("/sessions", {
        method: "POST",
        body: JSON.stringify({
          mode: "random",
          subject: "mathematics",
          grade: 12,
          count: 10,
        }),
      });
      useQuizStore.getState().reset({
        sessionId: res.session.id,
        questions: res.questions,
        contextLabel: "Practice",
      });
      router.push(`/quiz/${res.session.id}`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not start");
      setStarting(false);
    }
  }

  if (isPending) return <ContentSkeleton rows={4} />;

  if (isError || !data) {
    return (
      <p className="text-error-text">
        {error instanceof Error ? error.message : "Could not load results"}
      </p>
    );
  }

  const message =
    percent >= 80
      ? {
          icon: <Trophy className="h-5 w-5 text-accent-500" />,
          heading: "Strong session.",
          body: `You've mastered ${weakest?.topic ?? "this set"}. Keep this up.`,
        }
      : percent >= 60
        ? {
            icon: <TrendingUp className="h-5 w-5 text-primary-600" />,
            heading: "Good effort.",
            body: `Review ${weakest?.topic ?? "weak topics"} before your next session.`,
          }
        : {
            icon: <Target className="h-5 w-5 text-gray-500" />,
            heading: "Tough session — keep going.",
            body: `Let's focus on ${weakest?.topic ?? "fundamentals"} together.`,
          };

  return (
    <div className="-mx-4 -mt-2 overflow-hidden sm:-mx-6">
      <section className="relative overflow-hidden rounded-[1.75rem] bg-primary-800 px-6 pb-16 pt-10 text-center shadow-[0_16px_40px_rgba(0,44,27,0.25)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(64,145,108,0.35),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(244,162,97,0.14),transparent_45%)]"
        />
        <p className="relative text-6xl font-extrabold tracking-tight text-white">
          {displayPct}%
        </p>
        <p className="relative mt-1.5 text-base text-white/70">
          {score} correct out of {total} questions
        </p>
        <div className="relative mt-5 flex justify-center gap-1.5">
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              className={`h-7 w-7 ${n <= stars ? "fill-accent-500 text-accent-500" : "text-white/30"}`}
            />
          ))}
        </div>
        <p className="relative mt-4 text-xs font-medium uppercase tracking-[0.12em] text-accent-500/90">
          Mathematics
          {data.session.topic ? ` · ${data.session.topic}` : " · Practice"}
        </p>
      </section>

      <section className="relative z-10 -mt-8 rounded-t-[2rem] bg-white px-6 pb-10 pt-4 shadow-[0_-16px_48px_rgba(0,44,27,0.18)]">
        <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-gray-200" />
        <div className="mb-6 flex gap-3">
          {message.icon}
          <div>
            <h2 className="text-lg font-semibold text-gray-950">
              {message.heading}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{message.body}</p>
          </div>
        </div>

        <SectionLabel>How you did by topic</SectionLabel>
        <div className="mt-3">
          {topicBreakdown.map((t) => {
            const pct = Math.round((t.correct / t.total) * 100);
            return (
              <div
                key={t.topic}
                className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0"
              >
                <span className="flex-1 text-sm text-gray-700">{t.topic}</span>
                <div className="mx-3 h-1.5 w-[120px] overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full rounded-full ${pct >= 80 ? "bg-primary-500" : pct >= 50 ? "bg-warning" : "bg-error"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-12 text-right text-sm font-semibold text-gray-600">
                  {t.correct}/{t.total}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-7 space-y-2.5">
          <PrimaryButton
            disabled={starting}
            onClick={() => void practiceWeak()}
            className="rounded-2xl"
          >
            {percent < 80 ? "Practice weak topics →" : "Practice again →"}
          </PrimaryButton>
          <SecondaryButton
            disabled={starting}
            onClick={() => void retry()}
            className="rounded-2xl"
          >
            Try this quiz again
          </SecondaryButton>
          {data.answers.some((a) => !a.isCorrect) ? (
            <Link href={`/quiz/${params.sessionId}/review`}>
              <SecondaryButton type="button" className="rounded-2xl">
                Review wrong answers
              </SecondaryButton>
            </Link>
          ) : null}
          <GhostButton onClick={() => router.push("/subjects/mathematics")}>
            Back to Mathematics
          </GhostButton>
        </div>
        {actionError ? (
          <p className="mt-3 text-sm text-error-text">{actionError}</p>
        ) : null}
      </section>
    </div>
  );
}
