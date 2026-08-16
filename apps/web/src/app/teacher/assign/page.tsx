"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { useTeacherTitle } from "@/components/teacher-chrome";
import { useTeacherClasses } from "@/lib/teacher-data";
import {
  Card,
  ContentSkeleton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui";

export default function TeacherAssignHubPage() {
  useTeacherTitle("Assign Work");

  const classesQuery = useTeacherClasses();
  const classes = classesQuery.data ?? [];

  if (classesQuery.isPending && !classesQuery.data) {
    return <ContentSkeleton rows={3} />;
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

  if (classes.length === 0) {
    return (
      <Card className="mx-auto max-w-lg px-8 py-12 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-gray-300" />
        <h2 className="mt-4 text-lg font-bold text-gray-950">
          Create a class first
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          You need a class before you can assign practice.
        </p>
        <Link href="/teacher/classes" className="mt-6 inline-block w-full max-w-xs">
          <PrimaryButton type="button">Go to My Classes</PrimaryButton>
        </Link>
      </Card>
    );
  }

  if (classes.length === 1) {
    return (
      <Card className="mx-auto max-w-lg px-8 py-12 text-center">
        <ClipboardList className="mx-auto h-10 w-10 text-primary-700" />
        <h2 className="mt-4 text-lg font-bold text-gray-950">
          Assign to {classes[0].name}
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Create a practice assignment for this class.
        </p>
        <Link
          href={`/teacher/classes/${classes[0].id}/assign`}
          className="mt-6 inline-block w-full max-w-xs"
        >
          <PrimaryButton type="button">Create assignment</PrimaryButton>
        </Link>
        <Link href="/teacher/classes" className="mt-3 inline-block w-full max-w-xs">
          <SecondaryButton type="button">All classes</SecondaryButton>
        </Link>
      </Card>
    );
  }

  return (
    <>
      <p className="text-sm text-gray-500">
        Choose a class to create an assignment.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {classes.map((klass) => (
          <li key={klass.id}>
            <Link href={`/teacher/classes/${klass.id}/assign`}>
              <Card className="transition hover:border-primary-400">
                <p className="font-bold text-gray-950">{klass.name}</p>
                <p className="mt-1 text-sm text-gray-500">
                  Grade {klass.grade} · {klass.subject}
                </p>
                <p className="mt-4 text-sm font-semibold text-primary-700">
                  Assign practice →
                </p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
