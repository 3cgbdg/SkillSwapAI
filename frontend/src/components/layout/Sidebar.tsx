"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { navLinks } from "@/constants/navLinks";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  return (
    <aside className="border-border hidden w-full max-w-xs flex-col border-r bg-card lg:flex">
      <nav className="flex flex-col gap-1 p-4">
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
  const active = path === href;

  return (
    <Link
      href={href}
      className={cn(
        "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active && "bg-primary/10 text-primary font-semibold"
      )}
    >
      {icon}
      {title}
    </Link>
  );
}

export default Sidebar;
