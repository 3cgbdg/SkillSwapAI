import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";

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

  footer: ReactNode;

  mobileNav?: ReactNode;

  overlays?: ReactNode;

  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid h-dvh overflow-hidden grid-rows-[auto_1fr_auto_auto]",

        className
      )}
    >
      {overlays}

      <div className="contents">{header}</div>

      <div className="border-border flex min-h-0 min-w-0 items-stretch border-t">
        {sidebar}

        <main
          id="main-content"
          className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain"
        >
          {main}
        </main>
      </div>

      {mobileNav ?? null}

      {footer}
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
