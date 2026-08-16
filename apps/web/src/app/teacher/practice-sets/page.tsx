"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, ChevronDown } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { useTeacherTitle } from "@/components/teacher-chrome";
import { useTeacherClasses } from "@/lib/teacher-data";
import {
  Card,
  ContentSkeleton,
  EmptyState,
  MetricCard,
  PrimaryButton,
  StatusPill,
} from "@/components/ui";

type MetaResponse = {
  subject: string;
  grade: number;
  questionCount: number;
  units: Array<{
    unit: string;
    topics: Array<{
      topic: string;
      questionCount: number;
      accuracy: number | null;
    }>;
  }>;
};

export default function PracticeSetsPage() {
  const classesQuery = useTeacherClasses();
  const [openUnit, setOpenUnit] = useState<string | null>(null);
  const [classId, setClassId] = useState("");

  useTeacherTitle("Practice Sets");

  const metaQuery = useQuery({
    queryKey: ["subjects", "mathematics", "meta"],
    queryFn: () => apiFetch<MetaResponse>("/subjects/mathematics/meta"),
  });

  const classes = classesQuery.data ?? [];
  const meta = metaQuery.data;
  const topicCount = useMemo(
    () => meta?.units.reduce((n, u) => n + u.topics.length, 0) ?? 0,
    [meta],
  );

  const selectedClassId = classId || classes[0]?.id || "";

  if (
    (metaQuery.isPending && !metaQuery.data) ||
    (classesQuery.isPending && !classesQuery.data)
  ) {
    return <ContentSkeleton rows={5} />;
  }

  if (metaQuery.isError || !meta) {
    return (
      <EmptyState
        icon={<BookOpen className="h-12 w-12" />}
        title="Couldn’t load practice sets"
        body={
          metaQuery.error instanceof Error
            ? metaQuery.error.message
            : "Try again in a moment."
        }
      />
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500">
        Grade {meta.grade} Mathematics topics from the question bank. Pick a
        class, then assign a set.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Questions" value={meta.questionCount} />
        <MetricCard label="Units" value={meta.units.length} />
        <MetricCard label="Topics" value={topicCount} />
      </div>

      {classes.length > 0 ? (
        <label className="mt-6 flex max-w-sm flex-col gap-1.5 text-sm text-gray-700">
          <span className="font-medium text-gray-800">Assign to class</span>
          <select
            value={selectedClassId}
            onChange={(e) => setClassId(e.target.value)}
            className="h-12 rounded-xl border border-gray-200 bg-white px-3 outline-none focus:border-primary-600"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <Card className="mt-6">
          <p className="text-sm text-gray-600">
            Create a class before assigning practice sets.
          </p>
          <Link href="/teacher/classes" className="mt-4 inline-block">
            <PrimaryButton type="button" className="sm:w-auto">
              Go to My Classes
            </PrimaryButton>
          </Link>
        </Card>
      )}

      <div className="mt-6 space-y-2">
        {meta.units.map((unit) => {
          const open = openUnit === unit.unit;
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
                <div>
                  <p className="font-semibold text-gray-950">{unit.unit}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {unit.topics.length} topics · {qCount} questions
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
                      className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {topic.topic}
                        </p>
                        <p className="text-xs text-gray-400">
                          {topic.questionCount} questions
                          {topic.accuracy != null
                            ? ` · class accuracy ${topic.accuracy}%`
                            : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill tone="neutral">Topic set</StatusPill>
                        {selectedClassId ? (
                          <Link
                            href={`/teacher/classes/${selectedClassId}/assign?unit=${encodeURIComponent(unit.unit)}&topic=${encodeURIComponent(topic.topic)}&title=${encodeURIComponent(`${topic.topic} · 10 questions`)}`}
                            className="text-sm font-semibold text-primary-700 hover:underline"
                          >
                            Assign →
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))
                : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
