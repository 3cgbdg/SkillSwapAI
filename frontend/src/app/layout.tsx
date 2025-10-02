import type { Metadata } from "next";
import { Dancing_Script, Inter } from "next/font/google";
import "@/styles/globals.css";
import QueryProvider from "@/providers/QueryProvider";
import ReduxProvider from "@/providers/ReduxProvider";





const InterFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const DancingScript = Dancing_Script({
  variable: "--font-dancing_script",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSwapAI",
  description: "SkillSwap AI is a skills exchange platform",
  icons: {
    icon: "/logo.png"
  }
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body
        className={`${InterFont.variable} ${DancingScript.variable} relative  antialiased`}
      >
        <QueryProvider>
          <ReduxProvider>
            <div className="">
              {children}
            </div>
          </ReduxProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
