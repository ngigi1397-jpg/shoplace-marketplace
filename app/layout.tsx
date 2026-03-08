import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Shoplace — Kenya's Local Marketplace",
  description: "Buy and sell products and services across all 47 counties in Kenya.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
