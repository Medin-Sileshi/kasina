"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BrandAtmosphere } from "@/components/brand-chrome";
import { KasinaLogo } from "@/components/kasina-logo";
import {
  Card,
  ContentSkeleton,
  Field,
  PrimaryButton,
  StatusPill,
  TextInput,
} from "@/components/ui";
import { apiFetch } from "@/lib/auth-client";
import { isUnauthorized, useMe, useSignOut } from "@/lib/session";

type TeacherRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string;
  approvalStatus: string;
  createdAt: string;
};

export default function SchoolAdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meQuery = useMe();
  const signOut = useSignOut();
  const me = meQuery.data;
  const unauthorized = isUnauthorized(meQuery.error);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (unauthorized) {
      router.replace("/activate");
      return;
    }
    if (me && me.user.role !== "school_admin") {
      if (me.user.role === "admin") router.replace("/medin");
      else if (me.user.role === "teacher") router.replace("/teacher");
      else router.replace("/student");
    }
    if (me?.user.approvalStatus === "invited") {
      router.replace("/activate");
    }
  }, [unauthorized, me, router]);

  const schoolQuery = useQuery({
    queryKey: ["school-admin", "me"],
    enabled: me?.user.role === "school_admin",
    queryFn: () =>
      apiFetch<{
        school: { id: string; name: string; schoolType: string; verified: boolean } | null;
      }>("/school-admin/me"),
  });

  const teachersQuery = useQuery({
    queryKey: ["school-admin", "teachers"],
    enabled: me?.user.role === "school_admin",
    queryFn: () => apiFetch<{ teachers: TeacherRow[] }>("/school-admin/teachers"),
  });

  const addTeacher = useMutation({
    mutationFn: () =>
      apiFetch("/school-admin/teachers", {
        method: "POST",
        body: JSON.stringify({ name, phone }),
      }),
    onSuccess: async () => {
      setName("");
      setPhone("");
      setFormError(null);
      await queryClient.invalidateQueries({
        queryKey: ["school-admin", "teachers"],
      });
    },
    onError: (err) =>
      setFormError(err instanceof Error ? err.message : "Could not add teacher"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    addTeacher.mutate();
  }

  if (unauthorized || (me && me.user.role !== "school_admin")) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-center text-gray-500">
        Redirecting…
      </main>
    );
  }

  if (meQuery.isPending && !me) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <ContentSkeleton rows={4} />
      </main>
    );
  }

  const school = schoolQuery.data?.school;
  const teachers = teachersQuery.data?.teachers ?? [];

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-primary-800">
      <BrandAtmosphere />
      <header className="relative z-40 text-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-4 sm:px-6">
          <KasinaLogo size="sm" tone="dark" href="/school-admin" />
          <span className="text-sm text-white/70">School admin</span>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-white/70 sm:inline">{me?.user.name}</span>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-white/60 hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-0 sm:px-4">
        <div className="flex flex-1 flex-col rounded-t-[2rem] bg-gray-50 px-4 pb-10 pt-7 sm:px-6 sm:pt-9">
          <h1 className="text-2xl font-bold text-gray-950">
            {school?.name ?? "Your school"}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Roster teachers by name and phone. They activate with OTP — no
            separate Kasina admin approval.
            {school ? (
              <>
                {" "}
                · {school.schoolType}
                {school.verified ? " · verified" : ""}
              </>
            ) : null}
          </p>

          <Card className="mt-6">
            <h2 className="text-sm font-semibold text-gray-800">Add teacher</h2>
            <form
              onSubmit={onSubmit}
              className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
            >
              <Field label="Name">
                <TextInput
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>
              <Field label="Phone">
                <TextInput
                  required
                  type="tel"
                  placeholder="+251…"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <PrimaryButton
                type="submit"
                className="h-12 w-auto shrink-0 px-5"
                disabled={addTeacher.isPending}
              >
                {addTeacher.isPending ? "Adding…" : "Add"}
              </PrimaryButton>
            </form>
            {formError ? (
              <p className="mt-2 text-sm text-error-text">{formError}</p>
            ) : null}
          </Card>

          <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Teachers
          </h2>
          {teachersQuery.isPending ? (
            <ContentSkeleton rows={3} />
          ) : (
            <ul className="mt-3 space-y-2">
              {teachers.length === 0 ? (
                <li>
                  <Card>
                    <p className="text-sm text-gray-500">No teachers yet.</p>
                  </Card>
                </li>
              ) : (
                teachers.map((t) => (
                  <li key={t.id}>
                    <Card className="flex flex-wrap items-center justify-between gap-2 p-4">
                      <div>
                        <p className="font-semibold text-gray-950">{t.name}</p>
                        <p className="text-sm text-gray-500">{t.phone}</p>
                      </div>
                      <StatusPill
                        tone={
                          t.approvalStatus === "approved" ? "success" : "warning"
                        }
                      >
                        {t.approvalStatus}
                      </StatusPill>
                    </Card>
                  </li>
                ))
              )}
            </ul>
          )}

          <p className="mt-8 text-center text-sm text-gray-400">
            Teachers sign in at{" "}
            <Link href="/activate" className="text-primary-700 underline">
              /activate
            </Link>{" "}
            with their phone OTP.
          </p>
        </div>
      </div>
    </div>
  );
}
