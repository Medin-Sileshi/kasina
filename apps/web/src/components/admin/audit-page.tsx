"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/auth-client";
import { Card, ContentSkeleton, StatusPill } from "@/components/ui";

type AuditEntry = {
  id: string;
  adminId: string;
  action: string;
  targetUserId: string | null;
  signupRequestId: string | null;
  meta: unknown;
  createdAt: string;
};

type RosterEntry = {
  id: string;
  actorUserId: string;
  actorRole: string;
  schoolId: string;
  schoolName: string | null;
  action: string;
  targetUserId: string | null;
  classId: string | null;
  meta: unknown;
  createdAt: string;
  source: "roster";
};

export function AdminAuditPage() {
  const auditQuery = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: () => apiFetch<{ entries: AuditEntry[] }>("/admin/audit"),
  });
  const rosterQuery = useQuery({
    queryKey: ["admin", "roster-audit"],
    queryFn: () => apiFetch<{ entries: RosterEntry[] }>("/admin/roster-audit"),
  });

  if (auditQuery.isPending || rosterQuery.isPending) {
    return <ContentSkeleton rows={4} />;
  }
  if (auditQuery.isError) {
    return (
      <p className="text-error-text">
        {auditQuery.error instanceof Error
          ? auditQuery.error.message
          : "Failed to load audit log"}
      </p>
    );
  }

  const entries = auditQuery.data?.entries ?? [];
  const rosterEntries = rosterQuery.data?.entries ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-950">
        Audit log
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Kasina-admin actions and school roster cascade events (kept separate).
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Kasina admin
      </h2>
      <ul className="mt-3 space-y-2">
        {entries.length === 0 ? (
          <li>
            <Card>
              <p className="text-sm text-gray-500">No admin audit entries yet.</p>
            </Card>
          </li>
        ) : (
          entries.map((e) => (
            <li key={e.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-gray-950">{e.action}</p>
                  <StatusPill tone="neutral">kasina admin</StatusPill>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(e.createdAt).toLocaleString()} · admin{" "}
                  {e.adminId.slice(0, 8)}
                  {e.targetUserId
                    ? ` · user ${e.targetUserId.slice(0, 8)}`
                    : ""}
                  {e.signupRequestId
                    ? ` · request ${e.signupRequestId.slice(0, 8)}`
                    : ""}
                </p>
              </Card>
            </li>
          ))
        )}
      </ul>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Roster cascade
      </h2>
      {rosterQuery.isError ? (
        <p className="mt-3 text-sm text-error-text">
          Could not load roster audit (apply migration 007 if missing).
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {rosterEntries.length === 0 ? (
            <li>
              <Card>
                <p className="text-sm text-gray-500">
                  No roster cascade entries yet.
                </p>
              </Card>
            </li>
          ) : (
            rosterEntries.map((e) => (
              <li key={e.id}>
                <Card className="p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-950">{e.action}</p>
                    <StatusPill tone="accent">{e.actorRole}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(e.createdAt).toLocaleString()} ·{" "}
                    {e.schoolName ?? e.schoolId.slice(0, 8)} · actor{" "}
                    {e.actorUserId.slice(0, 8)}
                    {e.targetUserId
                      ? ` · user ${e.targetUserId.slice(0, 8)}`
                      : ""}
                    {e.classId ? ` · class ${e.classId.slice(0, 8)}` : ""}
                  </p>
                </Card>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
