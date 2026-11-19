# Slyd carousel guide (for agents)

Slyd turns a JSON **Carousel Spec** into a designed, editable carousel. You write the words and choose the look; Slyd handles the layout. Call `create_carousel` with the spec and give the user the link it returns. The link opens in their browser, where they can tweak anything and export PNG, PDF or ZIP. Nothing is uploaded or stored on a server.

## Writing carousels people finish
1. **Slide 1 is the hook** (`cover`): a promise or tension in under 10 words. It earns the swipe.
2. **One idea per slide.** Use `point` for numbered ideas; titles under ~10 words, bodies 1–3 short sentences.
3. **Show proof**: a `stat` with a real number, a `quote`, or a `photo` slide.
4. **End with one ask** (`cta`): follow, save, share or comment.
5. **5–10 slides** is the sweet spot. Highlight 1–3 key words per slide with `*asterisks*`.
6. Write like a human, in the user's voice, not marketing copy. If the user gave source text, keep their facts.

## Slide layouts
- `cover` — kicker?, **title**, subtitle? — the hook, first slide
- `point` — **title**, body?, number? — numbered idea (auto 01, 02, …)
- `list` — kicker?, **title**, **items** (2–7) — checklist
- `quote` — **quote**, author? — pull quote
- `photo` — **photo**, **title**, body? — photo with caption
- `stat` — **value**, **label**, source? — one big number
- `cta` — **title**, button? — closing ask, last slide
- `blank` — elements — fully custom slide
Every slide also accepts: `background` {color | gradient {from,to,angle} | mesh | photo, darken?, overlay?, blur?}, `texture`, `align` (left|center), `hideBrand`, and `elements` (freeform, see below).

## Photos
Any `photo` field takes an https URL **or 2–5 search words** ("rainy city street at night"). Slyd finds a free stock photo (Unsplash/Pexels/Openverse) in the user's browser and credits it automatically.

## Look and feel (all optional)
- **template**: `editorial` (Warm paper, serif headlines, quiet confidence.); `noir` (Near-black, electric accent, loud and modern.); `swiss` (Grid, red accent, uppercase poster type.); `aurora` (Glowing mesh gradient with crisp white type.); `notebook` (Dot-grid paper with handwritten energy.); `photo` (Full-bleed photography with a cinematic overlay.); `forest` (Deep green, golden accents, framed pages.); `clay` (Warm clay, poster type, unmissable.); `blank` (Theme and fonts only. Bring your own ideas.). Default `editorial`.
- **format**: `1:1` Square, 1080×1080 (Instagram · LinkedIn); `4:5` Portrait, 1080×1350 (Instagram feed (best reach)); `3:4` Tall, 1080×1440 (Instagram 2025 grid); `9:16` Story, 1080×1920 (Stories · TikTok · Reels); `16:9` Wide, 1080×608 (X · Slides · YouTube). Default `4:5`.
- **palette**: `paper`, `noir`, `swiss`, `forest`, `ocean`, `blush`, `butter`, `lilac`, `clay`, `mono`, `matcha`, `midnight`. Or exact brand colours via `colors` {bg, surface, ink, muted, accent} / `accent` (hex).
- **fonts** (pairs): `editorial` (Instrument Serif + Inter), `modern` (Inter Tight + Inter), `loud` (Archivo Black + Manrope), `quirky` (Bricolage Grotesque + Manrope), `classic` (Playfair Display + Inter), `warm` (Fraunces + Manrope), `tech` (Space Grotesk + JetBrains Mono), `poster` (Anton + Inter), `art` (Syne + Space Grotesk), `notes` (Caveat + Manrope). Or `headingFont` / `bodyFont`: Inter, Inter Tight, Manrope, Space Grotesk, Bricolage Grotesque, Syne, Archivo Black, Anton, Instrument Serif, Fraunces, Playfair Display, DM Serif Display, JetBrains Mono, Caveat.
- **highlight** (how *words* look): `color`, `italic`, `marker`, `underline`, `pill`.
- **texture**: `none`, `grain`, `noise-heavy`, `paper`, `dots`, `grid`, `lines`; `textureIntensity` 0–1.
- **mesh** backgrounds: `aurora`, `peach`, `lagoon`, `ember`, `dusk`, `themed`.
- **brand**: {name, handle, avatar (https URL), show, position top|bottom, counter, arrow, color}. If omitted, the user's saved Slyd brand kit is used.
- **open**: `editor` (default), `preview` (phone mockup), or `export` (download dialog).

## Colours
Anywhere a colour is accepted: a theme token, `bg` `surface` `ink` `muted` `accent` (these follow the palette, so prefer them), or a hex like `#FF5A1F`.

## Freeform elements
For custom designs, add `elements` to any slide. Coordinates are px on a canvas 1080 wide (height depends on format: 1350 for 4:5). Keep ~96px margins and leave ~180px at the bottom for the brand footer.
- `text`: text, x, y, w?, size?, font? (heading|body|family), weight?, color?, align?, italic?, uppercase?, lineHeight?, letterSpacing?, label? {color, padding, radius}
- `image`: photo, x, y, w, h, radius?, fit? (cover|contain), filter? (none|mono|noir|warm|cool|fade|punch), shadow?, focus? {x,y in %}
- `shape`: shape (rect|ellipse|line|arrow|triangle|star|blob), x, y, w, h, fill?, stroke?, strokeWidth?, radius?
- `icon`: icon, x, y, size?, color?, strokeWidth?. Icons: ArrowRight, ArrowUpRight, ArrowDown, Check, CircleCheck, CircleX, X, Sparkles, Star, Heart, Bookmark, Send, Share2, MessageCircle, Repeat2, ThumbsUp, Quote, Lightbulb, Zap, Bolt, Flame, Rocket, Target, TrendingUp, Trophy, Crown, Gem, Clock, Coffee, Smile, BadgeCheck.
All elements accept rotation (deg) and opacity (0–1).

## Editing an existing carousel
**Editing.** Every carousel has an `id` (returned by `create_carousel`). When the user asks for changes, call `update_carousel` with the same `id` and the full revised spec: opening the new link updates that same carousel in their browser (with Undo) instead of adding a copy. If the user shares a Slyd link, call `read_carousel_link` to get its spec and id first.

**Their own look.** Set `myTheme: true` to use the colours and fonts the user saved as their theme in Slyd.

## Example
```json
{
  "title": "Async-first team lessons",
  "template": "noir",
  "format": "4:5",
  "brand": {
    "name": "Ava Reyes",
    "handle": "@avamakes"
  },
  "slides": [
    {
      "layout": "cover",
      "kicker": "Remote work",
      "title": "We cut meetings by *70%*. Here's how.",
      "subtitle": "5 rules from a year of async-first work. Swipe →"
    },
    {
      "layout": "point",
      "title": "Default to *writing*",
      "body": "Every decision starts as a doc. Meetings are for disagreement, not updates."
    },
    {
      "layout": "point",
      "title": "Make updates *async*",
      "body": "A 5-minute Loom beats a 30-minute stand-up for everyone in the room."
    },
    {
      "layout": "stat",
      "value": "70%",
      "label": "fewer meetings after six months, with faster shipping.",
      "source": "Our team calendar, 2026"
    },
    {
      "layout": "photo",
      "photo": "calm minimal home office",
      "title": "Protect *deep work*",
      "body": "Two no-meeting days a week, guarded like a launch."
    },
    {
      "layout": "list",
      "title": "Start this week",
      "items": [
        "Write before you meet",
        "Record updates",
        "Batch questions",
        "Cancel one recurring meeting"
      ]
    },
    {
      "layout": "cta",
      "title": "Useful? *Save it* for your next planning day.",
      "button": "Follow for more →"
    }
  ]
}
```

Without MCP: build the link yourself as `https://tryslyd.vercel.app/app/new#j=<base64url of the spec JSON>`. JSON Schema: https://tryslyd.vercel.app/carousel.schema.json
