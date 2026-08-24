import type { Metadata } from "next";

import { ClosingCta } from "@/components/marketing/ClosingCta";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingSection } from "@/components/marketing/MarketingSection";

const DESCRIPTION =
  "SkillSwap AI matches you with people who can teach what you want to learn — and want to learn what you can teach. Free to join.";

export const metadata: Metadata = {
  title: { absolute: "SkillSwapAI — Swap skills. Grow together." },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SkillSwapAI",
    title: "SkillSwapAI — Swap skills. Grow together.",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSwapAI — Swap skills. Grow together.",
    description: DESCRIPTION,
  },
};

export default function LandingPage() {
  return (
    <>
      <MarketingHero />

      <MarketingSection labelledBy="features-heading">
        <div className="flex flex-col gap-10">
          <div className="flex max-w-2xl flex-col gap-3">
            <h2 id="features-heading" className="font-heading text-h2">
              Everything you need to trade skills
            </h2>
            <p className="text-muted-foreground text-body">
              One place to find a partner, plan the work, talk it through, and
              book the time.
            </p>
          </div>
          <FeatureGrid />
        </div>
      </MarketingSection>

      <MarketingSection tone="muted" labelledBy="how-it-works-heading">
        <div className="flex flex-col gap-10">
          <h2 id="how-it-works-heading" className="font-heading text-h2">
            How SkillSwap works
          </h2>
          <HowItWorks />
        </div>
      </MarketingSection>

      <MarketingSection labelledBy="cta-heading">
        <ClosingCta />
      </MarketingSection>
    </>
  );
}
