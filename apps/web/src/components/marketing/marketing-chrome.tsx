"use client";

import type { ReactNode } from "react";
import { MarketingLangProvider, useMarketingLang } from "@/components/marketing/lang-context";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

function MarketingShell({ children }: { children: ReactNode }) {
  const { lang } = useMarketingLang();
  return (
    <div
      className="marketing-site flex min-h-screen flex-col"
      lang={lang === "am" ? "am" : "en"}
    >
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function MarketingChrome({ children }: { children: ReactNode }) {
  return (
    <MarketingLangProvider>
      <MarketingShell>{children}</MarketingShell>
    </MarketingLangProvider>
  );
}
