/**
 * Image helpers. Exports render through html-to-image, which needs CORS-clean
 * pixels. Hosts known to send CORS headers pass through; everything else goes
 * through the open-source wsrv.nl image proxy.
 */
const CORS_OK = ["images.unsplash.com", "images.pexels.com", "picsum.photos", "fastly.picsum.photos", "wsrv.nl", "images.weserv.nl"];

export function safeSrc(src: string, width = 2000): string {
  if (!src || src.startsWith("data:") || src.startsWith("blob:") || src.startsWith("/")) return src;
  try {
    const u = new URL(src);
    if (CORS_OK.some((h) => u.hostname === h || u.hostname.endsWith("." + h))) return src;
    return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${width}&we&output=jpg&q=88`;
  } catch {
    return src;
  }
}

/** Downscale + compress user uploads so projects stay small in IndexedDB. */
export async function fileToDataUrl(file: File, max = 2160, quality = 0.88): Promise<{ src: string; w: number; h: number }> {
  const bitmap = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * k);
  const h = Math.round(bitmap.height * k);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  const isPng = file.type === "image/png" || file.type === "image/webp" || file.type === "image/svg+xml";
  const src = canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality);
  return { src, w, h };
}

export function loadImageSize(src: string): Promise<{ w: number; h: number }> {
  return new Promise((res) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => res({ w: 4, h: 3 });
    img.src = safeSrc(src);
  });
}
