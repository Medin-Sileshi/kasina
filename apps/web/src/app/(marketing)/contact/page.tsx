"use client";

import { useState } from "react";
import {
  MarketingEyebrow,
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
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  }

  return (
    <MarketingPageShell>
      <MarketingEyebrow>{t.title}</MarketingEyebrow>
      <MarketingH1>{t.headline}</MarketingH1>
      <MarketingLead>{t.intro}</MarketingLead>
      <div className={`mt-8 space-y-2 text-[14px] text-mkt-ink-muted ${amClass}`}>
        <p>
          <span className="text-mkt-ink/40">{t.emailLabel}: </span>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mkt-link-ochre">
            {CONTACT_EMAIL}
          </a>
        </p>
        <p>
          <span className="text-mkt-ink/40">{t.phoneLabel}: </span>
          <a href={`tel:${CONTACT_PHONE_TEL}`} className="hover:text-mkt-ink">
            {CONTACT_PHONE}
          </a>
        </p>
      </div>
      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <label className="block">
          <span className={`text-[12px] font-semibold text-mkt-ink-muted ${amClass}`}>
            {t.formName}
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-mkt-rule bg-mkt-paper px-4 py-3 text-[15px] text-mkt-ink outline-none focus:border-mkt-green"
          />
        </label>
        <label className="block">
          <span className={`text-[12px] font-semibold text-mkt-ink-muted ${amClass}`}>
            {t.formEmail}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-mkt-rule bg-mkt-paper px-4 py-3 text-[15px] text-mkt-ink outline-none focus:border-mkt-green"
          />
        </label>
        <label className="block">
          <span className={`text-[12px] font-semibold text-mkt-ink-muted ${amClass}`}>
            {t.formMessage}
          </span>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="mt-1.5 w-full rounded-lg border border-mkt-rule bg-mkt-paper px-4 py-3 text-[15px] text-mkt-ink outline-none focus:border-mkt-green"
          />
        </label>
        <button type="submit" className={`mkt-cta ${amClass}`}>
          {t.formSubmit}
        </button>
        <p className={`text-[12px] text-mkt-ink-muted ${amClass}`}>{t.note}</p>
      </form>
    </MarketingPageShell>
  );
}
