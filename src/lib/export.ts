import { toJpeg, toPng } from "html-to-image";
import { CANVAS_FONTS, SLIDE_W, slideHeight, googleFontsHref } from "./model/constants";
import { fontFamilyName } from "./model/resolve";
import type { Project } from "./model/types";

export type ExportFormat = "png" | "jpg" | "pdf" | "zip-png" | "zip-jpg";

/* ---------------------------------------------------------------- fonts -- */

const fontCache = new Map<string, Promise<string>>();

function familiesIn(p: Project): string[] {
  const set = new Set<string>([p.theme.headingFont, p.theme.bodyFont]);
  for (const s of p.slides) for (const e of s.elements) if (e.type === "text") set.add(fontFamilyName(e.font, p.theme));
  return [...set].filter((f) => CANVAS_FONTS.some((c) => c.family === f));
}

async function toDataUrl(url: string) {
  const r = await fetch(url);
  const b = await r.blob();
  return new Promise<string>((res) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result as string);
    fr.readAsDataURL(b);
  });
}

/**
 * Builds a self-contained @font-face block (latin + latin-ext only) so
 * html-to-image doesn't crawl every stylesheet on the page. Cached per family.
 */
function fontCSSFor(family: string): Promise<string> {
  if (!fontCache.has(family)) {
    fontCache.set(
      family,
      (async () => {
        const meta = CANVAS_FONTS.filter((f) => f.family === family);
        const css = await (await fetch(googleFontsHref(meta))).text();
        const blocks = css.split(/(?=\/\* )/).filter((b) => /\/\* latin(-ext)? \*\//.test(b));
        const out = await Promise.all(
          blocks.map(async (b) => {
            const m = b.match(/url\((https:[^)]+)\)/);
            if (!m) return b;
            try {
              return b.replace(m[1], await toDataUrl(m[1]));
            } catch {
              return "";
            }
          }),
        );
        return out.join("\n");
      })().catch(() => ""),
    );
  }
  return fontCache.get(family)!;
}

export async function buildFontEmbedCSS(p: Project) {
  const parts = await Promise.all(familiesIn(p).map(fontCSSFor));
  return parts.join("\n");
}

/* --------------------------------------------------------------- render -- */

async function waitForImages(node: HTMLElement) {
  const imgs = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener("load", () => res(), { once: true });
            img.addEventListener("error", () => res(), { once: true });
            setTimeout(res, 12000);
          }),
    ),
  );
}

const BLANK = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const IS_WEBKIT = typeof navigator !== "undefined" && /AppleWebKit/.test(navigator.userAgent) && !/Chrome|Chromium|Edg/.test(navigator.userAgent);

export async function renderSlide(
  node: HTMLElement,
  p: Project,
  opts: { scale: number; type: "png" | "jpg"; fontEmbedCSS: string; quality?: number },
): Promise<string> {
  await waitForImages(node);
  const H = slideHeight(p.aspect);
  const common = {
    width: SLIDE_W,
    height: H,
    pixelRatio: opts.scale,
    fontEmbedCSS: opts.fontEmbedCSS,
    cacheBust: false,
    // One unreachable photo shouldn't sink the whole export: it renders transparent instead.
    imagePlaceholder: BLANK,
    style: { transform: "none", left: "0", top: "0", margin: "0" },
  };
  // WebKit sometimes paints images blank on the first SVG pass; a tiny warm-up fixes it.
  // Chromium/Gecko don't need it, so skip the extra render there (halves export time).
  if (IS_WEBKIT) await (opts.type === "png" ? toPng : toJpeg)(node, { ...common, pixelRatio: 0.05 }).catch(() => {});
  if (opts.type === "png") return toPng(node, common);
  return toJpeg(node, { ...common, quality: opts.quality ?? 0.92, backgroundColor: "#ffffff" });
}

/* ------------------------------------------------------------- packaging -- */

export { slug, download } from "./download";
import { slug } from "./download";

export async function packageZip(images: string[], p: Project, ext: "png" | "jpg") {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const base = slug(p.name);
  images.forEach((d, i) => zip.file(`${base}-${String(i + 1).padStart(2, "0")}.${ext}`, d.split(",")[1], { base64: true }));
  return zip.generateAsync({ type: "blob" });
}

export async function packagePdf(images: string[], p: Project, scale: number) {
  const { jsPDF } = await import("jspdf");
  const W = SLIDE_W;
  const H = slideHeight(p.aspect);
  const pdf = new jsPDF({ orientation: W > H ? "landscape" : "portrait", unit: "px", format: [W, H], hotfixes: ["px_scaling"], compress: true });
  images.forEach((d, i) => {
    if (i > 0) pdf.addPage([W, H], W > H ? "landscape" : "portrait");
    pdf.addImage(d, "JPEG", 0, 0, W, H, undefined, scale > 1 ? "SLOW" : "FAST");
  });
  pdf.setProperties({ title: p.name, creator: "KANVAS" });
  return pdf.output("blob");
}
