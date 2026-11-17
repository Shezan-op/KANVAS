import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { googleFontsHref } from "@/lib/model/constants";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument", display: "swap" });

export const metadata: Metadata = {
  title: "Slyd — Carousels that stop the scroll",
  description:
    "Slyd is a free, open source carousel maker for Instagram, LinkedIn and X. Templates, stock photos, brand kits, textures and pixel-perfect exports — all in your browser.",
  openGraph: {
    title: "Slyd — Carousels that stop the scroll",
    description: "Free, open source, laptop-first carousel maker.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f0e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0c" },
  ],
};

/** Applies the saved theme before paint so there's no flash. */
const themeScript = `(function(){try{var t=localStorage.getItem('slyd:theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} ${instrument.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Canvas fonts: loaded globally so slides render identically everywhere. */}
        <link rel="stylesheet" href={googleFontsHref()} crossOrigin="anonymous" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body className="font-sans grain">{children}</body>
    </html>
  );
}
