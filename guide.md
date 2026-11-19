# KANVAS Carousel Guide (For AI Agents)

KANVAS turns a structured JSON **Carousel Spec** into a designed, editable carousel. You write the words and choose the look; KANVAS handles the layout. 

Call `create_carousel` with the spec and give the user the link it returns. The link opens in their browser, where they can tweak anything and export PNG, PDF or ZIP. Nothing is uploaded or stored on an external server.

## Supported Layouts
- `cover`: Large hook, kicker, subtitle.
- `point`: Numbered takeaway (01, 02...).
- `list`: Bulleted checklist.
- `stat`: Hero numerical metric with context.
- `quote`: Pull-quote with attribution.
- `photo`: Full-bleed or half-split photography.
- `cta`: Final conversion or engagement card.
- `blank`: Custom element placement.

## Themes & Aesthetics
- `obsidian`: High-contrast OLED dark theme with emerald highlights.
- `spatial`: Apple Vision Pro inspired frosted glass aesthetics.
- `minimalist`: Warm monochrome editorial type.
- `noir`, `swiss`, `editorial`, `aurora`, `notebook`, `clay`.
