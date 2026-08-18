"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch, apiFetchText } from "@/lib/auth-client";
import { ContentSkeleton, EmptyState, SecondaryButton } from "@/components/ui";

export type TextbookIndex = {
  subject: string;
  grade: number;
  title: string;
  format: "markdown" | "pages";
  note?: string;
  chapters: Array<{
    id: string;
    number: number;
    title: string;
    format?: "markdown" | "pages";
    pages?: string[];
  }>;
};

type Props = {
  subject: string;
  backHref: string;
  backLabel?: string;
};

export function TextbookReader({
  subject,
  backHref,
  backLabel = "Back",
}: Props) {
  const [chapterId, setChapterId] = useState<string | null>(null);
  const [pageIdx, setPageIdx] = useState(0);

  const indexQuery = useQuery({
    queryKey: ["textbook", subject],
    queryFn: () => apiFetch<TextbookIndex>(`/textbooks/grade-12/${subject}`),
  });

  const index = indexQuery.data;
  const chapter =
    index?.chapters.find((ch) => ch.id === chapterId) ?? index?.chapters[0];

  useEffect(() => {
    if (index && !chapterId && index.chapters[0]) {
      setChapterId(index.chapters[0].id);
    }
  }, [index, chapterId]);

  useEffect(() => {
    setPageIdx(0);
  }, [chapterId]);

  const isPages = (chapter?.format ?? index?.format) === "pages";

  const mdQuery = useQuery({
    queryKey: ["textbook-chapter", subject, chapter?.id],
    enabled: Boolean(chapter) && !isPages,
    queryFn: () =>
      apiFetch<{ markdown: string }>(
        `/textbooks/grade-12/${subject}/chapters/${chapter!.id}`,
      ),
  });

  if (indexQuery.isPending) return <ContentSkeleton rows={6} />;

  if (indexQuery.isError || !index) {
    return (
      <EmptyState
        title="Textbook is not ready"
        body={
          indexQuery.error instanceof Error
            ? indexQuery.error.message
            : "Could not load this book."
        }
        icon={<span className="text-2xl font-bold text-gray-300">?</span>}
        action={
          <Link href={backHref}>
            <SecondaryButton type="button">{backLabel}</SecondaryButton>
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-primary-700"
      >
        <ChevronLeft className="h-5 w-5" /> {backLabel}
      </Link>

      <h1 className="mt-5 text-[1.45rem] font-bold tracking-tight text-gray-950 sm:text-[1.7rem]">
        {index.title}
      </h1>
      <p className="mt-2 text-[14px] text-gray-500">
        Read online by unit. Nothing is downloaded as a PDF.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          ["mathematics", "Math"],
          ["chemistry", "Chemistry"],
          ["physics", "Physics"],
          ["biology", "Biology"],
        ].map(([id, label]) => (
          <Link
            key={id}
            href={
              backHref.startsWith("/teacher")
                ? `/teacher/textbook/${id}`
                : `/read/${id}`
            }
            className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
              id === subject
                ? "bg-accent-500/20 text-primary-800"
                : "text-gray-500 hover:text-primary-800"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {index.chapters.map((ch) => {
          const active = ch.id === chapter?.id;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setChapterId(ch.id)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold ${
                active
                  ? "bg-primary-800 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200 hover:text-primary-800"
              }`}
            >
              Unit {ch.number}
            </button>
          );
        })}
      </div>

      {chapter ? (
        <p className="mt-5 text-sm font-semibold text-gray-800">
          Unit {chapter.number}: {chapter.title}
        </p>
      ) : null}

      <div className="mt-4">
        {isPages && chapter ? (
          <PageViewer
            subject={subject}
            pages={chapter.pages ?? []}
            pageIdx={pageIdx}
            onPageIdx={setPageIdx}
          />
        ) : mdQuery.isPending ? (
          <ContentSkeleton rows={8} />
        ) : mdQuery.isError ? (
          <p className="text-error-text">
            {mdQuery.error instanceof Error
              ? mdQuery.error.message
              : "Could not load this unit."}
          </p>
        ) : (
          <MarkdownBody markdown={mdQuery.data?.markdown ?? ""} />
        )}
      </div>
    </div>
  );
}

function MarkdownBody({ markdown }: { markdown: string }) {
  return (
    <article className="textbook-md max-w-3xl text-[15.5px] leading-relaxed text-gray-800">
      <Markdown remarkPlugins={[remarkGfm]}>{markdown}</Markdown>
    </article>
  );
}

function PageViewer({
  subject,
  pages,
  pageIdx,
  onPageIdx,
}: {
  subject: string;
  pages: string[];
  pageIdx: number;
  onPageIdx: (n: number) => void;
}) {
  const file = pages[pageIdx];
  const pageQuery = useQuery({
    queryKey: ["textbook-page", subject, file],
    enabled: Boolean(file),
    queryFn: async () => {
      const { body } = await apiFetchText(
        `/textbooks/grade-12/${subject}/pages/${file}`,
      );
      return URL.createObjectURL(new Blob([body], { type: "image/webp" }));
    },
  });

  const url = pageQuery.data;
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const label = useMemo(
    () => (pages.length ? `Page ${pageIdx + 1} of ${pages.length}` : "No pages"),
    [pageIdx, pages.length],
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={pageIdx <= 0}
          onClick={() => onPageIdx(pageIdx - 1)}
          className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-primary-800 disabled:text-gray-300"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <p className="text-[13px] text-gray-500">{label}</p>
        <button
          type="button"
          disabled={pageIdx >= pages.length - 1}
          onClick={() => onPageIdx(pageIdx + 1)}
          className="inline-flex h-10 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-primary-800 disabled:text-gray-300"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
        {pageQuery.isPending ? (
          <div className="px-4 py-16">
            <ContentSkeleton rows={4} />
          </div>
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={label}
            className="mx-auto w-full max-w-3xl bg-white"
          />
        ) : (
          <p className="px-4 py-10 text-center text-gray-500">
            Could not load this page.
          </p>
        )}
      </div>
    </div>
  );
}
