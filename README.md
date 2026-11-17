# Slyd

**Carousels that stop the scroll.** Slyd is a free, open source, laptop-first carousel maker for Instagram, LinkedIn, X and the rest. It runs in the browser: no account, no server, and your files stay on your machine.

- 9 templates built on live theme tokens: change one palette or font pair and every slide follows
- 8 slide layouts: hook, numbered point, list, quote, photo + text, big number, CTA, blank
- Stock photos from Unsplash, Pexels, Openverse and Picsum in one search. Openverse and Picsum need no key.
- Brand kit (avatar, name, handle, page counter, swipe arrow) shown on every slide
- Textures: film grain, risograph, paper, dot grid, graph, ruled
- `*asterisk*` highlights in five styles: colour, italic, marker, underline, pill
- Canvas editing: drag, resize, rotate, snapping guides, marquee select, Alt-drag to duplicate, layers, lock and hide
- Undo/redo, copy/paste, image paste from the clipboard, drag-and-drop from your desktop
- Phone preview (Instagram and LinkedIn mockups) with swipe
- Export to PNG, JPG, PDF (LinkedIn documents) or ZIP at 1×, 2× or 3×, with fonts embedded
- Autosave to IndexedDB, plus portable `.slyd.json` project files

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Optional: copy `.env.example` to `.env.local` and add Unsplash or Pexels keys. Users can also paste their own keys in the app under **Settings**.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | SSR/SEO for the landing page; the editor is a static client route |
| Styling | Tailwind CSS v4 + CSS tokens | One token set drives light and dark mode |
| UI motion | Motion (Framer Motion) | Springs, layout animations, presence |
| Scroll motion | GSAP + ScrollTrigger, Lenis | Pinned horizontal gallery, scrubbed reveals, smooth scroll |
| Shaders | Raw WebGL (~2 KB) | Hero "silk" fragment shader; Three.js was 130 KB for one quad |
| State | Zustand + Immer | Small store, structural-sharing undo history |
| Persistence | IndexedDB (idb-keyval) | No 5 MB localStorage limit |
| Export | html-to-image, JSZip, jsPDF | The DOM that renders a slide is the DOM that gets exported |

## Architecture

```
src/
  app/                      Routes: / (landing), /app (dashboard), /app/edit?id= (editor)
  lib/
    model/
      types.ts              The document model (Project → Slide → Element)
      constants.ts          Aspect ratios, fonts, palettes, font pairs, meshes
      resolve.ts            Theme tokens → CSS, backgrounds, textures, image filters
      factory.ts            Element/slide/project constructors
      templates.ts          Layouts + templates (style × sequence of layouts)
    stock/index.ts          Provider interface + Unsplash/Pexels/Openverse/Picsum
    export.ts               Font embedding, rendering, ZIP/PDF packaging
    storage.ts              IndexedDB projects + prefs, import/export files
    image.ts                CORS-safe image URLs, upload compression
  store/editor.ts           Editor state, history (undo/redo), all editing actions
  components/
    slide/SlideRenderer.tsx The single source of truth for how a slide looks
    editor/                 Canvas, panels, inspector, filmstrip, modals, hotkeys
    landing/                Landing page sections, shader, scroll choreography
    ui/                     Buttons, controls, cursor, toasts, theme toggle
```

### Key decisions

- **One renderer everywhere.** `SlideRenderer` draws slides in the editor, thumbnails, the phone preview, the landing page and the export. The editor only wraps each element with interaction chrome through `renderElement`. What you see is exactly what you export.
- **Theme tokens.** Colours are stored as `$bg`, `$ink`, `$accent`, `$muted` or `$surface`, or as literal hex. Fonts are stored as `$heading`, `$body` or a family name. Templates use tokens, so restyling is one assignment.
- **History by reference.** Every mutation goes through Immer, so each history entry is a structurally shared snapshot. Drags and slider scrubs coalesce into one undo step.
- **Export-safe textures.** Noise textures are PNG tiles generated on a canvas (alpha noise only, no SVG filters or blend modes), so they survive html-to-image unchanged.
- **Responsive images.** Previews ask the image host (Picsum, Unsplash, Pexels, wsrv) for roughly the pixels they paint, and load lazily. Exports always use full resolution.
- **Cheap re-renders.** `SlideRenderer` is memoized on slide/theme/brand identity, and the filmstrip renders through `useDeferredValue`, so a drag costs ~1 ms per move even in a 12-slide deck.
- **Lazy export.** html-to-image, JSZip and jsPDF load only when you press Export.
- **CORS-safe images.** Hosts that send CORS headers pass through. Everything else goes through the open-source [wsrv.nl](https://wsrv.nl) proxy, so exports never taint the canvas.
- **Fixed slide coordinates.** Every slide is 1080 px wide and its height depends on the aspect ratio. Changing aspect reflows elements proportionally.

### Adding things

- **Template:** add an entry to `TEMPLATES` in `lib/model/templates.ts` (a `Style` plus a sequence of layouts).
- **Palette or font pair:** add to `PALETTES` / `FONT_PAIRS` in `constants.ts`. New fonts also go in `CANVAS_FONTS`.
- **Photo provider:** implement `Provider` in `lib/stock/index.ts` and add it to `PROVIDERS`.
- **Element type:** extend `SlideElement` in `types.ts`, render it in `ElementContent`, then add inspector controls.

## Roadmap

- Optional AI layer: hook writer, thread → carousel, outline → slides
- Custom font upload
- Multi-select resize and grouping
- Shareable read-only links

## Credits

Photos come from their respective providers under their licenses. Slyd stores attribution with every stock photo you use.

MIT © Slyd contributors
