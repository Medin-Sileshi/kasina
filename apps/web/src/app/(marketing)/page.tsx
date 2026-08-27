"use client";

import Link from "next/link";
import { ArrowRight, WifiOff, Sparkles, School } from "lucide-react";
import { BrandAtmosphere } from "@/components/brand-chrome";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { homeCopy } from "@/lib/marketing-copy";

export default function HomePage() {
  const { lang } = useMarketingLang();
  const t = homeCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <div lang={lang === "am" ? "am" : "en"}>
      <section className="relative overflow-hidden pb-16 pt-8 sm:pb-20 sm:pt-12">
        <BrandAtmosphere />
        <div className="relative z-10 mx-auto max-w-3xl px-5 text-center sm:px-8">
          <p
            className={`text-[12px] font-medium leading-relaxed text-accent-500/95 sm:text-[13px] ${amClass}`}
          >
            {t.eyebrow}
          </p>
          <h1
            className={`mt-5 text-[1.85rem] font-bold leading-[1.2] tracking-tight text-white sm:text-[2.5rem] ${amClass}`}
          >
            {t.headline}
          </h1>
          <p
            className={`mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-white/70 sm:text-base ${amClass}`}
          >
            {t.subhead}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10">
            <Link
              href="/pilot"
              className={`inline-flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[17px] font-semibold text-primary-800 transition hover:bg-white/95 ${amClass}`}
            >
              {t.primaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/get-involved"
              className={`text-[14px] font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline ${amClass}`}
            >
              {t.secondaryCta}
            </Link>
            <p className={`mt-1 text-[12px] text-white/45 ${amClass}`}>{t.joinHint}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-[13px]">
              <Link href="/join" className={`font-semibold text-accent-500 hover:text-accent-600 ${amClass}`}>
                {t.productJoin}
              </Link>
              <span className="text-white/25">·</span>
              <Link
                href="/teacher/signup"
                className={`font-semibold text-white/70 hover:text-white ${amClass}`}
              >
                {t.teacherLink}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-primary-900/50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className={`text-center text-2xl font-bold tracking-tight sm:text-[1.75rem] ${amClass}`}>
            {t.problemTitle}
          </h2>
          <p
            className={`mx-auto mt-3 max-w-2xl text-center text-[15px] leading-relaxed text-white/65 ${amClass}`}
          >
            {t.problemBody}
          </p>
          <div className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {t.problems.map((item) => (
              <div key={item.title} className="text-center sm:text-left">
                <h3 className={`text-lg font-bold text-white ${amClass}`}>{item.title}</h3>
                <p className={`mt-2 text-[14px] leading-relaxed text-white/60 ${amClass}`}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 px-5 py-16 sm:px-8 sm:py-20">
        <BrandAtmosphere className="opacity-40" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <h2 className={`text-center text-2xl font-bold tracking-tight ${amClass}`}>
            {t.pillarsTitle}
          </h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-3">
            {t.pillars.map((p, i) => (
              <div key={p.title} className="text-center sm:text-left">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 sm:mx-0">
                  {i === 0 ? (
                    <WifiOff className="h-5 w-5 text-accent-500" aria-hidden />
                  ) : i === 1 ? (
                    <Sparkles className="h-5 w-5 text-accent-500" aria-hidden />
                  ) : (
                    <School className="h-5 w-5 text-accent-500" aria-hidden />
                  )}
                </div>
                <h3 className={`mt-4 text-[15px] font-bold text-white ${amClass}`}>{p.title}</h3>
                <p className={`mt-2 text-[13px] leading-relaxed text-white/60 ${amClass}`}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-primary-900/40 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h2 className={`text-2xl font-bold tracking-tight ${amClass}`}>{t.pilotTitle}</h2>
          <p className={`mt-4 text-[15px] leading-relaxed text-white/65 ${amClass}`}>
            {t.pilotBody}
          </p>
          <Link
            href="/pilot"
            className={`mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-accent-500 hover:text-accent-600 ${amClass}`}
          >
            {t.pilotCta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="border-t border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-12 sm:grid-cols-2">
          <div>
            <h2 className={`text-xl font-bold ${amClass}`}>{t.impactTitle}</h2>
            <p className={`mt-3 text-[14px] leading-relaxed text-white/60 ${amClass}`}>
              {t.impactBody}
            </p>
            <Link
              href="/impact"
              className={`mt-4 inline-block text-[14px] font-semibold text-white/80 hover:text-white ${amClass}`}
            >
              {t.impactCta} →
            </Link>
          </div>
          <div>
            <h2 className={`text-xl font-bold ${amClass}`}>{t.partnersTitle}</h2>
            <p className={`mt-3 text-[14px] leading-relaxed text-white/60 ${amClass}`}>
              {t.partnersBody}
            </p>
            <Link
              href="/partners"
              className={`mt-4 inline-block text-[14px] font-semibold text-white/80 hover:text-white ${amClass}`}
            >
              {t.partnersCta} →
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-primary-900/50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className={`text-2xl font-bold tracking-tight ${amClass}`}>{t.closeTitle}</h2>
          <p className={`mt-4 text-[15px] leading-relaxed text-white/65 ${amClass}`}>
            {t.closeBody}
          </p>
          <Link
            href="/get-involved"
            className={`mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-semibold text-primary-800 transition hover:bg-white/95 ${amClass}`}
          >
            {t.closeCta}
          </Link>
          <p className={`mt-8 text-[13px] text-white/45 ${amClass}`}>{t.productTitle}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-[13px] font-semibold">
            <Link href="/join" className="text-accent-500 hover:text-accent-600">
              {t.productJoin}
            </Link>
            <Link href="/teacher/signup" className="text-white/70 hover:text-white">
              {t.productTeacher}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
