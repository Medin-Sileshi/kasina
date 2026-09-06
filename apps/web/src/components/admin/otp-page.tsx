"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/auth-client";
import {
  Card,
  ContentSkeleton,
  SecondaryButton,
  StatusPill,
} from "@/components/ui";

type OtpItem = {
  id: string;
  phone: string;
  purpose: string;
  status: string;
  codeHint: string | null;
  error: string | null;
  createdAt: string;
};

export function AdminOtpPage() {
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const queueQuery = useQuery({
    queryKey: ["admin", "otp-queue"],
    queryFn: () => apiFetch<{ items: OtpItem[] }>("/admin/otp-queue"),
  });

  const markManual = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/admin/otp-queue/${id}/manual`, { method: "POST" }),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: ["admin", "otp-queue"] });
    },
    onError: (err) =>
      setActionError(err instanceof Error ? err.message : "Update failed"),
  });

  if (queueQuery.isPending) return <ContentSkeleton rows={4} />;
  if (queueQuery.isError) {
    return (
      <p className="text-error-text">
        {queueQuery.error instanceof Error
          ? queueQuery.error.message
          : "Failed to load OTP queue"}
      </p>
    );
  }

  const items = queueQuery.data?.items ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-gray-950">
        OTP queue
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Pending or failed SMS sends — mark as handled manually when needed.
      </p>

      {actionError ? (
        <p className="mt-4 text-sm text-error-text">{actionError}</p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {items.length === 0 ? (
          <li>
            <Card>
              <p className="text-sm text-gray-500">Queue is clear.</p>
            </Card>
          </li>
        ) : (
          items.map((item) => (
            <li key={item.id}>
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-gray-950">{item.phone}</p>
                    <StatusPill
                      tone={item.status === "failed" ? "danger" : "warning"}
                    >
                      {item.status}
                    </StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.purpose}
                    {item.codeHint ? ` · hint ${item.codeHint}` : ""}
                    {item.error ? ` · ${item.error}` : ""}
                  </p>
                </div>
                <SecondaryButton
                  type="button"
                  className="h-10 w-auto px-4 text-sm sm:shrink-0"
                  disabled={markManual.isPending}
                  onClick={() => markManual.mutate(item.id)}
                >
                  Mark manual
                </SecondaryButton>
              </Card>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
