"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { isNavLinkActive, navLinks } from "@/constants/navLinks";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-border border-b px-2 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 px-2">
          <Logo size={32} className="shrink-0" />
          <span className="truncate font-heading text-sm font-semibold group-data-[collapsible=icon]:hidden">
            Skill<span className="text-primary">Swap</span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navLinks.map((item) => {
                const active = isNavLinkActive(pathname, item.link);
                return (
                  <SidebarMenuItem key={item.link}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.title}
                      render={
                        <Link
                          href={item.link}
                          aria-current={active ? "page" : undefined}
                        />
                      }
                    >
                      {item.icon}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:hidden">
        <Link
          href="/discover"
          className="border-primary/20 bg-primary/10 hover:bg-primary/15 block rounded-xl border p-3 transition-colors"
        >
          <span className="text-primary flex items-center gap-2 text-sm font-semibold">
            <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-lg">
              <Sparkles className="size-3.5" aria-hidden="true" />
            </span>
            AI matching active
          </span>
          <span className="text-muted-foreground mt-2 block text-xs leading-5">
            New partners are ranked from your teach and learn goals.
          </span>
        </Link>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
