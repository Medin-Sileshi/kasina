"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useTeacherTitle } from "@/components/teacher-chrome";
import {
  flattenStudents,
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

const AT_RISK_THRESHOLD = 50;

export default function AtRiskStudentsPage() {
  const insightsQuery = useTeacherClassInsights();

  useTeacherTitle("At-Risk Students");

  const atRisk = useMemo(() => {
    const students = flattenStudents(insightsQuery.data ?? []);
    return students
      .filter(
        (s) => s.lastPercent != null && s.lastPercent < AT_RISK_THRESHOLD,
      )
      .sort((a, b) => (a.lastPercent ?? 0) - (b.lastPercent ?? 0));
  }, [insightsQuery.data]);

  if (insightsQuery.isPending && !insightsQuery.data) {
    return <ContentSkeleton rows={5} />;
  }

  if (insightsQuery.isError && !insightsQuery.data) {
    return (
      <p className="text-error-text">
        {insightsQuery.error instanceof Error
          ? insightsQuery.error.message
          : "Could not load students"}
      </p>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500">
        Students whose latest session scored under {AT_RISK_THRESHOLD}%. Focus
        practice here first.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="At risk now"
          value={atRisk.length}
          accent={atRisk.length ? "warning" : "default"}
          hint={`Below ${AT_RISK_THRESHOLD}% last score`}
        />
        <MetricCard
          label="Classes affected"
          value={new Set(atRisk.map((s) => s.classId)).size}
          hint="With at least one at-risk student"
        />
      </div>

      {atRisk.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<AlertTriangle className="h-12 w-12" />}
            title="No at-risk students right now"
            body="Once students complete practice, anyone below 50% on their latest session will show up here."
            action={
              <Link href="/teacher/assign">
                <PrimaryButton type="button">Assign practice</PrimaryButton>
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {atRisk.map((s) => (
            <li key={`${s.classId}-${s.studentId}`}>
              <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-950">{s.name}</p>
                    <StatusPill
                      tone={(s.lastPercent ?? 0) < 40 ? "danger" : "warning"}
                    >
                      {s.lastPercent}%
                    </StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {s.className} · {s.email}
                    {s.lastTotal != null
                      ? ` · Last ${s.lastScore}/${s.lastTotal}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/teacher/classes/${s.classId}?tab=results`}
                    className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    View class
                  </Link>
                  <Link
                    href={`/teacher/classes/${s.classId}/assign`}
                    className="inline-flex h-10 items-center rounded-xl bg-primary-800 px-3 text-sm font-semibold text-white hover:bg-primary-700"
                  >
                    Assign practice
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
