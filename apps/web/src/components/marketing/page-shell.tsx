"use client";

import type { ReactNode } from "react";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { RootWingDivider } from "@/components/marketing/root-wing-mark";

export function MarketingPageShell({
  children,
  wide = false,
}: {
  children: ReactNode;
  wide?: boolean;
}) {
  const { lang } = useMarketingLang();
  return (
    <div
      className="flex-1 bg-mkt-paper text-mkt-ink"
      lang={lang === "am" ? "am" : "en"}
    >
      <RootWingDivider />
      <div
        className={`landing-fade-up mx-auto px-5 pb-16 pt-4 sm:px-8 sm:pb-20 ${
          wide ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export function MarketingEyebrow({ children }: { children: ReactNode }) {
  const { lang } = useMarketingLang();
  const amClass = lang === "am" ? "font-ethiopic" : "";
  return (
    <p
      className={`font-utility text-[11px] font-medium uppercase tracking-[0.14em] text-mkt-ochre sm:text-[12px] ${amClass}`}
    >
      {children}
    </p>
  );
}

export function MarketingH1({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { lang } = useMarketingLang();
  const amClass = lang === "am" ? "font-ethiopic" : "";
  return (
    <h1
      className={`font-display mt-4 text-[1.85rem] font-semibold leading-[1.15] tracking-tight text-mkt-ink sm:text-[2.4rem] ${amClass} ${className}`}
    >
      {children}
    </h1>
  );
}

export function MarketingLead({ children }: { children: ReactNode }) {
  const { lang } = useMarketingLang();
  const amClass = lang === "am" ? "font-ethiopic" : "";
  return (
    <p
      className={`mt-5 max-w-xl text-[15px] leading-relaxed text-mkt-ink-muted sm:text-base ${amClass}`}
    >
      {children}
    </p>
  );
}

export function MarketingSectionTitle({ children }: { children: ReactNode }) {
  const { lang } = useMarketingLang();
  const amClass = lang === "am" ? "font-ethiopic" : "";
  return (
    <h2
      className={`font-display mt-12 text-xl font-semibold tracking-tight text-mkt-ink ${amClass}`}
    >
      {children}
    </h2>
  );
}

export function MarketingBody({ children }: { children: ReactNode }) {
  const { lang } = useMarketingLang();
  const amClass = lang === "am" ? "font-ethiopic" : "";
  return (
    <p className={`mt-3 text-[15px] leading-relaxed text-mkt-ink-muted ${amClass}`}>
      {children}
    </p>
  );
}
