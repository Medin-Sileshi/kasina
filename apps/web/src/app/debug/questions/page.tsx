"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/auth-client";

type QuestionsResponse = {
  count: number;
  questions: Array<{
    id: string;
    unit: string;
    topic: string;
    stem: string;
  }>;
};

export default function DebugQuestionsPage() {
  const [data, setData] = useState<QuestionsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<QuestionsResponse>("/questions?subject=mathematics&grade=12")
      .then(setData)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="mx-auto max-w-[720px] px-6 py-12">
      <Link href="/" className="text-sm text-gray-500 hover:text-primary-600">
        ← Home
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-gray-950">
        Debug · Question bank
      </h1>
      <p className="mt-2 text-sm text-gray-600">
        Grade 12 Mathematics seed (M0 exit: ≥50 tagged questions).
      </p>

      {error ? (
        <p className="mt-6 text-error-text">{error}</p>
      ) : null}

      {data ? (
        <>
          <p className="mt-6 text-lg font-semibold text-primary-800">
            {data.count} questions loaded
          </p>
          <ul className="mt-4 space-y-2">
            {data.questions.slice(0, 20).map((q) => (
              <li
                key={q.id}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
              >
                <span className="font-mono text-xs text-gray-400">{q.id}</span>
                <p className="mt-1 text-gray-700">
                  <span className="font-medium text-gray-950">
                    {q.unit} / {q.topic}
                  </span>
                  {" — "}
                  {q.stem.slice(0, 80)}…
                </p>
              </li>
            ))}
          </ul>
          {data.count > 20 ? (
            <p className="mt-3 text-sm text-gray-400">
              Showing first 20 of {data.count}
            </p>
          ) : null}
        </>
      ) : !error ? (
        <p className="mt-6 text-gray-500">Loading…</p>
      ) : null}
    </main>
  );
}
