/**
 * Public origin of the site, used for canonical/OpenGraph URLs and the sitemap.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL — explicit override (e.g. a custom domain).
 *  2. VERCEL_PROJECT_PRODUCTION_URL — set automatically by Vercel, and stable
 *     across deployments (unlike VERCEL_URL, which is per-deployment). It has
 *     no protocol, so https:// is prefixed. Server-only, which is fine: every
 *     caller (metadata, robots, sitemap) is evaluated on the server.
 *  3. localhost, for local development.
 *
 * Without step 2 an unconfigured deploy silently emits canonical/og URLs
 * pointing at localhost, which tells crawlers the canonical page is a machine
 * they can't reach.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) return `https://${vercelProductionUrl}`;

  return "http://localhost:3000";
}
