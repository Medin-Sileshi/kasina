"use client";

import { Sparkles, WifiOff } from "lucide-react";
import type { MarketingLang } from "@/components/marketing/lang-context";

export function MelakPhonePreview({
  lang,
  name,
  question,
  answer,
  caption,
}: {
  lang: MarketingLang;
  name: string;
  question: string;
  answer: string;
  caption: string;
}) {
  return (
    <div className="landing-fade-up landing-delay-2 relative mx-auto w-[min(100%,280px)] sm:w-[300px]">
      <div className="rounded-[2rem] border border-white/20 bg-primary-900/80 p-3 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
        <div className="overflow-hidden rounded-[1.5rem] bg-gray-50 text-gray-950">
          <div className="flex items-center gap-2 bg-primary-800 px-4 py-3 text-white">
            <Sparkles className="h-4 w-4 text-accent-500" aria-hidden />
            <span className="text-sm font-semibold">{name}</span>
          </div>
          <div className="space-y-3 px-4 py-4">
            <div className="ml-6 rounded-2xl rounded-tr-md bg-primary-100 px-3 py-2 text-[13px] leading-snug text-primary-900">
              <span
                lang={lang === "am" ? "am" : undefined}
                className={lang === "am" ? "font-ethiopic" : undefined}
              >
                {question}
              </span>
            </div>
            <div className="mr-6 rounded-2xl rounded-tl-md bg-white px-3 py-2 text-[13px] leading-snug text-gray-800 shadow-sm ring-1 ring-gray-200/80">
              <span
                lang={lang === "am" ? "am" : undefined}
                className={lang === "am" ? "font-ethiopic" : undefined}
              >
                {answer}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-medium text-gray-500">
              <WifiOff className="h-3.5 w-3.5 text-accent-600" aria-hidden />
              <span
                lang={lang === "am" ? "am" : undefined}
                className={lang === "am" ? "font-ethiopic" : undefined}
              >
                {caption}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
