"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { useMarketingLang } from "@/components/marketing/lang-context";
import { KasinaMark, KasinaMarkDivider } from "@/components/kasina-logo";
import { homeCopy } from "@/lib/marketing-copy";

export default function HomePage() {
  const { lang } = useMarketingLang();
  const t = homeCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <div>
      <section className="relative overflow-hidden bg-mkt-deep text-mkt-paper">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:py-24">
          <div className="landing-fade-up text-left">
            <p
              className={`font-utility text-[11px] font-medium uppercase tracking-[0.14em] text-mkt-ochre sm:text-[12px] ${amClass}`}
            >
              {t.eyebrow}
            </p>
            <h1
              className={`font-display mt-5 text-[2rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.6rem] lg:text-[2.85rem] ${amClass}`}
            >
              {t.headline}
            </h1>
            <p
              className={`mt-5 max-w-lg text-[15px] leading-relaxed text-mkt-paper/70 sm:text-base ${amClass}`}
            >
              {t.subhead}
            </p>
            <div className="mt-9 flex flex-col items-start gap-4">
              <Link href="/join" className={`mkt-cta ${amClass}`}>
                {t.primaryCta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <div className={`flex flex-wrap gap-x-5 gap-y-2 text-[14px] ${amClass}`}>
                <Link href="/join" className="mkt-link-ochre">
                  {t.productJoin}
                </Link>
                <Link href="/teacher/signup" className="mkt-link-ochre">
                  {t.secondaryCta}
                </Link>
              </div>
              <p className={`text-[12px] text-mkt-paper/45 ${amClass}`}>{t.joinHint}</p>
            </div>
          </div>

          <div className="landing-fade-up landing-delay-2 relative flex justify-center lg:justify-end">
            <KasinaMark size="hero" priority className="drop-shadow-lg" />
          </div>
        </div>
      </section>

      <KasinaMarkDivider className="bg-mkt-paper" />

      <section className="bg-mkt-paper px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2
            className={`font-display max-w-2xl text-left text-[1.75rem] font-semibold tracking-tight text-mkt-ink sm:text-[2rem] ${amClass}`}
          >
            {t.problemTitle}
          </h2>
          <p
            className={`mt-3 max-w-2xl text-left text-[15px] leading-relaxed text-mkt-ink-muted ${amClass}`}
          >
            {t.problemBody}
          </p>

          <div className="mt-12 grid overflow-hidden rounded-xl border border-mkt-rule sm:grid-cols-2">
            <div className="bg-mkt-paper p-7 sm:p-9">
              <p className={`font-utility text-[11px] font-medium uppercase tracking-[0.14em] text-mkt-ochre ${amClass}`}>
                {t.studentsLabel}
              </p>
              <h3 className={`font-display mt-3 text-xl font-semibold text-mkt-ink ${amClass}`}>
                {t.studentsTitle}
              </h3>
              <p className={`mt-3 text-[14px] leading-relaxed text-mkt-ink-muted ${amClass}`}>
                {t.studentsBody}
              </p>
            </div>
            <div className="border-t border-mkt-rule bg-mkt-panel p-7 sm:border-t-0 sm:border-l sm:p-9">
              <p className={`font-utility text-[11px] font-medium uppercase tracking-[0.14em] text-mkt-green ${amClass}`}>
                {t.teachersLabel}
              </p>
              <h3 className={`font-display mt-3 text-xl font-semibold text-mkt-ink ${amClass}`}>
                {t.teachersTitle}
              </h3>
              <p className={`mt-3 text-[14px] leading-relaxed text-mkt-ink-muted ${amClass}`}>
                {t.teachersBody}
              </p>
            </div>
          </div>
          <p className={`mt-5 text-[13px] text-mkt-ink-muted ${amClass}`}>{t.schoolsNote}</p>
        </div>
      </section>

      <KasinaMarkDivider />

      <section className="bg-mkt-paper px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <h2
            className={`font-display text-left text-[1.75rem] font-semibold tracking-tight text-mkt-ink sm:text-[2rem] ${amClass}`}
          >
            {t.pillarsTitle}
          </h2>

          <div className="relative mt-12">
            <div
              className="pointer-events-none absolute left-[8%] right-[8%] top-[1.15rem] hidden h-px bg-mkt-green/35 sm:block"
              aria-hidden
            />
            <ol className="grid gap-10 sm:grid-cols-3 sm:gap-6">
              {t.pillars.map((step) => (
                <li key={step.title} className="relative text-left">
                  <span className="font-utility relative z-10 inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-mkt-green bg-mkt-paper px-2 text-[12px] font-medium text-mkt-green">
                    {step.stage}
                  </span>
                  <h3 className={`font-display mt-5 text-lg font-semibold text-mkt-ink ${amClass}`}>
                    {step.title}
                  </h3>
                  <p className={`mt-2 text-[14px] leading-relaxed text-mkt-ink-muted ${amClass}`}>
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-mkt-deep px-5 py-16 text-mkt-paper sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className={`font-utility text-[11px] font-medium uppercase tracking-[0.14em] text-mkt-gold ${amClass}`}>
              Pilot
            </p>
            <h2
              className={`font-display mt-3 text-[1.75rem] font-semibold tracking-tight sm:text-[2rem] ${amClass}`}
            >
              {t.pilotTitle}
            </h2>
            <p className={`mt-4 text-[15px] leading-relaxed text-mkt-paper/70 ${amClass}`}>
              {t.pilotBody}
            </p>
            <Link
              href="/pilot"
              className={`mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-mkt-ochre hover:underline ${amClass}`}
            >
              {t.pilotCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-6 sm:p-8">
            <p className="font-utility text-[10px] font-medium uppercase tracking-[0.16em] text-mkt-gold">
              Locations
            </p>
            <ul className="mt-5 space-y-4">
              {t.pilotLocations.map((loc) => (
                <li key={loc} className={`flex items-center gap-3 text-[15px] font-medium ${amClass}`}>
                  <MapPin className="h-4 w-4 shrink-0 text-mkt-ochre" aria-hidden />
                  {loc}
                </li>
              ))}
            </ul>
            <p className={`mt-5 border-t border-white/10 pt-4 text-[12px] text-mkt-paper/45 ${amClass}`}>
              {t.pilotLocationsDetail}
            </p>
          </div>
        </div>
      </section>

      <KasinaMarkDivider className="bg-mkt-paper" />

      <section className="bg-mkt-paper px-5 py-16 sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-6xl gap-0 overflow-hidden rounded-xl border border-mkt-rule sm:grid-cols-2">
          <div className="p-7 sm:p-9">
            <h2 className={`font-display text-xl font-semibold text-mkt-ink ${amClass}`}>
              {t.impactTitle}
            </h2>
            <p className={`mt-3 text-[14px] leading-relaxed text-mkt-ink-muted ${amClass}`}>
              {t.impactBody}
            </p>
            <Link
              href="/impact"
              className={`mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-mkt-green hover:underline ${amClass}`}
            >
              {t.impactCta}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
          <div className="border-t border-mkt-rule bg-mkt-panel p-7 sm:border-t-0 sm:border-l sm:p-9">
            <h2 className={`font-display text-xl font-semibold text-mkt-ink ${amClass}`}>
              {t.partnersTitle}
            </h2>
            <p className={`mt-3 text-[14px] leading-relaxed text-mkt-ink-muted ${amClass}`}>
              {t.partnersBody}
            </p>
            <Link
              href="/partners"
              className={`mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-mkt-green hover:underline ${amClass}`}
            >
              {t.partnersCta}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-mkt-rule bg-[#eef4f0] px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2
            className={`font-display text-[1.75rem] font-semibold tracking-tight text-mkt-ink sm:text-[2rem] ${amClass}`}
          >
            {t.closeTitle}
          </h2>
          <p className={`mt-4 text-[15px] leading-relaxed text-mkt-ink-muted ${amClass}`}>
            {t.closeBody}
          </p>
          <Link href="/get-involved" className={`mkt-cta mt-8 ${amClass}`}>
            {t.closeCta}
          </Link>
          <div className={`mt-6 flex flex-wrap justify-center gap-5 text-[13px] ${amClass}`}>
            <Link href="/join" className="mkt-link-ochre">
              {t.productJoin}
            </Link>
            <Link href="/teacher/signup" className="mkt-link-ochre">
              {t.productTeacher}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
