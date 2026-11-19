import type { AspectId, Theme, TextureKind } from "./types";

export const SLIDE_W = 1080;

export const ASPECTS: Record<AspectId, { h: number; label: string; hint: string }> = {
  "1:1": { h: 1080, label: "Square", hint: "Instagram · LinkedIn" },
  "4:5": { h: 1350, label: "Portrait", hint: "Instagram feed (best reach)" },
  "3:4": { h: 1440, label: "Tall", hint: "Instagram 2025 grid" },
  "9:16": { h: 1920, label: "Story", hint: "Stories · TikTok · Reels" },
  "16:9": { h: 608, label: "Wide", hint: "X · Slides · YouTube" },
};

export const slideHeight = (a: AspectId) => ASPECTS[a].h;

/** Fonts available on the canvas. These load from Google Fonts so exports can embed them. */
export const CANVAS_FONTS: { family: string; category: "sans" | "serif" | "display" | "mono" | "hand"; weights: number[]; italic?: boolean }[] = [
  { family: "Inter", category: "sans", weights: [400, 500, 600, 700, 800, 900], italic: true },
  { family: "Inter Tight", category: "sans", weights: [400, 500, 600, 700, 800, 900], italic: true },
  { family: "Manrope", category: "sans", weights: [400, 500, 600, 700, 800] },
  { family: "Space Grotesk", category: "sans", weights: [400, 500, 600, 700] },
  { family: "Bricolage Grotesque", category: "display", weights: [400, 500, 600, 700, 800] },
  { family: "Syne", category: "display", weights: [400, 500, 600, 700, 800] },
  { family: "Archivo Black", category: "display", weights: [400] },
  { family: "Anton", category: "display", weights: [400] },
  { family: "Instrument Serif", category: "serif", weights: [400], italic: true },
  { family: "Fraunces", category: "serif", weights: [400, 500, 600, 700, 900], italic: true },
  { family: "Playfair Display", category: "serif", weights: [400, 500, 600, 700, 800, 900], italic: true },
  { family: "DM Serif Display", category: "serif", weights: [400], italic: true },
  { family: "JetBrains Mono", category: "mono", weights: [400, 500, 600, 700] },
  { family: "Caveat", category: "hand", weights: [400, 500, 600, 700] },
];

export function googleFontsHref(families = CANVAS_FONTS) {
  const parts = families.map((f) => {
    const name = f.family.replace(/ /g, "+");
    if (f.italic) {
      const ital = [...f.weights.map((w) => `0,${w}`), ...f.weights.map((w) => `1,${w}`)].join(";");
      return `family=${name}:ital,wght@${ital}`;
    }
    return `family=${name}:wght@${f.weights.join(";")}`;
  });
  return `https://fonts.googleapis.com/css2?${parts.join("&")}&display=swap`;
}

export interface Palette {
  id: string;
  name: string;
  theme: Omit<Theme, "headingFont" | "bodyFont">;
}

export const PALETTES: Palette[] = [
  { id: "kanvas-dark", name: "KANVAS Obsidian", theme: { bg: "#0E0E10", surface: "#18181B", ink: "#FFFFFF", muted: "#A1A1AA", accent: "#10B981" } },
  { id: "cyber-emerald", name: "Cyber Emerald", theme: { bg: "#061412", surface: "#0D2622", ink: "#ECFDF5", muted: "#6EE7B7", accent: "#00F5A0" } },
  { id: "paper", name: "Paper", theme: { bg: "#F2EDE4", surface: "#E8E1D4", ink: "#1A1714", muted: "#6E665B", accent: "#D9481C" } },
  { id: "noir", name: "Noir", theme: { bg: "#0C0C0D", surface: "#18181A", ink: "#F4F2EE", muted: "#8A8780", accent: "#D4FF3A" } },
  { id: "swiss", name: "Swiss", theme: { bg: "#F5F5F2", surface: "#FFFFFF", ink: "#111111", muted: "#777771", accent: "#E8261F" } },
  { id: "forest", name: "Forest", theme: { bg: "#13241C", surface: "#1C3328", ink: "#EEF1E6", muted: "#97A894", accent: "#F2C14E" } },
  { id: "ocean", name: "Ocean", theme: { bg: "#0B1D3A", surface: "#142B52", ink: "#F1F5FF", muted: "#93A4C7", accent: "#5CE1E6" } },
  { id: "blush", name: "Blush", theme: { bg: "#FBE9E4", surface: "#F6D9D1", ink: "#2B1A1A", muted: "#8F6C66", accent: "#C2366B" } },
  { id: "butter", name: "Butter", theme: { bg: "#FFF4C9", surface: "#FBE79A", ink: "#1E1B10", muted: "#776E4C", accent: "#3A5BFF" } },
  { id: "lilac", name: "Lilac", theme: { bg: "#EAE6FF", surface: "#DBD4FF", ink: "#17142B", muted: "#6D679A", accent: "#FF6A3D" } },
  { id: "clay", name: "Clay", theme: { bg: "#C9673E", surface: "#B85A33", ink: "#FFF6EC", muted: "#F3C9AE", accent: "#1C1410" } },
  { id: "mono", name: "Mono", theme: { bg: "#FFFFFF", surface: "#F2F2F2", ink: "#0A0A0A", muted: "#7A7A7A", accent: "#0A0A0A" } },
  { id: "matcha", name: "Matcha", theme: { bg: "#DCE6C8", surface: "#CBD9AF", ink: "#1D2A14", muted: "#5E6E4E", accent: "#2F5D1E" } },
  { id: "midnight", name: "Midnight", theme: { bg: "#121019", surface: "#1D1A29", ink: "#ECE8FF", muted: "#8C86A8", accent: "#A98BFF" } },
];

export const FONT_PAIRS: { id: string; name: string; heading: string; body: string }[] = [
  { id: "editorial", name: "Editorial", heading: "Instrument Serif", body: "Inter" },
  { id: "modern", name: "Modern", heading: "Inter Tight", body: "Inter" },
  { id: "loud", name: "Loud", heading: "Archivo Black", body: "Manrope" },
  { id: "quirky", name: "Quirky", heading: "Bricolage Grotesque", body: "Manrope" },
  { id: "classic", name: "Classic", heading: "Playfair Display", body: "Inter" },
  { id: "warm", name: "Warm", heading: "Fraunces", body: "Manrope" },
  { id: "tech", name: "Tech", heading: "Space Grotesk", body: "JetBrains Mono" },
  { id: "poster", name: "Poster", heading: "Anton", body: "Inter" },
  { id: "art", name: "Art school", heading: "Syne", body: "Space Grotesk" },
  { id: "notes", name: "Notebook", heading: "Caveat", body: "Manrope" },
];

export const TEXTURES: { id: TextureKind; name: string }[] = [
  { id: "none", name: "None" },
  { id: "grain", name: "Film grain" },
  { id: "noise-heavy", name: "Risograph" },
  { id: "paper", name: "Paper" },
  { id: "dots", name: "Dot grid" },
  { id: "grid", name: "Graph" },
  { id: "lines", name: "Ruled" },
];

/** Mesh gradients built from layered radial gradients. `$tokens` are resolved against the theme. */
export const MESHES: Record<string, { name: string; layers: string[]; base: string }> = {
  aurora: {
    name: "Aurora",
    base: "#0E1022",
    layers: [
      "radial-gradient(60% 50% at 15% 20%, #5B4BFF 0%, transparent 70%)",
      "radial-gradient(50% 60% at 85% 30%, #FF5FA2 0%, transparent 70%)",
      "radial-gradient(70% 60% at 50% 100%, #19D3C5 0%, transparent 70%)",
    ],
  },
  peach: {
    name: "Peach",
    base: "#FFD9C2",
    layers: [
      "radial-gradient(60% 60% at 0% 0%, #FF8A5B 0%, transparent 70%)",
      "radial-gradient(60% 60% at 100% 100%, #FFC6E0 0%, transparent 70%)",
      "radial-gradient(40% 40% at 70% 20%, #FFF1B8 0%, transparent 70%)",
    ],
  },
  lagoon: {
    name: "Lagoon",
    base: "#D8F3EC",
    layers: [
      "radial-gradient(60% 70% at 100% 0%, #6FD6FF 0%, transparent 70%)",
      "radial-gradient(60% 60% at 0% 100%, #9BF0B4 0%, transparent 70%)",
    ],
  },
  ember: {
    name: "Ember",
    base: "#1A0B08",
    layers: [
      "radial-gradient(60% 50% at 20% 90%, #FF4D1C 0%, transparent 70%)",
      "radial-gradient(50% 50% at 90% 10%, #FFB020 0%, transparent 70%)",
    ],
  },
  dusk: {
    name: "Dusk",
    base: "#2A1E4A",
    layers: [
      "radial-gradient(70% 60% at 50% 0%, #FF9A8B 0%, transparent 70%)",
      "radial-gradient(60% 60% at 0% 100%, #6A5BFF 0%, transparent 70%)",
    ],
  },
  themed: {
    name: "From theme",
    base: "$bg",
    layers: [
      "radial-gradient(60% 60% at 10% 10%, $accent 0%, transparent 70%)",
      "radial-gradient(60% 60% at 90% 90%, $surface 0%, transparent 70%)",
    ],
  },
};
