import Link from "next/link";
import { cn } from "./cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden>
      <rect x="13" y="4" width="12" height="17" rx="3" fill="var(--accent)" opacity=".45" transform="rotate(14 19 12)" />
      <rect x="10.5" y="6" width="12" height="17" rx="3" fill="var(--accent)" opacity=".75" transform="rotate(5 16 14)" />
      <rect x="7" y="8" width="12" height="17" rx="3" fill="var(--ink)" transform="rotate(-7 13 16)" />
    </svg>
  );
}

export function Logo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2", className)} data-cursor="Home">
      <LogoMark className="transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6 group-hover:scale-110" />
      <span className="font-serif text-[26px] leading-none tracking-tight italic">slyd</span>
    </Link>
  );
}
