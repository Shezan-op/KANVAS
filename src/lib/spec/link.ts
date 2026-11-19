/**
 * Spec ⇄ link. The spec travels in the URL *fragment* (after #), which browsers
 * never send to a server, so a carousel's content stays private until opened.
 *
 *   /c/<name>#s=<base64url(deflate-raw(json))>   what Slyd's MCP server emits; <name> is just a readable label
 *   /app/new#s=…  ·  /app/new#j=<base64url(json)>   also accepted (#j= is easy for any agent to build by hand)
 */

const b64url = {
  encode(bytes: Uint8Array) {
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  },
  decode(s: string) {
    const b = s.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(b + "===".slice((b.length + 3) % 4));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  },
};

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export async function encodeSpec(spec: unknown): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(spec));
  return `s=${b64url.encode(await pipe(json, new CompressionStream("deflate-raw")))}`;
}

/** Accepts a full URL, a bare fragment ("#s=…"), or just the payload part. */
export async function decodeSpec(input: string): Promise<unknown> {
  const frag = input.includes("#") ? input.slice(input.indexOf("#") + 1) : input;
  const params = new URLSearchParams(frag);
  const s = params.get("s");
  const j = params.get("j");
  if (s) return JSON.parse(new TextDecoder().decode(await pipe(b64url.decode(s), new DecompressionStream("deflate-raw"))));
  if (j) return JSON.parse(new TextDecoder().decode(b64url.decode(j)));
  throw new Error("This link doesn't contain a carousel.");
}

/** A readable label for the link path, from the carousel's title or hook: "Sleep *better* tonight" → "sleep-better-tonight". */
type Named = { title?: string; slides?: object[] };

export function linkName(spec: Named) {
  const hook = spec.slides?.map((s) => (s as { title?: unknown }).title).find((t): t is string => typeof t === "string");
  const raw = spec.title ?? hook ?? "carousel";
  const slug = raw
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/, "");
  return slug || "carousel";
}

export async function specLink(spec: Named, siteUrl: string) {
  return `${siteUrl.replace(/\/$/, "")}/c/${linkName(spec)}#${await encodeSpec(spec)}`;
}
