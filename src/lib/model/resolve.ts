import { MESHES } from "./constants";
import type { Background, ColorRef, FontRef, Theme, TextureKind } from "./types";

const COLOR_TOKENS = ["bg", "surface", "ink", "muted", "accent"] as const;
export type ColorToken = (typeof COLOR_TOKENS)[number];
export const colorTokens = COLOR_TOKENS;

export function resolveColor(c: ColorRef | undefined | null, t: Theme): string {
  if (!c) return "transparent";
  if (c.startsWith("$")) {
    const k = c.slice(1) as ColorToken;
    return (t as unknown as Record<string, string>)[k] ?? c;
  }
  return c;
}

/** Replace `$token` occurrences inside a CSS string. */
export function resolveTokens(s: string, t: Theme) {
  return s.replace(/\$(bg|surface|ink|muted|accent)/g, (_, k: ColorToken) => t[k]);
}

export function resolveFont(f: FontRef, t: Theme): string {
  const fam = f === "$heading" ? t.headingFont : f === "$body" ? t.bodyFont : f;
  return `"${fam}", ui-sans-serif, system-ui, sans-serif`;
}

export function fontFamilyName(f: FontRef, t: Theme) {
  return f === "$heading" ? t.headingFont : f === "$body" ? t.bodyFont : f;
}

export function backgroundCSS(bg: Background, t: Theme): React.CSSProperties {
  switch (bg.kind) {
    case "solid":
      return { background: resolveColor(bg.color, t) };
    case "gradient":
      return {
        background: `linear-gradient(${bg.angle}deg, ${resolveColor(bg.from, t)}, ${resolveColor(bg.to, t)})`,
      };
    case "mesh": {
      const m = MESHES[bg.preset] ?? MESHES.aurora;
      return {
        backgroundColor: resolveTokens(m.base, t),
        backgroundImage: m.layers.map((l) => resolveTokens(l, t)).join(","),
      };
    }
    case "image":
      return { background: resolveColor("$bg", t) };
  }
}

/** Relative luminance, used to pick a readable texture blend. */
export function isDark(hex: string) {
  const m = hex.replace("#", "");
  if (m.length < 6) return false;
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
}

/* ------------------------------------------------------------- textures --
 * Noise textures are generated once per session on a <canvas> as PNG tiles of
 * pure alpha noise in black (light slides) or white (dark slides). No SVG
 * filters and no blend modes, so the editor and the exported PNG match exactly.
 */
const noiseCache = new Map<string, string>();

function rand(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

export function noiseTile(kind: "grain" | "noise-heavy" | "paper", dark: boolean): string | null {
  if (typeof document === "undefined") return null;
  const key = `${kind}:${dark}`;
  const hit = noiseCache.get(key);
  if (hit) return hit;
  const size = kind === "paper" ? 384 : 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const r = rand(kind === "grain" ? 7 : kind === "paper" ? 13 : 29);
  const v = dark ? 255 : 0;

  // Low-frequency fibre field for paper: value noise on a coarse grid, bilinearly sampled.
  const G = 24;
  const grid = Array.from({ length: G * G }, () => r());
  const fibre = (x: number, y: number) => {
    const gx = (x / size) * G, gy = (y / size) * G;
    const x0 = Math.floor(gx) % G, y0 = Math.floor(gy) % G, x1 = (x0 + 1) % G, y1 = (y0 + 1) % G;
    const fx = gx - Math.floor(gx), fy = gy - Math.floor(gy);
    const a = grid[y0 * G + x0], b = grid[y0 * G + x1], cc = grid[y1 * G + x0], d = grid[y1 * G + x1];
    return (a * (1 - fx) + b * fx) * (1 - fy) + (cc * (1 - fx) + d * fx) * fy;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const n = r();
      let a: number;
      if (kind === "grain") a = n * 70;
      else if (kind === "noise-heavy") a = n > 0.55 ? (n - 0.55) * 380 : 0;
      else a = fibre(x, y) * 34 + n * 22;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
  const url = c.toDataURL("image/png");
  noiseCache.set(key, url);
  return url;
}

/**
 * CSS for a texture layer. Noise kinds need `tile` (from `noiseTile`) which is
 * only available in the browser; callers render nothing until it exists.
 */
export function textureCSS(kind: TextureKind, opacity: number, dark: boolean, tile?: string | null): React.CSSProperties | null {
  const ink = dark ? "#ffffff" : "#000000";
  switch (kind) {
    case "none":
      return null;
    case "grain":
    case "noise-heavy":
    case "paper": {
      const t = tile ?? noiseTile(kind, dark);
      if (!t) return null;
      const size = kind === "paper" ? 384 : 256;
      return { backgroundImage: `url("${t}")`, backgroundSize: `${size}px ${size}px`, opacity };
    }
    case "dots":
      return {
        backgroundImage: `radial-gradient(${ink} 1.6px, transparent 1.8px)`,
        backgroundSize: "36px 36px",
        backgroundPosition: "18px 18px",
        opacity: opacity * 0.5,
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${ink} 1px, transparent 1px), linear-gradient(90deg, ${ink} 1px, transparent 1px)`,
        backgroundSize: "54px 54px",
        opacity: opacity * 0.35,
      };
    case "lines":
      return {
        backgroundImage: `linear-gradient(${ink} 1px, transparent 1px)`,
        backgroundSize: "100% 48px",
        backgroundPosition: "0 24px",
        opacity: opacity * 0.3,
      };
  }
}

export const IMAGE_FILTERS: Record<string, { name: string; css: string }> = {
  none: { name: "Original", css: "none" },
  mono: { name: "Mono", css: "grayscale(1) contrast(1.08)" },
  noir: { name: "Noir", css: "grayscale(1) contrast(1.45) brightness(.92)" },
  warm: { name: "Warm", css: "sepia(.28) saturate(1.2) hue-rotate(-8deg)" },
  cool: { name: "Cool", css: "saturate(.9) hue-rotate(12deg) brightness(1.03)" },
  fade: { name: "Faded", css: "contrast(.85) brightness(1.08) saturate(.75)" },
  punch: { name: "Punch", css: "contrast(1.2) saturate(1.35)" },
};
