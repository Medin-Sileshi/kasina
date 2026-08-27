"use client";

import Link from "next/link";
import {
  MarketingBody,
  MarketingH1,
  MarketingLead,
  MarketingPageShell,
  MarketingSectionTitle,
} from "@/components/marketing/page-shell";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { pilotCopy } from "@/lib/marketing-copy";

export default function PilotPage() {
  const { lang } = useMarketingLang();
  const t = pilotCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell>
      <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40 ${amClass}`}>
        {t.title}
      </p>
      <MarketingH1>{t.headline}</MarketingH1>
      <MarketingLead>{t.intro}</MarketingLead>
      <MarketingSectionTitle>{t.scopeTitle}</MarketingSectionTitle>
      <MarketingBody>{t.scope}</MarketingBody>
      <MarketingSectionTitle>{t.timelineTitle}</MarketingSectionTitle>
      <MarketingBody>{t.timeline}</MarketingBody>
      <MarketingSectionTitle>{t.outcomesTitle}</MarketingSectionTitle>
      <MarketingBody>{t.outcomes}</MarketingBody>
      <MarketingSectionTitle>{t.fundingTitle}</MarketingSectionTitle>
      <MarketingBody>{t.funding}</MarketingBody>
      <MarketingSectionTitle>{t.expandTitle}</MarketingSectionTitle>
      <MarketingBody>{t.expand}</MarketingBody>
      <Link
        href="/get-involved"
        className={`mt-10 inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-[15px] font-semibold text-primary-800 ${amClass}`}
      >
        {t.cta}
      </Link>
    </MarketingPageShell>
  );
}
