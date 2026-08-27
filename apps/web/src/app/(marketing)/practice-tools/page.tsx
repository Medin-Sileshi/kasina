"use client";

import Link from "next/link";
import {
  MarketingBody,
  MarketingEyebrow,
  MarketingH1,
  MarketingLead,
  MarketingPageShell,
} from "@/components/marketing/page-shell";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { practiceToolsCopy } from "@/lib/marketing-copy";

export default function PracticeToolsPage() {
  const { lang } = useMarketingLang();
  const t = practiceToolsCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell>
      <MarketingEyebrow>{t.title}</MarketingEyebrow>
      <MarketingH1>{t.headline}</MarketingH1>
      <MarketingLead>{t.intro}</MarketingLead>
      <ul className="mt-10 space-y-8">
        {t.points.map((p) => (
          <li key={p.title} className="border-b border-mkt-rule pb-8 last:border-0">
            <h2 className={`font-display text-lg font-semibold text-mkt-ink ${amClass}`}>
              {p.title}
            </h2>
            <MarketingBody>{p.body}</MarketingBody>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href="/cbt" className={`mkt-cta ${amClass}`}>
          {t.ctaTry}
        </Link>
        <Link
          href="/join"
          className={`inline-flex h-12 items-center justify-center rounded border border-mkt-green px-5 text-[15px] font-semibold text-mkt-green ${amClass}`}
        >
          {t.ctaJoin}
        </Link>
        <Link href="/melak" className={`mkt-link-ochre inline-flex h-12 items-center px-2 text-[14px] ${amClass}`}>
          {t.ctaMelak}
        </Link>
      </div>
    </MarketingPageShell>
  );
}
