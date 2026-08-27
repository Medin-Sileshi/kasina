"use client";

import { MarketingLangProvider } from "@/components/marketing/lang-context";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MarketingLangProvider>
      <div className="flex min-h-screen flex-col bg-primary-800 text-white">
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </div>
    </MarketingLangProvider>
  );
}
