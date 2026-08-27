"use client";

import {
  MarketingBody,
  MarketingH1,
  MarketingPageShell,
} from "@/components/marketing/page-shell";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { legalCopy } from "@/lib/marketing-copy";

export default function PrivacyPage() {
  const { lang } = useMarketingLang();
  const t = legalCopy[lang].privacy;
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell>
      <MarketingH1 className={amClass}>{t.title}</MarketingH1>
      {t.body.map((para) => (
        <MarketingBody key={para.slice(0, 40)}>{para}</MarketingBody>
      ))}
    </MarketingPageShell>
  );
}
