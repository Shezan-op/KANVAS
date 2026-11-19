import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KANVAS — Pro Carousel Studio",
    short_name: "KANVAS",
    description: "Next-generation local-first PWA carousel maker for Instagram, LinkedIn and X with AI MCP server.",
    id: "/app",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    orientation: "any",
    categories: ["design", "productivity", "social"],
    shortcuts: [
      { name: "New Carousel", url: "/app?template=blank", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
      { name: "AI Agent Studio", short_name: "Agents", url: "/agents", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
    ],
    background_color: "#0b0f14",
    theme_color: "#0b0f14",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
