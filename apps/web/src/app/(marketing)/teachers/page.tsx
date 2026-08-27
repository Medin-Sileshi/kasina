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
import { audienceCopy } from "@/lib/marketing-copy";

export default function TeachersPage() {
  const { lang } = useMarketingLang();
  const t = audienceCopy[lang].teachers;
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell>
      <MarketingEyebrow>{t.title}</MarketingEyebrow>
      <MarketingH1>{t.headline}</MarketingH1>
      <MarketingLead>{t.intro}</MarketingLead>
      <ul className="mt-12 space-y-10">
        {t.points.map((p) => (
          <li key={p.title} className="border-b border-mkt-rule pb-10 last:border-0 last:pb-0">
            <h2 className={`font-display text-lg font-semibold text-mkt-ink ${amClass}`}>
              {p.title}
            </h2>
            <MarketingBody>{p.body}</MarketingBody>
          </li>
        ))}
      </ul>
      <div className={`mt-10 flex flex-wrap gap-x-5 gap-y-3 text-[14px] font-semibold ${amClass}`}>
        <Link href="/melak" className="mkt-link-ochre">
          {t.ctaMelak}
        </Link>
        <Link href="/practice-tools" className="text-mkt-green hover:underline">
          {t.ctaPractice}
        </Link>
        <Link href="/teacher/signup" className="text-mkt-green hover:underline">
          {t.ctaJoin}
        </Link>
      </div>
    </MarketingPageShell>
  );
}
