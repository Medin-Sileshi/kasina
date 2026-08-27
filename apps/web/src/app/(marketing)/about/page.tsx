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
import { aboutCopy } from "@/lib/marketing-copy";

export default function AboutPage() {
  const { lang } = useMarketingLang();
  const t = aboutCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell>
      <MarketingEyebrow>{t.title}</MarketingEyebrow>
      <MarketingH1>{t.missionTitle}</MarketingH1>
      <MarketingLead>{t.mission}</MarketingLead>
      <MarketingSectionTitle>{t.originTitle}</MarketingSectionTitle>
      <MarketingBody>{t.origin}</MarketingBody>
      <MarketingSectionTitle>{t.teamTitle}</MarketingSectionTitle>
      <p className={`mt-3 text-[15px] font-semibold text-mkt-ink ${amClass}`}>{t.founder}</p>
      <MarketingBody>{t.founderBody}</MarketingBody>
      <MarketingSectionTitle>{t.orgTitle}</MarketingSectionTitle>
      <MarketingBody>{t.org}</MarketingBody>
      <Link href="/get-involved" className={`mkt-link-ochre mt-10 inline-flex text-[14px] ${amClass}`}>
        Get Involved →
      </Link>
    </MarketingPageShell>
  );
}
