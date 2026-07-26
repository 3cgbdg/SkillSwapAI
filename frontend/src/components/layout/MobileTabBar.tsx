"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileNavLinks } from "@/constants/navLinks";
import { cn } from "@/lib/utils";

const MobileTabBar = () => {
  const path = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="border-border bg-card/95 supports-[backdrop-filter]:bg-card/80 fixed inset-x-0 bottom-0 z-[var(--z-dropdown)] border-t backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
        {mobileNavLinks.map((item) => {
          const active =
            path === item.link ||
            (item.link !== "/dashboard" && path.startsWith(item.link));
          return (
            <li key={item.link} className="flex-1">
              <Link
                href={item.link}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-muted-foreground flex flex-col items-center gap-0.5 px-2 py-2 text-[0.65rem] font-medium transition-colors duration-[var(--duration-fast)]",
                  active && "text-primary"
                )}
              >
                <span
                  className={cn(
                    "rounded-lg p-1 [&_svg]:size-5",
                    active && "bg-primary/10"
                  )}
                >
                  {item.icon}
                </span>
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileTabBar;
