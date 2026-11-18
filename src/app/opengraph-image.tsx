import { ImageResponse } from "next/og";
import { AUTHOR, SITE_URL } from "@/lib/site";

export const alt = "Slyd — Carousels that stop the scroll. A free, open source carousel maker.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Pull a TTF from Google Fonts (an older user agent gets TTF, which Satori needs).
 * Falls back to the default font if offline at build time.
 */
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

const C = { bg: "#F3F0E9", ink: "#141311", muted: "#77736A", accent: "#FF5A1F", line: "rgba(20,19,17,.10)" };

function Card({ rotate, x, y, children, bg, border }: { rotate: number; x: number; y: number; children: React.ReactNode; bg: string; border?: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 250,
        height: 312,
        borderRadius: 22,
        background: bg,
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 40px 70px -30px rgba(0,0,0,.45)",
        border: border ?? "none",
        display: "flex",
        flexDirection: "column",
        padding: 26,
      }}
    >
      {children}
    </div>
  );
}

export default async function OgImage() {
  const [sansBold, serifItalic, mono] = await Promise.all([googleFont("Inter Tight", 700), googleFont("Instrument Serif", 400, true), googleFont("JetBrains Mono", 500)]);
  const fonts = [
    sansBold && { name: "Inter Tight", data: sansBold, weight: 700 as const, style: "normal" as const },
    serifItalic && { name: "Instrument Serif", data: serifItalic, weight: 400 as const, style: "italic" as const },
    mono && { name: "JetBrains Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: "normal" | "italic" }[];

  const host = SITE_URL.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: C.bg, fontFamily: "Inter Tight", position: "relative", overflow: "hidden" }}>
        {/* warm glow, echoing the hero shader */}
        <div style={{ position: "absolute", right: -160, top: -200, width: 720, height: 720, borderRadius: 999, background: "linear-gradient(135deg, rgba(255,90,31,.30), rgba(255,200,107,.12))", filter: "blur(60px)", display: "flex" }} />

        {/* Left: copy */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 0 56px 72px", width: 640 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 44, height: 44, display: "flex" }}>
              <div style={{ position: "absolute", left: 16, top: 2, width: 18, height: 26, borderRadius: 5, background: C.accent, opacity: 0.45, transform: "rotate(14deg)" }} />
              <div style={{ position: "absolute", left: 12, top: 6, width: 18, height: 26, borderRadius: 5, background: C.accent, opacity: 0.75, transform: "rotate(5deg)" }} />
              <div style={{ position: "absolute", left: 7, top: 10, width: 18, height: 26, borderRadius: 5, background: C.ink, transform: "rotate(-7deg)" }} />
            </div>
            <div style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 46, color: C.ink, marginTop: -6 }}>slyd</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 84, fontWeight: 700, color: C.ink, letterSpacing: -3.5, lineHeight: 0.98 }}>Carousels that</div>
            <div style={{ display: "flex", alignItems: "baseline", fontSize: 84, fontWeight: 700, color: C.ink, letterSpacing: -3.5, lineHeight: 1.05 }}>
              <span style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontWeight: 400, color: C.accent, letterSpacing: -1, marginRight: 12, fontSize: 92 }}>stop</span>
              the scroll.
            </div>
            <div style={{ marginTop: 26, fontSize: 27, color: C.muted, letterSpacing: -0.3, lineHeight: 1.35, maxWidth: 520 }}>
              Free, open source carousel maker for Instagram, LinkedIn and X.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "JetBrains Mono", fontSize: 19, color: C.muted, letterSpacing: 1 }}>
            <span style={{ color: C.ink }}>{host}</span>
            <span style={{ width: 5, height: 5, borderRadius: 9, background: C.muted, opacity: 0.5 }} />
            <span>by {AUTHOR.name}</span>
          </div>
        </div>

        {/* Right: a fanned deck of example slides */}
        <div style={{ position: "relative", display: "flex", flex: 1 }}>
          <Card rotate={-11} x={20} y={190} bg="#F2EDE4" border={`1px solid ${C.line}`}>
            <div style={{ width: 34, height: 5, background: "#D9481C", marginBottom: 22 }} />
            <div style={{ fontFamily: "Instrument Serif", fontSize: 40, color: "#1A1714", lineHeight: 1.02, display: "flex", flexWrap: "wrap" }}>
              How to write carousels people&nbsp;<span style={{ fontStyle: "italic", color: "#D9481C" }}>finish.</span>
            </div>
          </Card>
          <Card rotate={8} x={250} y={150} bg="linear-gradient(160deg, #5B4BFF 0%, #FF5FA2 55%, #19D3C5 100%)">
            <div style={{ fontFamily: "JetBrains Mono", fontSize: 13, color: "rgba(255,255,255,.75)", letterSpacing: 2, marginBottom: 18 }}>CREATOR PLAYBOOK</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1.05, letterSpacing: -1 }}>Grow without going viral.</div>
          </Card>
          <Card rotate={-2} x={120} y={60} bg="#0C0C0D">
            <div style={{ fontSize: 60, fontWeight: 700, color: "#D4FF3A", letterSpacing: -2.5, lineHeight: 0.9, marginBottom: 16 }}>01</div>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 30, fontWeight: 700, color: "#F4F2EE", lineHeight: 1.08, letterSpacing: -1 }}>
              <span>Ship faster with</span>
              <span style={{ display: "flex" }}>
                <span style={{ background: "#D4FF3A", color: "#0B0B0C", padding: "0 6px", borderRadius: 3 }}>fewer</span>
              </span>
              <span>meetings.</span>
            </div>
            <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 99, background: "#D4FF3A" }} />
              <div style={{ fontSize: 14, color: "#F4F2EE" }}>{AUTHOR.name}</div>
            </div>
          </Card>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
