"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/auth-client";
import { useTeacherTitle } from "@/components/teacher-chrome";
import { useInvalidateTeacherOverview } from "@/lib/teacher-data";
import {
  Card,
  ContentSkeleton,
  Field,
  PrimaryButton,
  TextInput,
} from "@/components/ui";

type MetaResponse = {
  units: Array<{
    unit: string;
    topics: Array<{ topic: string; questionCount: number }>;
  }>;
};

type CreateResponse = {
  assignment: { id: string };
};

export default function AssignPage() {
  const params = useParams<{ classId: string }>();
  const classId = params.classId;
  const router = useRouter();
  const invalidateOverview = useInvalidateTeacherOverview();

  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"random" | "topic">("topic");
  const [unit, setUnit] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [dueAt, setDueAt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [presetsApplied, setPresetsApplied] = useState(false);

  useTeacherTitle("Assign practice");

  const metaQuery = useQuery({
    queryKey: ["subjects", "mathematics", "meta"],
    queryFn: () => apiFetch<MetaResponse>("/subjects/mathematics/meta"),
  });

  const meta = metaQuery.data;

  useEffect(() => {
    if (!meta || presetsApplied) return;
    const paramsQs =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const presetUnit = paramsQs?.get("unit") ?? "";
    const presetTopic = paramsQs?.get("topic") ?? "";
    const presetTitle = paramsQs?.get("title") ?? "";

    if (presetTitle) setTitle(presetTitle);
    if (presetUnit && meta.units.some((u) => u.unit === presetUnit)) {
      setUnit(presetUnit);
      setMode("topic");
      const topicsForUnit =
        meta.units.find((u) => u.unit === presetUnit)?.topics ?? [];
      if (presetTopic && topicsForUnit.some((t) => t.topic === presetTopic)) {
        setTopic(presetTopic);
      } else {
        setTopic(topicsForUnit[0]?.topic ?? "");
      }
      if (!presetTitle && presetTopic) {
        setTitle(`${presetTopic} · 10 questions`);
      }
    } else {
      const firstUnit = meta.units[0];
      if (firstUnit) {
        setUnit(firstUnit.unit);
        setTopic(firstUnit.topics[0]?.topic ?? "");
      }
    }
    setPresetsApplied(true);
  }, [meta, presetsApplied]);

  const topics = useMemo(() => {
    return meta?.units.find((u) => u.unit === unit)?.topics ?? [];
  }, [meta, unit]);

  useEffect(() => {
    if (!topics.some((t) => t.topic === topic)) {
      setTopic(topics[0]?.topic ?? "");
    }
  }, [topics, topic]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        classId,
        title: title.trim(),
        mode,
        count,
        dueAt: dueAt ? new Date(`${dueAt}T23:59:59`).toISOString() : null,
      };
      if (mode === "topic") {
        body.unit = unit;
        body.topic = topic;
      }
      const data = await apiFetch<CreateResponse>("/assignments", {
        method: "POST",
        body: JSON.stringify(body),
      });
      await invalidateOverview();
      router.push(`/teacher/assignments/${data.assignment.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create");
      setSaving(false);
    }
  }

  if (metaQuery.isPending && !metaQuery.data) {
    return <ContentSkeleton rows={4} />;
  }

  if (metaQuery.isError) {
    return (
      <p className="text-error-text">
        {metaQuery.error instanceof Error
          ? metaQuery.error.message
          : "Could not load topics"}
      </p>
    );
  }

  return (
    <>
      <Link
        href={`/teacher/classes/${classId}`}
        className="text-sm text-gray-500 hover:text-primary-700"
      >
        ← Back to class
      </Link>

      <Card className="mt-4 max-w-xl">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Title">
            <TextInput
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Power Rule · 10 questions"
            />
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-gray-800">Mode</legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                checked={mode === "topic"}
                onChange={() => setMode("topic")}
              />
              Topic practice
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="mode"
                checked={mode === "random"}
                onChange={() => setMode("random")}
              />
              Random mix
            </label>
          </fieldset>

          {mode === "topic" ? (
            <>
              <Field label="Unit">
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-primary-600"
                >
                  {(meta?.units ?? []).map((u) => (
                    <option key={u.unit} value={u.unit}>
                      {u.unit}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Topic">
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-primary-600"
                >
                  {topics.map((t) => (
                    <option key={t.topic} value={t.topic}>
                      {t.topic} ({t.questionCount})
                    </option>
                  ))}
                </select>
              </Field>
            </>
          ) : null}

          <Field label="Question count">
            <TextInput
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </Field>

          <Field label="Due date (optional)">
            <TextInput
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
            />
          </Field>

          {error ? <p className="text-sm text-error-text">{error}</p> : null}

          <PrimaryButton type="submit" disabled={saving}>
            {saving ? "Creating…" : "Create assignment"}
          </PrimaryButton>
        </form>
      </Card>
    </>
  );
}
