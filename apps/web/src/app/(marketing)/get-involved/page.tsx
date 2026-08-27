"use client";

import Link from "next/link";
import {
  MarketingEyebrow,
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
      <MarketingEyebrow>{t.title}</MarketingEyebrow>
      <MarketingH1>{t.headline}</MarketingH1>
      <MarketingLead>{t.intro}</MarketingLead>
      <ul className="mt-10 space-y-4">
        {t.segments.map((s) => {
          const external = s.href.startsWith("mailto:");
          const linkClass = `mkt-link-ochre mt-4 inline-flex text-[14px] ${amClass}`;
          return (
            <li
              key={s.title}
              className="rounded-xl border border-mkt-rule bg-mkt-panel px-5 py-5"
            >
              <h2 className={`font-display text-lg font-semibold text-mkt-ink ${amClass}`}>
                {s.title}
              </h2>
              <p className={`mt-2 text-[14px] leading-relaxed text-mkt-ink-muted ${amClass}`}>
                {s.body}
              </p>
              {external ? (
                <a href={s.href} className={linkClass}>
                  {s.cta} →
                </a>
              ) : (
                <Link href={s.href} className={linkClass}>
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
