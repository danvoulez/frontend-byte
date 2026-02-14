
import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const urls = ["", "/pricing", "/docs", "/changelog", "/about"].map((p) => ({ url: `${base}${p || "/"}`, lastModified: new Date() }));
  return urls;
}
