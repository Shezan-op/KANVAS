import { SLIDE_W, slideHeight } from "./constants";
import { blankSlide, defaultBrand, defaultTheme, heading, icon, image, kicker, newProject, shape, text } from "./factory";
import type { AspectId, Background, Project, Slide, TextureKind } from "./types";

/**
 * Templates are a *style* applied to a *sequence of layouts*.
 * Layouts are reusable on their own: "Add slide → Layout" calls the same functions.
 */

export interface Style {
  palette: string;
  pair: string;
  texture: TextureKind;
  textureOpacity: number;
  align: "left" | "center";
  headingSize: number;
  headingWeight: number;
  headingUpper?: boolean;
  headingItalic?: boolean;
  highlight: "color" | "marker" | "underline" | "pill" | "italic";
  ornament: "bar" | "circle" | "none" | "star" | "frame";
  coverBg?: Background;
  bg?: Background;
}

const PAD = 96;
const CW = SLIDE_W - PAD * 2;

export type LayoutId = "cover" | "point" | "list" | "quote" | "imageText" | "stat" | "cta" | "blank";

export const LAYOUTS: { id: LayoutId; name: string; hint: string }[] = [
  { id: "cover", name: "Hook", hint: "Big promise, stops the scroll" },
  { id: "point", name: "Numbered point", hint: "01 — one idea per slide" },
  { id: "list", name: "List", hint: "Quick bullets" },
  { id: "quote", name: "Quote", hint: "Pull quote with attribution" },
  { id: "imageText", name: "Photo + text", hint: "Visual with a caption" },
  { id: "stat", name: "Big number", hint: "A single striking stat" },
  { id: "cta", name: "Call to action", hint: "Follow, save, share" },
  { id: "blank", name: "Blank", hint: "Start from nothing" },
];

interface Copy {
  kicker?: string;
  title?: string;
  body?: string;
  items?: string[];
  n?: number;
  img?: string;
  author?: string;
  button?: string;
}

const ornament = (s: Style, H: number) => {
  switch (s.ornament) {
    case "bar":
      return [shape("rect", { x: PAD, y: PAD, w: 88, h: 14, radius: 0, fill: "$accent", name: "Accent bar" })];
    case "circle":
      return [shape("ellipse", { x: SLIDE_W - 300, y: -120, w: 420, h: 420, fill: "$accent", opacity: 0.9, name: "Orb" })];
    case "star":
      return [shape("star", { x: SLIDE_W - PAD - 150, y: PAD - 10, w: 150, h: 150, fill: "$accent", name: "Star" })];
    case "frame":
      return [
        shape("rect", {
          x: 40,
          y: 40,
          w: SLIDE_W - 80,
          h: H - 80,
          fill: "none",
          stroke: "$ink",
          strokeWidth: 3,
          radius: 0,
          opacity: 0.85,
          name: "Frame",
          locked: true,
        }),
      ];
    default:
      return [];
  }
};

const withBg = (s: Style, extra: Partial<Slide> = {}): Slide =>
  blankSlide({
    background: s.bg ?? { kind: "solid", color: "$bg" },
    texture: { kind: s.texture, opacity: s.textureOpacity },
    ...extra,
  });

const hl = (s: Style) => ({ style: s.highlight, color: "$accent" });

export function buildLayout(id: LayoutId, s: Style, aspect: AspectId, c: Copy = {}): Slide {
  const H = slideHeight(aspect);
  const center = s.align === "center";
  const align = s.align;
  const hs = Math.round(s.headingSize * (H < 900 ? 0.72 : 1));
  const bottomSafe = H - 180; // brand footer lives below this

  switch (id) {
    case "cover": {
      const slide = withBg(s, { background: s.coverBg ?? s.bg ?? { kind: "solid", color: "$bg" } });
      slide.elements.push(
        ...ornament(s, H),
        kicker({ text: c.kicker ?? "A short guide", x: PAD, y: H * 0.2, w: CW, align }),
        heading({
          text: c.title ?? "Write the hook that makes them *stop.*",
          x: PAD,
          y: H * 0.2 + 70,
          w: CW,
          size: Math.round(hs * 1.15),
          weight: s.headingWeight,
          uppercase: !!s.headingUpper,
          italic: !!s.headingItalic,
          align,
          highlight: hl(s),
        }),
        text({
          text: c.body ?? "A one-line promise of what they get by swiping.",
          x: PAD,
          y: Math.min(bottomSafe - 160, H * 0.2 + 70 + hs * 3.6),
          w: center ? CW : CW * 0.8,
          size: 38,
          color: "$muted",
          align,
        }),
      );
      return slide;
    }
    case "point": {
      const slide = withBg(s);
      const n = String(c.n ?? 1).padStart(2, "0");
      slide.elements.push(
        heading({
          text: n,
          x: PAD,
          y: PAD + 20,
          w: CW,
          size: 220,
          weight: s.headingWeight,
          color: "$accent",
          lineHeight: 0.9,
          align,
          name: "Number",
        }),
        heading({
          text: c.title ?? "One idea per slide. Make it *obvious.*",
          x: PAD,
          y: H * 0.36,
          w: CW,
          size: Math.round(hs * 0.78),
          weight: s.headingWeight,
          uppercase: !!s.headingUpper,
          italic: !!s.headingItalic,
          align,
          highlight: hl(s),
        }),
        text({
          text:
            c.body ??
            "Explain it in two or three short sentences. People read carousels on their phone, so keep each line punchy and give them a reason to swipe again.",
          x: PAD,
          y: H * 0.36 + hs * 2.4,
          w: CW,
          size: 36,
          lineHeight: 1.4,
          color: "$muted",
          align,
        }),
      );
      return slide;
    }
    case "list": {
      const slide = withBg(s);
      const items = c.items ?? ["Lead with the outcome", "Cut every extra word", "Show, don't tell", "End with one clear ask"];
      slide.elements.push(
        kicker({ text: c.kicker ?? "Checklist", x: PAD, y: PAD + 40, w: CW, align }),
        heading({
          text: c.title ?? "The *short* version",
          x: PAD,
          y: PAD + 100,
          w: CW,
          size: Math.round(hs * 0.8),
          weight: s.headingWeight,
          uppercase: !!s.headingUpper,
          italic: !!s.headingItalic,
          align,
          highlight: hl(s),
        }),
        text({
          text: items.map((i) => `→  ${i}`).join("\n"),
          x: PAD,
          y: PAD + 140 + hs * 1.4,
          w: CW,
          size: 42,
          lineHeight: 1.85,
          weight: 500,
          align,
          name: "Bullets",
        }),
      );
      return slide;
    }
    case "quote": {
      const slide = withBg(s);
      slide.elements.push(
        icon("Quote", { x: center ? SLIDE_W / 2 - 70 : PAD - 10, y: H * 0.16, w: 140, h: 140, color: "$accent", strokeWidth: 1.5 }),
        heading({
          text: c.title ?? "“The best carousels feel like a conversation, not a *lecture.*”",
          x: PAD,
          y: H * 0.16 + 190,
          w: CW,
          size: Math.round(hs * 0.74),
          weight: s.headingWeight,
          italic: !!s.headingItalic,
          align,
          highlight: hl(s),
        }),
        kicker({ text: c.author ?? "— Someone wise", x: PAD, y: Math.min(bottomSafe - 60, H * 0.16 + 190 + hs * 3.4), w: CW, align, color: "$ink" }),
      );
      return slide;
    }
    case "imageText": {
      const slide = withBg(s);
      const ih = Math.round(H * 0.5);
      slide.elements.push(
        image(c.img ?? "https://picsum.photos/id/1043/1600/1200", { x: PAD, y: PAD, w: CW, h: ih, radius: 28, name: "Photo" }),
        heading({
          text: c.title ?? "Show it, *then* say it.",
          x: PAD,
          y: PAD + ih + 56,
          w: CW,
          size: Math.round(hs * 0.66),
          weight: s.headingWeight,
          uppercase: !!s.headingUpper,
          italic: !!s.headingItalic,
          align,
          highlight: hl(s),
        }),
        text({
          text: c.body ?? "A strong image does half the work. Your caption does the rest.",
          x: PAD,
          y: PAD + ih + 56 + hs * 1.6,
          w: CW,
          size: 34,
          color: "$muted",
          align,
        }),
      );
      return slide;
    }
    case "stat": {
      const slide = withBg(s);
      slide.elements.push(
        heading({
          text: c.title ?? "3.1×",
          x: PAD,
          y: H * 0.26,
          w: CW,
          size: 300,
          weight: s.headingWeight,
          color: "$accent",
          lineHeight: 0.9,
          align: "center",
          name: "Stat",
        }),
        text({
          text: c.body ?? "more reach on carousels than single images, on average.",
          x: PAD + 60,
          y: H * 0.26 + 340,
          w: CW - 120,
          size: 44,
          align: "center",
          weight: 500,
        }),
        kicker({ text: c.kicker ?? "Source: your own analytics", x: PAD, y: H * 0.26 + 520, w: CW, align: "center" }),
      );
      return slide;
    }
    case "cta": {
      const slide = withBg(s, { background: s.coverBg ?? s.bg ?? { kind: "solid", color: "$bg" } });
      const btnW = 520;
      const by = H * 0.62;
      slide.elements.push(
        heading({
          text: c.title ?? "Found this useful? *Save it* for later.",
          x: PAD,
          y: H * 0.24,
          w: CW,
          size: Math.round(hs * 0.9),
          weight: s.headingWeight,
          uppercase: !!s.headingUpper,
          italic: !!s.headingItalic,
          align: "center",
          highlight: hl(s),
        }),
        shape("rect", { x: (SLIDE_W - btnW) / 2, y: by, w: btnW, h: 112, radius: 56, fill: "$ink", name: "Button" }),
        text({
          text: c.button ?? "Follow for more  →",
          x: (SLIDE_W - btnW) / 2,
          y: by + 30,
          w: btnW,
          size: 40,
          weight: 600,
          color: "$bg",
          align: "center",
          lineHeight: 1.2,
          name: "Button label",
        }),
        icon("Bookmark", { x: SLIDE_W / 2 - 220, y: by + 200, w: 72, h: 72, color: "$muted" }),
        icon("Send", { x: SLIDE_W / 2 - 36, y: by + 200, w: 72, h: 72, color: "$muted" }),
        icon("Heart", { x: SLIDE_W / 2 + 148, y: by + 200, w: 72, h: 72, color: "$muted" }),
      );
      return slide;
    }
    case "blank":
    default:
      return withBg(s);
  }
}

export interface Template {
  id: string;
  name: string;
  description: string;
  tags: string[];
  style: Style;
  sequence: { layout: LayoutId; copy?: Copy }[];
}

const standardSeq = (topic: Partial<Record<string, Copy>> = {}): Template["sequence"] => [
  { layout: "cover", copy: topic.cover },
  { layout: "point", copy: { n: 1, ...topic.p1 } },
  { layout: "point", copy: { n: 2, title: "Cut the *throat-clearing.*", body: "Your first line should already be useful. Skip the intro and give them the point.", ...topic.p2 } },
  { layout: "list", copy: topic.list },
  { layout: "cta", copy: topic.cta },
];

export const TEMPLATES: Template[] = [
  {
    id: "obsidian",
    name: "KANVAS Obsidian",
    description: "Deep OLED black, precision emerald accents, Apple-grade restraint.",
    tags: ["dark", "minimal", "steve-jobs", "pro"],
    style: { palette: "kanvas-dark", pair: "modern", texture: "grain", textureOpacity: 0.35, align: "left", headingSize: 104, headingWeight: 800, highlight: "color", ornament: "bar" },
    sequence: standardSeq({
      cover: { kicker: "KANVAS Masterclass", title: "Design is not what it looks like. *It's how it works.*", body: "The 5 laws of insanely great product positioning." },
    }),
  },
  {
    id: "spatial",
    name: "Spatial Glass",
    description: "Vision Pro inspired dark titanium, floating depth and luminescence.",
    tags: ["dark", "vision-pro", "glass", "futuristic"],
    style: { palette: "cyber-emerald", pair: "tech", texture: "none", textureOpacity: 0.2, align: "left", headingSize: 96, headingWeight: 700, highlight: "pill", ornament: "frame" },
    sequence: standardSeq({
      cover: { kicker: "Spatial Interface", title: "Computing beyond the *screen.*", body: "How spatial optics and gaze navigation redefine modern software." },
    }),
  },
  {
    id: "minimalist",
    name: "Minimalist Mono",
    description: "Pure document-grade typographic discipline. High contrast, zero distraction.",
    tags: ["minimal", "light", "editorial"],
    style: { palette: "mono", pair: "modern", texture: "none", textureOpacity: 0.1, align: "left", headingSize: 100, headingWeight: 700, highlight: "italic", ornament: "none" },
    sequence: standardSeq({
      cover: { kicker: "Essay Nº 01", title: "Subtract until *nothing* is left to remove.", body: "The ruthless art of simplifying complex products." },
    }),
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Warm paper, serif headlines, quiet confidence.",
    tags: ["serif", "light", "thought-leadership"],
    style: { palette: "paper", pair: "editorial", texture: "paper", textureOpacity: 0.55, align: "left", headingSize: 112, headingWeight: 400, highlight: "italic", ornament: "bar" },
    sequence: standardSeq({
      cover: { kicker: "Issue Nº 12 — Writing", title: "How to write carousels people *actually* finish.", body: "Five rules I use on every post. Swipe →" },
    }),
  },
  {
    id: "noir",
    name: "Noir",
    description: "Near-black, electric accent, loud and modern.",
    tags: ["dark", "bold", "tech"],
    style: { palette: "noir", pair: "modern", texture: "grain", textureOpacity: 0.5, align: "left", headingSize: 104, headingWeight: 800, highlight: "marker", ornament: "none" },
    sequence: standardSeq({
      cover: { kicker: "Thread → Carousel", title: "Ship faster with *fewer* meetings.", body: "What changed when our team went async-first." },
    }),
  },
  {
    id: "swiss",
    name: "Swiss",
    description: "Grid, red accent, uppercase poster type.",
    tags: ["grid", "light", "design"],
    style: { palette: "swiss", pair: "loud", texture: "grid", textureOpacity: 0.35, align: "left", headingSize: 96, headingWeight: 400, headingUpper: true, highlight: "color", ornament: "bar" },
    sequence: standardSeq({
      cover: { kicker: "Design notes / 04", title: "Less, but *better.*", body: "A field guide to restraint in visual design." },
    }),
  },
  {
    id: "aurora",
    name: "Aurora",
    description: "Glowing mesh gradient with crisp white type.",
    tags: ["gradient", "dark", "creator"],
    style: {
      palette: "midnight",
      pair: "quirky",
      texture: "noise-heavy",
      textureOpacity: 0.28,
      align: "center",
      headingSize: 104,
      headingWeight: 700,
      highlight: "pill",
      ornament: "none",
      coverBg: { kind: "mesh", preset: "aurora" },
      bg: { kind: "solid", color: "$bg" },
    },
    sequence: standardSeq({
      cover: { kicker: "Creator playbook", title: "Grow from 0 to *10k* without going viral.", body: "The boring system that actually compounds." },
    }),
  },
  {
    id: "notebook",
    name: "Notebook",
    description: "Dot-grid paper with handwritten energy.",
    tags: ["playful", "light", "education"],
    style: { palette: "butter", pair: "notes", texture: "dots", textureOpacity: 0.6, align: "left", headingSize: 128, headingWeight: 700, highlight: "underline", ornament: "star" },
    sequence: standardSeq({
      cover: { kicker: "Study notes", title: "Learn anything in *20 hours.*", body: "The 4-step method, explained simply." },
    }),
  },
  {
    id: "photo",
    name: "Photo story",
    description: "Full-bleed photography with a cinematic overlay.",
    tags: ["photo", "dark", "storytelling"],
    style: {
      palette: "noir",
      pair: "classic",
      texture: "grain",
      textureOpacity: 0.45,
      align: "left",
      headingSize: 108,
      headingWeight: 500,
      headingItalic: false,
      highlight: "italic",
      ornament: "none",
      coverBg: { kind: "image", src: "https://picsum.photos/id/1036/1600/2000", overlay: "#000000", overlayOpacity: 0.45, blur: 0 },
    },
    sequence: [
      { layout: "cover", copy: { kicker: "A travel diary", title: "What 30 days *offline* taught me.", body: "No phone, one notebook, a lot of mountains." } },
      { layout: "imageText", copy: { img: "https://picsum.photos/id/1018/1600/1200", title: "Day 1: the *itch.*", body: "I reached for my pocket 40 times before lunch." } },
      { layout: "quote", copy: { title: "“Boredom is the doorway to *attention.*”", author: "— My notebook, day 9" } },
      { layout: "stat", copy: { title: "6h", body: "of screen time I got back. Every single day.", kicker: "Measured, sadly" } },
      { layout: "cta" },
    ],
  },
  {
    id: "forest",
    name: "Field guide",
    description: "Deep green, golden accents, framed pages.",
    tags: ["dark", "serif", "nature"],
    style: { palette: "forest", pair: "warm", texture: "paper", textureOpacity: 0.4, align: "center", headingSize: 100, headingWeight: 500, highlight: "color", ornament: "frame" },
    sequence: standardSeq({
      cover: { kicker: "Field guide", title: "Slow growth is *still* growth.", body: "Lessons from a year of tending a business like a garden." },
    }),
  },
  {
    id: "clay",
    name: "Terracotta",
    description: "Warm clay, poster type, unmissable.",
    tags: ["bold", "warm", "poster"],
    style: { palette: "clay", pair: "poster", texture: "noise-heavy", textureOpacity: 0.35, align: "left", headingSize: 140, headingWeight: 400, headingUpper: true, highlight: "color", ornament: "circle" },
    sequence: standardSeq({
      cover: { kicker: "Hot take", title: "Your brand is a *feeling.*", body: "Not a logo. Here's how to design one." },
    }),
  },
  {
    id: "blank",
    name: "Blank canvas",
    description: "Theme and fonts only. Bring your own ideas.",
    tags: ["minimal"],
    style: { palette: "mono", pair: "modern", texture: "none", textureOpacity: 0.3, align: "left", headingSize: 96, headingWeight: 700, highlight: "color", ornament: "none" },
    sequence: [{ layout: "cover" }, { layout: "blank" }, { layout: "blank" }],
  },
];

export function styleFromTemplateId(id?: string): Style {
  return (TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0]).style;
}

export function buildTemplateSlides(t: Template, aspect: AspectId): Slide[] {
  return t.sequence.map((s) => buildLayout(s.layout, t.style, aspect, s.copy));
}

export function projectFromTemplate(t: Template, aspect: AspectId = "4:5"): Project {
  return newProject({
    name: t.id === "blank" ? "Untitled carousel" : `${t.name} carousel`,
    aspect,
    templateId: t.id,
    theme: defaultTheme(t.style.palette, t.style.pair),
    brand: defaultBrand(),
    slides: buildTemplateSlides(t, aspect),
  });
}
