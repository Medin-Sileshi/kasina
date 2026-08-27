"use client";

import type { ReactNode } from "react";
import { BrandAtmosphere } from "@/components/brand-chrome";
import { useMarketingLang } from "@/components/marketing/lang-context";

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
      className="relative flex-1 overflow-hidden pb-16 pt-6 sm:pb-20 sm:pt-8"
      lang={lang === "am" ? "am" : "en"}
    >
      <BrandAtmosphere className="opacity-55" />
      <div
        className={`relative z-10 mx-auto px-5 sm:px-8 ${wide ? "max-w-6xl" : "max-w-2xl"}`}
      >
        <div className="landing-fade-up">{children}</div>
      </div>
    </div>
  );
}

export function MarketingEyebrow({ children }: { children: ReactNode }) {
  const { lang } = useMarketingLang();
  const amClass = lang === "am" ? "font-ethiopic" : "";
  return (
    <p
      className={`text-[12px] font-medium leading-relaxed text-accent-500/95 sm:text-[13px] ${amClass}`}
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
      className={`mt-4 text-[1.85rem] font-bold leading-[1.15] tracking-tight text-white sm:text-[2.4rem] ${amClass} ${className}`}
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
      className={`mt-5 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base ${amClass}`}
    >
      {children}
    </p>
  );
}

export function MarketingSectionTitle({ children }: { children: ReactNode }) {
  const { lang } = useMarketingLang();
  const amClass = lang === "am" ? "font-ethiopic" : "";
  return (
    <h2 className={`mt-12 text-xl font-bold tracking-tight text-white ${amClass}`}>
      {children}
    </h2>
  );
}

export function MarketingBody({ children }: { children: ReactNode }) {
  const { lang } = useMarketingLang();
  const amClass = lang === "am" ? "font-ethiopic" : "";
  return (
    <p className={`mt-3 text-[15px] leading-relaxed text-white/65 ${amClass}`}>
      {children}
    </p>
  );
}
