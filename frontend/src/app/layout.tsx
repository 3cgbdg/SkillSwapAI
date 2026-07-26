import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "@/styles/globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SocketProvider } from "@/context/SocketContext";
import CheckEmptyPath from "@/components/CheckEmptyPath";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const OswaldFont = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const InterFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSwapAI",
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
      className={cn(InterFont.variable, OswaldFont.variable)}
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
            <SocketProvider>
              <TooltipProvider>
                <CheckEmptyPath />
                {children}
                <Toaster />
              </TooltipProvider>
            </SocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
