"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/auth-client";
import { Card, ContentSkeleton, MetricCard, SectionLabel } from "@/components/ui";

type Overview = {
  bySchool: Array<{
    schoolId: string;
    schoolName: string;
    approved: number;
    pending: number;
    rejected: number;
    revoked: number;
  }>;
  unassigned: {
    approved: number;
    pending: number;
    rejected: number;
    revoked: number;
  };
  totals: {
    approved: number;
    pending: number;
    rejected: number;
    revoked: number;
  };
};

type Activity = {
  recentSignups: Array<{
    id: string;
    name: string;
    role: string;
    phone: string | null;
    status: string;
    created_at: string;
  }>;
  recentSessions: Array<{
    id: string;
    subject: string;
    mode: string;
    score: number | null;
    total: number | null;
    started_at: string;
    sync_status: string | null;
  }>;
  melakUserMessageCount: number;
};

export default function AdminOverviewPage() {
  const overviewQuery = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => apiFetch<Overview>("/admin/overview"),
  });
  const activityQuery = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: () => apiFetch<Activity>("/admin/activity"),
  });

  if (overviewQuery.isPending || activityQuery.isPending) {
    return <ContentSkeleton rows={5} />;
  }

  if (overviewQuery.isError) {
    return (
      <p className="text-error-text">
        {overviewQuery.error instanceof Error
          ? overviewQuery.error.message
          : "Failed to load overview"}
      </p>
    );
  }

  const overview = overviewQuery.data!;
  const activity = activityQuery.data;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-950">
        Admin overview
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Approvals, school rollups, and recent activity.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Approved" value={overview.totals.approved} />
        <MetricCard
          label="Pending"
          value={overview.totals.pending}
          accent="warning"
        />
        <MetricCard
          label="Rejected"
          value={overview.totals.rejected}
          accent="danger"
        />
        <MetricCard label="Revoked" value={overview.totals.revoked} />
      </div>

      <SectionLabel>
        <span className="mt-8 block">By school</span>
      </SectionLabel>
      <ul className="mt-3 space-y-2">
        {overview.bySchool.map((s) => (
          <li key={s.schoolId}>
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
              <p className="font-semibold text-gray-950">{s.schoolName}</p>
              <p className="text-sm text-gray-500">
                {s.approved} approved · {s.pending} pending · {s.rejected}{" "}
                rejected · {s.revoked} revoked
              </p>
            </Card>
          </li>
        ))}
      </ul>

      <SectionLabel>
        <span className="mt-8 block">Activity</span>
      </SectionLabel>
      {activityQuery.isError ? (
        <p className="mt-3 text-sm text-error-text">Could not load activity</p>
      ) : (
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <Card>
            <p className="text-sm font-semibold text-gray-800">Recent signups</p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {(activity?.recentSignups ?? []).slice(0, 8).map((s) => (
                <li key={s.id}>
                  {s.name} · {s.role} · {s.status}
                </li>
              ))}
              {!activity?.recentSignups?.length ? (
                <li className="text-gray-400">No recent signups</li>
              ) : null}
            </ul>
          </Card>
          <Card>
            <p className="text-sm font-semibold text-gray-800">
              Sessions · Melak msgs {activity?.melakUserMessageCount ?? 0}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              {(activity?.recentSessions ?? []).slice(0, 8).map((s) => (
                <li key={s.id}>
                  {s.subject} · {s.mode}
                  {s.score != null && s.total != null
                    ? ` · ${s.score}/${s.total}`
                    : ""}
                  {s.sync_status ? ` · ${s.sync_status}` : ""}
                </li>
              ))}
              {!activity?.recentSessions?.length ? (
                <li className="text-gray-400">No recent sessions</li>
              ) : null}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
