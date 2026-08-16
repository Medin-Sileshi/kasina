"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { meQueryKey } from "@/lib/session";
import { useTeacherTitle } from "@/components/teacher-chrome";
import {
  useInvalidateTeacherOverview,
  useTeacherClasses,
} from "@/lib/teacher-data";
import {
  Card,
  ContentSkeleton,
  Field,
  PrimaryButton,
  TextInput,
} from "@/components/ui";

export default function TeacherClassesPage() {
  const queryClient = useQueryClient();
  const invalidateOverview = useInvalidateTeacherOverview();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useTeacherTitle("My Classes");

  const classesQuery = useTeacherClasses();
  const classes = classesQuery.data ?? [];

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await apiFetch("/classes", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      setName("");
      await Promise.all([
        invalidateOverview(),
        queryClient.invalidateQueries({ queryKey: meQueryKey }),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create class");
    } finally {
      setCreating(false);
    }
  }

  if (classesQuery.isPending && !classesQuery.data) {
    return <ContentSkeleton rows={4} />;
  }

  if (classesQuery.isError && !classesQuery.data) {
    return (
      <p className="text-error-text">
        {classesQuery.error instanceof Error
          ? classesQuery.error.message
          : "Could not load classes"}
      </p>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500">
        Open a class to view roster, results, and assign practice.
      </p>

      {classes.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-gray-600">
            No classes yet. Create your first class below.
          </p>
        </Card>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {classes.map((klass) => (
            <li key={klass.id}>
              <Link href={`/teacher/classes/${klass.id}`}>
                <Card className="flex h-full items-start justify-between gap-3 transition hover:border-primary-400">
                  <div>
                    <p className="text-lg font-bold text-gray-950">
                      {klass.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Grade {klass.grade} · {klass.subject}
                    </p>
                    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      Invite code
                    </p>
                    <p className="font-mono text-lg font-bold text-primary-800">
                      {klass.inviteCode}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-gray-300" />
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Card className="mt-8">
        <h2 className="text-base font-bold text-gray-950">Create class</h2>
        <p className="mt-1 text-sm text-gray-500">
          Grade 12 · Mathematics (fixed for MVP)
        </p>
        <form
          onSubmit={onCreate}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <Field label="Class name">
              <TextInput
                required
                placeholder="Section 12A"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </div>
          <PrimaryButton
            type="submit"
            disabled={creating}
            className="sm:h-12 sm:w-auto sm:min-w-[160px]"
          >
            {creating ? "Creating…" : "Create class"}
          </PrimaryButton>
        </form>
        {error ? <p className="mt-2 text-sm text-error-text">{error}</p> : null}
      </Card>
    </>
  );
}
