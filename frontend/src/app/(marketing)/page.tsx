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
  "SkillSwap AI finds reciprocal learning partners, explains every match, and generates a structured learning journey with chat and scheduling built in.";

export const metadata: Metadata = {
  title: { absolute: "SkillSwapAI — AI matching and guided skill exchange" },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "SkillSwapAI",
    title: "SkillSwapAI — AI matching and guided skill exchange",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSwapAI — AI matching and guided skill exchange",
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
          eyebrow="Your learning journey"
          title="A match becomes a plan you can finish"
          headingId="plan-heading"
          visual={<PlanPreview />}
        >
          <p>
            A compatibility score is only useful when it leads somewhere.
            SkillSwap turns the exchange into an ordered path with a visible
            goal, progress, and next step.
          </p>
          <p>
            Every journey includes modules, a realistic timeline, resources,
            partner context, chat, and scheduling — all connected in the same
            workspace.
          </p>
        </FeatureRow>
      </MarketingSection>

      <MarketingSection tone="muted" labelledBy="match-heading">
        <FeatureRow
          reverse
          eyebrow="How matching works"
          title="See why the exchange works before you commit"
          headingId="match-heading"
          visual={<ExampleSwap />}
        >
          <p>
            Tell us what you can teach and what you want to learn. SkillSwap
            surfaces the people whose skills are the mirror image of yours.
          </p>
          <p>
            You see their teaching strengths and learning goals up front. Once
            you connect and start a journey together, you get a compatibility
            score and the AI&apos;s reasoning for the pairing.
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
