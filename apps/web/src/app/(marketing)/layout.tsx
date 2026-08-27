import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MarketingChrome } from "@/components/marketing/marketing-chrome";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("home");

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return <MarketingChrome>{children}</MarketingChrome>;
}
