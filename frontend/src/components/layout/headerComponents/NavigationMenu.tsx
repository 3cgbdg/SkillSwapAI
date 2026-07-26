"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { navLinks } from "@/constants/navLinks";
import { cn } from "@/lib/utils";

interface NavigationMenuProps {
  onLogOut: () => void;
}

const NavigationMenu = ({ onLogOut }: NavigationMenuProps) => {
  const path = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="text-foreground hover:text-primary rounded-md p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:hidden"
        aria-label="Open navigation menu"
      >
        <Menu size={28} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        {navLinks.map((item) => (
          <DropdownMenuItem key={item.link} className="p-0">
            <Link
              href={item.link}
              className={cn(
                "flex w-full items-center gap-2 px-2 py-1.5",
                item.link === path && "bg-muted font-semibold"
              )}
            >
              {item.icon}
              {item.title}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogOut}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NavigationMenu;
