import { renderOg } from "@/lib/og";

// GitHub repo social preview (Settings → Social preview): 1280×640 PNG, under 1 MB.
export const dynamic = "force-static";

export function GET() {
  return renderOg({ width: 1280, height: 640 });
}
