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
import { KasinaMark } from "@/components/kasina-logo";
import { melakMarketingCopy } from "@/lib/marketing-copy";

export default function MelakMarketingPage() {
  const { lang } = useMarketingLang();
  const t = melakMarketingCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell wide>
      <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-14">
        <div>
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
            <Link href="/join?next=/student/melak" className={`mkt-cta ${amClass}`}>
              {t.ctaJoin}
            </Link>
            <Link
              href="/student/melak"
              className={`inline-flex h-12 items-center justify-center rounded border border-mkt-green px-5 text-[15px] font-semibold text-mkt-green hover:bg-mkt-panel ${amClass}`}
            >
              {t.ctaProduct}
            </Link>
          </div>
          <div className={`mt-6 flex gap-4 text-[14px] font-semibold ${amClass}`}>
            <Link href="/students" className="mkt-link-ochre">
              {t.ctaStudents}
            </Link>
            <Link href="/teachers" className="mkt-link-ochre">
              {t.ctaTeachers}
            </Link>
          </div>
        </div>
        <div className="flex justify-center lg:pt-6">
          <KasinaMark size="hero" />
        </div>
      </div>
    </MarketingPageShell>
  );
}
