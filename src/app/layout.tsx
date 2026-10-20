import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "No Nonsenses — Wear your inside voice.",
    template: "%s | No Nonsenses",
  },
  description:
    "Everyday clothing with an unapologetic sense of humour. A little attitude. A lot of you.",
  keywords: ["online store", "premium products", "no-nonsense store", "shopping"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "No Nonsenses",
    title: "No Nonsenses — Wear your inside voice.",
    description:
      "Everyday clothing with an unapologetic sense of humour. A little attitude. A lot of you.",
  },
  twitter: {
    card: "summary_large_image",
    title: "No Nonsenses",
    description: "Wear your inside voice.",
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
