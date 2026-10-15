import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Outfit, Onest } from "next/font/google"
import "./globals.css";

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
     className={`${outfit.variable} ${onest.variable}`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 mx-20">{children}</body>
    </html>
  );
}
