import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    // The editor is per-user and client-only, so there's nothing there worth indexing.
    rules: { userAgent: "*", allow: "/", disallow: ["/app/edit"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
