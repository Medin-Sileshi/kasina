"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTeacherTitle } from "@/components/teacher-chrome";
import {
  flattenStudents,
  useTeacherClassInsights,
} from "@/lib/teacher-data";
import {
  Card,
  ContentSkeleton,
  MetricCard,
  StatusPill,
  TextInput,
} from "@/components/ui";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export default function AllStudentsPage() {
  const insightsQuery = useTeacherClassInsights();
  const [q, setQ] = useState("");

  useTeacherTitle("All Students");

  const students = useMemo(
    () => flattenStudents(insightsQuery.data ?? []),
    [insightsQuery.data],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(needle) ||
        s.email.toLowerCase().includes(needle) ||
        s.className.toLowerCase().includes(needle),
    );
  }, [students, q]);

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
        Students across all of your classes.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total students" value={students.length} />
        <MetricCard
          label="With practice data"
          value={students.filter((s) => s.lastPercent != null).length}
        />
        <MetricCard
          label="Classes"
          value={insightsQuery.data?.length ?? 0}
        />
      </div>

      <div className="mt-6 max-w-md">
        <TextInput
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email, or class"
          aria-label="Search students"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-600">
            {students.length === 0
              ? "No students have joined yet. Share an invite code from My Classes."
              : "No students match your search."}
          </p>
        </Card>
      ) : (
        <Card className="mt-6 overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
                <th className="px-4 py-2.5 font-medium">Student</th>
                <th className="px-4 py-2.5 font-medium">Class</th>
                <th className="px-4 py-2.5 font-medium">Sessions</th>
                <th className="px-4 py-2.5 font-medium">Last score</th>
                <th className="px-4 py-2.5 font-medium">Joined</th>
                <th className="px-4 py-2.5 font-medium">Activity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={`${s.classId}-${s.studentId}`}
                  className="border-b border-gray-100"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-950">{s.name}</p>
                    <p className="text-gray-500">{s.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/teacher/classes/${s.classId}`}
                      className="font-medium text-primary-700 hover:underline"
                    >
                      {s.className}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.sessionsCount}</td>
                  <td className="px-4 py-3">
                    {s.lastPercent != null ? (
                      <StatusPill
                        tone={
                          s.lastPercent >= 70
                            ? "success"
                            : s.lastPercent >= 50
                              ? "warning"
                              : "danger"
                        }
                      >
                        {s.lastPercent}%
                      </StatusPill>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(s.joinedAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(s.lastActivityAt)}
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
