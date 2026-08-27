"use client";

import Link from "next/link";
import {
  MarketingBody,
  MarketingH1,
  MarketingLead,
  MarketingPageShell,
} from "@/components/marketing/page-shell";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { audienceCopy } from "@/lib/marketing-copy";

function AudiencePage({ kind }: { kind: "students" | "teachers" }) {
  const { lang } = useMarketingLang();
  const t = audienceCopy[lang][kind];
  const amClass = lang === "am" ? "font-ethiopic" : "";
  const primaryHref = kind === "students" ? "/join" : "/teacher/signup";

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
      <div className={`mt-8 flex flex-wrap gap-4 text-[14px] font-semibold ${amClass}`}>
        <Link href="/melak" className="text-accent-500 hover:text-accent-600">
          {t.ctaMelak}
        </Link>
        <Link href="/practice-tools" className="text-white/75 hover:text-white">
          {t.ctaPractice}
        </Link>
        <Link href={primaryHref} className="text-white/75 hover:text-white">
          {t.ctaJoin}
        </Link>
      </div>
    </MarketingPageShell>
  );
}

export default function StudentsPage() {
  return <AudiencePage kind="students" />;
}
