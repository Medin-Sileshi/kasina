"use client";

import Link from "next/link";
import {
  MarketingEyebrow,
  MarketingH1,
  MarketingLead,
  MarketingPageShell,
} from "@/components/marketing/page-shell";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { placeholderCopy } from "@/lib/marketing-copy";

export default function PartnersPage() {
  const { lang } = useMarketingLang();
  const t = placeholderCopy[lang].partners;
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell>
      <MarketingEyebrow>{t.title}</MarketingEyebrow>
      <MarketingH1>{t.headline}</MarketingH1>
      <MarketingLead>{t.body}</MarketingLead>
      <Link href="/get-involved" className={`mkt-link-ochre mt-8 inline-block text-[14px] ${amClass}`}>
        {t.cta} →
      </Link>
    </MarketingPageShell>
  );
}
