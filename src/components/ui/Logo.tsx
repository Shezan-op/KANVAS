import Link from "next/link";
import { cn } from "./cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} fill="none" aria-hidden>
      <rect x="3" y="3" width="26" height="26" rx="7" fill="#0E0E10" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
      <rect x="7" y="7" width="18" height="18" rx="4" fill="var(--accent, #10B981)" fillOpacity="0.15" />
      <path d="M11 10V22M11 16L18 10M13.5 14L21 22" stroke="var(--ink, #FFFFFF)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SIZES = {
  md: { mark: "h-8 w-8", word: "text-[22px]" },
  lg: { mark: "h-9 w-9", word: "text-[26px]" },
};

export function Logo({ href = "/", className, size = "lg" }: { href?: string; className?: string; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="KANVAS home">
      <LogoMark className={cn(s.mark, "transition-transform duration-300 ease-out group-hover:scale-105")} />
      <span className={cn(s.word, "font-sans font-extrabold tracking-[-0.04em] uppercase text-white")}>
        KANVAS
      </span>
    </Link>
  );
}
