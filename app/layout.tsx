import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shoplace — Kenya's Local Marketplace",
  description: "Discover products and services from verified sellers across all 47 counties in Kenya.",
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