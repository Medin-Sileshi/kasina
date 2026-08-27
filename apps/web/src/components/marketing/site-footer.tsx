"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useMarketingLang } from "@/components/marketing/lang-context";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  marketingShell,
} from "@/lib/marketing-copy";

export function SiteFooter() {
  const { lang } = useMarketingLang();
  const t = marketingShell[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <footer className="border-t border-white/10 bg-primary-900/40 px-5 py-12 text-white sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-bold tracking-tight">
              Kasina{" "}
              <span lang="am" className="font-ethiopic font-semibold text-white/75">
                ({t.brandAm})
              </span>
            </p>
            <p className={`mt-2 max-w-sm text-xs leading-relaxed text-white/45 ${amClass}`}>
              {t.footerTag}
            </p>
            <p className={`mt-3 text-[13px] text-white/55 ${amClass}`}>{t.footerOrg}</p>
          </div>
          <div className="space-y-2 text-[13px] text-white/60">
            <a href={`mailto:${CONTACT_EMAIL}`} className="block hover:text-white">
              {CONTACT_EMAIL}
            </a>
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="block hover:text-white">
              {CONTACT_PHONE}
            </a>
          </div>
        </div>

        <p className={`text-center text-[12px] text-white/35 ${amClass}`}>{t.partnerStrip}</p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[12px] text-white/40">
          <Link href="/privacy-policy" className={`hover:text-white ${amClass}`}>
            {t.footerPrivacy}
          </Link>
          <Link href="/terms-of-use" className={`hover:text-white ${amClass}`}>
            {t.footerTerms}
          </Link>
          <Link href="/faq" className={`hover:text-white ${amClass}`}>
            {t.footerFaq}
          </Link>
        </div>

        <p className="flex items-center justify-center gap-2 text-[12px] text-white/30">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          Kasina · Melak
        </p>
      </div>
    </footer>
  );
}
