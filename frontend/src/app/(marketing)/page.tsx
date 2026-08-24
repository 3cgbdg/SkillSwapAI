import type { Metadata } from "next";

import { ClosingCta } from "@/components/marketing/ClosingCta";
import { ExampleSwap } from "@/components/marketing/ExampleSwap";
import { FeatureGrid } from "@/components/marketing/FeatureGrid";
import { FeatureRow } from "@/components/marketing/FeatureRow";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingSection } from "@/components/marketing/MarketingSection";
import { PlanPreview } from "@/components/marketing/PlanPreview";
import { Reveal } from "@/components/marketing/Reveal";

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

      {/* The differentiator leads: anyone can match two people, but the plan is
          the part nobody else generates. */}
      <MarketingSection labelledBy="plan-heading">
        <FeatureRow
          eyebrow="What makes it work"
          title="You get a plan, not just a name"
          headingId="plan-heading"
          visual={<PlanPreview />}
        >
          <p>
            Being introduced to someone is the easy part. The hard part is
            knowing what to actually do in week one — so SkillSwap writes that
            for you.
          </p>
          <p>
            Every match comes with a structured plan: modules in order, a
            realistic timeline, and specific resources for both sides of the
            trade. Tick things off as you go.
          </p>
        </FeatureRow>
      </MarketingSection>

      <MarketingSection tone="muted" labelledBy="match-heading">
        <FeatureRow
          reverse
          eyebrow="How matching works"
          title="Matched on what you can actually trade"
          headingId="match-heading"
          visual={<ExampleSwap />}
        >
          <p>
            Tell us what you can teach and what you want to learn. SkillSwap
            looks for the people whose lists are the mirror image of yours.
          </p>
          <p>
            You&apos;ll see why each match was made and how well you fit before
            you reach out to anyone.
          </p>
        </FeatureRow>
      </MarketingSection>

      <MarketingSection labelledBy="supporting-heading">
        <div className="flex flex-col gap-10">
          <Reveal className="flex max-w-2xl flex-col gap-3">
            <h2 id="supporting-heading" className="font-heading text-h2">
              Everything else is already here
            </h2>
            <p className="text-muted-foreground text-body">
              Once you&apos;ve matched, you shouldn&apos;t need four other apps
              to keep it going.
            </p>
          </Reveal>
          <FeatureGrid />
        </div>
      </MarketingSection>

      <MarketingSection tone="muted" labelledBy="how-it-works-heading">
        <div className="flex flex-col gap-10">
          <Reveal>
            <h2 id="how-it-works-heading" className="font-heading text-h2">
              Getting started takes about a minute
            </h2>
          </Reveal>
          <HowItWorks />
        </div>
      </MarketingSection>

      <MarketingSection labelledBy="cta-heading">
        <Reveal>
          <ClosingCta />
        </Reveal>
      </MarketingSection>
    </>
  );
}
