"use client";

import Link from "next/link";
import {
  MarketingH1,
  MarketingLead,
  MarketingPageShell,
} from "@/components/marketing/page-shell";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { placeholderCopy } from "@/lib/marketing-copy";

export default function ImpactPage() {
  const { lang } = useMarketingLang();
  const t = placeholderCopy[lang].impact;
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell>
      <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40 ${amClass}`}>
        {t.title}
      </p>
      <MarketingH1>{t.headline}</MarketingH1>
      <MarketingLead>{t.body}</MarketingLead>
      <Link
        href="/pilot"
        className={`mt-8 inline-block text-[14px] font-semibold text-accent-500 hover:text-accent-600 ${amClass}`}
      >
        {t.cta} →
      </Link>
    </MarketingPageShell>
  );
}
