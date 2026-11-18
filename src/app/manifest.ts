import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Slyd — Carousel maker",
    short_name: "Slyd",
    description: "Free, open source carousel maker for Instagram, LinkedIn and X.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f3f0e9",
    theme_color: "#141311",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
