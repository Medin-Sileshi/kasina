"use client";

import {
  MarketingBody,
  MarketingH1,
  MarketingPageShell,
} from "@/components/marketing/page-shell";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { legalCopy } from "@/lib/marketing-copy";

export default function TermsPage() {
  const { lang } = useMarketingLang();
  const t = legalCopy[lang].terms;

  return (
    <MarketingPageShell>
      <MarketingH1>{t.title}</MarketingH1>
      {t.body.map((para) => (
        <MarketingBody key={para.slice(0, 40)}>{para}</MarketingBody>
      ))}
    </MarketingPageShell>
  );
}
