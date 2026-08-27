import type { MetadataRoute } from "next";
import { absoluteUrl, marketingPages } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return Object.values(marketingPages).map((page) => ({
    url: absoluteUrl(page.path),
    lastModified: now,
    changeFrequency: page.path === "/" ? "weekly" : "monthly",
    priority: page.path === "/" ? 1 : page.path === "/about" || page.path === "/melak" ? 0.9 : 0.7,
  }));
}
