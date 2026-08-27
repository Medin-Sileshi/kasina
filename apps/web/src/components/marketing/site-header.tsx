"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { marketingShell } from "@/lib/marketing-copy";

export function SiteHeader() {
  const { lang, toggleLang } = useMarketingLang();
  const t = marketingShell[lang];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <header className="relative z-30 border-b border-white/10 bg-primary-800/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex shrink-0 items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight">Kasina</span>
          <span lang="am" className="font-ethiopic text-sm font-semibold text-white/75">
            ({t.brandAm})
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {t.nav.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition ${amClass} ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/90 transition hover:bg-white/10"
            aria-label={lang === "en" ? "Switch to Amharic" : "Switch to English"}
          >
            <span className="text-white/50">{t.langLabel}</span>
            <span className="mx-1.5 text-white/30">|</span>
            <span
              lang={lang === "en" ? "am" : "en"}
              className={lang === "en" ? "font-ethiopic" : undefined}
            >
              {t.langSwitch}
            </span>
          </button>
          <Link
            href="/get-involved"
            className={`hidden rounded-xl bg-white px-3.5 py-2 text-[13px] font-semibold text-primary-800 transition hover:bg-white/95 sm:inline-flex ${amClass}`}
          >
            {t.cta}
          </Link>
          <button
            type="button"
            className="inline-flex rounded-lg p-2 text-white/80 hover:bg-white/10 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className="border-t border-white/10 px-5 py-4 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="space-y-1">
            {t.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-[15px] font-medium text-white/85 hover:bg-white/10 ${amClass}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/get-involved"
                onClick={() => setOpen(false)}
                className={`mt-2 block rounded-xl bg-white px-3 py-2.5 text-center text-[15px] font-semibold text-primary-800 ${amClass}`}
              >
                {t.cta}
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
