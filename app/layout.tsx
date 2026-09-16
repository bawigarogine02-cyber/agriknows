import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AOSProvider from "@/components/ui/AosProvider";
import { getDb } from "@/lib/db/pool";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const defaults = { title: "AgriKnow", description: "Agricultural knowledge and decision support for modern farms.", canonicalUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000" };
  try {
    const db = getDb();
    if (!db) return { title: defaults.title, description: defaults.description, metadataBase: new URL(defaults.canonicalUrl) };
    const [rows] = await db.query("SELECT setting_key AS settingKey, setting_value AS settingValue FROM site_settings WHERE setting_key IN ('site_title', 'site_description', 'canonical_url')");
    const values = Object.fromEntries((rows as Array<{ settingKey: string; settingValue: string }>).map((row) => [row.settingKey, row.settingValue]));
    const title = values.site_title || defaults.title;
    const description = values.site_description || defaults.description;
    const canonicalUrl = values.canonical_url || defaults.canonicalUrl;
    return { title, description, metadataBase: new URL(canonicalUrl), alternates: { canonical: "/" }, openGraph: { title, description, type: "website", url: canonicalUrl } };
  } catch {
    return { title: defaults.title, description: defaults.description };
  }
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AOSProvider />
        <div className="flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
