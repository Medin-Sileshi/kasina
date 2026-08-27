"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TeacherShell } from "@/components/teacher-shell";
import {
  TeacherChromeProvider,
  useTeacherChromeTitle,
} from "@/components/teacher-chrome";
import { ContentSkeleton } from "@/components/ui";
import {
  isUnauthorized,
  useMe,
  useSignOut,
} from "@/lib/session";
import {
  fetchTeacherOverview,
  teacherOverviewKey,
} from "@/lib/teacher-data";

function isAuthPage(pathname: string) {
  return pathname === "/teacher/login" || pathname === "/teacher/signup";
}

function TeacherProtectedShell({ children }: { children: React.ReactNode }) {
  const title = useTeacherChromeTitle();
  const meQuery = useMe();
  const signOut = useSignOut();
  const me = meQuery.data;

  return (
    <TeacherShell
      title={title}
      userName={me?.user.name}
      onSignOut={() => void signOut()}
    >
      {!me && meQuery.isPending ? <ContentSkeleton rows={4} /> : children}
    </TeacherShell>
  );
}

export default function TeacherGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const authPage = isAuthPage(pathname);
  const meQuery = useMe({ enabled: !authPage });
  const unauthorized = isUnauthorized(meQuery.error);
  const [networkHint, setNetworkHint] = useState(false);

  useEffect(() => {
    if (authPage) return;
    if (unauthorized) {
      router.replace("/teacher/login");
      return;
    }
    if (
      meQuery.data &&
      meQuery.data.user.role !== "teacher" &&
      meQuery.data.user.role !== "admin"
    ) {
      router.replace("/student");
    }
  }, [authPage, unauthorized, meQuery.data, router]);

  useEffect(() => {
    if (
      authPage ||
      !meQuery.data ||
      (meQuery.data.user.role !== "teacher" &&
        meQuery.data.user.role !== "admin")
    ) {
      return;
    }
    void queryClient.prefetchQuery({
      queryKey: teacherOverviewKey,
      queryFn: fetchTeacherOverview,
      staleTime: 60_000,
    });
  }, [authPage, meQuery.data, queryClient]);

  useEffect(() => {
    if (authPage || unauthorized || meQuery.isPending || meQuery.data) {
      setNetworkHint(false);
      return;
    }
    if (meQuery.isError) {
      setNetworkHint(true);
    }
  }, [authPage, unauthorized, meQuery.isPending, meQuery.data, meQuery.isError]);

  if (authPage) {
    return <>{children}</>;
  }

  if (unauthorized) {
    return (
      <main className="mx-auto max-w-[720px] px-6 py-12 text-gray-500">
        Redirecting to sign in…
      </main>
    );
  }

  if (networkHint && !meQuery.data) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-error-text">
          {meQuery.error instanceof Error
            ? meQuery.error.message
            : "Could not verify session"}
        </p>
        <button
          type="button"
          onClick={() => void meQuery.refetch()}
          className="mt-4 text-primary-700 hover:underline"
        >
          Try again
        </button>
        <p className="mt-4">
          <Link href="/teacher/login" className="text-sm text-gray-500">
            Sign in
          </Link>
        </p>
      </main>
    );
  }

  return (
    <TeacherChromeProvider>
      <TeacherProtectedShell>{children}</TeacherProtectedShell>
    </TeacherChromeProvider>
  );
}
