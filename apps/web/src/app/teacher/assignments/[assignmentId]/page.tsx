"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/auth-client";
import { useTeacherTitle } from "@/components/teacher-chrome";
import { Card, ContentSkeleton, MetricCard, StatusPill } from "@/components/ui";

type AssignmentDetail = {
  assignment: {
    id: string;
    classId: string;
    className: string;
    title: string;
    unit: string | null;
    topic: string | null;
    questionCount: number;
    dueAt: string | null;
    createdAt: string;
  };
  members: Array<{
    studentId: string;
    name: string;
    email: string;
    status: "todo" | "done";
    score: number | null;
    total: number | null;
    completedAt: string | null;
  }>;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export default function AssignmentDetailPage() {
  const params = useParams<{ assignmentId: string }>();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["assignment", params.assignmentId],
    queryFn: () =>
      apiFetch<AssignmentDetail>(`/assignments/${params.assignmentId}`),
  });

  useTeacherTitle(data?.assignment.title ?? "Assignment");

  if (isPending) return <ContentSkeleton rows={4} />;

  if (isError || !data) {
    return (
      <p className="text-error-text">
        {error instanceof Error ? error.message : "Could not load assignment"}
      </p>
    );
  }

  const doneCount = data.members.filter((m) => m.status === "done").length;

  return (
    <>
      <Link
        href={`/teacher/classes/${data.assignment.classId}`}
        className="text-sm text-gray-500 hover:text-primary-700"
      >
        ← {data.assignment.className}
      </Link>
      <p className="mt-2 text-sm text-gray-500">
        {data.assignment.questionCount} questions
        {data.assignment.topic ? ` · ${data.assignment.topic}` : ""}
        {data.assignment.dueAt
          ? ` · Due ${new Date(data.assignment.dueAt).toLocaleDateString()}`
          : ""}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <MetricCard
          label="Completed"
          value={`${doneCount} / ${data.members.length}`}
          hint="Students finished"
        />
        <MetricCard
          label="Still to do"
          value={data.members.length - doneCount}
          hint="Awaiting submission"
          accent={doneCount < data.members.length ? "warning" : "default"}
        />
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
              <th className="px-4 py-2.5 font-medium">Student</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Score</th>
              <th className="px-4 py-2.5 font-medium">Completed</th>
            </tr>
          </thead>
          <tbody>
            {data.members.map((m) => (
              <tr key={m.studentId} className="border-b border-gray-100">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-950">{m.name}</p>
                  <p className="text-gray-500">{m.email}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusPill tone={m.status === "done" ? "success" : "warning"}>
                    {m.status === "done" ? "Done" : "To do"}
                  </StatusPill>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {m.status === "done" && m.total
                    ? `${m.score}/${m.total}`
                    : "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {formatDate(m.completedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
