import type { Metadata } from "next";
import { Geist, Inter, Oswald } from "next/font/google";
import "@/styles/globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { SocketProvider } from "@/context/SocketContext";
import CheckEmptyPath from "@/components/CheckEmptyPath";
import { ToastContainer } from "react-toastify";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

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
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body
        className={`${InterFont.variable} ${OswaldFont.variable} relative antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <SocketProvider>
              <TooltipProvider>
                <CheckEmptyPath />
                {children}
                <ToastContainer position="top-right" />
              </TooltipProvider>
            </SocketProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
