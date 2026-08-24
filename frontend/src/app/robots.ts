import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
