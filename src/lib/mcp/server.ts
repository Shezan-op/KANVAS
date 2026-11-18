import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { TEMPLATES } from "../model/templates";
import { SITE_URL } from "../site";
import { carouselGuide } from "../spec/guide";
import { decodeSpec, specLink } from "../spec/link";
import { CarouselSpec, lintSpec } from "../spec/schema";

const INSTRUCTIONS = `Slyd makes designed social-media carousels (Instagram, LinkedIn, X, TikTok) from a JSON spec.

Workflow:
1. If you are unsure about layouts, templates or options, call get_carousel_guide once.
2. Write the carousel: a 'cover' hook first, one idea per slide, a 'cta' last, 5–10 slides. Use *asterisks* to highlight 1–3 key words per slide. Photos can be search words.
3. Call create_carousel. Give the user the returned link as a clickable link. It opens Slyd in their browser, ready to edit and export as PNG/PDF/ZIP.
4. To revise a carousel the user shared, call read_carousel_link, edit the spec, and call create_carousel again.

Nothing is stored on a server: the whole carousel travels inside the link.`;

const pretty = (x: unknown) => JSON.stringify(x, null, 2);

export function createSlydServer() {
  const server = new McpServer(
    {
      name: "slyd",
      title: "Slyd — Carousel maker",
      version: "1.1.0",
      websiteUrl: SITE_URL,
      // Shown by MCP clients (e.g. Claude's connector list) instead of a generic placeholder.
      icons: [
        { src: `${SITE_URL}/icon-512.png`, mimeType: "image/png", sizes: ["512x512"] },
        { src: `${SITE_URL}/icon-192.png`, mimeType: "image/png", sizes: ["192x192"] },
        { src: `${SITE_URL}/icon.svg`, mimeType: "image/svg+xml", sizes: ["any"] },
      ],
    },
    { instructions: INSTRUCTIONS },
  );

  server.registerTool(
    "create_carousel",
    {
      title: "Create carousel",
      description:
        "Create a designed, editable social-media carousel and return a link that opens it in Slyd (the user's browser), where they can edit and export PNG/PDF/ZIP. " +
        "Write the words yourself: start with a 'cover' hook, one idea per slide, end with a 'cta'. 5–10 slides is ideal. " +
        "Highlight 1–3 key words per slide with *asterisks*. Any photo can be an https URL or a few search words. " +
        "Everything visual is optional (template, format, palette, fonts, colours, textures, backgrounds, brand, freeform elements). The full option list is in get_carousel_guide.",
      inputSchema: CarouselSpec.shape,
      annotations: { title: "Create carousel", readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async (spec) => {
      const parsed = CarouselSpec.parse(spec);
      const url = await specLink(parsed, SITE_URL);
      const tips = lintSpec(parsed);
      const t = TEMPLATES.find((x) => x.id === (parsed.template ?? "editorial"))!;
      const photos = parsed.slides.filter((s) => ("photo" in s && s.photo) || s.background?.photo || s.elements?.some((e) => e.type === "image")).length;
      const lines = [
        `Carousel ready: ${parsed.slides.length} slides · ${t.name} template · ${parsed.format ?? "4:5"}.`,
        "",
        `Open in Slyd: ${url}`,
        "",
        "Share that link with the user as a clickable link. It opens their carousel in Slyd, where they can edit anything and export PNG, PDF or ZIP. The carousel lives in the link itself; nothing is uploaded.",
        photos ? `Photos described in words are matched to free stock photos when the link opens (${photos} slide${photos > 1 ? "s" : ""}).` : "",
        tips.length ? `\nSuggestions (optional, fix and call again if you agree):\n${tips.map((x) => `- ${x}`).join("\n")}` : "",
      ].filter((l) => l !== "");
      return {
        content: [{ type: "text", text: lines.join("\n") }],
        structuredContent: { url, slides: parsed.slides.length, template: t.id, format: parsed.format ?? "4:5", suggestions: tips },
      };
    },
  );

  server.registerTool(
    "get_carousel_guide",
    {
      title: "Carousel guide",
      description:
        "Everything needed to write a great Slyd carousel: copywriting rules, every slide layout and its fields, templates, palettes, fonts, textures, backgrounds, icons, freeform element coordinates, and a complete example. Useful before a first carousel.",
      annotations: { title: "Carousel guide", readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async () => ({ content: [{ type: "text", text: carouselGuide() }] }),
  );

  server.registerTool(
    "read_carousel_link",
    {
      title: "Read carousel link",
      description:
        "Turn a Slyd carousel link (…/app/new#s=… or #j=…) back into its JSON spec, so it can be revised and passed to create_carousel for a new link.",
      inputSchema: { url: z.string().min(10).describe("The Slyd link the user shared.") },
      annotations: { title: "Read carousel link", readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ url }) => {
      try {
        const raw = await decodeSpec(url);
        const parsed = CarouselSpec.safeParse(raw);
        if (!parsed.success) {
          return { isError: true, content: [{ type: "text", text: `The link decoded but isn't a valid carousel:\n${parsed.error.issues.map((i) => `- ${i.path.join(".")}: ${i.message}`).join("\n")}` }] };
        }
        return { content: [{ type: "text", text: `Carousel spec (${parsed.data.slides.length} slides). Edit it and call create_carousel:\n\n${pretty(parsed.data)}` }], structuredContent: { spec: parsed.data } };
      } catch {
        return {
          isError: true,
          content: [{ type: "text", text: "That doesn't look like a Slyd carousel link. Links look like https://tryslyd.vercel.app/app/new#s=… . Links to saved projects (/app/edit?id=…) only exist in the user's browser and can't be read." }],
        };
      }
    },
  );

  server.registerPrompt(
    "carousel_from_text",
    {
      title: "Turn text into a carousel",
      description: "Turn a post, thread, article or notes into a Slyd carousel.",
      argsSchema: {
        source: z.string().describe("The text to turn into a carousel (post, thread, article, notes)."),
        platform: z.string().optional().describe("Where it will be posted, e.g. LinkedIn or Instagram."),
        style: z.string().optional().describe("Optional look, e.g. 'dark and bold' or 'editorial serif'."),
      },
    },
    ({ source, platform, style }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text:
              `Turn the text below into a carousel with Slyd${platform ? ` for ${platform}` : ""}${style ? `, styled ${style}` : ""}. ` +
              "Keep my facts and voice. Hook first, one idea per slide, a clear ask at the end, 5–10 slides, highlight key words with *asterisks*. " +
              "Use the create_carousel tool, then give me the link.\n\n---\n" +
              source,
          },
        },
      ],
    }),
  );

  return server;
}
