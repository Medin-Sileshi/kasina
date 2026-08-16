"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Plus } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { useTeacherTitle } from "@/components/teacher-chrome";
import { useTeacherOverview } from "@/lib/teacher-data";
import {
  Card,
  ContentSkeleton,
  MetricCard,
  StatusPill,
} from "@/components/ui";

type ClassDetail = {
  class: {
    id: string;
    name: string;
    grade: number;
    subject: string;
    inviteCode: string;
  };
  roster: Array<{
    studentId: string;
    name: string;
    email: string;
    joinedAt: string;
    lastActivityAt: string | null;
  }>;
};

type AssignmentItem = {
  id: string;
  title: string;
  unit: string | null;
  topic: string | null;
  questionCount: number;
  dueAt: string | null;
  createdAt: string;
};

type ResultsResponse = {
  class: { id: string; name: string; inviteCode: string };
  assignments: Array<{ id: string; title: string }>;
  students: Array<{
    studentId: string;
    name: string;
    email: string;
    sessionsCount: number;
    lastScore: number | null;
    lastTotal: number | null;
    lastPercent: number | null;
    assignmentStatus: Record<
      string,
      { status: "todo" | "done"; score: number | null; total: number | null }
    >;
  }>;
  weakTopics: Array<{
    topic: string;
    unit: string;
    accuracy: number;
    attempts: number;
  }>;
};

type TabId = "overview" | "results";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function tabFromSearch(value: string | null): TabId {
  return value === "results" ? "results" : "overview";
}

export default function ClassDetailPage() {
  return (
    <Suspense fallback={<ContentSkeleton rows={5} />}>
      <ClassDetailInner />
    </Suspense>
  );
}

function ClassDetailInner() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = tabFromSearch(searchParams.get("tab"));
  const [copied, setCopied] = useState(false);

  const overviewQuery = useTeacherOverview();
  const overviewClass = overviewQuery.data?.classes.find((c) => c.id === classId);

  const detailQuery = useQuery({
    queryKey: ["class", classId],
    queryFn: async () => {
      const [detail, assignments] = await Promise.all([
        apiFetch<ClassDetail>(`/classes/${classId}`),
        apiFetch<{ assignments: AssignmentItem[] }>(
          `/assignments?classId=${encodeURIComponent(classId)}`,
        ),
      ]);
      return { detail, assignments: assignments.assignments };
    },
  });

  // Prefer shared overview cache so Results doesn't re-hit a heavy endpoint
  // while layout prefetch / sidebar screens are already loading the same data.
  const resultsFromOverview: ResultsResponse | undefined = overviewClass
    ? {
        class: {
          id: overviewClass.id,
          name: overviewClass.name,
          inviteCode: overviewClass.inviteCode,
        },
        assignments: overviewClass.assignments,
        students: overviewClass.students,
        weakTopics: overviewClass.weakTopics,
      }
    : undefined;

  const resultsQuery = useQuery({
    queryKey: ["class", classId, "results"],
    queryFn: () => apiFetch<ResultsResponse>(`/classes/${classId}/results`),
    // Wait for overview (layout prefetch / shared cache) before falling back —
    // firing both at once overloadeds Supabase and hung the Results tab.
    enabled:
      tab === "results" && !resultsFromOverview && !overviewQuery.isPending,
    staleTime: 60_000,
  });

  const detail = detailQuery.data?.detail;
  const assignments = detailQuery.data?.assignments ?? [];
  const results = resultsFromOverview ?? resultsQuery.data;
  const resultsPending =
    tab === "results" &&
    !results &&
    (overviewQuery.isPending || resultsQuery.isPending);
  const resultsError =
    tab === "results" &&
    !results &&
    !resultsPending &&
    (resultsQuery.isError || overviewQuery.isError);

  useTeacherTitle(
    detail
      ? tab === "results"
        ? `Results: ${detail.class.name}`
        : `Overview: ${detail.class.name}`
      : "Class overview",
  );

  function setTab(next: TabId) {
    const href =
      next === "results"
        ? `/teacher/classes/${classId}?tab=results`
        : `/teacher/classes/${classId}`;
    router.replace(href, { scroll: false });
  }

  async function copyInvite() {
    if (!detail) return;
    await navigator.clipboard.writeText(detail.class.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (detailQuery.isPending) return <ContentSkeleton rows={5} />;

  if (detailQuery.isError || !detail) {
    return (
      <div>
        <p className="text-error-text">
          {detailQuery.error instanceof Error
            ? detailQuery.error.message
            : "Could not load class"}
        </p>
        <Link href="/teacher" className="mt-4 inline-block text-primary-700">
          ← Back
        </Link>
      </div>
    );
  }

  const weakTop = results?.weakTopics[0];
  const scored = (results?.students ?? []).filter((s) => s.lastPercent != null);
  const avgSafe =
    scored.length > 0
      ? Math.round(
          scored.reduce((s, st) => s + (st.lastPercent ?? 0), 0) / scored.length,
        )
      : null;

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Total students"
          value={detail.roster.length}
          hint={detail.class.name}
        />
        <MetricCard
          label="Assignments"
          value={assignments.length}
          hint="Active for class"
        />
        <Card className="p-4">
          <p className="text-xs font-medium uppercase tracking-[0.06em] text-gray-400">
            Invite code
          </p>
          <div className="mt-2 flex items-center gap-2">
            <p className="font-mono text-2xl font-bold text-primary-800">
              {detail.class.inviteCode}
            </p>
            <button
              type="button"
              onClick={copyInvite}
              className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
              aria-label="Copy invite"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {copied ? "Copied!" : "Share with students"}
          </p>
        </Card>
      </div>

      <div
        role="tablist"
        aria-label="Class sections"
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "overview"}
          onClick={() => setTab("overview")}
          className={`inline-flex h-[52px] flex-1 items-center justify-center rounded-xl px-5 text-base font-semibold transition ${
            tab === "overview"
              ? "bg-primary-800 text-white"
              : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "results"}
          onClick={() => setTab("results")}
          className={`inline-flex h-[52px] flex-1 items-center justify-center rounded-xl px-5 text-base font-semibold transition ${
            tab === "results"
              ? "bg-primary-800 text-white"
              : "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50"
          }`}
        >
          Class results
        </button>
      </div>

      {tab === "overview" ? (
        <div role="tabpanel" className="mt-8">
          <section>
            <h2 className="text-lg font-bold text-gray-950">Roster</h2>
            <Card className="mt-3 overflow-hidden p-0">
              {detail.roster.length === 0 ? (
                <p className="p-5 text-sm text-gray-600">
                  No students yet. Share the invite code.
                </p>
              ) : (
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
                      <th className="px-4 py-2.5 font-medium">Name</th>
                      <th className="px-4 py-2.5 font-medium">Email</th>
                      <th className="px-4 py-2.5 font-medium">Joined</th>
                      <th className="px-4 py-2.5 font-medium">Last activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.roster.map((s) => (
                      <tr key={s.studentId} className="border-b border-gray-100">
                        <td className="px-4 py-3 font-medium text-gray-950">
                          {s.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{s.email}</td>
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
              )}
            </Card>
          </section>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-950">
                Recent practice sessions
              </h2>
              <Link
                href={`/teacher/classes/${classId}/assign`}
                className="text-sm font-medium text-primary-700 hover:underline"
              >
                Assign work
              </Link>
            </div>
            {assignments.length === 0 ? (
              <Card>
                <p className="text-sm text-gray-600">No assignments yet.</p>
              </Card>
            ) : (
              <Card className="overflow-hidden p-0">
                <ul className="divide-y divide-gray-100">
                  {assignments.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={`/teacher/assignments/${a.id}`}
                        className="flex items-center justify-between px-4 py-3.5 hover:bg-primary-50"
                      >
                        <div>
                          <p className="font-medium text-gray-950">{a.title}</p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {a.questionCount} questions
                            {a.topic ? ` · ${a.topic}` : ""}
                            {a.dueAt ? ` · Due ${formatDate(a.dueAt)}` : ""}
                          </p>
                        </div>
                        <StatusPill tone="neutral">Review</StatusPill>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </section>
        </div>
      ) : (
        <div role="tabpanel" className="mt-8">
          {resultsPending ? (
            <ContentSkeleton rows={4} />
          ) : resultsError || !results ? (
            <p className="text-error-text">
              {resultsQuery.error instanceof Error
                ? resultsQuery.error.message
                : overviewQuery.error instanceof Error
                  ? overviewQuery.error.message
                  : "Could not load results"}
            </p>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <MetricCard
                  label="Avg. last score"
                  value={avgSafe != null ? `${avgSafe}%` : "—"}
                  hint="Across completed sessions"
                />
                <MetricCard
                  label="Most failed topic"
                  value={
                    <span className="text-2xl text-error-text">
                      {weakTop?.topic ?? "—"}
                    </span>
                  }
                  hint={weakTop ? "Mathematics" : "Not enough data"}
                  accent={weakTop ? "danger" : "default"}
                />
                <MetricCard
                  label="Tracked assignments"
                  value={results.assignments.length}
                  hint="In this results view"
                />
              </div>

              <section className="mt-8">
                <h2 className="text-lg font-bold text-gray-950">Weak topics</h2>
                {results.weakTopics.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600">
                    Not enough answered questions yet.
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {results.weakTopics.map((t) => (
                      <Link
                        key={`${t.unit}-${t.topic}`}
                        href={`/teacher/classes/${classId}/assign?unit=${encodeURIComponent(t.unit)}&topic=${encodeURIComponent(t.topic)}&title=${encodeURIComponent(`${t.topic} · 10 questions`)}`}
                      >
                        <StatusPill tone="warning">
                          {t.topic} · {t.accuracy}% ({t.attempts}) · Assign →
                        </StatusPill>
                      </Link>
                    ))}
                  </div>
                )}
              </section>

              <section className="mt-8">
                <h2 className="text-lg font-bold text-gray-950">Students</h2>
                <Card className="mt-3 overflow-x-auto p-0">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50 text-gray-500">
                        <th className="px-4 py-2.5 font-medium">Student</th>
                        <th className="px-4 py-2.5 font-medium">Sessions</th>
                        <th className="px-4 py-2.5 font-medium">Last score</th>
                        {results.assignments.map((a) => (
                          <th key={a.id} className="px-4 py-2.5 font-medium">
                            {a.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.students.map((s) => (
                        <tr
                          key={s.studentId}
                          className="border-b border-gray-100"
                        >
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-950">{s.name}</p>
                            <p className="text-gray-500">{s.email}</p>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {s.sessionsCount}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {s.lastPercent != null
                              ? `${s.lastPercent}% (${s.lastScore}/${s.lastTotal})`
                              : "—"}
                          </td>
                          {results.assignments.map((a) => {
                            const st = s.assignmentStatus[a.id];
                            return (
                              <td key={a.id} className="px-4 py-3">
                                {st?.status === "done" ? (
                                  <StatusPill tone="success">
                                    Done
                                    {st.total != null
                                      ? ` ${st.score}/${st.total}`
                                      : ""}
                                  </StatusPill>
                                ) : (
                                  <StatusPill tone="neutral">To do</StatusPill>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </section>
            </>
          )}
        </div>
      )}

      <Link
        href={`/teacher/classes/${classId}/assign`}
        className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-primary-800 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-primary-700"
      >
        <Plus className="h-4 w-4" /> Assign Practice
      </Link>
    </>
  );
}
