"use client";

import { useState } from "react";
import {
  MarketingH1,
  MarketingLead,
  MarketingPageShell,
} from "@/components/marketing/page-shell";
import { useMarketingLang } from "@/components/marketing/lang-context";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  contactCopy,
} from "@/lib/marketing-copy";

export default function ContactPage() {
  const { lang } = useMarketingLang();
  const t = contactCopy[lang];
  const amClass = lang === "am" ? "font-ethiopic" : "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`Kasina contact — ${name || "visitor"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <MarketingPageShell>
      <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40 ${amClass}`}>
        {t.title}
      </p>
      <MarketingH1>{t.headline}</MarketingH1>
      <MarketingLead>{t.intro}</MarketingLead>
      <div className={`mt-8 space-y-2 text-[14px] text-white/70 ${amClass}`}>
        <p>
          <span className="text-white/40">{t.emailLabel}: </span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-500 hover:text-accent-600">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>
          <span className="text-white/40">{t.phoneLabel}: </span>
          <a href={`tel:${CONTACT_PHONE_TEL}`} className="hover:text-white">
            {CONTACT_PHONE}
          </a>
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <label className="block">
          <span className={`text-[12px] font-semibold text-white/50 ${amClass}`}>
            {t.formName}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-white outline-none focus:border-accent-500"
          />
        </label>
        <label className="block">
          <span className={`text-[12px] font-semibold text-white/50 ${amClass}`}>
            {t.formEmail}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-white outline-none focus:border-accent-500"
          />
        </label>
        <label className="block">
          <span className={`text-[12px] font-semibold text-white/50 ${amClass}`}>
            {t.formMessage}
          </span>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-[15px] text-white outline-none focus:border-accent-500"
          />
        </label>
        <button
          type="submit"
          className={`inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-[15px] font-semibold text-primary-800 ${amClass}`}
        >
          {t.formSubmit}
        </button>
        <p className={`text-[12px] text-white/40 ${amClass}`}>{t.note}</p>
      </form>
    </MarketingPageShell>
  );
}
