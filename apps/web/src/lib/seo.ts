import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://kasina.et";

export const SITE_NAME = "Kasina";
export const SITE_NAME_AM = "ካሲና";

/** Default description optimized for brand + product queries. */
export const SITE_DESCRIPTION =
  "Kasina (ካሲና) is an Ethiopian EdTech platform. Melak helps Grade 11–12 students understand lessons in Amharic or English, with classroom tools for teachers. Piloting in Addis Ababa.";

export const SITE_KEYWORDS = [
  "Kasina",
  "ካሲና",
  "Kasina Ethiopia",
  "Kasina Melak",
  "Melak AI tutor",
  "መላክ",
  "Ethiopian EdTech",
  "Ethiopia secondary school",
  "Grade 12 Mathematics",
  "offline AI tutor Ethiopia",
  "Addis Ababa education",
  "kasina.et",
];

type PageSeo = {
  title: string;
  description: string;
  path: string;
};

/** Marketing page SEO — titles intentionally lead with Kasina for brand search. */
export const marketingPages = {
  home: {
    path: "/",
    title: "Kasina (ካሲና) | Melak AI tutor for Ethiopian classrooms",
    description: SITE_DESCRIPTION,
  },
  about: {
    path: "/about",
    title: "About Kasina (ካሲና)",
    description:
      "Learn about Kasina (ካሲና) — Ethiopian secondary EdTech building Melak, an offline-aware AI tutor for students and teachers in Addis Ababa pilot schools.",
  },
  students: {
    path: "/students",
    title: "Kasina for Students",
    description:
      "Study with Kasina and Melak — clear explanations in Amharic or English, practice tools, and offline-friendly support for Ethiopian secondary students.",
  },
  teachers: {
    path: "/teachers",
    title: "Kasina for Teachers",
    description:
      "Kasina helps Ethiopian secondary teachers assign practice, see who needs help, and support Grade 11–12 classrooms with Melak.",
  },
  melak: {
    path: "/melak",
    title: "Melak — Kasina’s AI tutor",
    description:
      "Melak (መላክ) is Kasina’s AI-assisted tutor for Ethiopian classrooms — curriculum-grounded help in Amharic and English, designed to work when connectivity is weak.",
  },
  pilot: {
    path: "/pilot",
    title: "Kasina Classroom Pilot",
    description:
      "Kasina’s Grade 11–12 classroom pilot in Addis Ababa (Kolfe Keranio, Nifas Silk-Lafto, Lemi Kura) — strengthening daily learning and teacher support.",
  },
  "practice-tools": {
    path: "/practice-tools",
    title: "Kasina Practice & Assessment Tools",
    description:
      "Classroom practice, exam-format sessions, and feedback tools from Kasina for Ethiopian secondary math classrooms.",
  },
  impact: {
    path: "/impact",
    title: "Kasina Impact",
    description:
      "How Kasina measures learning outcomes and teacher feedback in Ethiopian secondary classrooms.",
  },
  partners: {
    path: "/partners",
    title: "Kasina Partners",
    description:
      "Schools, education offices, and funders partnering with Kasina (ካሲና) to strengthen Ethiopian secondary classrooms.",
  },
  "get-involved": {
    path: "/get-involved",
    title: "Get Involved with Kasina",
    description:
      "Partner with Kasina as a school, teacher, funder, or volunteer supporting Ethiopian secondary education.",
  },
  contact: {
    path: "/contact",
    title: "Contact Kasina",
    description:
      "Contact Kasina (ካሲና) — reach the team about the Melak pilot, school partnerships, or support.",
  },
  faq: {
    path: "/faq",
    title: "Kasina FAQ",
    description:
      "Frequently asked questions about Kasina, Melak, the classroom pilot, and how students and teachers get started.",
  },
  "privacy-policy": {
    path: "/privacy-policy",
    title: "Kasina Privacy Policy",
    description: "Privacy policy for Kasina (ካሲና) and the Melak learning platform.",
  },
  "terms-of-use": {
    path: "/terms-of-use",
    title: "Kasina Terms of Use",
    description: "Terms of use for Kasina (ካሲና) and the Melak learning platform.",
  },
} as const satisfies Record<string, PageSeo>;

export type MarketingPageKey = keyof typeof marketingPages;

export function absoluteUrl(path = "/"): string {
  if (path === "/") return SITE_URL;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata(key: MarketingPageKey): Metadata {
  const page = marketingPages[key];
  const url = absoluteUrl(page.path);
  return {
    title: {
      absolute: page.title,
    },
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.title,
      description: page.description,
      url,
      type: "website",
      siteName: SITE_NAME,
      locale: "en_ET",
      alternateLocale: ["am_ET"],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: [SITE_NAME_AM, "Kasina Ethiopia"],
    url: SITE_URL,
    logo: absoluteUrl("/brand/kasina-icon-512.png"),
    description: SITE_DESCRIPTION,
    email: "medin.sileshi.diro@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Addis Ababa",
      addressCountry: "ET",
    },
    areaServed: {
      "@type": "Country",
      name: "Ethiopia",
    },
    sameAs: [SITE_URL, "https://www.kasina.et"],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: [SITE_NAME_AM, "kasina.et"],
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: ["en", "am"],
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: absoluteUrl("/brand/kasina-icon-512.png"),
    },
  };
}

export function softwareApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Kasina",
    alternateName: ["ካሲና", "Melak"],
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ETB",
    },
    inLanguage: ["en", "am"],
  };
}
