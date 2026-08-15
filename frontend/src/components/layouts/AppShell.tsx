import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";
import { SidebarInset } from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";

export function AppShell({
  header,

  sidebar,

  main,

  footer,

  mobileNav,

  overlays,

  className,
}: {
  header: ReactNode;

  sidebar?: ReactNode;

  main: ReactNode;

  footer?: ReactNode;

  mobileNav?: ReactNode;

  overlays?: ReactNode;

  className?: string;
}) {
  return (
    <div className={cn("flex min-h-svh w-full", className)}>
      {overlays}
      {sidebar}
      <SidebarInset id="main-content" className="min-w-0">
        <div className="sticky top-0 z-[var(--z-fab)]">{header}</div>
        <div className="min-w-0 flex-1">{main}</div>
        {mobileNav ?? null}
        {footer ?? null}
      </SidebarInset>
    </div>
  );
}

export function AppShellMain({
  children,

  className,
}: {
  children: ReactNode;

  className?: string;
}) {
  return (
    <Container className={cn("py-(--space-page)", className)}>
      {children}
    </Container>
  );
}
