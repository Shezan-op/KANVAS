import { nanoid } from "nanoid";
import { FONT_PAIRS, PALETTES, SLIDE_W, slideHeight } from "./constants";
import type {
  AspectId,
  BrandKit,
  IconElement,
  ImageElement,
  Project,
  ShapeElement,
  ShapeKind,
  Slide,
  SlideElement,
  TextElement,
  Theme,
} from "./types";

export const uid = () => nanoid(10);

export const defaultTheme = (paletteId = "paper", pairId = "editorial"): Theme => {
  const p = PALETTES.find((x) => x.id === paletteId) ?? PALETTES[0];
  const f = FONT_PAIRS.find((x) => x.id === pairId) ?? FONT_PAIRS[0];
  return { ...p.theme, headingFont: f.heading, bodyFont: f.body };
};

export const defaultBrand = (): BrandKit => ({
  enabled: true,
  name: "Your Name",
  handle: "@yourhandle",
  avatar: null,
  position: "bottom",
  showCounter: true,
  showArrow: true,
  color: "$ink",
});

export function text(p: Partial<TextElement> & { text: string }): TextElement {
  return {
    id: uid(),
    type: "text",
    x: 96,
    y: 200,
    w: SLIDE_W - 192,
    h: 120,
    rotation: 0,
    opacity: 1,
    font: "$body",
    size: 44,
    weight: 400,
    color: "$ink",
    align: "left",
    lineHeight: 1.25,
    letterSpacing: 0,
    italic: false,
    uppercase: false,
    highlight: { style: "color", color: "$accent" },
    background: null,
    ...p,
  };
}

export function heading(p: Partial<TextElement> & { text: string }) {
  return text({ font: "$heading", size: 104, weight: 400, lineHeight: 1.02, letterSpacing: -0.02, ...p });
}

export function kicker(p: Partial<TextElement> & { text: string }) {
  return text({
    font: "JetBrains Mono",
    size: 26,
    weight: 500,
    uppercase: true,
    letterSpacing: 0.12,
    color: "$muted",
    h: 40,
    ...p,
  });
}

export function shape(shape: ShapeKind, p: Partial<ShapeElement> = {}): ShapeElement {
  return {
    id: uid(),
    type: "shape",
    shape,
    x: 390,
    y: 390,
    w: 300,
    h: shape === "line" || shape === "arrow" ? 24 : 300,
    rotation: 0,
    opacity: 1,
    fill: shape === "line" || shape === "arrow" ? "none" : "$accent",
    stroke: shape === "line" || shape === "arrow" ? "$ink" : "$ink",
    strokeWidth: shape === "line" || shape === "arrow" ? 6 : 0,
    radius: shape === "rect" ? 24 : 0,
    ...p,
  };
}

export function image(src: string, p: Partial<ImageElement> = {}): ImageElement {
  return {
    id: uid(),
    type: "image",
    src,
    x: 140,
    y: 240,
    w: 800,
    h: 600,
    rotation: 0,
    opacity: 1,
    fit: "cover",
    radius: 24,
    filter: "none",
    border: null,
    shadow: false,
    credit: null,
    ...p,
  };
}

export function icon(name: string, p: Partial<IconElement> = {}): IconElement {
  return {
    id: uid(),
    type: "icon",
    icon: name,
    x: 440,
    y: 440,
    w: 200,
    h: 200,
    rotation: 0,
    opacity: 1,
    color: "$accent",
    strokeWidth: 1.75,
    ...p,
  };
}

export function blankSlide(p: Partial<Slide> = {}): Slide {
  return {
    id: uid(),
    background: { kind: "solid", color: "$bg" },
    texture: { kind: "grain", opacity: 0.35 },
    elements: [],
    ...p,
  };
}

export function cloneElement<T extends SlideElement>(el: T, offset = 24): T {
  return { ...structuredClone(el), id: uid(), x: el.x + offset, y: el.y + offset };
}

export function cloneSlide(s: Slide): Slide {
  const c = structuredClone(s);
  c.id = uid();
  c.elements = c.elements.map((e) => ({ ...e, id: uid() }));
  return c;
}

export function newProject(p: Partial<Project> = {}): Project {
  const now = Date.now();
  return {
    id: uid(),
    name: "Untitled carousel",
    aspect: "4:5",
    theme: defaultTheme(),
    brand: defaultBrand(),
    slides: [blankSlide()],
    createdAt: now,
    updatedAt: now,
    ...p,
  };
}

/** Re-flows vertical positions when the aspect changes so content stays proportionally placed. */
export function reflowForAspect(project: Project, next: AspectId): Project {
  const from = slideHeight(project.aspect);
  const to = slideHeight(next);
  const k = to / from;
  return {
    ...project,
    aspect: next,
    slides: project.slides.map((s) => ({
      ...s,
      elements: s.elements.map((e) => {
        const cy = (e.y + e.h / 2) * k;
        const scaleH = e.type === "image" ? Math.min(1, k) : 1;
        const h = e.h * scaleH;
        return { ...e, h, y: Math.round(cy - h / 2) };
      }),
    })),
  };
}
