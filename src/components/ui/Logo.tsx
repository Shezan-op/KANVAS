import Link from "next/link";
import Image from "next/image";
import { cn } from "./cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center", className)}>
      <Image
        src="/logo.png"
        alt="KANVAS"
        width={36}
        height={36}
        className="h-full w-full object-contain p-0.5"
        priority
      />
    </div>
  );
}

const SIZES = {
  md: { mark: "h-8 w-8", word: "text-[20px]" },
  lg: { mark: "h-9 w-9", word: "text-[22px]" },
};

export function Logo({ href = "/", className, size = "lg" }: { href?: string; className?: string; size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)} aria-label="KANVAS home">
      <LogoMark className={cn(s.mark, "transition-transform duration-300 ease-out group-hover:scale-105")} />
      <span className={cn(s.word, "font-sans font-black tracking-[-0.04em] uppercase text-ink")}>
        KANVAS
      </span>
    </Link>
  );
}
