import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The authenticated surface — middleware already redirects these to the
      // login page, so let crawlers skip the redirect chains entirely.
      disallow: [
        "/auth",
        "/dashboard",
        "/discover",
        "/learning",
        "/matches",
        "/chats",
        "/inbox",
        "/profile",
        "/profiles",
        "/calendar",
        "/schedule",
      ],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
