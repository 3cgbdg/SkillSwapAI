import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { MarketingLogo } from "@/components/marketing/MarketingLogo";
import { buttonVariants } from "@/components/ui/button";

export function MarketingFooter() {
  // Statically rendered, so this is the build year. Fine for a footer notice;
  // making the page dynamic just to tick it over would not be a good trade.
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <MarketingLogo />
          <p className="text-muted-foreground text-body-sm">
            © {year} SkillSwapAI
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: "link", size: "sm" })}
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className={buttonVariants({ variant: "link", size: "sm" })}
          >
            Sign up
          </Link>
        </div>
      </Container>
    </footer>
  );
}
