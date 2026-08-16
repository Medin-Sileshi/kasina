"use client";

import Link from "next/link";
import { useMemo } from "react";
import { LineChart } from "lucide-react";
import { useTeacherTitle } from "@/components/teacher-chrome";
import {
  flattenStudents,
  readinessFromPercent,
  useTeacherClassInsights,
} from "@/lib/teacher-data";
import {
  Card,
  ContentSkeleton,
  EmptyState,
  MetricCard,
  PrimaryButton,
  StatusPill,
} from "@/components/ui";

export default function ExamPredictionsPage() {
  const insightsQuery = useTeacherClassInsights();

  useTeacherTitle("Exam Predictions");

  const rows = useMemo(() => {
    const students = flattenStudents(insightsQuery.data ?? []);
    return students
      .map((s) => ({
        ...s,
        readiness: readinessFromPercent(s.lastPercent),
      }))
      .sort((a, b) => {
        const ae = a.readiness.estimate ?? -1;
        const be = b.readiness.estimate ?? -1;
        return ae - be;
      });
  }, [insightsQuery.data]);

  const withData = rows.filter((r) => r.readiness.estimate != null);
  const onTrack = withData.filter((r) => r.readiness.tone === "success").length;
  const needsReview = withData.filter(
    (r) => r.readiness.tone === "warning",
  ).length;
  const atRisk = withData.filter((r) => r.readiness.tone === "danger").length;

  if (insightsQuery.isPending && !insightsQuery.data) {
    return <ContentSkeleton rows={5} />;
  }

  if (insightsQuery.isError && !insightsQuery.data) {
    return (
      <p className="text-error-text">
        {insightsQuery.error instanceof Error
          ? insightsQuery.error.message
          : "Could not load predictions"}
      </p>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500">
        Practice-based readiness estimates from each student&apos;s latest
        session score. This is a classroom guide — not an official exam
        forecast.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="With estimates" value={withData.length} />
        <MetricCard
          label="On track"
          value={onTrack}
          accent="default"
          valueClassName="text-primary-700"
        />
        <MetricCard
          label="Needs review"
          value={needsReview}
          accent={needsReview ? "warning" : "default"}
        />
        <MetricCard
          label="At risk"
          value={atRisk}
          accent={atRisk ? "danger" : "default"}
        />
      </div>

      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<LineChart className="h-12 w-12" />}
            title="No students yet"
            body="Invite students and run practice sessions to see readiness estimates."
            action={
              <Link href="/teacher/classes">
                <PrimaryButton type="button">Open My Classes</PrimaryButton>
              </Link>
            }
          />
        </div>
      ) : (
        <Card className="mt-6 overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80 text-[11px] uppercase tracking-[0.08em] text-gray-400">
                <th className="px-5 py-3 font-semibold">Student</th>
                <th className="px-5 py-3 font-semibold">Class</th>
                <th className="px-5 py-3 font-semibold">Last practice</th>
                <th className="px-5 py-3 font-semibold">Estimate</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={`${s.classId}-${s.studentId}`}
                  className="border-b border-gray-50"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-950">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{s.className}</td>
                  <td className="px-5 py-3.5 text-gray-700">
                    {s.lastPercent != null ? `${s.lastPercent}%` : "—"}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-950">
                    {s.readiness.estimate != null
                      ? `${s.readiness.estimate}%`
                      : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusPill tone={s.readiness.tone}>
                      {s.readiness.label}
                    </StatusPill>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/teacher/classes/${s.classId}/assign`}
                      className="font-semibold text-primary-700 hover:underline"
                    >
                      Assign →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
