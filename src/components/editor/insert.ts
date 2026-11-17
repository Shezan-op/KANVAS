"use client";

import { SLIDE_W, slideHeight } from "@/lib/model/constants";
import { image } from "@/lib/model/factory";
import { fileToDataUrl, loadImageSize } from "@/lib/image";
import type { StockCredit } from "@/lib/model/types";
import { useEditor } from "@/store/editor";

export const DND_MIME = "application/x-slyd-image";

export interface ImagePayload {
  src: string;
  w: number;
  h: number;
  credit?: StockCredit | null;
}

/** Fit an image of natural size (w,h) into the slide, centred or at a drop point. */
export function insertImage(p: ImagePayload, at?: { x: number; y: number }) {
  const st = useEditor.getState();
  if (!st.project) return;
  const H = slideHeight(st.project.aspect);
  const maxW = SLIDE_W * 0.72;
  const maxH = H * 0.6;
  const k = Math.min(maxW / p.w, maxH / p.h);
  const w = Math.round(p.w * k);
  const h = Math.round(p.h * k);
  const el = image(p.src, {
    w,
    h,
    x: at ? Math.round(at.x - w / 2) : Math.round((SLIDE_W - w) / 2),
    y: at ? Math.round(at.y - h / 2) : Math.round((H - h) / 2),
    credit: p.credit ?? null,
  });
  st.addElement(el);
}

export function setBackgroundImage(p: ImagePayload) {
  const st = useEditor.getState();
  st.mutate((d) => {
    const s = d.slides.find((x) => x.id === st.activeSlideId) ?? d.slides[0];
    s.background = { kind: "image", src: p.src, overlay: "#000000", overlayOpacity: 0.25, blur: 0, credit: p.credit ?? null };
  });
}

export function replaceImage(id: string, p: ImagePayload) {
  useEditor.getState().updateElement(id, { src: p.src, credit: p.credit ?? null } as never);
}

export async function filesToPayloads(files: FileList | File[]): Promise<ImagePayload[]> {
  const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
  return Promise.all(
    list.map(async (f) => {
      const { src, w, h } = await fileToDataUrl(f);
      return { src, w, h, credit: null };
    }),
  );
}

export async function urlToPayload(src: string, credit?: StockCredit | null): Promise<ImagePayload> {
  const { w, h } = await loadImageSize(src);
  return { src, w, h, credit };
}
