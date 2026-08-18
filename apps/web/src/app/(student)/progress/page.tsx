"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart2, Flame, CheckCircle } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { useQuizStore, type QuizQuestion } from "@/lib/quiz-store";
import {
  PrimaryButton,
  SectionLabel,
  EmptyState,
  MetricCard,
  Card,
  StatusPill,
  ContentSkeleton,
} from "@/components/ui";

type ProgressResponse = {
  stats: {
    questionsAnswered: number;
    averageScore: number;
    dayStreak: number;
  };
  subjects: Array<{
    id: string;
    name: string;
    questionsAnswered: number;
    averageScore: number;
    active: boolean;
  }>;
  weakTopics: Array<{
    topic: string;
    unit: string;
    accuracy: number;
    attempts: number;
  }>;
  recentSessions: Array<{
    id: string;
    subject: string;
    topic: string | null;
    score: number | null;
    total: number | null;
    percent: number;
    completedAt: string | null;
  }>;
  inProgressSessions: Array<{
    id: string;
    subject: string;
    topic: string | null;
    unit: string | null;
    mode: string;
    total: number | null;
    startedAt: string;
  }>;
};

function scoreColor(pct: number) {
  if (pct >= 80) return "text-success-text";
  if (pct >= 60) return "text-warning-text";
  return "text-error-text";
}

export default function ProgressPage() {
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["progress"],
    queryFn: () => apiFetch<ProgressResponse>("/progress"),
  });

  async function practiceTopic(topic: string, unit?: string) {
    setStarting(true);
    setActionError(null);
    try {
      const res = await apiFetch<{
        session: { id: string };
        questions: QuizQuestion[];
      }>("/sessions", {
        method: "POST",
        body: JSON.stringify({
          mode: "weak_topics",
          topic,
          unit,
          subject: "mathematics",
          grade: 12,
          count: 10,
        }),
      });
      useQuizStore.getState().reset({
        sessionId: res.session.id,
        questions: res.questions,
        contextLabel: topic,
      });
      router.push(`/quiz/${res.session.id}`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not start");
      setStarting(false);
    }
  }

  async function practiceAllWeak() {
    setStarting(true);
    setActionError(null);
    try {
      const res = await apiFetch<{
        session: { id: string };
        questions: QuizQuestion[];
      }>("/sessions", {
        method: "POST",
        body: JSON.stringify({
          mode: "weak_topics",
          subject: "mathematics",
          grade: 12,
          count: 10,
        }),
      });
      useQuizStore.getState().reset({
        sessionId: res.session.id,
        questions: res.questions,
        contextLabel: "Weak topics",
      });
      router.push(`/quiz/${res.session.id}`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not start");
      setStarting(false);
    }
  }

  if (isPending) return <ContentSkeleton rows={5} />;

  if (isError || !data) {
    return (
      <p className="text-error-text">
        {error instanceof Error ? error.message : "Could not load progress"}
      </p>
    );
  }

  if (data.stats.questionsAnswered === 0 && !data.inProgressSessions?.length) {
    return (
      <EmptyState
        icon={<BarChart2 className="h-12 w-12" />}
        title="No practice sessions yet"
        body="Start practicing to see your progress here."
        action={
          <Link href="/subjects/mathematics">
            <PrimaryButton type="button">Start practicing</PrimaryButton>
          </Link>
        }
      />
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3 text-center sm:text-left">
        <div className="w-full sm:w-auto">
          <h1 className="text-[1.65rem] font-bold tracking-tight text-gray-950 sm:text-[1.85rem]">
            Your study plan
          </h1>
          <p className="mt-2 text-[15px] text-gray-500">
            Updated based on your recent practice
          </p>
        </div>
        <StatusPill tone="accent">
          <Flame className="h-3.5 w-3.5" />
          {data.stats.dayStreak} day streak
        </StatusPill>
      </div>

      {data.inProgressSessions?.length ? (
        <>
          <SectionLabel>
            <span className="mt-8 block">Continue</span>
          </SectionLabel>
          <div className="mt-3 space-y-2">
            {data.inProgressSessions.map((s) => (
              <Link
                key={s.id}
                href={`/quiz/${s.id}`}
                className="block overflow-hidden rounded-2xl border border-primary-200 bg-primary-50/40 transition hover:border-primary-400"
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="font-semibold text-gray-950">
                      {s.mode === "cbt" ? "CBT exam" : "Practice session"}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {s.topic ?? s.unit ?? s.subject}
                      {s.total ? ` · ${s.total} questions` : ""}
                    </p>
                  </div>
                  <PrimaryButton type="button" className="shrink-0">
                    Resume
                  </PrimaryButton>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Questions answered"
          value={data.stats.questionsAnswered}
          hint="all time"
        />
        <MetricCard
          label="Average score"
          value={`${data.stats.averageScore}%`}
          hint="completed sessions"
        />
        <MetricCard
          label="Day streak"
          value={
            <span className="inline-flex items-center gap-1">
              {data.stats.dayStreak}
              <Flame className="h-5 w-5 text-accent-500" />
            </span>
          }
          hint="days in a row"
        />
      </div>

      <SectionLabel>
        <span className="mt-8 block">By subject</span>
      </SectionLabel>
      <div className="mt-3 space-y-2">
        {data.subjects.map((s) => (
          <Link
            key={s.id}
            href={s.active ? "/subjects/mathematics" : "#"}
            className={`block overflow-hidden rounded-2xl border border-gray-200 bg-white ${s.active ? "hover:border-primary-400" : "opacity-60"}`}
          >
            <div className="flex">
              <span className="w-1.5 shrink-0 bg-subject-math" aria-hidden />
              <div className="flex-1 px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-950">{s.name}</p>
                  <p
                    className={`text-sm font-semibold ${scoreColor(s.averageScore)}`}
                  >
                    {s.averageScore}% avg
                  </p>
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  {s.questionsAnswered} questions
                  {!s.active ? " · Coming soon" : ""}
                </p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-subject-math"
                    style={{ width: `${s.averageScore}%` }}
                  />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <SectionLabel>
        <span className="mt-8 block">Focus areas</span>
      </SectionLabel>
      <p className="mt-1 text-sm text-gray-400">
        Accuracy under 70% with at least 3 attempts
      </p>
      {data.weakTopics.length === 0 ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-success-text">
          <CheckCircle className="h-4 w-4" /> No weak topics right now. Keep it
          up!
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          <PrimaryButton
            disabled={starting}
            onClick={() => void practiceAllWeak()}
            className="mb-2"
          >
            {starting ? "Starting…" : "Practice weak topics →"}
          </PrimaryButton>
          {data.weakTopics.map((t) => (
            <Card
              key={`${t.unit}-${t.topic}`}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-semibold text-gray-950">
                  {t.topic} · {t.accuracy}%
                </p>
                <p className="text-sm text-gray-500">
                  {t.unit} · {t.attempts} attempts
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone="danger">Weak</StatusPill>
                <button
                  type="button"
                  disabled={starting}
                  onClick={() => void practiceTopic(t.topic, t.unit)}
                  className="h-10 rounded-xl bg-primary-800 px-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  Practice
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SectionLabel>
        <span className="mt-8 block">Recent sessions</span>
      </SectionLabel>
      <Card className="mt-3 overflow-hidden p-0">
        <div className="grid grid-cols-4 gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5 text-xs uppercase tracking-[0.06em] text-gray-400">
          <span>Date</span>
          <span>Topic</span>
          <span>Questions</span>
          <span>Score</span>
        </div>
        {data.recentSessions.map((s) => (
          <Link
            key={s.id}
            href={`/quiz/${s.id}/results`}
            className="grid grid-cols-4 gap-2 border-b border-gray-100 px-4 py-3 text-sm text-gray-700 last:border-0 hover:bg-primary-50"
          >
            <span>
              {s.completedAt
                ? new Date(s.completedAt).toLocaleDateString()
                : "—"}
            </span>
            <span className="truncate">{s.topic ?? "Practice"}</span>
            <span>{s.total ?? "—"}</span>
            <span className={`font-semibold ${scoreColor(s.percent)}`}>
              {s.percent}%
            </span>
          </Link>
        ))}
      </Card>
      {actionError ? (
        <p className="mt-3 text-sm text-error-text">{actionError}</p>
      ) : null}
    </>
  );
}
