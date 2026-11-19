import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Slyd — Carousel maker",
    short_name: "Slyd",
    description: "Free, open source carousel maker for Instagram, LinkedIn and X.",
    id: "/app",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    categories: ["design", "productivity", "social"],
    shortcuts: [
      { name: "New carousel", url: "/app?template=blank", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "Connect an AI agent", short_name: "AI agents", url: "/agents", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
    background_color: "#f3f0e9",
    theme_color: "#141311",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
