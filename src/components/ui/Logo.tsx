import Link from "next/link";
import { cn } from "./cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} fill="none" aria-hidden>
      {/* Pristine white squircle background */}
      <rect x="2" y="2" width="28" height="28" rx="8" fill="#FFFFFF" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
      {/* Pure black geometric architectural glyph */}
      <path
        d="M10 9V23M10 16L19 9M13.5 13.5L22 23"
        stroke="#0A0A0C"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SIZES = {
  md: { mark: "h-8 w-8", word: "text-[20px]" },
  lg: { mark: "h-9 w-9", word: "text-[24px]" },
};

export function Logo({ href = "/", className, size = "lg" }: { href?: string; className?: string; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="KANVAS home">
      <LogoMark className={cn(s.mark, "transition-transform duration-300 ease-out group-hover:scale-105 shadow-sm")} />
      <span className={cn(s.word, "font-sans font-black tracking-[-0.04em] uppercase text-ink")}>
        KANVAS
      </span>
    </Link>
  );
}
