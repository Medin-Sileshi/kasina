"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Clock, MonitorSmartphone } from "lucide-react";
import { apiFetch } from "@/lib/auth-client";
import { useQuizStore, type QuizQuestion } from "@/lib/quiz-store";
import {
  Card,
  PrimaryButton,
  SecondaryButton,
  ContentSkeleton,
} from "@/components/ui";

const CBT_MINUTES = 40;
const CBT_QUESTIONS = 20;

export default function CbtStartPage() {
  const router = useRouter();
  const reset = useQuizStore((s) => s.reset);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startExam() {
    setStarting(true);
    setError(null);
    try {
      const data = await apiFetch<{
        session: { id: string };
        questions: QuizQuestion[];
      }>("/sessions", {
        method: "POST",
        body: JSON.stringify({
          mode: "cbt",
          subject: "mathematics",
          grade: 12,
          count: CBT_QUESTIONS,
        }),
      });
      reset({
        sessionId: data.session.id,
        questions: data.questions,
        contextLabel: "CBT Practice Exam",
        mode: "cbt",
        flagged: {},
        timerSeconds: CBT_MINUTES * 60,
      });
      router.push(`/quiz/${data.session.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start CBT");
      setStarting(false);
    }
  }

  return (
    <>
      <header className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800">
          <MonitorSmartphone className="h-3.5 w-3.5" />
          CBT pilot
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-950">
          Computer-Based Test Practice
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Exam-style session: no instant feedback until you submit. Flag questions
          to review before finishing.
        </p>
      </header>

      <Card className="space-y-4">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-5 w-5 text-primary-700" />
          <div>
            <p className="font-semibold text-gray-950">{CBT_MINUTES} minutes</p>
            <p className="text-sm text-gray-500">
              Timer runs locally in your browser for this pilot.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MonitorSmartphone className="mt-0.5 h-5 w-5 text-primary-700" />
          <div>
            <p className="font-semibold text-gray-950">{CBT_QUESTIONS} questions</p>
            <p className="text-sm text-gray-500">
              Grade 12 Mathematics · mixed topics from the Kasina bank
            </p>
          </div>
        </div>
        <PrimaryButton
          type="button"
          className="mt-2 min-h-12"
          disabled={starting}
          onClick={() => void startExam()}
        >
          {starting ? "Starting exam…" : "Start CBT practice →"}
        </PrimaryButton>
        {error ? <p className="text-sm text-error-text">{error}</p> : null}
      </Card>

      <p className="mt-6 text-center text-xs text-gray-400 sm:text-left">
        Results still feed your weak-topic profile after submission.
      </p>
    </>
  );
}
