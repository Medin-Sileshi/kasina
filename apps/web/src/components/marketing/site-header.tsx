"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { RootWingMark } from "@/components/marketing/root-wing-mark";
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
    <header className="relative z-30 border-b border-mkt-rule bg-mkt-paper text-mkt-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <RootWingMark className="h-8 w-7" tone="green" />
          <span className="flex items-baseline gap-1.5">
            <span className="font-display text-lg font-semibold tracking-tight">Kasina</span>
            <span lang="am" className="font-ethiopic text-sm font-semibold text-mkt-ink-muted">
              ካሲና
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {t.primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-3 py-2 text-[13px] font-medium transition ${amClass} ${
                isActive(item.href)
                  ? "text-mkt-green"
                  : "text-mkt-ink-muted hover:text-mkt-ink"
              }`}
            >
              {item.label}
              {isActive(item.href) ? (
                <span className="absolute inset-x-3 bottom-1 h-px bg-mkt-green" aria-hidden />
              ) : null}
            </Link>
          ))}
          <div className="relative" ref={moreRef}>
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={`inline-flex items-center gap-1 px-3 py-2 text-[13px] font-medium text-mkt-ink-muted transition hover:text-mkt-ink ${amClass}`}
              aria-expanded={moreOpen}
            >
              {t.moreLabel}
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            </button>
            {moreOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[11rem] overflow-hidden rounded-lg border border-mkt-rule bg-mkt-paper py-1.5 shadow-lg">
                {t.moreNav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-2.5 text-[13px] font-medium transition hover:bg-mkt-panel ${amClass} ${
                      isActive(item.href) ? "text-mkt-green" : "text-mkt-ink-muted"
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
            className="font-utility rounded border border-mkt-rule px-2.5 py-1.5 text-[11px] font-medium uppercase text-mkt-ink-muted transition hover:border-mkt-green hover:text-mkt-green"
            aria-label={lang === "en" ? "Switch to Amharic" : "Switch to English"}
          >
            {t.langLabel}
            <span className="mx-1 text-mkt-rule">|</span>
            <span lang={lang === "en" ? "am" : "en"} className={lang === "en" ? "font-ethiopic" : undefined}>
              {t.langSwitch}
            </span>
          </button>
          <Link
            href="/get-involved"
            className={`hidden rounded bg-mkt-green px-3.5 py-2 text-[13px] font-semibold text-mkt-paper transition hover:bg-mkt-green-hover sm:inline-flex ${amClass}`}
          >
            {t.cta}
          </Link>
          <button
            type="button"
            className="inline-flex rounded p-2 text-mkt-ink-muted hover:bg-mkt-panel lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-mkt-rule bg-mkt-paper px-5 py-4 lg:hidden" aria-label="Mobile">
          <ul className="space-y-0.5">
            {t.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-mkt-panel ${amClass} ${
                    isActive(item.href) ? "text-mkt-green" : "text-mkt-ink"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/get-involved"
                className={`mt-2 block rounded bg-mkt-green px-3 py-3 text-center text-[15px] font-semibold text-mkt-paper ${amClass}`}
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
