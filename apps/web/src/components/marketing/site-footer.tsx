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
    <footer className="border-t border-white/10 px-5 py-14 text-white sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-lg font-bold tracking-tight">
            Kasina{" "}
            <span lang="am" className="font-ethiopic font-semibold text-white/75">
              ({t.brandAm})
            </span>
          </p>
          <p className={`mt-3 max-w-sm text-[13px] leading-relaxed text-white/45 ${amClass}`}>
            {t.footerTag}
          </p>
          <p className={`mt-4 text-[12px] text-white/35 ${amClass}`}>{t.footerOrg}</p>
        </div>

        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35 ${amClass}`}>
            {t.footerExplore}
          </p>
          <ul className={`mt-3 space-y-2 text-[13px] text-white/60 ${amClass}`}>
            {t.primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35 ${amClass}`}>
            {t.footerContact}
          </p>
          <div className="mt-3 space-y-2 text-[13px] text-white/60">
            <a href={`mailto:${CONTACT_EMAIL}`} className="block hover:text-white">
              {CONTACT_EMAIL}
            </a>
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="block hover:text-white">
              {CONTACT_PHONE}
            </a>
          </div>
          <p className={`mt-6 text-[12px] text-white/30 ${amClass}`}>{t.partnerStrip}</p>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
        <div className={`flex flex-wrap gap-4 text-[12px] text-white/40 ${amClass}`}>
          <Link href="/privacy-policy" className="hover:text-white">
            {t.footerPrivacy}
          </Link>
          <Link href="/terms-of-use" className="hover:text-white">
            {t.footerTerms}
          </Link>
          <Link href="/faq" className="hover:text-white">
            {t.footerFaq}
          </Link>
        </div>
        <p className="flex items-center gap-2 text-[12px] text-white/30">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          Kasina · Melak
        </p>
      </div>
    </footer>
  );
}
