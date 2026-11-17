import type { StockCredit } from "../model/types";

/**
 * Stock photos behind one interface. Providers that need a key are enabled
 * via env (NEXT_PUBLIC_*) or by the user pasting a key in Settings — keys
 * never leave the browser except to the provider itself.
 */

export interface StockPhoto {
  id: string;
  provider: ProviderId;
  thumb: string;
  full: string;
  w: number;
  h: number;
  color?: string;
  alt: string;
  credit: StockCredit;
  /** Some providers (Unsplash) ask apps to ping an endpoint on use. */
  track?: () => void;
}

export type ProviderId = "unsplash" | "pexels" | "openverse" | "picsum";

export interface SearchResult {
  photos: StockPhoto[];
  hasMore: boolean;
}

export interface Provider {
  id: ProviderId;
  name: string;
  needsKey: boolean;
  searchable: boolean;
  keyUrl?: string;
  search: (q: string, page: number, opts: { orientation?: "portrait" | "landscape" | "squarish"; key?: string }) => Promise<SearchResult>;
}

const KEY_STORE = "slyd:stock-keys";

export function getKeys(): Partial<Record<ProviderId, string>> {
  const env: Partial<Record<ProviderId, string>> = {
    unsplash: process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY || undefined,
    pexels: process.env.NEXT_PUBLIC_PEXELS_API_KEY || undefined,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(KEY_STORE) || "{}");
    return { ...env, ...Object.fromEntries(Object.entries(saved).filter(([, v]) => v)) };
  } catch {
    return env;
  }
}

export function setKey(id: ProviderId, key: string) {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY_STORE) || "{}");
    saved[id] = key.trim();
    localStorage.setItem(KEY_STORE, JSON.stringify(saved));
  } catch {
    /* storage unavailable: key lives for this session only */
  }
}

const UTM = "utm_source=slyd&utm_medium=referral";

const unsplash: Provider = {
  id: "unsplash",
  name: "Unsplash",
  needsKey: true,
  searchable: true,
  keyUrl: "https://unsplash.com/developers",
  async search(q, page, { orientation, key }) {
    if (!key) throw new Error("NO_KEY");
    const url = q
      ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&page=${page}&per_page=30${orientation ? `&orientation=${orientation}` : ""}`
      : `https://api.unsplash.com/photos?page=${page}&per_page=30&order_by=popular`;
    const r = await fetch(url, { headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" } });
    if (!r.ok) throw new Error(r.status === 401 ? "BAD_KEY" : `Unsplash ${r.status}`);
    const json = await r.json();
    const list = (q ? json.results : json) as any[];
    return {
      hasMore: q ? page < json.total_pages : list.length === 30,
      photos: list.map((p) => ({
        id: `us-${p.id}`,
        provider: "unsplash" as const,
        thumb: `${p.urls.raw}&w=400&q=70&auto=format`,
        full: `${p.urls.raw}&w=2160&q=85&auto=format`,
        w: p.width,
        h: p.height,
        color: p.color,
        alt: p.alt_description ?? "",
        credit: {
          provider: "Unsplash",
          author: p.user.name,
          authorUrl: `${p.user.links.html}?${UTM}`,
          sourceUrl: `${p.links.html}?${UTM}`,
          license: "Unsplash License",
        },
        track: () => {
          fetch(`${p.links.download_location}&client_id=${key}`).catch(() => {});
        },
      })),
    };
  },
};

const pexels: Provider = {
  id: "pexels",
  name: "Pexels",
  needsKey: true,
  searchable: true,
  keyUrl: "https://www.pexels.com/api/",
  async search(q, page, { orientation, key }) {
    if (!key) throw new Error("NO_KEY");
    const o = orientation === "squarish" ? "square" : orientation;
    const url = q
      ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&page=${page}&per_page=30${o ? `&orientation=${o}` : ""}`
      : `https://api.pexels.com/v1/curated?page=${page}&per_page=30`;
    const r = await fetch(url, { headers: { Authorization: key } });
    if (!r.ok) throw new Error(r.status === 401 ? "BAD_KEY" : `Pexels ${r.status}`);
    const json = await r.json();
    return {
      hasMore: !!json.next_page,
      photos: (json.photos as any[]).map((p) => ({
        id: `px-${p.id}`,
        provider: "pexels" as const,
        thumb: p.src.medium,
        full: `${p.src.original}?auto=compress&cs=tinysrgb&w=2160`,
        w: p.width,
        h: p.height,
        color: p.avg_color,
        alt: p.alt ?? "",
        credit: { provider: "Pexels", author: p.photographer, authorUrl: p.photographer_url, sourceUrl: p.url, license: "Pexels License" },
      })),
    };
  },
};

const openverse: Provider = {
  id: "openverse",
  name: "Openverse",
  needsKey: false,
  searchable: true,
  async search(q, page, { orientation }) {
    const aspect = orientation === "portrait" ? "tall" : orientation === "landscape" ? "wide" : orientation === "squarish" ? "square" : "";
    const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(q || "texture")}&page=${page}&page_size=20&license_type=commercial,modification&mature=false${aspect ? `&aspect_ratio=${aspect}` : ""}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Openverse ${r.status}`);
    const json = await r.json();
    return {
      // Anonymous access is capped at 20 per page and 240 results total.
      hasMore: page < Math.min(json.page_count ?? 1, 12),
      photos: (json.results as any[])
        .filter((p) => p.url)
        .map((p) => ({
          id: `ov-${p.id}`,
          provider: "openverse" as const,
          thumb: p.thumbnail || `https://wsrv.nl/?url=${encodeURIComponent(p.url)}&w=400&output=webp`,
          full: p.url,
          w: p.width || 1200,
          h: p.height || 900,
          alt: p.title ?? "",
          credit: {
            provider: p.source ? `Openverse · ${p.source}` : "Openverse",
            author: p.creator || "Unknown",
            authorUrl: p.creator_url ?? undefined,
            sourceUrl: p.foreign_landing_url ?? undefined,
            license: `CC ${String(p.license).toUpperCase()} ${p.license_version ?? ""}`.trim(),
          },
        })),
    };
  },
};

const picsum: Provider = {
  id: "picsum",
  name: "Picsum",
  needsKey: false,
  searchable: false,
  async search(_q, page) {
    const r = await fetch(`https://picsum.photos/v2/list?page=${page}&limit=30`);
    if (!r.ok) throw new Error(`Picsum ${r.status}`);
    const list = (await r.json()) as any[];
    return {
      hasMore: list.length === 30,
      photos: list.map((p) => {
        const k = Math.min(1, 2160 / Math.max(p.width, p.height));
        return {
          id: `ps-${p.id}`,
          provider: "picsum" as const,
          thumb: `https://picsum.photos/id/${p.id}/400/${Math.round((400 * p.height) / p.width)}`,
          full: `https://picsum.photos/id/${p.id}/${Math.round(p.width * k)}/${Math.round(p.height * k)}`,
          w: p.width,
          h: p.height,
          alt: `Photo by ${p.author}`,
          credit: { provider: "Unsplash via Picsum", author: p.author, sourceUrl: p.url, license: "Unsplash License" },
        };
      }),
    };
  },
};

export const PROVIDERS: Provider[] = [unsplash, pexels, openverse, picsum];
export const getProvider = (id: ProviderId) => PROVIDERS.find((p) => p.id === id)!;

/** Best default: a keyed provider if configured, otherwise Openverse. */
export function defaultProvider(): ProviderId {
  const keys = getKeys();
  if (keys.unsplash) return "unsplash";
  if (keys.pexels) return "pexels";
  return "openverse";
}
