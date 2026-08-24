import Link from "next/link";

import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

/**
 * Same lockup as the in-app HeaderLogo, but pointing at the public landing
 * page rather than /dashboard.
 */
export function MarketingLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex w-fit items-center gap-2 transition-colors",
        className
      )}
    >
      <Logo
        size={32}
        className="transition-transform duration-[var(--duration-slow)] group-hover:rotate-180"
      />
      <span className="font-heading relative text-2xl leading-none font-bold transition-colors group-hover:text-primary">
        Skill<span className="text-primary">Swap</span>
      </span>
    </Link>
  );
}
