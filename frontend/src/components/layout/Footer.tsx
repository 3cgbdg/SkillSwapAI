import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { navLinks } from "@/constants/navLinks";

const Footer = () => {
  return (
    <footer className="border-border bg-muted/40 mt-auto hidden border-t md:block">
      <Container className="flex flex-wrap items-center justify-between gap-4 py-6 text-sm">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} SkillSwap AI
        </p>
        <div className="flex flex-wrap gap-4">
          {navLinks.slice(0, 4).map((item) => (
            <Link
              key={item.link}
              href={item.link}
              className="text-muted-foreground hover:text-primary focus-visible:ring-ring/50 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
