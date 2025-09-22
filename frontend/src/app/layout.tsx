import type { Metadata } from "next";
import { Borel, Inter, Outfit } from "next/font/google";
import "@/styles/globals.css";
import QueryProvider from "@/providers/QueryProvider";
import ReduxProvider from "@/providers/ReduxProvider";




const BorelFont = Borel({
  weight: "400",
  variable: "--font-borel",
  subsets: ["latin"],
});
const InterFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});
const outfitFont = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"]
})
export const metadata: Metadata = {
  title: "Trainix",
  description: "Trainix - best ai fitness web app",
  icons: {
    icon: "/logo.svg"
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
        className={`${InterFont.variable} ${outfitFont.variable} ${BorelFont.variable} antialiased`}
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
