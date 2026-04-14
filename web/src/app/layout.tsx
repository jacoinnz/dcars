import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppTopBar } from "@/components/app-top-bar";
import { MantineProviders } from "@/components/mantine-provider";
import { SiteNav } from "@/components/site-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Youth programme — data & reporting",
  description: "Session data entry, aggregation, and reporting across programme sites.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className={`${geistSans.className} flex min-h-screen flex-col bg-stone-50 text-stone-900 md:flex-row`}
      >
        <MantineProviders>
          <SiteNav />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <AppTopBar />
            <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
          </div>
        </MantineProviders>
      </body>
    </html>
  );
}
