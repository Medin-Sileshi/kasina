"use client";

import Link from "next/link";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { KasinaLogo } from "@/components/kasina-logo";
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
    <footer className="bg-mkt-deep px-5 py-14 text-mkt-paper sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <KasinaLogo size="sm" tone="dark" href="/" />
          <p className={`mt-4 max-w-sm text-[13px] leading-relaxed text-mkt-paper/55 ${amClass}`}>
            {t.footerTag}
          </p>
          <p className={`mt-4 text-[12px] text-mkt-paper/35 ${amClass}`}>{t.footerOrg}</p>
        </div>

        <div>
          <p className={`font-utility text-[10px] font-medium uppercase tracking-[0.16em] text-mkt-gold ${amClass}`}>
            {t.footerExplore}
          </p>
          <ul className={`mt-3 space-y-2 text-[13px] text-mkt-paper/60 ${amClass}`}>
            {t.primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-mkt-paper">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={`font-utility text-[10px] font-medium uppercase tracking-[0.16em] text-mkt-gold ${amClass}`}>
            {t.footerContact}
          </p>
          <div className="mt-3 space-y-2 text-[13px] text-mkt-paper/60">
            <a href={`mailto:${CONTACT_EMAIL}`} className="block hover:text-mkt-paper">
              {CONTACT_EMAIL}
            </a>
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="block hover:text-mkt-paper">
              {CONTACT_PHONE}
            </a>
          </div>
          <p className={`mt-6 text-[12px] text-mkt-paper/30 ${amClass}`}>{t.partnerStrip}</p>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
        <div className={`flex flex-wrap gap-4 text-[12px] text-mkt-paper/40 ${amClass}`}>
          <Link href="/privacy-policy" className="hover:text-mkt-paper">
            {t.footerPrivacy}
          </Link>
          <Link href="/terms-of-use" className="hover:text-mkt-paper">
            {t.footerTerms}
          </Link>
          <Link href="/faq" className="hover:text-mkt-paper">
            {t.footerFaq}
          </Link>
        </div>
        <p className="text-[12px] text-mkt-paper/30">Kasina · Melak</p>
      </div>
    </footer>
  );
}
