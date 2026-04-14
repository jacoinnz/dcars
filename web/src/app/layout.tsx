import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppMain, AppMainColumn, AppShell } from "@/components/app-shell";
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} style={{ height: "100%" }}>
      <body
        className={geistSans.className}
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <MantineProviders>
          <AppShell>
            <SiteNav />
            <AppMainColumn>
              <AppTopBar />
              <AppMain>{children}</AppMain>
            </AppMainColumn>
          </AppShell>
        </MantineProviders>
      </body>
    </html>
  );
}
