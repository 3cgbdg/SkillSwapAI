"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { navLinks } from "@/constants/navLinks";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  return (
    <aside className="border-border bg-card sticky top-0 hidden h-[calc(100dvh-theme(spacing.16))] w-16 shrink-0 flex-col border-r md:flex lg:w-full lg:max-w-xs">
      <nav className="flex flex-col gap-1 p-2 lg:p-4">
        {navLinks.map((item) => (
          <NavItem
            key={item.link}
            href={item.link}
            icon={item.icon}
            title={item.title}
          />
        ))}
      </nav>
    </aside>
  );
};

function NavItem({
  href,
  icon,
  title,
}: {
  href: string;
  icon: ReactNode;
  title: string;
}) {
  const path = usePathname();
  const active =
    path === href || (href !== "/dashboard" && path.startsWith(href));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      title={title}
      className={cn(
        "text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring/50 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-[var(--duration-fast)] focus-visible:ring-2 focus-visible:outline-none md:justify-center lg:justify-start",
        active && "bg-primary/10 text-primary font-semibold"
      )}
    >
      <span className="shrink-0 [&_svg]:size-5">{icon}</span>
      <span className="hidden lg:inline">{title}</span>
    </Link>
  );
}

export default Sidebar;
