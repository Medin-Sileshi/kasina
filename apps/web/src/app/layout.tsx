import type { Metadata } from "next";
import { Inter, Noto_Serif_Ethiopic } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const notoEthiopic = Noto_Serif_Ethiopic({
  variable: "--font-ethiopic",
  subsets: ["ethiopic"],
  weight: ["400", "600", "700"],
  display: "swap",
  // Avoid serverless crashes if Google Fonts fetch fails at runtime/build on Vercel
  preload: false,
  fallback: ["Noto Serif Ethiopic", "serif"],
});

export const metadata: Metadata = {
  title: "Kasina (ካሲና)",
  description:
    "Classroom practice for Ethiopian Grade 12 students — assign, practice, and track progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoEthiopic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-950 font-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
