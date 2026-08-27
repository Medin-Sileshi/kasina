import type { Metadata } from "next";
import {
  Fraunces,
  IBM_Plex_Mono,
  Noto_Serif_Ethiopic,
  Source_Sans_3,
} from "next/font/google";
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
  title: "Kasina (ካሲና) | Melak AI tutor for Ethiopian classrooms",
  description:
    "Melak helps students understand their lessons and helps teachers teach more effectively. Now piloting Grade 12 Mathematics classrooms.",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
