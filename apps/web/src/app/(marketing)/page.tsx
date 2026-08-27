"use client";

import Link from "next/link";
import {
  ArrowRight,
  Download,
  School,
  Sparkles,
} from "lucide-react";
import { BrandAtmosphere } from "@/components/brand-chrome";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { MelakPhonePreview } from "@/components/marketing/melak-phone";
import { homeCopy } from "@/lib/marketing-copy";

function PillarIcon({ name }: { name: "download" | "sparkles" | "school" }) {
  const className = "h-6 w-6 text-accent-500";
  if (name === "download") return <Download className={className} strokeWidth={1.75} aria-hidden />;
  if (name === "sparkles") return <Sparkles className={className} strokeWidth={1.75} aria-hidden />;
  return <School className={className} strokeWidth={1.75} aria-hidden />;
}

export default function HomePage() {
  const { lang } = useMarketingLang();
  const t = homeCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <div lang={lang === "am" ? "am" : "en"}>
      {/* Hero — one composition: brand signal + headline + CTA + product visual */}
      <section className="relative overflow-hidden pb-16 pt-2 sm:pb-20 sm:pt-4">
        <BrandAtmosphere />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-10">
          <div className="text-center lg:text-left">
            <p
              className={`landing-fade-up text-[2.5rem] font-bold leading-none tracking-tight text-white sm:text-[2.75rem] lg:text-[3rem] ${
                lang === "am" ? "font-ethiopic" : ""
              }`}
            >
              {t.brandLine}
            </p>
            <p
              lang="am"
              className="landing-fade-up font-ethiopic mt-2 text-xl font-semibold tracking-wide text-white/85 sm:text-2xl"
            >
              ካሲና
            </p>
            <p
              className={`landing-fade-up landing-delay-1 mt-6 text-[12px] font-medium leading-relaxed text-accent-500/95 sm:text-[13px] ${amClass}`}
            >
              {t.eyebrow}
            </p>
            <h1
              className={`landing-fade-up landing-delay-1 mt-4 text-[1.65rem] font-bold leading-[1.2] tracking-tight text-white sm:text-[2.1rem] lg:text-[2.25rem] ${amClass}`}
            >
              {t.headline}
            </h1>
            <p
              className={`landing-fade-up landing-delay-2 mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base lg:mx-0 ${amClass}`}
            >
              {t.subhead}
            </p>

            <div className="landing-fade-up landing-delay-3 mt-8 flex flex-col items-center gap-3 sm:mt-10 lg:items-start">
              <Link
                href="/join"
                className={`inline-flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[17px] font-semibold text-primary-800 transition hover:bg-white/95 lg:w-auto lg:min-w-[240px] ${amClass}`}
              >
                {t.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/teacher/signup"
                className={`text-[14px] font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline ${amClass}`}
              >
                {t.secondaryCta}
              </Link>
              <p className={`mt-1 text-[12px] text-white/45 ${amClass}`}>{t.joinHint}</p>
            </div>
          </div>

          <div className="relative">
            <MelakPhonePreview
              lang={lang}
              name={t.melakName}
              question={t.melakChatQ}
              answer={t.melakChatA}
              caption={t.offlineCaption}
            />
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="relative border-t border-white/10 bg-primary-900/50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2
            className={`text-center text-2xl font-bold tracking-tight sm:text-[1.75rem] ${amClass}`}
          >
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

      {/* How it works */}
      <section className="relative border-t border-white/10 px-5 py-16 sm:px-8 sm:py-20">
        <BrandAtmosphere className="opacity-40" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <h2 className={`text-center text-2xl font-bold tracking-tight ${amClass}`}>
            {t.pillarsTitle}
          </h2>
          <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {t.pillars.map((step, i) => (
              <li key={step.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <PillarIcon name={step.icon} />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  {i + 1}
                </p>
                <h3 className={`mt-2 text-[15px] font-bold text-white ${amClass}`}>
                  {step.title}
                </h3>
                <p className={`mt-2 text-[13px] leading-relaxed text-white/60 ${amClass}`}>
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pilot */}
      <section className="border-t border-white/10 bg-primary-900/40 px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-xl text-center">
          <School className="mx-auto h-7 w-7 text-accent-500" strokeWidth={1.75} aria-hidden />
          <h2 className={`mt-5 text-2xl font-bold tracking-tight ${amClass}`}>{t.pilotTitle}</h2>
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

      {/* Impact / Partners — quiet strip, not cards */}
      <section className="border-t border-white/10 px-5 py-16 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-12 border-white/10 sm:grid-cols-2 sm:gap-16">
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${amClass}`}>{t.impactTitle}</h2>
            <p className={`mt-3 text-[14px] leading-relaxed text-white/60 ${amClass}`}>
              {t.impactBody}
            </p>
            <Link
              href="/impact"
              className={`mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/80 hover:text-white ${amClass}`}
            >
              {t.impactCta}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div>
            <h2 className={`text-xl font-bold tracking-tight ${amClass}`}>{t.partnersTitle}</h2>
            <p className={`mt-3 text-[14px] leading-relaxed text-white/60 ${amClass}`}>
              {t.partnersBody}
            </p>
            <Link
              href="/partners"
              className={`mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-white/80 hover:text-white ${amClass}`}
            >
              {t.partnersCta}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
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
          <div className={`mt-6 flex flex-wrap justify-center gap-4 text-[13px] font-semibold ${amClass}`}>
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
