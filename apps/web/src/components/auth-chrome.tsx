import Link from "next/link";
import type { ReactNode } from "react";
import {
  BottomSheet,
  BrandAtmosphere,
  BrandWordmark,
} from "@/components/brand-chrome";

export function WelcomeChrome({
  children,
  tagline = "Learn · Practice · Pass",
}: {
  children: ReactNode;
  tagline?: string;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-primary-800">
      <BrandAtmosphere />
      <div className="relative flex min-h-[42dvh] shrink-0 flex-col items-center justify-center px-6 pb-8 pt-16 text-center sm:min-h-[48dvh]">
        <BrandWordmark />
        <p className="mt-5 text-xs font-medium uppercase tracking-[0.12em] text-accent-500/90">
          {tagline}
        </p>
      </div>
      <BottomSheet className="flex-1">{children}</BottomSheet>
    </main>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  backHref = "/",
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  backHref?: string;
  eyebrow?: string;
}) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden bg-primary-800">
      <BrandAtmosphere />

      <section className="relative flex min-h-[28dvh] shrink-0 flex-col items-center justify-center px-6 pb-8 pt-14 text-center sm:min-h-[32dvh] sm:pt-16">
        <Link href={backHref} className="landing-fade-up block">
          <BrandWordmark />
        </Link>
        <p className="landing-fade-up landing-delay-1 mt-5 text-xs font-medium uppercase tracking-[0.12em] text-accent-500/90">
          {eyebrow ?? "Learn · Practice · Pass"}
        </p>
      </section>

      <BottomSheet className="mt-auto">
        <div className="text-center sm:text-left">
          <Link
            href={backHref}
            className="text-sm font-medium text-gray-400 transition hover:text-primary-700"
          >
            ← Back
          </Link>
          <h1 className="mt-5 text-[1.65rem] font-bold tracking-tight text-gray-950 sm:text-[1.85rem]">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2.5 text-[15px] leading-relaxed text-gray-500">
              {subtitle}
            </p>
          ) : null}
        </div>
        <div className="mt-7">{children}</div>
      </BottomSheet>
    </main>
  );
}
