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
      className="relative flex-1 overflow-hidden px-5 py-12 sm:px-8 sm:py-16"
      lang={lang === "am" ? "am" : "en"}
    >
      <BrandAtmosphere className="opacity-50" />
      <div
        className={`relative z-10 mx-auto ${wide ? "max-w-6xl" : "max-w-3xl"}`}
      >
        {children}
      </div>
    </div>
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
      className={`text-[1.85rem] font-bold leading-tight tracking-tight text-white sm:text-[2.35rem] ${amClass} ${className}`}
    >
      {children}
    </h1>
  );
}

export function MarketingLead({ children }: { children: ReactNode }) {
  const { lang } = useMarketingLang();
  const amClass = lang === "am" ? "font-ethiopic" : "";
  return (
    <p className={`mt-4 text-[15px] leading-relaxed text-white/70 sm:text-base ${amClass}`}>
      {children}
    </p>
  );
}

export function MarketingSectionTitle({ children }: { children: ReactNode }) {
  const { lang } = useMarketingLang();
  const amClass = lang === "am" ? "font-ethiopic" : "";
  return (
    <h2 className={`mt-10 text-xl font-bold text-white ${amClass}`}>{children}</h2>
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
