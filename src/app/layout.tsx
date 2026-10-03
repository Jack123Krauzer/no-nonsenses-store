import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "No-Nonsense Store — Premium Products, Honest Prices",
    template: "%s | No-Nonsense Store",
  },
  description:
    "Discover curated premium products at honest prices. No fluff, no gimmicks — just quality.",
  keywords: ["online store", "premium products", "no-nonsense store", "shopping"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "No-Nonsense Store",
    title: "No-Nonsense Store — Premium Products, Honest Prices",
    description:
      "Discover curated premium products at honest prices. No fluff, no gimmicks — just quality.",
  },
  twitter: {
    card: "summary_large_image",
    title: "No-Nonsense Store",
    description: "Premium products. Honest prices.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
