"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { GITHUB_REPO_URL } from "@/lib/site";
import { Github } from "./BrandIcons";
import { cn } from "./cn";

let cached: number | null | undefined;

/** "Star on GitHub" with the live count. Counts are shared across instances on the page. */
export function useStars() {
  const [stars, setStars] = useState<number | null | undefined>(cached);
  useEffect(() => {
    if (cached !== undefined) return;
    fetch("/api/stars")
      .then((r) => r.json())
      .then((j) => setStars((cached = typeof j.stars === "number" ? j.stars : null)))
      .catch(() => setStars((cached = null)));
  }, []);
  return stars;
}

/** Below this, a count reads as "nobody uses this", so the button shows no number. */
const MIN_SHOWN = 10;
const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

export function StarButton({ className, label = "Star" }: { className?: string; label?: string }) {
  const stars = useStars();
  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group inline-flex h-8 items-stretch overflow-hidden rounded-lg text-[13px] font-medium text-ink-2 ring-1 ring-line-2 transition-colors hover:text-ink hover:ring-ink/30",
        className,
      )}
      aria-label={`Star Slyd on GitHub${typeof stars === "number" ? `, ${stars} stars` : ""}`}
    >
      <span className="flex items-center gap-1.5 px-2.5 transition-colors group-hover:bg-line">
        <Github size={14} />
        <Star size={13} className="transition-all duration-500 group-hover:rotate-[72deg] group-hover:fill-accent group-hover:text-accent" />
        {label}
      </span>
      <AnimatePresence>
        {typeof stars === "number" && stars >= MIN_SHOWN && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            className="flex items-center border-l border-line-2 bg-panel-2 px-2.5 font-mono text-[12px] tabular-nums"
          >
            {fmt(stars)}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
}
