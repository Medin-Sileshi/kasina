"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronDown, ChevronLeft } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { useQuizStore, type QuizQuestion } from "@/lib/quiz-store";
import {
  PrimaryButton,
  SecondaryButton,
  SectionLabel,
  EmptyState,
  StatusPill,
  ContentSkeleton,
} from "@/components/ui";

type MetaResponse = {
  subject: string;
  grade: number;
  questionCount: number;
  overallAccuracy: number | null;
  years: number[];
  units: Array<{
    unit: string;
    topics: Array<{
      topic: string;
      questionCount: number;
      accuracy: number | null;
    }>;
  }>;
};

type StartResponse = {
  session: {
    id: string;
    mode: string;
    topic?: string | null;
    unit?: string | null;
    year?: number | null;
  };
  questions: QuizQuestion[];
};

function accuracyColor(acc: number | null) {
  if (acc == null) return "text-gray-400";
  if (acc >= 70) return "text-success-text";
  if (acc >= 40) return "text-warning-text";
  return "text-error-text";
}

function barColor(acc: number | null) {
  if (acc == null) return "bg-gray-200";
  if (acc >= 70) return "bg-primary-500";
  if (acc >= 40) return "bg-warning";
  return "bg-error";
}

export default function MathematicsSubjectPage() {
  const router = useRouter();
  const reset = useQuizStore((s) => s.reset);
  const [starting, setStarting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [openUnit, setOpenUnit] = useState<string | null>(null);

  const metaQuery = useQuery({
    queryKey: ["subjects", "mathematics", "meta"],
    queryFn: () => apiFetch<MetaResponse>("/subjects/mathematics/meta"),
  });

  const meta = metaQuery.data;

  useEffect(() => {
    if (meta && openUnit == null) {
      setOpenUnit(meta.units[0]?.unit ?? null);
    }
  }, [meta, openUnit]);

  async function startSession(body: Record<string, unknown>, label: string) {
    setStarting(true);
    setActionError(null);
    try {
      const data = await apiFetch<StartResponse>("/sessions", {
        method: "POST",
        body: JSON.stringify(body),
      });
      reset({
        sessionId: data.session.id,
        questions: data.questions,
        contextLabel: label,
      });
      router.push(`/quiz/${data.session.id}`);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not start session");
      setStarting(false);
    }
  }

  const totalTopics = useMemo(
    () => meta?.units.reduce((n, u) => n + u.topics.length, 0) ?? 0,
    [meta],
  );

  if (metaQuery.isPending) return <ContentSkeleton rows={5} />;

  if (metaQuery.isError) {
    return (
      <EmptyState
        icon={<BookOpen className="h-12 w-12" />}
        title="Couldn't load questions"
        body={
          metaQuery.error instanceof Error
            ? metaQuery.error.message
            : "Something went wrong"
        }
        action={
          <SecondaryButton onClick={() => void metaQuery.refetch()}>
            Try again
          </SecondaryButton>
        }
      />
    );
  }

  if (!meta || meta.questionCount === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="h-12 w-12" />}
        title="No questions yet"
        body="Questions for this subject are being added. Check back soon."
        action={
          <Link href="/student">
            <SecondaryButton type="button">Back home</SecondaryButton>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="text-center sm:text-left">
        <Link
          href="/student"
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-primary-700"
        >
          <ChevronLeft className="h-5 w-5" /> Home
        </Link>
        <div className="mt-5 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-accent-500">
              Grade {meta.grade}
            </p>
            <h1 className="mt-2 text-[1.65rem] font-bold tracking-tight text-gray-950 sm:text-[1.85rem]">
              Mathematics
            </h1>
            <p className="mt-2 text-[15px] text-gray-500">
              {meta.questionCount} questions · {totalTopics} topics
            </p>
            <Link
              href="/read/mathematics"
              className="mt-3 inline-block text-[13px] font-semibold text-primary-700 underline-offset-2 hover:underline"
            >
              Read Grade 12 Math textbook
            </Link>
          </div>
          {meta.overallAccuracy != null ? (
            <StatusPill tone="accent">{meta.overallAccuracy}% accuracy</StatusPill>
          ) : null}
        </div>
      </div>

      <div className="mt-8">
        <SectionLabel>Start practicing</SectionLabel>
        <PrimaryButton
          className="mt-3"
          disabled={starting}
          onClick={() =>
            startSession(
              { mode: "random", subject: "mathematics", grade: 12, count: 10 },
              "10 random",
            )
          }
        >
          {starting ? "Starting…" : "Practice 10 random questions"}
        </PrimaryButton>

        {meta.years.length > 0 ? (
          <>
            <SectionLabel>
              <span className="mt-8 block">By year</span>
            </SectionLabel>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {meta.years.map((year) => (
                <button
                  key={year}
                  type="button"
                  disabled={starting}
                  onClick={() =>
                    startSession(
                      {
                        mode: "year",
                        year,
                        subject: "mathematics",
                        grade: 12,
                        count: 10,
                      },
                      `${year} Exam`,
                    )
                  }
                  className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 hover:border-primary-600 hover:text-primary-700"
                >
                  {year}
                </button>
              ))}
            </div>
          </>
        ) : null}

        <SectionLabel>
          <span className="mt-8 block">By topic</span>
        </SectionLabel>
        <div className="mt-3 space-y-2">
          {meta.units.map((unit) => {
            const open = openUnit === unit.unit;
            const unitAccs = unit.topics
              .map((t) => t.accuracy)
              .filter((a): a is number => a != null);
            const unitAcc =
              unitAccs.length > 0
                ? Math.round(
                    unitAccs.reduce((s, a) => s + a, 0) / unitAccs.length,
                  )
                : null;
            const qCount = unit.topics.reduce((s, t) => s + t.questionCount, 0);
            return (
              <div
                key={unit.unit}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                  onClick={() => setOpenUnit(open ? null : unit.unit)}
                >
                  <div className="flex-1 pr-3">
                    <p className="font-semibold text-gray-950">{unit.unit}</p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full ${barColor(unitAcc)}`}
                        style={{ width: `${unitAcc ?? 0}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {unitAcc != null ? `${unitAcc}%` : "—"} · {qCount}{" "}
                      questions
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open
                  ? unit.topics.map((topic) => (
                      <div
                        key={topic.topic}
                        className="flex items-center justify-between border-t border-gray-100 py-2.5 pl-4 pr-5"
                      >
                        <div>
                          <p className="text-sm text-gray-700">{topic.topic}</p>
                          <p
                            className={`text-sm font-semibold ${accuracyColor(topic.accuracy)}`}
                          >
                            {topic.accuracy != null
                              ? `${topic.accuracy}%`
                              : "Not practiced"}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={starting}
                          onClick={() =>
                            startSession(
                              {
                                mode: "topic",
                                unit: unit.unit,
                                topic: topic.topic,
                                subject: "mathematics",
                                grade: 12,
                                count: 10,
                              },
                              topic.topic,
                            )
                          }
                          className="text-sm font-medium text-primary-700 hover:underline"
                        >
                          Practice →
                        </button>
                      </div>
                    ))
                  : null}
              </div>
            );
          })}
        </div>

        {actionError ? (
          <p className="mt-4 text-sm text-error-text">{actionError}</p>
        ) : null}
      </div>
    </div>
  );
}
