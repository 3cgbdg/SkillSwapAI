import Link from "next/link";

import { Container } from "@/components/layout/Container";

const Footer = () => {
  return (
    <footer className="border-border bg-muted/40 mt-auto hidden border-t md:block">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-6 text-sm">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} SkillSwap AI
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-primary focus-visible:ring-ring/50 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            Dashboard
          </Link>
          <Link
            href="/matches"
            className="text-muted-foreground hover:text-primary focus-visible:ring-ring/50 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            Matches
          </Link>
          <Link
            href="/profile"
            className="text-muted-foreground hover:text-primary focus-visible:ring-ring/50 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
          >
            Profile
          </Link>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
