import type { CSSProperties, ReactNode } from "react";
import { isDark, resolveColor } from "@/lib/model/resolve";
import type { HighlightStyle, Theme } from "@/lib/model/types";

/**
 * Text uses a tiny markup: wrap words in *asterisks* to highlight them.
 * It's fast to type, survives copy-paste, and needs no rich-text editor.
 */
export function parseHighlights(src: string): { text: string; hl: boolean }[] {
  const out: { text: string; hl: boolean }[] = [];
  const re = /\*([^*]+)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index), hl: false });
    out.push({ text: m[1], hl: true });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ text: src.slice(last), hl: false });
  return out;
}

function hlStyle(style: HighlightStyle, color: string, size: number): CSSProperties {
  switch (style) {
    case "color":
      return { color };
    case "italic":
      return { fontStyle: "italic", color };
    case "marker":
      // A solid highlighter swipe: the text flips to whichever ink reads on the colour.
      return {
        background: color,
        color: isDark(color) ? "#FFFFFF" : "#0B0B0C",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
        padding: "0 .14em",
        margin: "0 -.02em",
        borderRadius: ".06em",
      };
    case "underline":
      return {
        textDecoration: "underline",
        textDecorationColor: color,
        textDecorationThickness: Math.max(3, size * 0.07),
        textUnderlineOffset: size * 0.12,
        textDecorationSkipInk: "none",
      };
    case "pill":
      return {
        background: color,
        borderRadius: "999px",
        padding: "0 .32em",
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
        color: isDark(color) ? "#FFFFFF" : "#0B0B0C",
      };
  }
}

export function RichText({
  text,
  style,
  color,
  size,
  theme,
}: {
  text: string;
  style: HighlightStyle;
  color: string;
  size: number;
  theme: Theme;
}): ReactNode {
  const c = resolveColor(color, theme);
  return parseHighlights(text).map((seg, i) =>
    seg.hl ? (
      <span key={i} style={hlStyle(style, c, size)}>
        {seg.text}
      </span>
    ) : (
      <span key={i}>{seg.text}</span>
    ),
  );
}
