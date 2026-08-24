import type { ReactNode } from "react";

import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

export default function MarketingLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col">
      <MarketingHeader />
      {/* tabIndex={-1} so the root layout's "Skip to content" link can actually
          move focus here in Safari/Firefox, not just jump the scroll position. */}
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
