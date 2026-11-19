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
 * Staggered word reveal with Instrument Serif integration.
 * `*word*` renders in authentic Instrument Serif italic styling.
 */
export function SplitWords({ text, className, delay = 0, immediate = false }: { text: string; className?: string; delay?: number; immediate?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
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
        const nodes = words.map((w, wi) => (
          <Fragment key={`${k}-${wi}`}>
            <span className="inline-block overflow-hidden pb-[0.12em] align-bottom mb-[-0.12em]">
              <motion.span
                className="inline-block will-change-transform"
                variants={wordV}
                custom={i++}
                initial="hidden"
                animate={immediate || inView ? "show" : "hidden"}
              >
                <span className={cn(hl && "font-serif italic font-normal text-ink pr-[0.06em] tracking-tight")}>
                  {w}
                </span>
                {wi === words.length - 1 && tail}
              </motion.span>
            </span>
            {wi < words.length - 1 ? " " : null}
          </Fragment>
        ));
        return hl ? (
          <span key={k} className="whitespace-nowrap">
            {nodes}
          </span>
        ) : (
          nodes
        );
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

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      className={cn("relative transition-transform duration-200 ease-out", className)}
    >
      {children}
      {glare && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: useTransform(
              [sx, sy],
              ([x, y]) => `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, rgba(255,255,255,0.18), transparent 65%)`,
            ),
          }}
        />
      )}
    </motion.div>
  );
}

export function CountUp({ to, duration = 1.6, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setV(Math.round(ease * to));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {v}
      {suffix}
    </span>
  );
}

/** Clean, pill-free minimalist section label */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 font-mono text-[11px] tracking-[.18em] text-muted uppercase", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-ink" />
      <span>{children}</span>
    </div>
  );
}

export function SectionHead({ eyebrow, title, sub, center = true }: { eyebrow?: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div className={cn("mb-12 flex flex-col gap-4", center ? "items-center text-center" : "items-start")}>
      {eyebrow && (
        <Reveal>
          <Eyebrow>{eyebrow}</Eyebrow>
        </Reveal>
      )}
      <h2 className="max-w-3xl text-[clamp(2.2rem,4.4vw,4rem)] leading-none font-semibold tracking-[-0.035em] text-balance">
        <SplitWords text={title} />
      </h2>
      {sub && (
        <Reveal delay={0.15}>
          <p className="max-w-xl text-[16px] leading-relaxed text-muted text-pretty">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}
