import Link from "next/link";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/ui";

export function WelcomeChrome({
  children,
  tagline = "Learn. Practice. Pass.",
}: {
  children: ReactNode;
  tagline?: string;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-primary-800">
      {/* Soft glow atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(255,255,255,0.08),transparent_55%)]"
      />

      {/* Brand zone — top half */}
      <div className="relative flex min-h-[42dvh] shrink-0 flex-col items-center justify-center px-6 pb-8 pt-16 text-center sm:min-h-[48dvh]">
        <p className="text-[2.75rem] font-bold leading-none tracking-tight text-white sm:text-5xl">
          Kasina
        </p>
        <p className="mt-4 text-base font-medium text-white/75 sm:text-lg">
          <span lang="am" className="font-ethiopic">
            ህ
          </span>
          <span className="mx-2 text-white/40">—</span>
          {tagline}
        </p>
      </div>

      {/* Bottom sheet — flush to the bottom edge; top corners only */}
      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex flex-1 flex-col rounded-t-[2.25rem] bg-white px-7 pb-10 pt-3 shadow-[0_-12px_40px_rgba(0,0,0,0.18)] sm:rounded-t-[2rem] sm:px-9 sm:pb-9 sm:pt-4">
          <div className="mx-auto mb-7 h-1.5 w-12 shrink-0 rounded-full bg-gray-200" />
          {children}
        </div>
      </div>
    </main>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  backHref = "/",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backHref?: string;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center bg-gray-50 px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-primary-800"
      />
      <div className="relative mb-8 text-center">
        <Link href={backHref}>
          <BrandMark light className="text-2xl" />
        </Link>
      </div>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_20px_50px_rgba(11,46,31,0.12)]">
        <div className="h-1.5 bg-primary-800" />
        <div className="px-7 py-8 sm:px-8">
          <Link
            href={backHref}
            className="text-sm font-medium text-gray-400 transition hover:text-primary-700"
          >
            ← Back
          </Link>
          <h1 className="mt-5 text-[1.75rem] font-bold tracking-tight text-gray-950">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-[15px] leading-relaxed text-gray-500">
              {subtitle}
            </p>
          ) : null}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </main>
  );
}
