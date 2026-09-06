"use client";

import type { ApprovalStatus } from "@/lib/session";
import { useSignOut } from "@/lib/session";
import Link from "next/link";
import { PrimaryButton, SecondaryButton } from "@/components/ui";

export function needsApprovalGate(
  status: ApprovalStatus | undefined | null,
): status is "pending" | "rejected" | "revoked" | "invited" {
  return (
    status === "pending" ||
    status === "rejected" ||
    status === "revoked" ||
    status === "invited"
  );
}

export function ApprovalGate({
  status,
}: {
  status: "pending" | "rejected" | "revoked" | "invited";
}) {
  const signOut = useSignOut();
  const pending = status === "pending";
  const invited = status === "invited";

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-500">
        Account status
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight text-gray-950">
        {invited
          ? "Activate your account"
          : pending
            ? "Waiting for approval"
            : "Access not available"}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-gray-500">
        {invited
          ? "Your school already approved you. Confirm your phone with a one-time code to start using Kasina."
          : pending
            ? "Your signup is pending admin approval. You will be able to use Kasina once approved."
            : "Your account was not approved or has been revoked. Contact Kasina support or your school admin for help."}
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        {invited ? (
          <Link href="/activate">
            <PrimaryButton type="button" className="sm:w-auto">
              Activate with phone
            </PrimaryButton>
          </Link>
        ) : null}
        <SecondaryButton
          type="button"
          className="sm:w-auto"
          onClick={() => void signOut()}
        >
          Sign out
        </SecondaryButton>
      </div>
    </main>
  );
}
