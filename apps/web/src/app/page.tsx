"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Download,
  MessageCircle,
  MonitorSmartphone,
  Shield,
  Sparkles,
  WifiOff,
  LineChart,
  School,
} from "lucide-react";
import { BrandAtmosphere } from "@/components/brand-chrome";

type Lang = "en" | "am";

const copy = {
  en: {
    langSwitch: "አማ",
    langLabel: "EN",
    brandAm: "ካሲና",
    pilot:
      "Now piloting Grade 12 Mathematics classrooms on the web — Melak offline on mobile comes next.",
    headline: "Melak, an AI tutor that helps you pass — even without internet.",
    subhead:
      "Built for Grade 7–12 students preparing for Ethiopia’s national exams — including the new computer-based (CBT) format.",
    cta: "Start Learning Free",
    ctaTeachers: "For Schools & Teachers →",
    offlineCaption: "Designed for offline study after one download",
    problemTitle: "Built for the exam system students actually face",
    problemBody:
      "Parents and students already know the pressure. Kasina is built around that reality — not around generic study tips.",
    problems: [
      {
        title: "Passing is hard",
        body: "National exams decide next steps for millions of families. Students need focused practice, not guesswork.",
      },
      {
        title: "CBT is new for many",
        body: "Computer-based exams are rolling out. Sitting a test on a screen should not be the first time a student uses one.",
      },
      {
        title: "Access is uneven",
        body: "Quality tutoring clusters in cities with reliable internet. Rural and low-connectivity students get left behind.",
      },
    ],
    howTitle: "How Kasina + Melak work",
    steps: [
      {
        title: "Download once, learn anywhere",
        body: "After the first download, Melak’s core tutoring is meant to keep working without wifi.",
        icon: "download" as const,
      },
      {
        title: "Ask Melak anything",
        body: "Ask in your own words — Amharic or English — and get a clear explanation, not just a score.",
        icon: "sparkles" as const,
      },
      {
        title: "Practice like the real exam",
        body: "CBT-style practice so the computer format isn’t a surprise on exam day.",
        icon: "monitor" as const,
      },
      {
        title: "Track real progress",
        body: "See what’s improving and what still needs work — so effort turns into mastery.",
        icon: "chart" as const,
      },
    ],
    featuresTitle: "What students and parents care about",
    features: [
      {
        title: "Study without waiting for wifi",
        body: "On the bus, at home, or anywhere signal drops — Melak is designed to keep tutoring available offline after setup.",
      },
      {
        title: "Melak talks with you",
        body: "A conversational tutor (not only flashcards). Ask why an answer is wrong and get an explanation you can follow.",
      },
      {
        title: "Curriculum-aligned practice",
        body: "Classroom practice today starts with Grade 12 Mathematics. Broader Grade 7–12 subject coverage expands as Kasina grows.",
      },
      {
        title: "CBT exam simulation",
        body: "Practice on a screen the way the national exam increasingly works — so the format itself isn’t the obstacle.",
      },
      {
        title: "Amharic and English",
        body: "Learn in the language that helps you understand — switch when you need to.",
      },
    ],
    pricingTitle: "What it costs",
    pricingBody:
      "Free for students who join a class with an invite code. Teachers can create a free account during the classroom pilot. School and institutional plans will be clear before any paid rollout — no surprise fees on this page.",
    schoolsTitle: "For schools & teachers",
    schoolsBody:
      "Create classes, assign practice, and see who’s struggling — aligned with how Ethiopian classrooms actually run. Start free, then talk to us about school-wide rollout.",
    schoolsCta: "Create teacher account",
    schoolsContact: "Request a school conversation",
    faqTitle: "Questions parents ask",
    faqs: [
      {
        q: "Does it really work without internet?",
        a: "The long-term product is offline-first Melak on mobile after one download. Today’s pilot is web classroom practice and needs a connection. We’re clear about both so expectations stay honest.",
      },
      {
        q: "What devices does it support?",
        a: "Right now: modern phones and laptops in a browser (Chrome/Firefox). A dedicated Android app for offline Melak is on the roadmap after this pilot.",
      },
      {
        q: "Is my child’s data safe?",
        a: "We only collect what’s needed for learning and class management. We don’t sell student data. A plain-language Privacy Policy will stay linked in the footer as the product grows.",
      },
      {
        q: "How much data does the first download use?",
        a: "For the web pilot, you use normal browsing data. For the future mobile download, we’ll publish an approximate size before release so families can plan.",
      },
      {
        q: "Is this aligned with the national curriculum?",
        a: "Practice content is built around Ethiopian secondary exam prep — starting with Grade 12 Mathematics in this pilot. We do not claim official MoE endorsement unless a partnership is signed and listed here.",
      },
    ],
    footerTag: "Classroom learning for Ethiopian secondary schools",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
    footerSchools: "For Schools",
    footerAbout: "About",
    melakName: "Melak",
    melakChatQ: "How do I find the derivative of x²?",
    melakChatA:
      "Use the power rule: bring the exponent down, then subtract one. So 2x.",
    joinHint: "Have an invite code? Join your class free.",
  },
  am: {
    langSwitch: "EN",
    langLabel: "አማ",
    brandAm: "ካሲና",
    pilot:
      "አሁን በድር ላይ የ12ኛ ክፍል ሂሳብ ክፍሎችን በሙከራ እያስተዳደርን ነው — ከመስመር ውጭ መላክ በሞባይል ይቀጥላል።",
    headline: "መላክ — በይነመረብ ሳይኖርም እንድታልፍ የሚረዳህ የሰው ሰራሽ አስተማሪ።",
    subhead:
      "ለ7ኛ–12ኛ ክፍል ተማሪዎች የኢትዮጵያ ብሔራዊ ፈተናዎችን — የኮምፒዩተር ላይ (CBT) ቅርጸትን ጨምሮ — ለመዘጋጀት የተሰራ።",
    cta: "ነጻ ለመማር ይጀምሩ",
    ctaTeachers: "ለትምህርት ቤቶችና መምህራን →",
    offlineCaption: "አንድ ጊዜ ካወረዱ በኋላ ከመስመር ውጭ ለመማር የተዘጋጀ",
    problemTitle: "ተማሪዎች ለሚያጋጥሟቸው ፈተና እውነታ የተሰራ",
    problemBody:
      "ወላጆችና ተማሪዎች ጫናውን ያውቃሉ። ካሲና ያንን እውነታ መሠረት አድርጎ የተሰራ ነው።",
    problems: [
      {
        title: "ማለፍ ከባድ ነው",
        body: "ብሔራዊ ፈተናዎች የሚቀጥለውን እርምጃ ይወስናሉ። ተማሪዎች ሆን ብሎ ልምምድ ያስፈልጋቸዋል።",
      },
      {
        title: "CBT ለብዙዎች አዲስ ነው",
        body: "በኮምፒዩተር ላይ ፈተና እየተስፋፋ ነው። በፈተና ቀን ለመጀመሪያ ጊዜ ማያ ገጽ መጠቀም አይገባም።",
      },
      {
        title: "እኩል አይደለም",
        body: "ጥራት ያለው ትምህርት ብዙ ጊዜ በከተሞች ነው። አነስተኛ ግንኙነት ያላቸው ተማሪዎች ይቀራሉ።",
      },
    ],
    howTitle: "ካሲና + መላክ እንዴት ይሰራሉ",
    steps: [
      {
        title: "አንድ ጊዜ አውርድ፣ በየትም ተማር",
        body: "ከመጀመሪያው ማውረድ በኋላ የመላክ ዋና ትምህርት ያለ wifi እንዲቀጥል የተዘጋጀ ነው።",
        icon: "download" as const,
      },
      {
        title: "ማንኛውንም ነገር መላክን ጠይቅ",
        body: "በራስህ ቃላት — በአማርኛ ወይም በእንግሊዘኛ — ግልጽ ማብራሪያ ታገኛለህ።",
        icon: "sparkles" as const,
      },
      {
        title: "እንደ እውነተኛው ፈተና ልምምድ አድርግ",
        body: "የCBT-ቅርጸት ልምምድ — ቅርጸቱ በፈተና ቀን አያስደንቅህም።",
        icon: "monitor" as const,
      },
      {
        title: "እውነተኛ እድገትህን ተከታተል",
        body: "ምን እንደሚሻሻል እና ምን ገና እንደሚያስፈልግ ታያለህ።",
        icon: "chart" as const,
      },
    ],
    featuresTitle: "ተማሪዎችና ወላጆች የሚፈልጉት",
    features: [
      {
        title: "wifi ሳትጠብቅ ተማር",
        body: "በአውቶቡስ፣ በቤት፣ ሲግናል በሚቋረጥበት — መላክ ከተዘጋጀ በኋላ ከመስመር ውጭ እንዲሰራ የተዘጋጀ ነው።",
      },
      {
        title: "መላክ ከአንተ ጋር ይነጋገራል",
        body: "ውይይታዊ አስተማሪ። መልሱ ለምን እንደተሳሳተ ጠይቅ — የምትከተለው ማብራሪያ ታገኛለህ።",
      },
      {
        title: "ከስርአተ ትምህርት ጋር የተያያዘ ልምምድ",
        body: "ዛሬ የክፍል ልምምድ በ12ኛ ክፍል ሂሳብ ይጀምራል። የ7–12 ርዕሰ ጉዳዮች እየሰፋ ይሄዳል።",
      },
      {
        title: "የCBT ፈተና ማስመሰል",
        body: "ብሔራዊ ፈተና እየሄደበት ባለው ማያ ገጽ ላይ ልምምድ አድርግ።",
      },
      {
        title: "አማርኛ እና እንግሊዘኛ",
        body: "በምትረዳበት ቋንቋ ተማር — ስትፈልግ ቀይር።",
      },
    ],
    pricingTitle: "ዋጋው ምንድን ነው",
    pricingBody:
      "በግብዣ ኮድ የሚቀላቀሉ ተማሪዎች ነፃ ናቸው። መምህራን በሙከራ ወቅት ነፃ መለያ መፍጠር ይችላሉ። የትምህርት ቤት ክፍያ ከመጀመሩ በፊት በግልጽ ይገለጻል።",
    schoolsTitle: "ለትምህርት ቤቶችና መምህራን",
    schoolsBody:
      "ክፍል ፍጠር፣ ልምምድ መድብ፣ ማን እንደሚቸገር እይ። ነፃ ጀምር — ለትምህርት ቤት ስፋት ከእኛ ጋር ተነጋገር።",
    schoolsCta: "የመምህር መለያ ፍጠር",
    schoolsContact: "የትምህርት ቤት ውይይት ጠይቅ",
    faqTitle: "ወላጆች የሚጠይቋቸው ጥያቄዎች",
    faqs: [
      {
        q: "በእውነት ያለ በይነመረብ ይሰራል?",
        a: "ረጅም ጊዜ ያለው ምርት ከአንድ ማውረድ በኋላ ከመስመር ውጭ መላክ ነው። የዛሬው ሙከራ የድር ክፍል ልምምድ ሲሆን ግንኙነት ያስፈልገዋል። ሁለቱንም በግልጽ እንናገራለን።",
      },
      {
        q: "ምን ዓይነት መሣሪያ ይደግፋል?",
        a: "አሁን፡ ዘመናዊ ስልኮችና ላፕቶፖች በአሳሽ። ለከመስመር ውጭ መላክ የAndroid መተግበሪያ ከሙከራ በኋላ ይመጣል።",
      },
      {
        q: "የልጄ መረጃ ደህንነቱ የተጠበቀ ነው?",
        a: "ለትምህርትና ክፍል አስተዳደር የሚያስፈልገውን ብቻ እንሰበስባለን። የተማሪ መረጃ አንሸጥም።",
      },
      {
        q: "የመጀመሪያው ማውረድ ምን ያህል ዳታ ይወስዳል?",
        a: "ለድር ሙከራ መደበኛ የአሳሽ ዳታ ነው። ለወደፊት ሞባይል ማውረድ ከመውጣቱ በፊት ግምታዊ መጠን እናሳያለን።",
      },
      {
        q: "ከብሔራዊ ስርአተ ትምህርት ጋር የተጣጣመ ነው?",
        a: "ይዘቱ የኢትዮጵያ ሁለተኛ ደረጃ ፈተና ዝግጅትን ያጠነጥናል — በዚህ ሙከራ በ12ኛ ክፍል ሂሳብ። ያልተፈረመ የMoE አጋርነት አንጠቀስም።",
      },
    ],
    footerTag: "ለኢትዮጵያ ሁለተኛ ደረጃ ትምህርት ቤቶች የክፍል ትምህርት",
    footerPrivacy: "ግላዊነት",
    footerTerms: "ውሎች",
    footerSchools: "ለትምህርት ቤቶች",
    footerAbout: "ስለ እኛ",
    melakName: "መላክ",
    melakChatQ: "የ x² ተውሳክ እንዴት አገኛለሁ?",
    melakChatA: "የኃይል ህግን ተጠቀም፡ ገላጩን አውርድ ከዚያ አንድ ቀንስ። ስለዚህ 2x።",
    joinHint: "የግብዣ ኮድ አለህ? ክፍልህን ነፃ ተቀላቀል።",
  },
} as const;

function StepIcon({ name }: { name: "download" | "sparkles" | "monitor" | "chart" }) {
  const className = "h-6 w-6 text-accent-500";
  switch (name) {
    case "download":
      return <Download className={className} strokeWidth={1.75} aria-hidden />;
    case "sparkles":
      return <Sparkles className={className} strokeWidth={1.75} aria-hidden />;
    case "monitor":
      return (
        <MonitorSmartphone className={className} strokeWidth={1.75} aria-hidden />
      );
    case "chart":
      return <LineChart className={className} strokeWidth={1.75} aria-hidden />;
  }
}

function MelakPhone({
  lang,
  name,
  question,
  answer,
}: {
  lang: Lang;
  name: string;
  question: string;
  answer: string;
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
              <span lang={lang === "am" ? "am" : undefined} className={lang === "am" ? "font-ethiopic" : undefined}>
                {question}
              </span>
            </div>
            <div className="mr-6 rounded-2xl rounded-tl-md bg-white px-3 py-2 text-[13px] leading-snug text-gray-800 shadow-sm ring-1 ring-gray-200/80">
              <span lang={lang === "am" ? "am" : undefined} className={lang === "am" ? "font-ethiopic" : undefined}>
                {answer}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px] font-medium text-gray-500">
              <WifiOff className="h-3.5 w-3.5 text-accent-600" aria-hidden />
              <span lang={lang === "am" ? "am" : undefined} className={lang === "am" ? "font-ethiopic" : undefined}>
                {lang === "en" ? "Works after download" : "ካወረዱ በኋላ ይሰራል"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = copy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";

  return (
    <main className="bg-primary-800 text-white" lang={lang === "am" ? "am" : "en"}>
      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight">Kasina</span>
          <span lang="am" className="font-ethiopic text-sm font-semibold text-white/75">
            ({t.brandAm})
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setLang((l) => (l === "en" ? "am" : "en"))}
          className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/90 transition hover:bg-white/10"
          aria-label={lang === "en" ? "Switch to Amharic" : "Switch to English"}
        >
          <span className="text-white/50">{t.langLabel}</span>
          <span className="mx-1.5 text-white/30">|</span>
          <span lang={lang === "en" ? "am" : "en"} className={lang === "en" ? "font-ethiopic" : undefined}>
            {t.langSwitch}
          </span>
        </button>
      </header>

      {/* 1. Hero */}
      <section className="relative overflow-hidden pb-16 pt-4 sm:pb-20 sm:pt-6">
        <BrandAtmosphere />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-10">
          <div className="text-center lg:text-left">
            <p
              className={`landing-fade-up text-[12px] font-medium leading-relaxed text-accent-500/95 sm:text-[13px] ${amClass}`}
            >
              {t.pilot}
            </p>
            <h1
              className={`landing-fade-up landing-delay-1 mt-5 text-[1.75rem] font-bold leading-[1.2] tracking-tight text-white sm:text-[2.35rem] lg:text-[2.5rem] ${amClass}`}
            >
              {t.headline}
            </h1>
            <p
              className={`landing-fade-up landing-delay-2 mt-4 max-w-xl text-[15px] leading-relaxed text-white/70 sm:text-base lg:mx-0 mx-auto ${amClass}`}
            >
              {t.subhead}
            </p>

            <div className="landing-fade-up landing-delay-3 mt-8 flex flex-col items-center gap-3 sm:mt-10 lg:items-start">
              <Link
                href="/join"
                className={`inline-flex h-14 w-full max-w-sm items-center justify-center gap-2 rounded-2xl bg-white px-5 text-[17px] font-semibold text-primary-800 transition hover:bg-white/95 lg:w-auto lg:min-w-[240px] ${amClass}`}
              >
                {t.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/teacher/signup"
                className={`text-[14px] font-semibold text-white/80 underline-offset-2 hover:text-white hover:underline ${amClass}`}
              >
                {t.ctaTeachers}
              </Link>
              <p className={`mt-1 text-[12px] text-white/45 ${amClass}`}>{t.joinHint}</p>
            </div>
          </div>

          <div className="relative">
            <MelakPhone
              lang={lang}
              name={t.melakName}
              question={t.melakChatQ}
              answer={t.melakChatA}
            />
            <p
              className={`mt-4 text-center text-[12px] text-white/50 ${amClass}`}
            >
              {t.offlineCaption}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Problem */}
      <section className="relative border-t border-white/10 bg-primary-900/50 px-5 py-16 sm:px-8 sm:py-20">
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

      {/* 3. How it works */}
      <section className="relative border-t border-white/10 px-5 py-16 sm:px-8 sm:py-20">
        <BrandAtmosphere className="opacity-40" />
        <div className="relative z-10 mx-auto max-w-5xl">
          <h2 className={`text-center text-2xl font-bold tracking-tight sm:text-[1.75rem] ${amClass}`}>
            {t.howTitle}
          </h2>
          <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {t.steps.map((step, i) => (
              <li key={step.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <StepIcon name={step.icon} />
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/35">
                  {i + 1}
                </p>
                <h3 className={`mt-2 text-[15px] font-bold text-white ${amClass}`}>{step.title}</h3>
                <p className={`mt-2 text-[13px] leading-relaxed text-white/60 ${amClass}`}>
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. Features */}
      <section className="relative border-t border-white/10 bg-primary-900/40 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className={`text-center text-2xl font-bold tracking-tight ${amClass}`}>
            {t.featuresTitle}
          </h2>
          <ul className="mt-12 space-y-8">
            {t.features.map((f) => (
              <li key={f.title} className="border-b border-white/10 pb-8 last:border-0 last:pb-0">
                <h3 className={`text-lg font-bold text-white ${amClass}`}>{f.title}</h3>
                <p className={`mt-2 text-[15px] leading-relaxed text-white/65 ${amClass}`}>
                  {f.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 6. Pricing — skip empty social proof */}
      <section className="relative border-t border-white/10 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-xl text-center">
          <Shield className="mx-auto h-7 w-7 text-accent-500" strokeWidth={1.75} aria-hidden />
          <h2 className={`mt-5 text-2xl font-bold tracking-tight ${amClass}`}>{t.pricingTitle}</h2>
          <p className={`mt-4 text-[15px] leading-relaxed text-white/65 ${amClass}`}>
            {t.pricingBody}
          </p>
          <Link
            href="/join"
            className={`mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-semibold text-primary-800 transition hover:bg-white/95 ${amClass}`}
          >
            {t.cta}
          </Link>
        </div>
      </section>

      {/* 7. Schools */}
      <section
        id="schools"
        className="relative border-t border-white/10 bg-primary-900/50 px-5 py-16 sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-xl text-center">
          <School className="mx-auto h-7 w-7 text-accent-500" strokeWidth={1.75} aria-hidden />
          <h2 className={`mt-5 text-2xl font-bold tracking-tight ${amClass}`}>{t.schoolsTitle}</h2>
          <p className={`mt-4 text-[15px] leading-relaxed text-white/65 ${amClass}`}>
            {t.schoolsBody}
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/teacher/signup"
              className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 text-base font-semibold text-white transition hover:bg-white/10 ${amClass}`}
            >
              {t.schoolsCta}
            </Link>
            <a
              href="mailto:medin.sileshi.diro@gmail.com?subject=Kasina%20school%20conversation"
              className={`text-[14px] font-semibold text-accent-500 hover:text-accent-600 ${amClass}`}
            >
              {t.schoolsContact}
            </a>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="relative border-t border-white/10 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className={`text-center text-2xl font-bold tracking-tight ${amClass}`}>
            {t.faqTitle}
          </h2>
          <div className="mt-10 space-y-6">
            {t.faqs.map((item) => (
              <details
                key={item.q}
                className="group border-b border-white/10 pb-5 open:pb-5"
              >
                <summary
                  className={`cursor-pointer list-none text-[15px] font-semibold text-white marker:content-none [&::-webkit-details-marker]:hidden ${amClass}`}
                >
                  <span className="flex items-start justify-between gap-3">
                    {item.q}
                    <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-white/35 group-open:text-accent-500" aria-hidden />
                  </span>
                </summary>
                <p className={`mt-3 text-[14px] leading-relaxed text-white/60 ${amClass}`}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="border-t border-white/10 px-5 py-12 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
          <div>
            <p className="text-lg font-bold tracking-tight">
              Kasina{" "}
              <span lang="am" className="font-ethiopic font-semibold text-white/75">
                ({t.brandAm})
              </span>
            </p>
            <p className={`mt-2 text-xs text-white/40 ${amClass}`}>{t.footerTag}</p>
          </div>

          <button
            type="button"
            onClick={() => setLang((l) => (l === "en" ? "am" : "en"))}
            className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80"
          >
            {t.langLabel} | {t.langSwitch}
          </button>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-white/55">
            <Link href="/teacher/signup" className="hover:text-white">
              {t.footerSchools}
            </Link>
            <a href="mailto:medin.sileshi.diro@gmail.com" className="hover:text-white">
              medin.sileshi.diro@gmail.com
            </a>
            <a href="tel:+251927777739" className="hover:text-white">
              +251 927 777 739
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-[12px] text-white/35">
            <span>{t.footerPrivacy}</span>
            <span>{t.footerTerms}</span>
            <span>{t.footerAbout}</span>
          </div>

          <p className="flex items-center gap-2 text-[12px] text-white/30">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            Kasina · Melak
          </p>
        </div>
      </footer>
    </main>
  );
}
