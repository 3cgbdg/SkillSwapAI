import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { MarketingLogo } from "@/components/marketing/MarketingLogo";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-[var(--z-fab)] border-b border-border bg-background/80 backdrop-blur-sm">
      <Container className="flex h-(--header-h) items-center justify-between gap-4">
        <MarketingLogo />

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/auth/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Log in
          </Link>
          <Link href="/auth/signup" className={buttonVariants({ size: "sm" })}>
            Sign up
          </Link>
        </div>
      </Container>
    </header>
  );
}
