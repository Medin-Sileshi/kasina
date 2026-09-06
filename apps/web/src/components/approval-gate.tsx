"use client";

import type { ApprovalStatus } from "@/lib/session";
import { useSignOut } from "@/lib/session";
import { PrimaryButton } from "@/components/ui";

export function needsApprovalGate(
  status: ApprovalStatus | undefined | null,
): status is "pending" | "rejected" | "revoked" {
  return status === "pending" || status === "rejected" || status === "revoked";
}

export function ApprovalGate({
  status,
}: {
  status: "pending" | "rejected" | "revoked";
}) {
  const signOut = useSignOut();
  const pending = status === "pending";

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-500">
        Account status
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
        {pending ? "Waiting for approval" : "Access not available"}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
        {pending
          ? "Your signup is pending admin approval. You will be able to use Kasina once a school admin approves your account."
          : "Your account was not approved or has been revoked. Contact Kasina support or your school admin for help."}
      </p>
      <PrimaryButton
        type="button"
        className="mt-8 sm:w-auto"
        onClick={() => void signOut()}
      >
        Sign out
      </PrimaryButton>
    </main>
  );
}
