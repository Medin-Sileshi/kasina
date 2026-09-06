"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/auth-client";
import {
  Card,
  ContentSkeleton,
  PrimaryButton,
  SecondaryButton,
  StatusPill,
} from "@/components/ui";

type SchoolJoinRequest = {
  id: string;
  schoolName: string;
  subCity: string | null;
  woreda: string | null;
  region: string;
  declaredSchoolType: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  estimatedTeachers: number | null;
  estimatedStudents: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

export function MedinSchoolsPage() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const [schoolTypeById, setSchoolTypeById] = useState<
    Record<string, "government" | "private" | "other">
  >({});

  const listQuery = useQuery({
    queryKey: ["admin", "school-join-requests", "pending"],
    queryFn: () =>
      apiFetch<{ requests: SchoolJoinRequest[] }>(
        "/admin/school-join-requests?status=pending",
      ),
  });

  const approve = useMutation({
    mutationFn: (opts: {
      id: string;
      schoolType: "government" | "private" | "other";
    }) =>
      apiFetch(`/admin/school-join-requests/${opts.id}/approve`, {
        method: "POST",
        body: JSON.stringify({
          schoolType: opts.schoolType,
          verified: true,
        }),
      }),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin", "school-join-requests"],
      });
    },
    onError: (err) =>
      setActionError(err instanceof Error ? err.message : "Approve failed"),
  });

  const reject = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/school-join-requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin", "school-join-requests"],
      });
    },
    onError: (err) =>
      setActionError(err instanceof Error ? err.message : "Reject failed"),
  });

  if (listQuery.isPending) return <ContentSkeleton rows={4} />;
  if (listQuery.isError) {
    return (
      <p className="text-error-text">
        {listQuery.error instanceof Error
          ? listQuery.error.message
          : "Failed to load school requests"}
      </p>
    );
  }

  const requests = listQuery.data?.requests ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-950">
        School join requests
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Approve creates a verified school and invites the contact as school
        admin. Self-declared type is a hint — set the judged type before
        approving.
      </p>

      {actionError ? (
        <p className="mt-4 text-sm text-error-text">{actionError}</p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {requests.length === 0 ? (
          <li>
            <Card>
              <p className="text-sm text-gray-500">No pending school requests.</p>
            </Card>
          </li>
        ) : (
          requests.map((r) => {
            const judged =
              schoolTypeById[r.id] ??
              (r.declaredSchoolType as "government" | "private" | "other");
            return (
              <li key={r.id}>
                <Card className="flex flex-col gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-950">
                        {r.schoolName}
                      </p>
                      <StatusPill tone="warning">{r.status}</StatusPill>
                      <StatusPill tone="neutral">
                        declared: {r.declaredSchoolType}
                      </StatusPill>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {[r.subCity, r.woreda, r.region].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Contact {r.contactName} · {r.contactPhone}
                      {r.contactEmail ? ` · ${r.contactEmail}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Est. teachers {r.estimatedTeachers ?? "—"} · students{" "}
                      {r.estimatedStudents ?? "—"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="text-xs font-medium text-gray-500">
                      Judged type
                      <select
                        className="ml-2 rounded-lg border border-gray-200 px-2 py-1.5 text-sm"
                        value={judged}
                        onChange={(e) =>
                          setSchoolTypeById((prev) => ({
                            ...prev,
                            [r.id]: e.target.value as
                              | "government"
                              | "private"
                              | "other",
                          }))
                        }
                      >
                        <option value="government">government</option>
                        <option value="private">private</option>
                        <option value="other">other</option>
                      </select>
                    </label>
                    <PrimaryButton
                      type="button"
                      className="h-10 min-h-10 w-auto px-4 text-sm"
                      disabled={approve.isPending || reject.isPending}
                      onClick={() =>
                        approve.mutate({ id: r.id, schoolType: judged })
                      }
                    >
                      Approve
                    </PrimaryButton>
                    <SecondaryButton
                      type="button"
                      className="h-10 w-auto px-4 text-sm"
                      disabled={approve.isPending || reject.isPending}
                      onClick={() => reject.mutate(r.id)}
                    >
                      Reject
                    </SecondaryButton>
                  </div>
                </Card>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
