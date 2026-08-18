"use client";

import { use } from "react";
import { TextbookReader } from "@/components/textbook-reader";

const SUBJECTS = ["mathematics", "physics", "chemistry", "biology"] as const;

export default function TeacherTextbookPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject } = use(params);
  const safe = SUBJECTS.includes(subject as (typeof SUBJECTS)[number])
    ? subject
    : "mathematics";

  return (
    <TextbookReader
      subject={safe}
      backHref="/teacher"
      backLabel="Dashboard"
    />
  );
}
