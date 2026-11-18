import { GITHUB_REPO_URL } from "@/lib/site";

/**
 * Star count for the GitHub repo. Fetched server-side and cached for an hour,
 * so visitors never hit GitHub's 60-requests/hour unauthenticated limit.
 */
export const revalidate = 3600;

export async function GET() {
  const repo = GITHUB_REPO_URL.replace("https://github.com/", "");
  try {
    const r = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: { Accept: "application/vnd.github+json", "User-Agent": "slyd-site" },
      next: { revalidate: 3600 },
    });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    return Response.json({ stars: j.stargazers_count ?? 0 }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return Response.json({ stars: null }, { headers: { "Cache-Control": "public, s-maxage=300" } });
  }
}
