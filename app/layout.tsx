import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.clickfolio.veilcode.studio"),
  title: {
    default: "Clickfolio | Affiliate Link Hub and Click Tracking Dashboard",
    template: "%s | Clickfolio",
  },
  description: "Create a public affiliate link page, organize your offers, track clicks with ease, and generate promotional content from one dashboard.",
  keywords: [
    "affiliate links",
    "click tracking",
    "link management",
    "affiliate marketing dashboard",
    "promotional content generation",
    "affiliate link hub",
    "click analytics",
    "link organization",
    "affiliate offer management",
    "click tracking dashboard",
    "link in bio for affiliate marketers",
    "affiliate campaign tracker",
  ],
  authors: [{name: "Veilcode Studio", url: "https://www.veilcode.studio"}],
  openGraph: {
    title: "Clickfolio | Affiliate Link Hub and Click Tracking Dashboard",
    description: "Create a public affiliate link page, organize your offers, track clicks with ease, and generate promotional content from one dashboard.",
    url: "https://www.clickfolio.veilcode.studio",
    siteName: "Clickfolio",
    images: [
      {
        url: "https://www.clickfolio.veilcode.studio/og-image.png",
        width: 1200,
        height: 630,
        alt: "Clickfolio - Affiliate Link Hub and Click Tracking Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clickfolio | Affiliate Link Hub and Click Tracking Dashboard",
    description: "Create a public affiliate link page, organize your offers, track clicks with ease, and generate promotional content from one dashboard.",
    images: [
      {
        url: "https://www.clickfolio.veilcode.studio/og-image.png",
        alt: "Clickfolio - Affiliate Link Hub and Click Tracking Dashboard",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning>
        <ClerkProvider>
          <main className="max-w-400 mx-auto">
            {children}
            <Toaster />
          </main>
        </ClerkProvider>
      </body>
    </html>
  );
}
