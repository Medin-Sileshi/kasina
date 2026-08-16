"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, authClient, ApiError } from "@/lib/auth-client";

export type MeUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type MeClass = {
  id: string;
  name: string;
  grade: number;
  subject: string;
  inviteCode: string;
};

export type MeResponse = {
  user: MeUser;
  classes: MeClass[];
};

export const meQueryKey = ["me"] as const;

export function useMe(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: () => apiFetch<MeResponse>("/me"),
    staleTime: 5 * 60_000,
    enabled: options?.enabled ?? true,
    retry: false,
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return async () => {
    try {
      await authClient.signOut();
    } catch {
      // Clear local session state even if the API call fails.
    }
    queryClient.clear();
    window.location.href = "/";
  };
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
