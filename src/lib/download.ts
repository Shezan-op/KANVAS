/** Tiny helpers kept apart from export.ts so they don't pull in html-to-image. */

export function slug(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "carousel"
  );
}

export function download(href: string | Blob, filename: string) {
  const url = typeof href === "string" ? href : URL.createObjectURL(href);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (typeof href !== "string") setTimeout(() => URL.revokeObjectURL(url), 4000);
}

