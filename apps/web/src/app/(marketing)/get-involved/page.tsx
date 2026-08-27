"use client";

import Link from "next/link";
import {
  MarketingH1,
  MarketingLead,
  MarketingPageShell,
} from "@/components/marketing/page-shell";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { getInvolvedCopy } from "@/lib/marketing-copy";

export default function GetInvolvedPage() {
  const { lang } = useMarketingLang();
  const t = getInvolvedCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell>
      <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40 ${amClass}`}>
        {t.title}
      </p>
      <MarketingH1>{t.headline}</MarketingH1>
      <MarketingLead>{t.intro}</MarketingLead>
      <ul className="mt-10 space-y-6">
        {t.segments.map((s) => {
          const external = s.href.startsWith("mailto:");
          const className = `mt-4 inline-flex text-[14px] font-semibold text-accent-500 hover:text-accent-600 ${amClass}`;
          return (
            <li
              key={s.title}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5"
            >
              <h2 className={`text-lg font-bold text-white ${amClass}`}>{s.title}</h2>
              <p className={`mt-2 text-[14px] leading-relaxed text-white/60 ${amClass}`}>
                {s.body}
              </p>
              {external ? (
                <a href={s.href} className={className}>
                  {s.cta} →
                </a>
              ) : (
                <Link href={s.href} className={className}>
                  {s.cta} →
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </MarketingPageShell>
  );
}
