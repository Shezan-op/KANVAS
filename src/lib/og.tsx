import { ImageResponse } from "next/og";
import { AUTHOR, SITE_URL } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "KANVAS: Pro Carousel Studio & Visual Engine";

async function googleFont(family: string, weight: number, italic = false): Promise<ArrayBuffer | null> {
  try {
    const q = `${family.replace(/ /g, "+")}:${italic ? "ital,wght@1," : "wght@"}${weight}`;
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${q}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1" },
      })
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

// Apple HIG Obsidian & Vision Pro Spatial Aesthetic
const C = {
  bg: "#0A0A0C",
  surface: "#141417",
  cardBorder: "rgba(255,255,255,0.08)",
  ink: "#FFFFFF",
  muted: "#94949E",
  accent: "#10B981", // Emerald highlight
  accentGlow: "rgba(16, 185, 129, 0.22)",
  glass: "rgba(22, 22, 26, 0.75)"
};

function Card({ rotate, left, top, bg, border, children }: { rotate: number; left: number; top: number; bg: string; border?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 234,
        height: 292,
        borderRadius: 22,
        background: bg,
        border: border ?? `1px solid ${C.cardBorder}`,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 35px 80px -20px rgba(0,0,0,.85), 0 0 0 1px rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        padding: 24,
      }}
    >
      {children}
    </div>
  );
}

export async function renderOg(canvas: { width: number; height: number } = OG_SIZE) {
  const [sansBold, serifItalic, mono] = await Promise.all([
    googleFont("Inter Tight", 700),
    googleFont("Instrument Serif", 400, true),
    googleFont("JetBrains Mono", 500)
  ]);
  const fonts = [
    sansBold && { name: "Inter Tight", data: sansBold, weight: 700 as const, style: "normal" as const },
    serifItalic && { name: "Instrument Serif", data: serifItalic, weight: 400 as const, style: "italic" as const },
    mono && { name: "JetBrains Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: "normal" | "italic" }[];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, overflow: "hidden" }}>
        <div style={{ width: OG_SIZE.width, height: OG_SIZE.height, flexShrink: 0, display: "flex", fontFamily: "Inter Tight", position: "relative" }}>
          
          {/* Subtle Vision Pro Ambient Luminescence */}
          <div style={{ position: "absolute", left: 320, top: 40, width: 560, height: 480, borderRadius: 999, background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)", filter: "blur(60px)", display: "flex" }} />

          {/* Left Slide 1: Obsidian Editorial */}
          <Card rotate={-12} left={-60} top={240} bg="#131316" border="1px solid rgba(255,255,255,0.1)">
            <div style={{ width: 36, height: 5, background: C.accent, borderRadius: 2, marginBottom: 20 }} />
            <div style={{ fontFamily: "Instrument Serif", fontSize: 34, color: "#FFFFFF", lineHeight: 1.05, display: "flex", flexWrap: "wrap" }}>
              How top creators build carousels that&nbsp;<span style={{ fontStyle: "italic", color: C.accent }}>convert.</span>
            </div>
          </Card>

          {/* Left Slide 2: Numbered Takeaway (Apple Noir) */}
          <Card rotate={-5} left={75} top={70} bg="#16161A" border="1px solid rgba(16,185,129,0.3)">
            <div style={{ fontSize: 54, fontWeight: 700, color: C.accent, letterSpacing: -2, lineHeight: 0.9, marginBottom: 16 }}>01</div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 26, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15, letterSpacing: -0.5 }}>
              <span>Ruthless focus.</span>
              <span style={{ display: "flex", marginTop: 4 }}>
                <span style={{ background: "rgba(16,185,129,0.15)", color: C.accent, padding: "2px 8px", borderRadius: 6, border: "1px solid rgba(16,185,129,0.3)" }}>One big idea</span>
              </span>
              <span style={{ marginTop: 4 }}>per slide.</span>
            </div>
          </Card>

          {/* Right Slide 1: Spatial Mesh */}
          <Card rotate={6} left={895} top={65} bg="linear-gradient(145deg, #181920 0%, #0F172A 100%)" border="1px solid rgba(99,102,241,0.35)">
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "#818CF8", letterSpacing: 2, marginBottom: 16 }}>CREATOR SUITE</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.08, letterSpacing: -0.8 }}>Scale your reach with zero friction.</div>
          </Card>

          {/* Right Slide 2: Big Stat Hero */}
          <Card rotate={13} left={1025} top={295} bg="#121316" border="1px solid rgba(255,255,255,0.12)">
            <div style={{ fontSize: 50, fontWeight: 700, color: "#60A5FA", letterSpacing: -2, lineHeight: 1 }}>3.8×</div>
            <div style={{ marginTop: 12, fontSize: 21, color: "#D1D5DB", lineHeight: 1.25 }}>higher engagement than standard posts</div>
          </Card>

          {/* Centre Column: Hero Presentation */}
          <div style={{ position: "absolute", left: 285, top: 0, width: 630, height: 630, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            
            {/* Logo Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, background: "rgba(255,255,255,0.04)", padding: "8px 18px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#0E0E10", fontWeight: 900, fontSize: 14 }}>K</span>
              </div>
              <span style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "#FFFFFF", letterSpacing: 2, fontWeight: 700 }}>KANVAS</span>
            </div>

            {/* Typography Master Headline */}
            <div style={{ fontSize: 74, fontWeight: 700, color: "#FFFFFF", letterSpacing: -3.5, lineHeight: 0.98, textAlign: "center" }}>Carousels that</div>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: 74, fontWeight: 700, color: "#FFFFFF", letterSpacing: -3.5, lineHeight: 1.08, textAlign: "center" }}>
              <span style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontWeight: 400, color: C.accent, letterSpacing: -1, marginRight: 12, fontSize: 84 }}>command</span>
              attention.
            </div>

            {/* Subtitle */}
            <div style={{ marginTop: 20, fontSize: 21, color: C.muted, textAlign: "center", lineHeight: 1.4, maxWidth: 520, display: "flex" }}>
              The high-contrast, local-first visual studio for LinkedIn, Instagram &amp; X.
            </div>

            {/* Glass Pill URL badge */}
            <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.06)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "10px 24px", fontFamily: "JetBrains Mono", fontSize: 16, letterSpacing: 0.5, backdropFilter: "blur(20px)" }}>
              github.com/Shezan-op/KANVAS
            </div>

            <div style={{ marginTop: 16, fontSize: 14, color: "#71717A", fontFamily: "JetBrains Mono", letterSpacing: 1, display: "flex" }}>
              PRO VISUAL ENGINE · STANDALONE PWA · NATIVE MCP
            </div>
          </div>
        </div>
      </div>
    ),
    { ...canvas, fonts, headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
