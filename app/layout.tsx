import type { Metadata, Viewport } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Shoplace — Kenya's Local Marketplace",
  description: "Buy and sell products and services from verified sellers across all 47 counties in Kenya. Free to join.",
  keywords: "Kenya marketplace, buy sell Kenya, online shopping Kenya, local sellers Kenya, shoplace",
  metadataBase: new URL("https://shoplace.co.ke"),
  openGraph: {
    title: "Shoplace — Kenya's Local Marketplace",
    description: "Buy and sell products and services from verified sellers across all 47 counties in Kenya.",
    url: "https://shoplace.co.ke",
    siteName: "Shoplace",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shoplace — Kenya's Local Marketplace",
    description: "Buy and sell products and services from verified sellers across all 47 counties in Kenya.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  verification: {
    google: "google1b92b1647c466532",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1499447602546789"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}