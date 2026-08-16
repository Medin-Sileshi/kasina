"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronRight, GraduationCap, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { useMe } from "@/lib/session";
import {
  Card,
  ContentSkeleton,
  PrimaryButton,
  SecondaryButton,
  StatusPill,
} from "@/components/ui";
import { useQuizStore, type QuizQuestion } from "@/lib/quiz-store";

type AssignmentMine = {
  id: string;
  className: string;
  title: string;
  unit: string | null;
  topic: string | null;
  questionCount: number;
  dueAt: string | null;
  status: "todo" | "done";
  score: number | null;
  total: number | null;
};

type ProgressLite = {
  stats: { questionsAnswered: number; averageScore: number; dayStreak: number };
  weakTopics: Array<{ topic: string; accuracy: number }>;
};

type StartResponse = {
  session: { id: string };
  questions: QuizQuestion[];
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function StudentHomePage() {
  const router = useRouter();
  const reset = useQuizStore((s) => s.reset);
  const meQuery = useMe();
  const me = meQuery.data;
  const [startingId, setStartingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const homeQuery = useQuery({
    queryKey: ["student-home"],
    queryFn: async () => {
      const [mine, prog] = await Promise.all([
        apiFetch<{ assignments: AssignmentMine[] }>("/assignments/mine"),
        apiFetch<ProgressLite>("/progress").catch(() => null),
      ]);
      return { assignments: mine.assignments, progress: prog };
    },
  });

  const assignments = homeQuery.data?.assignments ?? [];
  const progress = homeQuery.data?.progress ?? null;

  const todoFirst = useMemo(
    () =>
      [...assignments].sort(
        (a, b) => Number(a.status === "done") - Number(b.status === "done"),
      ),
    [assignments],
  );
  const pickup = todoFirst.find((a) => a.status === "todo") ?? todoFirst[0];
  const weak = progress?.weakTopics?.[0];
  const goalDone = Math.min(progress?.stats.questionsAnswered ?? 0, 20);
  const goalPct = Math.round((goalDone / 20) * 100);

  async function startAssignment(a: AssignmentMine) {
    setStartingId(a.id);
    setActionError(null);
    try {
      const data = await apiFetch<StartResponse>("/sessions", {
        method: "POST",
        body: JSON.stringify({ assignmentId: a.id }),
      });
      reset({
        sessionId: data.session.id,
        questions: data.questions,
        contextLabel: a.title,
      });
      router.push(`/quiz/${data.session.id}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Could not start");
      setStartingId(null);
    }
  }

  if ((!me && meQuery.isPending) || (homeQuery.isPending && !homeQuery.data)) {
    return <ContentSkeleton rows={5} />;
  }

  if (homeQuery.isError && !homeQuery.data) {
    return (
      <p className="text-error-text">
        {homeQuery.error instanceof Error
          ? homeQuery.error.message
          : "Could not load home"}
      </p>
    );
  }

  if (!me) {
    return <ContentSkeleton rows={5} />;
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-[1.75rem] bg-primary-800 px-6 py-8 text-white shadow-[0_16px_40px_rgba(11,46,31,0.25)] sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full bg-primary-700/50" />
        <div className="pointer-events-none absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-primary-900/50" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-[radial-gradient(ellipse_at_bottom,rgba(244,162,97,0.15),transparent_70%)]" />
        <h1 className="relative text-[1.85rem] font-bold tracking-tight sm:text-3xl">
          {greeting()}, {me.user.name.split(" ")[0]}
        </h1>
        <p className="relative mt-2.5 flex items-center gap-2 text-sm text-white/75">
          <Calendar className="h-4 w-4 shrink-0" />
          {me.classes[0]?.name ?? "Grade 12 Mathematics"} · Keep practicing
        </p>
        <div className="relative mt-8">
          <div className="mb-2.5 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.1em] text-white/55">
            <span>Today&apos;s goal</span>
            <span className="normal-case tracking-normal text-white/80">
              {goalDone}/20 questions
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-accent-500 transition-all"
              style={{ width: `${Math.max(goalPct, goalDone > 0 ? 8 : 0)}%` }}
            />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-950">
          Pick up where you left off
        </h2>
        {pickup ? (
          <Card className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <StatusPill tone="success">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                {pickup.className}
              </StatusPill>
              <h3 className="mt-3 text-xl font-bold text-gray-950">
                {pickup.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {pickup.questionCount} questions
                {pickup.topic ? ` · ${pickup.topic}` : ""}
                {pickup.status === "done" && pickup.total != null
                  ? ` · Last ${pickup.score}/${pickup.total}`
                  : ""}
              </p>
              <button
                type="button"
                disabled={startingId === pickup.id}
                onClick={() => startAssignment(pickup)}
                className="mt-4 inline-flex h-11 items-center rounded-xl bg-primary-800 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {startingId === pickup.id
                  ? "Starting…"
                  : pickup.status === "done"
                    ? "Practice again →"
                    : "Continue Practice →"}
              </button>
            </div>
            <div className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-300 sm:flex">
              <GraduationCap className="h-10 w-10" />
            </div>
          </Card>
        ) : (
          <Card className="mt-3">
            <p className="text-sm text-gray-600">
              No assignments yet. Start self-practice below.
            </p>
            <Link href="/subjects/mathematics" className="mt-4 inline-block">
              <PrimaryButton type="button" className="sm:w-auto">
                Practice Mathematics →
              </PrimaryButton>
            </Link>
          </Card>
        )}
      </section>

      {assignments.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-gray-950">Assigned for you</h2>
          <ul className="mt-3 space-y-2">
            {assignments.map((a) => (
              <li key={a.id}>
                <Card className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-950">
                      {a.title}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {a.questionCount} Q
                      {a.topic ? ` · ${a.topic}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill tone={a.status === "done" ? "success" : "warning"}>
                      {a.status === "done" ? "Done" : "To do"}
                    </StatusPill>
                    <button
                      type="button"
                      disabled={startingId === a.id}
                      onClick={() => startAssignment(a)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-primary-700"
                      aria-label="Start"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-950">Your subjects</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Link href="/subjects/mathematics">
            <Card className="flex items-center gap-3 overflow-hidden p-0 transition hover:border-primary-400">
              <span className="h-full w-1.5 shrink-0 self-stretch bg-subject-math" />
              <div className="flex flex-1 items-center justify-between py-4 pr-4">
                <div>
                  <p className="font-semibold text-gray-950">Mathematics</p>
                  <p className="text-sm text-gray-500">Grade 12 · Practice</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </div>
            </Card>
          </Link>
          <Link href="/progress">
            <Card className="flex items-center gap-3 overflow-hidden p-0 transition hover:border-primary-400">
              <span className="h-full w-1.5 shrink-0 self-stretch bg-primary-600" />
              <div className="flex flex-1 items-center justify-between py-4 pr-4">
                <div>
                  <p className="font-semibold text-gray-950">My Progress</p>
                  <p className="text-sm text-gray-500">
                    Streak {progress?.stats.dayStreak ?? 0} days
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {weak ? (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950">
            <Sparkles className="h-5 w-5 text-accent-500" />
            Focus suggestion
          </h2>
          <Card className="mt-3 border-accent-500/30">
            <h3 className="font-bold text-gray-950">Review {weak.topic}</h3>
            <p className="mt-1 text-sm text-gray-500">
              Accuracy {weak.accuracy}% — a short refresher can help.
            </p>
            <Link href="/progress" className="mt-4 inline-block">
              <SecondaryButton type="button" className="sm:w-auto">
                Practice weak topics →
              </SecondaryButton>
            </Link>
          </Card>
        </section>
      ) : null}

      {actionError ? (
        <p className="mt-4 text-sm text-error-text">{actionError}</p>
      ) : null}
    </>
  );
}
