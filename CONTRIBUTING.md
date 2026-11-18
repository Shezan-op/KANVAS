# Contributing to Slyd

Thanks for helping make Slyd better. Bug fixes, new templates, palettes, photo providers and docs are all welcome.

## Getting started

```bash
git clone https://github.com/venukumaraitech/slyd.git
cd slyd
npm install
npm run dev            # http://localhost:3000
```

Requires Node.js 20 or later. No API keys are needed; Openverse, Wikimedia Commons and Picsum work without one.

Before you open a pull request:

```bash
npm run typecheck
npm run build
```

> Running `npm run build` while `npm run dev` is running? Use `NEXT_DIST_DIR=.next-build npm run build` so the two don't share a folder.

## Good first contributions

| Add a… | Where | Notes |
| --- | --- | --- |
| **Template** | `src/lib/model/templates.ts` → `TEMPLATES` | A `Style` plus a sequence of layouts. It appears in the editor, the landing page and the MCP server automatically. |
| **Palette** | `src/lib/model/constants.ts` → `PALETTES` | Five colours: `bg`, `surface`, `ink`, `muted`, `accent`. Check the text contrast. |
| **Font pair** | `constants.ts` → `FONT_PAIRS` (and `CANVAS_FONTS` for new families) | Must be on Google Fonts so exports can embed it. |
| **Photo provider** | `src/lib/stock/index.ts` → `PROVIDERS` | Implement the `Provider` interface. Return CORS-friendly image URLs and a credit. |
| **Icon** | `src/lib/model/iconNames.ts` and `src/components/slide/icons.ts` | Any [Lucide](https://lucide.dev) icon. |
| **Slide layout** | `templates.ts` → `buildLayout`, then `src/lib/spec/schema.ts` | Adding it to the spec makes it available to AI agents too. |

## How the code is organised

- `src/components/slide/SlideRenderer.tsx`: the only place that draws a slide. The editor, thumbnails, previews and export all use it.
- `src/lib/model/`: the document model, templates and theme tokens.
- `src/lib/spec/`: the Carousel Spec that agents write. One Zod schema drives validation, the MCP tools, `/llms.txt` and the JSON Schema.
- `src/lib/mcp/server.ts`: the MCP server (stateless, no storage).
- `src/store/editor.ts`: editor state and undo history.

## Pull requests

- Keep each PR focused on one change.
- Include a screenshot for anything visual.
- Make sure exports still look right (Export → PNG) if you touched rendering.
- By contributing you agree that your work is released under the [MIT License](./LICENSE).

## Reporting bugs

Open an [issue](https://github.com/venukumaraitech/slyd/issues/new/choose) with your browser, the steps to reproduce it, and a screenshot if you can.
