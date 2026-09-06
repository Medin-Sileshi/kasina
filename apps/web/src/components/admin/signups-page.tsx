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

type SignupRequest = {
  id: string;
  userId: string | null;
  role: string;
  name: string;
  phone: string | null;
  email: string | null;
  schoolId: string;
  schoolName: string | null;
  schoolType: string | null;
  schoolVerified: boolean | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

export function AdminSignupsPage() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: ["admin", "signup-requests", "pending"],
    queryFn: () =>
      apiFetch<{ requests: SignupRequest[] }>(
        "/admin/signup-requests?status=pending",
      ),
  });

  const approve = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/signup-requests/${id}/approve`, { method: "POST" }),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin", "signup-requests"],
      });
    },
    onError: (err) =>
      setActionError(err instanceof Error ? err.message : "Approve failed"),
  });

  const reject = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/signup-requests/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({}),
      }),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({
        queryKey: ["admin", "signup-requests"],
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
          : "Failed to load signups"}
      </p>
    );
  }

  const requests = listQuery.data?.requests ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-950">
        Pending signups
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Approve or reject new student and teacher accounts.
      </p>

      {actionError ? (
        <p className="mt-4 text-sm text-error-text">{actionError}</p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {requests.length === 0 ? (
          <li>
            <Card>
              <p className="text-sm text-gray-500">No pending requests.</p>
            </Card>
          </li>
        ) : (
          requests.map((r) => (
            <li key={r.id}>
              <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-950">{r.name}</p>
                    <StatusPill tone="warning">{r.status}</StatusPill>
                    <StatusPill tone="neutral">{r.role}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {r.schoolName ?? r.schoolId}
                    {r.schoolType ? ` · ${r.schoolType}` : ""}
                    {r.schoolVerified === true
                      ? " · verified"
                      : r.schoolVerified === false
                        ? " · unverified"
                        : ""}
                    {r.phone ? ` · ${r.phone}` : ""}
                    {r.email ? ` · ${r.email}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <PrimaryButton
                    type="button"
                    className="h-10 min-h-10 w-auto px-4 text-sm"
                    disabled={approve.isPending || reject.isPending}
                    onClick={() => approve.mutate(r.id)}
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
          ))
        )}
      </ul>
    </div>
  );
}
