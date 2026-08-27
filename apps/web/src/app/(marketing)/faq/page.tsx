"use client";

import { MessageCircle } from "lucide-react";
import {
  MarketingEyebrow,
  MarketingH1,
  MarketingPageShell,
} from "@/components/marketing/page-shell";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { faqCopy } from "@/lib/marketing-copy";

export default function FaqPage() {
  const { lang } = useMarketingLang();
  const t = faqCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <MarketingPageShell>
      <MarketingEyebrow>{t.title}</MarketingEyebrow>
      <MarketingH1>{t.headline}</MarketingH1>
      <div className="mt-10 space-y-5">
        {t.items.map((item) => (
          <details key={item.q} className="group border-b border-mkt-rule pb-5">
            <summary
              className={`cursor-pointer list-none text-[15px] font-semibold text-mkt-ink marker:content-none [&::-webkit-details-marker]:hidden ${amClass}`}
            >
              <span className="flex items-start justify-between gap-3">
                {item.q}
                <MessageCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-mkt-ink/30 group-open:text-mkt-green"
                  aria-hidden
                />
              </span>
            </summary>
            <p className={`mt-3 text-[14px] leading-relaxed text-mkt-ink-muted ${amClass}`}>
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </MarketingPageShell>
  );
}
