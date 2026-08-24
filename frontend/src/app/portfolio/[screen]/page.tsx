import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SkillSwapShowcase,
  skillSwapScreens,
  type SkillSwapScreen,
} from "@/components/portfolio/SkillSwapShowcase";

export const metadata: Metadata = {
  title: "Product showcase",
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return skillSwapScreens.map((screen) => ({ screen }));
}

export default async function PortfolioScreen({
  params,
}: {
  params: Promise<{ screen: string }>;
}) {
  const { screen } = await params;
  if (!skillSwapScreens.includes(screen as SkillSwapScreen)) notFound();
  return <SkillSwapShowcase screen={screen as SkillSwapScreen} />;
}
