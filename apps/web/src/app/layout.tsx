import type { Metadata } from "next";
import {
  Fraunces,
  IBM_Plex_Mono,
  Noto_Serif_Ethiopic,
  Source_Sans_3,
} from "next/font/google";
import { SiteJsonLd } from "@/components/seo/json-ld";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_NAME_AM,
  SITE_URL,
} from "@/lib/seo";
import { Providers } from "./providers";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-utility",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const notoEthiopic = Noto_Serif_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  weight: ["400", "600", "700"],
  display: "swap",
  preload: false,
  fallback: ["Noto Serif Ethiopic", "serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Kasina (${SITE_NAME_AM}) | Melak AI tutor for Ethiopian classrooms`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: "Kasina", url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
      am: "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_ET",
    alternateLocale: ["am_ET"],
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `Kasina (${SITE_NAME_AM}) | Melak AI tutor for Ethiopian classrooms`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Kasina (ካሲና) — Melak AI tutor for Ethiopian classrooms",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Kasina (${SITE_NAME_AM}) | Melak AI tutor for Ethiopian classrooms`,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", type: "image/png" }],
  },
  other: {
    "geo.region": "ET-AA",
    "geo.placename": "Addis Ababa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${fraunces.variable} ${plexMono.variable} ${notoEthiopic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-950 font-body">
        <SiteJsonLd />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
