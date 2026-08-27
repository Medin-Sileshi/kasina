"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { marketingShell } from "@/lib/marketing-copy";

export function SiteHeader() {
  const { lang, toggleLang } = useMarketingLang();
  const t = marketingShell[lang];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const amClass = lang === "am" ? "font-ethiopic" : "";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="relative z-30 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight">Kasina</span>
          <span lang="am" className="font-ethiopic text-sm font-semibold text-white/75">
            ({t.brandAm})
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {t.primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-[13px] font-medium transition ${amClass} ${
                isActive(item.href)
                  ? "text-white"
                  : "text-white/65 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] font-medium text-white/65 transition hover:text-white ${amClass}`}
              aria-expanded={moreOpen}
            >
              {t.moreLabel}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </button>
            {moreOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-2xl border border-white/15 bg-primary-900/95 py-1.5 shadow-xl backdrop-blur">
                {t.moreNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2.5 text-[13px] font-medium transition hover:bg-white/10 ${amClass} ${
                      isActive(item.href) ? "text-white" : "text-white/75"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
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
            className={`hidden rounded-2xl bg-white px-4 py-2 text-[13px] font-semibold text-primary-800 transition hover:bg-white/95 sm:inline-flex ${amClass}`}
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
          className="border-t border-white/10 bg-primary-900/40 px-5 py-4 backdrop-blur lg:hidden"
          aria-label="Mobile"
        >
          <ul className="space-y-0.5">
            {t.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-xl px-3 py-3 text-[15px] font-medium text-white/85 hover:bg-white/10 ${amClass}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/get-involved"
                className={`mt-2 block rounded-2xl bg-white px-3 py-3 text-center text-[15px] font-semibold text-primary-800 ${amClass}`}
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
