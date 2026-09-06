"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/auth-client";
import { Card, ContentSkeleton } from "@/components/ui";

type AuditEntry = {
  id: string;
  adminId: string;
  action: string;
  targetUserId: string | null;
  signupRequestId: string | null;
  meta: unknown;
  createdAt: string;
};

export function AdminAuditPage() {
  const auditQuery = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: () => apiFetch<{ entries: AuditEntry[] }>("/admin/audit"),
  });

  if (auditQuery.isPending) return <ContentSkeleton rows={4} />;
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

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-950">
        Audit log
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Recent admin actions (approve, reject, revoke, OTP manual).
      </p>

      <ul className="mt-6 space-y-2">
        {entries.length === 0 ? (
          <li>
            <Card>
              <p className="text-sm text-gray-500">No audit entries yet.</p>
            </Card>
          </li>
        ) : (
          entries.map((e) => (
            <li key={e.id}>
              <Card className="p-4">
                <p className="font-semibold text-gray-950">{e.action}</p>
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
    </div>
  );
}
