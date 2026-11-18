import sharp from "sharp";
import { renderOg } from "@/lib/og";

// Rendered once at build time. JPEG keeps it well under WhatsApp's ~300 KB
// limit (older clients show no preview above that); the PNG was ~316 KB.
export const dynamic = "force-static";

export async function GET() {
  const png = Buffer.from(await (await renderOg()).arrayBuffer());
  const jpg = await sharp(png).jpeg({ quality: 86, mozjpeg: true, chromaSubsampling: "4:4:4" }).toBuffer();
  return new Response(new Uint8Array(jpg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400, s-maxage=86400" },
  });
}
