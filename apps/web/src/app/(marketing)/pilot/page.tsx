"use client";

import Link from "next/link";
import {
  MarketingBody,
  MarketingEyebrow,
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
      <MarketingEyebrow>{t.title}</MarketingEyebrow>
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
      <Link href="/get-involved" className={`mkt-cta mt-10 ${amClass}`}>
        {t.cta}
      </Link>
    </MarketingPageShell>
  );
}
