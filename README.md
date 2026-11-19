# KANVAS — Pro Visual Studio & Next-Gen Carousel Maker

> High-contrast Apple-grade design studio for high-converting social carousels, decks, and visual stories. 100% local-first, privacy-respecting PWA with native AI MCP server integration.

---

## ⚡ What is KANVAS?
**KANVAS** is a modern visual creation engine designed for high-impact content creators, B2B strategists, and agencies. It transforms raw ideas, articles, or prompt specs into pixel-perfect carousels formatted for **LinkedIn, Instagram, X (Twitter), and TikTok**.

- **Zero-Login & 100% Private:** Projects are stored locally in browser `IndexedDB`. Project links encode state directly in URL fragments (`#s=...`) so user data never touches an external server.
- **Universal Device Freedom:** Designed following Apple Human Interface Guidelines (`/apple-hig` & `/vision-pro-ui`) for mobile, tablet, and desktop without restrictive device gates.
- **Native AI Agent Hub (MCP):** Out-of-the-box Model Context Protocol server exposing `create_carousel`, `update_carousel`, `get_carousel_guide`, and `read_carousel_link`.
- **High-Resolution Multi-Format Exporter:** Instant client-side export to 1×, 2×, and 3× PNGs, Instagram JPGs, multi-page LinkedIn PDFs, or bundled ZIP archives.

---

## 🎨 Architectural Design Systems

KANVAS ships with a bespoke design system featuring:
1. **KANVAS Obsidian:** Deep OLED black, structural hairlines, and vivid emerald accents.
2. **Spatial Glass (visionOS Inspired):** Dynamic frosted glass, luminescent borders, and floating ornaments.
3. **Minimalist Mono:** High-contrast, editorial document discipline with zero visual clutter.
4. **Editorial & Swiss:** Classic serif and typographic poster aesthetics.

---

## 🛠️ Quick Start

```bash
# Clone the repository
git clone https://github.com/Shezan-op/KANVAS.git
cd KANVAS

# Install dependencies
npm install

# Run the local development studio
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start creating.

---

## 🤖 AI Agent MCP Integration

Add KANVAS directly to Claude Code, Cursor, or VS Code:

```bash
claude mcp add --transport http kanvas http://localhost:3000/mcp
```

Or for remote deployment:
```bash
claude mcp add --transport http kanvas https://your-kanvas-deployment.app/mcp
```

---

## 📄 License

MIT License © 2026 KANVAS Studio & Shezan.
