"use client";

import { cn } from "@/lib/utils";
import { isNavLinkActive, navLinks } from "@/constants/navLinks";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationMenuProps {
  onLogOut: () => void;
}

/** @deprecated Mobile nav uses SidebarTrigger; kept for optional fallback. */
const NavigationMenu = ({ onLogOut }: NavigationMenuProps) => {
  const path = usePathname();

  return (
    <nav aria-label="Mobile navigation" className="sr-only">
      {navLinks.map((item) => (
        <Link
          key={item.link}
          href={item.link}
          className={cn(isNavLinkActive(path, item.link) && "font-semibold")}
        >
          {item.title}
        </Link>
      ))}
      <button type="button" onClick={onLogOut}>
        Log out
      </button>
    </nav>
  );
};

export default NavigationMenu;
