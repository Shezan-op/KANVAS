import { ImageResponse } from "next/og";
import { AUTHOR, SITE_URL } from "@/lib/site";

/**
 * The social share card (WhatsApp, LinkedIn, X, Slack…), served at /og.jpg.
 *
 * Layout is centre-weighted on purpose: when a platform shows the small
 * thumbnail it crops the middle square, which still holds the logo and the
 * full headline. The large card adds the fanned slides on either side.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "Slyd: carousels that stop the scroll. A free, open source carousel maker.";

/** TTF from Google Fonts (an older user agent gets TTF, which Satori needs). Falls back if offline. */
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

function Card({ rotate, left, top, bg, border, children }: { rotate: number; left: number; top: number; bg: string; border?: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: 230,
        height: 288,
        borderRadius: 20,
        background: bg,
        border: border ?? "none",
        transform: `rotate(${rotate}deg)`,
        boxShadow: "0 40px 70px -30px rgba(0,0,0,.45)",
        display: "flex",
        flexDirection: "column",
        padding: 24,
      }}
    >
      {children}
    </div>
  );
}

/** `canvas` lets the same 1200×630 design sit centred on a larger image (GitHub wants 1280×640). */
export async function renderOg(canvas: { width: number; height: number } = OG_SIZE) {
  const [sansBold, serifItalic, mono] = await Promise.all([googleFont("Inter Tight", 700), googleFont("Instrument Serif", 400, true), googleFont("JetBrains Mono", 500)]);
  const fonts = [
    sansBold && { name: "Inter Tight", data: sansBold, weight: 700 as const, style: "normal" as const },
    serifItalic && { name: "Instrument Serif", data: serifItalic, weight: 400 as const, style: "italic" as const },
    mono && { name: "JetBrains Mono", data: mono, weight: 500 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 400 | 500 | 700; style: "normal" | "italic" }[];
  const host = SITE_URL.replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, overflow: "hidden" }}>
      {/* The design is laid out at 1200×630; on a larger canvas the side slides bleed to the edge instead of being clipped. */}
      <div style={{ width: OG_SIZE.width, height: OG_SIZE.height, flexShrink: 0, display: "flex", fontFamily: "Inter Tight", position: "relative" }}>
        {/* warm glow behind the headline */}
        <div style={{ position: "absolute", left: 300, top: 40, width: 600, height: 520, borderRadius: 999, background: "linear-gradient(135deg, rgba(255,90,31,.22), rgba(255,200,107,.10))", filter: "blur(70px)", display: "flex" }} />

        {/* Left slides (outside the centre square) */}
        <Card rotate={-14} left={-70} top={250} bg="#F2EDE4" border={`1px solid ${C.line}`}>
          <div style={{ width: 32, height: 5, background: "#D9481C", marginBottom: 20 }} />
          <div style={{ fontFamily: "Instrument Serif", fontSize: 36, color: "#1A1714", lineHeight: 1.02, display: "flex", flexWrap: "wrap" }}>
            How to write carousels people&nbsp;<span style={{ fontStyle: "italic", color: "#D9481C" }}>finish.</span>
          </div>
        </Card>
        <Card rotate={-6} left={70} top={70} bg="#0C0C0D">
          <div style={{ fontSize: 58, fontWeight: 700, color: "#D4FF3A", letterSpacing: -2.5, lineHeight: 0.9, marginBottom: 16 }}>01</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 28, fontWeight: 700, color: "#F4F2EE", lineHeight: 1.08, letterSpacing: -1 }}>
            <span>Ship faster with</span>
            <span style={{ display: "flex" }}>
              <span style={{ background: "#D4FF3A", color: "#0B0B0C", padding: "0 6px", borderRadius: 3 }}>fewer</span>
            </span>
            <span>meetings.</span>
          </div>
        </Card>

        {/* Right slides */}
        <Card rotate={7} left={900} top={60} bg="linear-gradient(160deg, #5B4BFF 0%, #FF5FA2 55%, #19D3C5 100%)">
          <div style={{ fontFamily: "JetBrains Mono", fontSize: 12, color: "rgba(255,255,255,.8)", letterSpacing: 2, marginBottom: 16 }}>CREATOR PLAYBOOK</div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#fff", lineHeight: 1.05, letterSpacing: -1 }}>Grow without going viral.</div>
        </Card>
        <Card rotate={13} left={1030} top={300} bg="#FFF4C9" border={`1px solid ${C.line}`}>
          <div style={{ fontSize: 52, fontWeight: 700, color: "#3A5BFF", letterSpacing: -2, lineHeight: 1 }}>3.1×</div>
          <div style={{ marginTop: 12, fontSize: 22, color: "#1E1B10", lineHeight: 1.2 }}>more reach than single images</div>
        </Card>

        {/* Centre column: everything that matters lives inside the middle 630px */}
        <div style={{ position: "absolute", left: 285, top: 0, width: 630, height: 630, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
            <div style={{ position: "relative", width: 44, height: 44, display: "flex" }}>
              <div style={{ position: "absolute", left: 16, top: 2, width: 18, height: 26, borderRadius: 5, background: C.accent, opacity: 0.45, transform: "rotate(14deg)" }} />
              <div style={{ position: "absolute", left: 12, top: 6, width: 18, height: 26, borderRadius: 5, background: C.accent, opacity: 0.75, transform: "rotate(5deg)" }} />
              <div style={{ position: "absolute", left: 7, top: 10, width: 18, height: 26, borderRadius: 5, background: C.ink, transform: "rotate(-7deg)" }} />
            </div>
            <div style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontSize: 48, color: C.ink, marginTop: -6 }}>slyd</div>
          </div>
          <div style={{ fontSize: 78, fontWeight: 700, color: C.ink, letterSpacing: -3.5, lineHeight: 0.98 }}>Carousels that</div>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 78, fontWeight: 700, color: C.ink, letterSpacing: -3.5, lineHeight: 1.08 }}>
            <span style={{ fontFamily: "Instrument Serif", fontStyle: "italic", fontWeight: 400, color: C.accent, letterSpacing: -1, marginRight: 12, fontSize: 88 }}>stop</span>
            the scroll.
          </div>
          <div style={{ marginTop: 24, fontSize: 25, color: C.muted, textAlign: "center", lineHeight: 1.35, maxWidth: 500, display: "flex" }}>Free, open source carousel maker for Instagram, LinkedIn and X.</div>
          <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 10, background: C.ink, color: C.bg, borderRadius: 999, padding: "12px 22px", fontFamily: "JetBrains Mono", fontSize: 18, letterSpacing: 0.5 }}>
            {host}
          </div>
          <div style={{ marginTop: 16, fontSize: 17, color: C.muted, fontFamily: "JetBrains Mono", letterSpacing: 0.5, display: "flex" }}>{`by ${AUTHOR.name}`}</div>
        </div>
      </div>
      </div>
    ),
    { ...canvas, fonts, headers: { "Cache-Control": "public, max-age=86400, s-maxage=86400" } },
  );
}
