"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronRight, Plus } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { useMe, meQueryKey } from "@/lib/session";
import { useTeacherTitle } from "@/components/teacher-chrome";
import {
  scoreTone,
  useInvalidateTeacherOverview,
  useTeacherOverview,
} from "@/lib/teacher-data";
import {
  Card,
  ContentSkeleton,
  Field,
  MetricCard,
  PrimaryButton,
  StatusPill,
  TextInput,
} from "@/components/ui";

export default function TeacherHomePage() {
  const meQuery = useMe();
  const me = meQuery.data;
  const queryClient = useQueryClient();
  const invalidateOverview = useInvalidateTeacherOverview();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overviewQuery = useTeacherOverview();
  const classes = overviewQuery.data?.classes ?? [];
  const primary = classes[0];
  const results = primary
    ? {
        students: primary.students,
        weakTopics: primary.weakTopics,
        assignments: primary.assignments,
      }
    : null;

  useTeacherTitle(
    primary
      ? `Overview: ${primary.name}`
      : me
        ? `Hello, ${me.user.name}`
        : "Dashboard",
  );

  const atRisk = useMemo(
    () =>
      (results?.students ?? [])
        .filter((s) => s.lastPercent != null && s.lastPercent < 50)
        .sort((a, b) => (a.lastPercent ?? 0) - (b.lastPercent ?? 0))
        .slice(0, 5),
    [results],
  );
  const scored = (results?.students ?? []).filter((s) => s.lastPercent != null);
  const avgScore =
    scored.length > 0
      ? Math.round(
          scored.reduce((n, s) => n + (s.lastPercent ?? 0), 0) / scored.length,
        )
      : null;
  const weakTop = results?.weakTopics[0];

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await apiFetch("/classes", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setName("");
      await Promise.all([
        invalidateOverview(),
        queryClient.invalidateQueries({ queryKey: meQueryKey }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create class");
    } finally {
      setCreating(false);
    }
  }

  if (overviewQuery.isPending && !overviewQuery.data) {
    return <ContentSkeleton rows={5} />;
  }

  if (overviewQuery.isError && !overviewQuery.data) {
    return (
      <p className="text-error-text">
        {overviewQuery.error instanceof Error
          ? overviewQuery.error.message
          : "Could not load dashboard"}
      </p>
    );
  }

  return (
    <>
      {primary && results ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Total students"
              value={results.students.length}
              hint={primary.name}
            />
            <MetricCard
              label="Avg. class score"
              value={avgScore != null ? `${avgScore}%` : "—"}
              hint={
                avgScore != null ? (
                  <span className="font-medium text-primary-700">
                    Based on latest sessions
                  </span>
                ) : (
                  "No completed sessions yet"
                )
              }
            />
            <MetricCard
              label="Most failed topic"
              value={
                <span className={weakTop ? "text-error-text" : ""}>
                  {weakTop?.topic ?? "—"}
                </span>
              }
              hint={weakTop ? "Mathematics" : "Need more practice data"}
              accent={weakTop ? "danger" : "default"}
            />
            <MetricCard
              label="Students at risk"
              value={
                <span className={atRisk.length ? "text-warning-text" : ""}>
                  {atRisk.length}
                </span>
              }
              hint="Require intervention"
              accent={atRisk.length ? "warning" : "default"}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            <Card className="lg:col-span-2">
              <div className="flex items-start justify-between">
                <h2 className="text-base font-bold text-gray-950">
                  Students at risk
                </h2>
                <AlertTriangle className="h-4 w-4 text-warning" />
              </div>
              {atRisk.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  No students below 50% right now.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {atRisk.map((s) => (
                    <li
                      key={s.studentId}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-950">
                          {s.name}
                        </p>
                        <p className="text-xs text-gray-400">Mathematics</p>
                      </div>
                      <StatusPill
                        tone={
                          (s.lastPercent ?? 0) < 40 ? "danger" : "warning"
                        }
                      >
                        {s.lastPercent}%
                      </StatusPill>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href={`/teacher/classes/${primary.id}?tab=results`}
                className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"
              >
                View all results <ChevronRight className="h-4 w-4" />
              </Link>
            </Card>

            <Card className="lg:col-span-3">
              <h2 className="text-base font-bold text-gray-950">
                Topic heatmap
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Weak topics across {primary.name}
              </p>
              {results.weakTopics.length === 0 ? (
                <p className="mt-6 text-sm text-gray-500">
                  Assign practice and have students complete sessions to unlock
                  the heatmap.
                </p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] uppercase tracking-[0.08em] text-gray-400">
                        <th className="pb-2 font-semibold">Topic</th>
                        <th className="pb-2 font-semibold">Accuracy</th>
                        <th className="pb-2 font-semibold">Attempts</th>
                        <th className="pb-2 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.weakTopics.map((t) => {
                        const band =
                          t.accuracy >= 80
                            ? "Excellent"
                            : t.accuracy >= 60
                              ? "Average"
                              : "Needs help";
                        const bandTone =
                          t.accuracy >= 80
                            ? "success"
                            : t.accuracy >= 60
                              ? "warning"
                              : "danger";
                        return (
                          <tr
                            key={`${t.unit}-${t.topic}`}
                            className="border-b border-gray-50"
                          >
                            <td className="py-3 font-medium text-gray-950">
                              {t.topic}
                              <p className="text-xs font-normal text-gray-400">
                                {t.unit}
                              </p>
                            </td>
                            <td
                              className={`py-3 font-semibold ${scoreTone(t.accuracy)}`}
                            >
                              {t.accuracy}%
                            </td>
                            <td className="py-3 text-gray-600">{t.attempts}</td>
                            <td className="py-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <StatusPill
                                  tone={
                                    bandTone as "success" | "warning" | "danger"
                                  }
                                >
                                  {band}
                                </StatusPill>
                                <Link
                                  href={`/teacher/classes/${primary.id}/assign?unit=${encodeURIComponent(t.unit)}&topic=${encodeURIComponent(t.topic)}&title=${encodeURIComponent(`${t.topic} · 10 questions`)}`}
                                  className="text-sm font-semibold text-primary-700 hover:underline"
                                >
                                  Assign →
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          <Card className="mt-6 overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-bold text-gray-950">
                Recent practice sessions
              </h2>
              <Link
                href={`/teacher/classes/${primary.id}`}
                className="text-sm font-semibold text-primary-700 hover:underline"
              >
                View all
              </Link>
            </div>
            {results.assignments.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-500">
                No assignments yet. Use Assign Practice to get started.
              </p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/80 text-[11px] uppercase tracking-[0.08em] text-gray-400">
                    <th className="px-5 py-3 font-semibold">Assignment</th>
                    <th className="px-5 py-3 font-semibold">Completed</th>
                    <th className="px-5 py-3 font-semibold">Avg. score</th>
                    <th className="px-5 py-3 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.assignments.slice(0, 6).map((a, i) => {
                    const done = results.students.filter(
                      (s) => s.assignmentStatus[a.id]?.status === "done",
                    );
                    const avg =
                      done.length > 0
                        ? Math.round(
                            done.reduce((n, s) => {
                              const st = s.assignmentStatus[a.id];
                              if (!st?.total) return n;
                              return n + ((st.score ?? 0) / st.total) * 100;
                            }, 0) / done.length,
                          )
                        : null;
                    const pct =
                      results.students.length > 0
                        ? Math.round(
                            (done.length / results.students.length) * 100,
                          )
                        : 0;
                    const dots = [
                      "bg-subject-math",
                      "bg-primary-600",
                      "bg-subject-physics",
                    ];
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-2 w-2 rounded-full ${dots[i % dots.length]}`}
                            />
                            <span className="font-medium text-gray-950">
                              {a.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-primary-600"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-gray-600">
                              {done.length}/{results.students.length}
                            </span>
                          </div>
                        </td>
                        <td
                          className={`px-5 py-3.5 font-semibold ${scoreTone(avg)}`}
                        >
                          {avg != null ? `${avg}%` : "—"}
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/teacher/assignments/${a.id}`}
                            className="font-semibold text-primary-700 hover:underline"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>

          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-950">My classes</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {classes.map((klass) => (
                <Link key={klass.id} href={`/teacher/classes/${klass.id}`}>
                  <Card className="h-full transition hover:border-primary-400">
                    <p className="text-lg font-bold text-gray-950">
                      {klass.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Grade {klass.grade} · {klass.subject}
                    </p>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Invite code
                    </p>
                    <p className="font-mono text-lg font-bold text-primary-800">
                      {klass.inviteCode}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard label="Classes" value={0} hint="Active sections" />
          <MetricCard label="Subject" value="Math" hint="Grade 12 (MVP)" />
          <MetricCard
            label="Invite ready"
            value="—"
            hint="Create a class first"
          />
        </div>
      )}

      <Card className="mt-6">
        <h2 className="text-base font-bold text-gray-950">Create class</h2>
        <p className="mt-1 text-sm text-gray-500">
          Grade 12 · Mathematics (fixed for MVP)
        </p>
        <form
          onSubmit={onCreate}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Field label="Class name">
              <TextInput
                required
                placeholder="Section 12A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </div>
          <PrimaryButton
            type="submit"
            disabled={creating}
            className="sm:h-12 sm:w-auto sm:min-w-[160px]"
          >
            {creating ? "Creating…" : "Create class"}
          </PrimaryButton>
        </form>
        {error ? <p className="mt-2 text-sm text-error-text">{error}</p> : null}
      </Card>

      {primary ? (
        <Link
          href={`/teacher/classes/${primary.id}/assign`}
          className="fixed bottom-6 right-6 z-30 inline-flex items-center gap-2 rounded-full bg-primary-800 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(11,46,31,0.35)] transition hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" /> Assign Practice
        </Link>
      ) : null}
    </>
  );
}
