import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { productConfig } from "@/config/product";
import { siteUrl } from "@/lib/seo";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Business Sorted | UK business deadline tracker",
    template: `%s | ${productConfig.name}`
  },
  description:
    "Plain-English UK business administration and compliance reminders for first-time founders, directors and small-business owners.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "Business Sorted | UK business deadline tracker",
    description:
      "Plain-English UK business administration and compliance reminders for first-time founders, directors and small-business owners.",
    url: siteUrl,
    siteName: productConfig.name,
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "Business Sorted | UK business deadline tracker",
    description:
      "Plain-English UK business administration and compliance reminders for first-time founders, directors and small-business owners."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
