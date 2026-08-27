"use client";

import Link from "next/link";
import {
  MarketingBody,
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
      <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40 ${amClass}`}>
        {t.title}
      </p>
      <MarketingH1>{t.headline}</MarketingH1>
      <MarketingLead>{t.intro}</MarketingLead>
      <ul className="mt-10 space-y-8">
        {t.points.map((p) => (
          <li key={p.title} className="border-b border-white/10 pb-8 last:border-0">
            <h2 className={`text-lg font-bold text-white ${amClass}`}>{p.title}</h2>
            <MarketingBody>{p.body}</MarketingBody>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href="/cbt"
          className={`inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-[15px] font-semibold text-primary-800 ${amClass}`}
        >
          {t.ctaTry}
        </Link>
        <Link
          href="/join"
          className={`inline-flex h-12 items-center justify-center rounded-2xl border border-white/30 px-5 text-[15px] font-semibold text-white hover:bg-white/10 ${amClass}`}
        >
          {t.ctaJoin}
        </Link>
        <Link
          href="/melak"
          className={`inline-flex h-12 items-center justify-center px-2 text-[14px] font-semibold text-accent-500 ${amClass}`}
        >
          {t.ctaMelak}
        </Link>
      </div>
    </MarketingPageShell>
  );
}
