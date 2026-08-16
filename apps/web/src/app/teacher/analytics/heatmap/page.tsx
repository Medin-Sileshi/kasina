"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Grid3X3 } from "lucide-react";
import { useTeacherTitle } from "@/components/teacher-chrome";
import {
  scoreTone,
  useTeacherClassInsights,
  type ClassInsight,
} from "@/lib/teacher-data";
import {
  Card,
  ContentSkeleton,
  EmptyState,
  MetricCard,
  PrimaryButton,
  StatusPill,
} from "@/components/ui";

type HeatRow = {
  unit: string;
  topic: string;
  accuracy: number;
  attempts: number;
  classId: string;
  className: string;
};

function collectHeat(insights: ClassInsight[]): HeatRow[] {
  const rows: HeatRow[] = [];
  for (const insight of insights) {
    for (const t of insight.results?.weakTopics ?? []) {
      rows.push({
        unit: t.unit,
        topic: t.topic,
        accuracy: t.accuracy,
        attempts: t.attempts,
        classId: insight.classItem.id,
        className: insight.classItem.name,
      });
    }
  }
  return rows.sort((a, b) => a.accuracy - b.accuracy);
}

function bandFor(accuracy: number) {
  if (accuracy >= 80) return { label: "Excellent", tone: "success" as const };
  if (accuracy >= 60) return { label: "Average", tone: "warning" as const };
  return { label: "Needs help", tone: "danger" as const };
}

export default function TopicHeatmapPage() {
  const insightsQuery = useTeacherClassInsights();
  const [classFilter, setClassFilter] = useState("all");

  useTeacherTitle("Topic Heatmap");

  const insights = insightsQuery.data ?? [];
  const allRows = useMemo(() => collectHeat(insights), [insights]);
  const rows = useMemo(
    () =>
      classFilter === "all"
        ? allRows
        : allRows.filter((r) => r.classId === classFilter),
    [allRows, classFilter],
  );

  if (insightsQuery.isPending && !insightsQuery.data) {
    return <ContentSkeleton rows={5} />;
  }

  if (insightsQuery.isError && !insightsQuery.data) {
    return (
      <p className="text-error-text">
        {insightsQuery.error instanceof Error
          ? insightsQuery.error.message
          : "Could not load heatmap"}
      </p>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500">
        Weak topics across your classes (accuracy under 70% with enough
        attempts). Assign a refresher from any row.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Weak topics" value={rows.length} />
        <MetricCard
          label="Avg accuracy"
          value={
            rows.length
              ? `${Math.round(
                  rows.reduce((n, r) => n + r.accuracy, 0) / rows.length,
                )}%`
              : "—"
          }
        />
        <MetricCard label="Classes" value={insights.length} />
      </div>

      {insights.length > 1 ? (
        <label className="mt-6 flex max-w-sm flex-col gap-1.5 text-sm text-gray-700">
          <span className="font-medium text-gray-800">Filter by class</span>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="h-12 rounded-xl border border-gray-200 bg-white px-3 outline-none focus:border-primary-600"
          >
            <option value="all">All classes</option>
            {insights.map((i) => (
              <option key={i.classItem.id} value={i.classItem.id}>
                {i.classItem.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Grid3X3 className="h-12 w-12" />}
            title="No heatmap data yet"
            body="Assign practice and have students complete sessions to unlock weak-topic insights."
            action={
              <Link href="/teacher/assign">
                <PrimaryButton type="button">Assign practice</PrimaryButton>
              </Link>
            }
          />
        </div>
      ) : (
        <Card className="mt-6 overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-[11px] uppercase tracking-[0.08em] text-gray-400">
                <th className="px-5 py-3 font-semibold">Topic</th>
                <th className="px-5 py-3 font-semibold">Class</th>
                <th className="px-5 py-3 font-semibold">Accuracy</th>
                <th className="px-5 py-3 font-semibold">Attempts</th>
                <th className="px-5 py-3 font-semibold">Band</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const band = bandFor(r.accuracy);
                return (
                  <tr
                    key={`${r.classId}-${r.unit}-${r.topic}`}
                    className="border-b border-gray-50"
                  >
                    <td className="px-5 py-3.5 font-medium text-gray-950">
                      {r.topic}
                      <p className="text-xs font-normal text-gray-400">
                        {r.unit}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{r.className}</td>
                    <td
                      className={`px-5 py-3.5 font-semibold ${scoreTone(r.accuracy)}`}
                    >
                      {r.accuracy}%
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{r.attempts}</td>
                    <td className="px-5 py-3.5">
                      <StatusPill tone={band.tone}>{band.label}</StatusPill>
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/teacher/classes/${r.classId}/assign?unit=${encodeURIComponent(r.unit)}&topic=${encodeURIComponent(r.topic)}&title=${encodeURIComponent(`${r.topic} · 10 questions`)}`}
                        className="font-semibold text-primary-700 hover:underline"
                      >
                        Assign →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
