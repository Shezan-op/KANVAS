/**
 * LeadLinked & Shezan - KANVAS Configuration
 */

export const GITHUB_REPO_URL = process.env.NEXT_PUBLIC_REPO_URL || "https://github.com/Shezan-op/KANVAS";
export const GITLAB_REPO_URL = "https://github.com/Shezan-op/KANVAS";
export const REPO_URL = GITHUB_REPO_URL;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;

/** Public URL of the deployed site: canonical links, share cards, sitemap. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://trykanvas.app").replace(/\/$/, "");

export function tracked(url: string, placement: string) {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", "kanvas");
    u.searchParams.set("utm_medium", "referral");
    u.searchParams.set("utm_campaign", "credit");
    u.searchParams.set("utm_content", placement);
    return u.toString();
  } catch {
    return url;
  }
}

export const AUTHOR = {
  name: "LeadLinked & Shezan",
  title: "LeadLinked Creative Technologies",
  url: "https://github.com/Shezan-op/KANVAS",
  profiles: [
    { label: "LeadLinked", href: "https://github.com/Shezan-op/KANVAS" },
    { label: "Shezan (GitHub)", href: "https://github.com/Shezan-op" },
  ],
} as const;
