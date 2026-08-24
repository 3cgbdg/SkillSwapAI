import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "@/styles/globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const FrauncesFont = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "variable",
  axes: ["SOFT", "WONK"],
});

const InterFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  // Required so routes below can use relative URLs (canonical, openGraph.url);
  // a relative URL-based metadata field without this is a build error.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "SkillSwapAI",
    template: "%s · SkillSwapAI",
  },
  description: "SkillSwap AI is a skills exchange platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(InterFont.variable, FrauncesFont.variable)}
      suppressHydrationWarning
    >
      <body className="relative font-sans antialiased">
        <a
          href="#main-content"
          className="bg-primary text-primary-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[var(--z-toast)] focus:rounded-md focus:px-3 focus:py-2 focus:ring-2"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <QueryProvider>
            {/* SocketProvider deliberately lives in (main)/layout.tsx, not here:
                it fetches the profile and chat list on mount, which 401s (and
                toasts) for logged-out visitors on public and auth routes. */}
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
