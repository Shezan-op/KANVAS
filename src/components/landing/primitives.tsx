"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform, type Variants } from "motion/react";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/components/ui/cn";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Blur-and-rise on enter. The workhorse of the page. */
export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "section" | "li" }) {
  const C = motion[as];
  return (
    <C
      className={className}
      initial={{ opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </C>
  );
}

const wordV: Variants = {
  hidden: { opacity: 0, y: "0.45em", filter: "blur(12px)" },
  show: (i: number) => ({ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE, delay: i * 0.055 } }),
};

/**
 * Staggered word reveal. `*word*` renders in italic serif accent, matching the
 * slide highlight syntax used in the editor.
 */
export function SplitWords({ text, className, delay = 0, immediate = false }: { text: string; className?: string; delay?: number; immediate?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  // A highlight carries its trailing punctuation ("*teaching*,") so the comma can never wrap alone.
  const tokens = text.split(/(\*[^*]+\*[^\s*]*|\s+|\n)/).filter(Boolean);
  let i = Math.round(delay / 0.055);
  return (
    <span ref={ref} className={className}>
      {tokens.map((tok, k) => {
        if (tok === "\n") return <br key={k} />;
        if (/^\s+$/.test(tok)) return " ";
        const m = tok.match(/^\*([^*]+)\*(\S*)$/);
        const hl = !!m;
        const tail = m?.[2] ?? "";
        const words = (m ? m[1] : tok).split(" ");
        return words.map((w, wi) => (
          <Fragment key={`${k}-${wi}`}>
            <span className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]">
              <motion.span
                className="inline-block will-change-transform"
                variants={wordV}
                custom={i++}
                initial="hidden"
                animate={immediate || inView ? "show" : "hidden"}
              >
                <span className={cn(hl && "font-serif italic text-accent font-normal pr-[0.04em]")}>{w}</span>
                {wi === words.length - 1 && tail}
              </motion.span>
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ));
      })}
    </span>
  );
}

/** Pointer-tracked 3D tilt with a moving glare. */
export function Tilt({ children, className, max = 10, glare = true }: { children: ReactNode; className?: string; max?: number; glare?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 200, damping: 20 });
  const sy = useSpring(py, { stiffness: 200, damping: 20 });
  const rx = useTransform(sy, [0, 1], [max, -max]);
  const ry = useTransform(sx, [0, 1], [-max, max]);
  const gx = useTransform(sx, (v) => `${v * 100}%`);
  const gy = useTransform(sy, (v) => `${v * 100}%`);
  const bg = useTransform([gx, gy] as never, ([x, y]: string[]) => `radial-gradient(circle at ${x} ${y}, rgb(255 255 255 / .28), transparent 50%)`);
  return (
    <motion.div
      ref={ref}
      className={cn("relative [transform-style:preserve-3d]", className)}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width);
        py.set((e.clientY - r.top) / r.height);
      }}
      onPointerLeave={() => {
        px.set(0.5);
        py.set(0.5);
      }}
    >
      {children}
      {glare && <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light" style={{ background: bg }} />}
    </motion.div>
  );
}

/** Counts up when scrolled into view. */
export function CountUp({ to, suffix = "", duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / (duration * 1000));
      setV(Math.round(to * (1 - Math.pow(1 - k, 4))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref} className="tabular-nums">
      {v}
      {suffix}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex w-fit items-center gap-2 rounded-full bg-panel px-3 py-1 font-mono text-[11px] tracking-[.14em] text-ink-2 uppercase shadow-sm", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_3px_var(--accent-soft)]" />
      {children}
    </span>
  );
}

export function SectionHead({ eyebrow, title, sub, center = true }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={cn("mb-14 flex flex-col gap-5", center ? "items-center text-center" : "items-start")}>
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <h2 className="max-w-3xl text-[clamp(2.2rem,4.4vw,4rem)] leading-[1] font-semibold tracking-[-0.035em] text-balance">
        <SplitWords text={title} />
      </h2>
      {sub && (
        <Reveal delay={0.15}>
          <p className="max-w-xl text-[17px] leading-relaxed text-muted text-pretty">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}
