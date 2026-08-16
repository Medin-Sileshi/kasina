"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { StudentShell } from "@/components/student-shell";
import { ContentSkeleton } from "@/components/ui";
import {
  isUnauthorized,
  useMe,
  useSignOut,
} from "@/lib/session";

function isAuthPage(pathname: string) {
  return pathname === "/student/login";
}

/** Fullscreen quiz play — has its own chrome; keep shell off. */
function isQuizPlay(pathname: string) {
  return /^\/quiz\/[^/]+$/.test(pathname);
}

export default function StudentGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const authPage = isAuthPage(pathname);
  const quizPlay = isQuizPlay(pathname);
  const signOut = useSignOut();

  const meQuery = useMe({ enabled: !authPage });
  const me = meQuery.data;
  const unauthorized = isUnauthorized(meQuery.error);

  useEffect(() => {
    if (authPage) return;
    if (unauthorized) {
      router.replace("/student/login");
      return;
    }
    if (
      me &&
      (me.user.role === "teacher" || me.user.role === "admin")
    ) {
      router.replace("/teacher");
    }
  }, [authPage, unauthorized, me, router]);

  if (authPage) {
    return <>{children}</>;
  }

  if (unauthorized) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center text-gray-500">
        Redirecting to sign in…
      </main>
    );
  }

  if (meQuery.isError && !me) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-error-text">
          {meQuery.error instanceof Error
            ? meQuery.error.message
            : "Something went wrong"}
        </p>
        <button
          type="button"
          onClick={() => void meQuery.refetch()}
          className="mt-4 text-primary-700 hover:underline"
        >
          Try again
        </button>
        <p className="mt-4">
          <Link href="/student/login" className="text-sm text-gray-500">
            Sign in
          </Link>
        </p>
      </main>
    );
  }

  if (quizPlay) {
    if (!me && meQuery.isPending) {
      return (
        <main className="mx-auto max-w-[680px] px-5 py-12">
          <ContentSkeleton rows={3} />
        </main>
      );
    }
    return <>{children}</>;
  }

  return (
    <StudentShell userName={me?.user.name}>
      {!me && meQuery.isPending ? <ContentSkeleton rows={4} /> : children}
      {me ? (
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-10 text-sm text-gray-400 hover:text-error-text"
        >
          Sign out
        </button>
      ) : null}
    </StudentShell>
  );
}
