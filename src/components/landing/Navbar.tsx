"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/components/ui/cn";
import { GITHUB_REPO_URL } from "@/lib/site";
import { AuthModal } from "@/components/auth/AuthModal";
import { getLocalSession, type Session } from "@/lib/auth";
import { useStars } from "@/components/ui/StarButton";

export function Nav() {
  const { scrollY } = useScroll();
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const stars = useStars();

  useEffect(() => {
    setSession(getLocalSession());
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 400);
    setSolid(y > 24);
  });

  const links = [
    ["Features", "#capabilities"],
    ["Templates", "#templates"],
    ["How it works", "#how"],
    ["FAQ", "#faq"],
    ["For agents", "/agents"],
  ];

  const handleOpenEditor = () => {
    if (session) {
      router.push("/app");
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <>
      <motion.header
        animate={{ y: hidden ? -90 : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-3.5"
      >
        <nav
          className={cn(
            "flex w-full max-w-6xl items-center justify-between px-4 py-2 transition-all duration-300",
            "border border-line bg-panel/85 shadow-lg backdrop-blur-2xl dark:border-white/10 dark:bg-[#0b0f14]/90",
            solid && "shadow-xl bg-panel/95 dark:bg-[#0b0f14]/95",
          )}
          style={{ borderRadius: "8px" }}
        >
          {/* Left: Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Center: Clean Text Navigation */}
          <div className="hidden items-center gap-7 md:flex">
            {links.map(([l, h]) => (
              <a
                key={h}
                href={h}
                className="text-[13.5px] font-normal text-ink-2 transition-colors hover:text-ink dark:text-[#909096] dark:hover:text-white"
              >
                {l}
              </a>
            ))}
          </div>

          {/* Right: Theme Toggle, Star on GitHub Pill, and Open Editor Button */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* GitHub Star Pill */}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-panel-2 px-3 text-[13px] font-normal text-ink transition-colors hover:bg-line dark:border-white/15 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <Star size={12} className="fill-current text-muted dark:text-white/70" />
              <span>Star</span>
              {typeof stars === "number" && stars > 0 && (
                <span className="text-[12px] opacity-70">· {stars}</span>
              )}
            </a>

            {/* Exact "Open editor ->" button */}
            <button
              onClick={handleOpenEditor}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-ink px-3.5 text-[13px] font-medium text-bg shadow-sm transition-opacity hover:opacity-90 active:scale-[0.98]"
            >
              <span>Open editor</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          router.push("/app");
        }}
      />
    </>
  );
}
