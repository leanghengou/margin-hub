import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Outfit, Onest } from "next/font/google"
import "./globals.css";
import SideNavigation from "@/components/SideNavigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const onest = Onest({ subsets: ["latin"], variable: "--font-onest" })
export const metadata: Metadata = {
  title: "Margin Hub",
  description: "Agencies source of truth.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
     className={`${geistSans.variable} ${geistSans.variable}`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">

        <div className="flex h-screen bg-[#3f3f3f]">
        <div className="w-50 shrink-0 h-full p-5">
        <SideNavigation/>
        </div>
         <div className="flex-1 min-w-0 bg-[#f1f1f1] mt-5 rounded-tl-sm overflow-y-auto">
        {children}
        </div>
</div>
        
        </body>
    </html>
  );
}
