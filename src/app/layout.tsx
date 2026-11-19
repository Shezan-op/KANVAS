import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { googleFontsHref } from "@/lib/model/constants";
import { Analytics } from "@vercel/analytics/next";
import { AUTHOR, GITLAB_REPO_URL, REPO_URL, SITE_URL } from "@/lib/site";
import { OG_ALT, OG_SIZE } from "@/lib/og";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  title: "KANVAS — Pro Carousel Studio & Visual Engine",
  description:
    "KANVAS is a next-generation local-first PWA carousel studio for Instagram, LinkedIn, and X. High-contrast typography, zero-login privacy, rich layouts, and built-in AI MCP integration.",
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  applicationName: "KANVAS",
  authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  creator: AUTHOR.name,
  publisher: AUTHOR.name,
  keywords: ["kanvas", "carousel maker", "pwa", "instagram carousel", "linkedin carousel", "open source", "design studio", "mcp"],
  openGraph: {
    title: "KANVAS — Pro Carousel Studio & Visual Engine",
    description: "Next-generation local-first PWA carousel studio with instant export and AI MCP integration.",
    type: "website",
    siteName: "KANVAS",
    url: SITE_URL,
    locale: "en_US",
    images: [{ url: "/og.jpg", secureUrl: `${SITE_URL}/og.jpg`, ...OG_SIZE, type: "image/jpeg", alt: OG_ALT }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KANVAS — Pro Carousel Studio & Visual Engine",
    description: "Next-generation local-first PWA carousel studio with instant export and AI MCP integration.",
    images: [{ url: "/og.jpg", alt: OG_ALT }],
  },
};

/** Structured data: tells search engines who built KANVAS */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "KANVAS",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  license: "https://opensource.org/licenses/MIT",
  codeRepository: [REPO_URL, GITLAB_REPO_URL],
  url: SITE_URL,
  author: {
    "@type": "Person",
    name: AUTHOR.name,
    jobTitle: AUTHOR.title,
    url: AUTHOR.url,
    sameAs: AUTHOR.profiles.filter((p) => p.href !== AUTHOR.url).map((p) => p.href),
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f0e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0c" },
  ],
};

/** Applies the saved theme before paint so there's no flash. */
const themeScript = `(function(){try{var t=localStorage.getItem('KANVAS:theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Canvas fonts: loaded globally so slides render identically everywhere. */}
        <link rel="stylesheet" href={googleFontsHref()} crossOrigin="anonymous" />
        {/* rel="me" links the site to the author's verified profiles */}
        {AUTHOR.profiles.map((p) => (
          <link key={p.href} rel="me" href={p.href} />
        ))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="font-sans grain">
        {children}
        {/* Privacy-friendly page views; enable "Analytics" for the project in the Vercel dashboard */}
        <Analytics />
      </body>
    </html>
  );
}
