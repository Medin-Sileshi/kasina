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
import { aboutCopy } from "@/lib/marketing-copy";

export default function AboutPage() {
  const { lang } = useMarketingLang();
  const t = aboutCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell>
      <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40 ${amClass}`}>
        {t.title}
      </p>
      <MarketingH1>{t.missionTitle}</MarketingH1>
      <MarketingLead>{t.mission}</MarketingLead>
      <MarketingSectionTitle>{t.originTitle}</MarketingSectionTitle>
      <MarketingBody>{t.origin}</MarketingBody>
      <MarketingSectionTitle>{t.teamTitle}</MarketingSectionTitle>
      <p className={`mt-3 text-[15px] font-semibold text-white ${amClass}`}>{t.founder}</p>
      <MarketingBody>{t.founderBody}</MarketingBody>
      <MarketingSectionTitle>{t.orgTitle}</MarketingSectionTitle>
      <MarketingBody>{t.org}</MarketingBody>
      <Link
        href="/get-involved"
        className={`mt-10 inline-block text-[14px] font-semibold text-accent-500 hover:text-accent-600 ${amClass}`}
      >
        Get Involved →
      </Link>
    </MarketingPageShell>
  );
}
