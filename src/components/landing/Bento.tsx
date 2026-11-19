"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Download, FileImage, FileText, FolderArchive, HardDrive, Lock, Search } from "lucide-react";
import { ScaledSlide } from "@/components/slide/SlideRenderer";
import { PALETTES, FONT_PAIRS, TEXTURES } from "@/lib/model/constants";
import { textureCSS } from "@/lib/model/resolve";
import { cn } from "@/components/ui/cn";
import { demo } from "./demo";
import { Reveal, SectionHead } from "./primitives";

function Card({ children, className, delay = 0, title, body }: { children?: ReactNode; className?: string; delay?: number; title: string; body: string }) {
  return (
    <Reveal delay={delay} className={cn("group relative flex flex-col overflow-hidden rounded-[28px] bg-panel p-7 shadow-sm", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,var(--accent-soft),transparent_45%)] opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      <div className="relative flex-1">{children}</div>
      <div className="relative mt-6">
        <h3 className="text-[19px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted text-pretty">{body}</p>
      </div>
    </Reveal>
  );
}

function PaletteDemo() {
  const base = demo("editorial");
  const [pi, setPi] = useState(0);
  const [fi, setFi] = useState(0);
  const [auto, setAuto] = useState(true);
  const opts = useMemo(() => PALETTES.filter((p) => ["paper", "noir", "forest", "blush", "ocean", "butter", "clay", "lilac"].includes(p.id)), []);
  const pairs = useMemo(() => FONT_PAIRS.filter((p) => ["editorial", "modern", "loud", "warm", "quirky"].includes(p.id)), []);
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      setPi((i) => (i + 1) % opts.length);
      setFi((i) => (i + 1) % pairs.length);
    }, 2200);
    return () => clearInterval(t);
  }, [auto, opts.length, pairs.length]);
  const doc = { ...base, theme: { ...opts[pi].theme, headingFont: pairs[fi].heading, bodyFont: pairs[fi].body } };

  return (
    <div className="flex h-full items-center gap-8" onPointerEnter={() => setAuto(false)}>
      <div className="relative shrink-0">
        <div className="flex gap-3">
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              layout
              className="overflow-hidden rounded-xl shadow-[0_30px_60px_-30px_rgb(0_0_0/.5),0_0_0_1px_var(--line)]"
              style={{ rotate: i ? 3 : -2, marginTop: i ? 28 : 0 }}
            >
              <ScaledSlide width={200} slide={base.slides[i]} doc={doc} index={i} total={base.slides.length} />
            </motion.div>
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <div>
          <div className="mb-2.5 font-mono text-[10.5px] tracking-[.14em] text-muted uppercase">Palette</div>
          <div className="flex flex-wrap gap-2">
            {opts.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setPi(i)}
                className={cn("relative h-9 w-9 rounded-full transition-transform duration-300 hover:scale-110", i === pi && "scale-110")}
                style={{ background: `conic-gradient(${p.theme.bg} 0 50%, ${p.theme.accent} 50% 75%, ${p.theme.ink} 75%)` }}
              >
                {i === pi && <motion.span layoutId="pal-ring" className="absolute -inset-1 rounded-full ring-2 ring-ink" />}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2.5 font-mono text-[10.5px] tracking-[.14em] text-muted uppercase">Font pair</div>
          <div className="flex flex-wrap gap-1.5">
            {pairs.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setFi(i)}
                className={cn("rounded-full px-3 py-1.5 text-[13px] transition-colors", i === fi ? "bg-ink text-bg" : "bg-panel-2 text-ink-2 hover:bg-line-2")}
                style={{ fontFamily: `"${p.heading}"` }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const PHOTOS = [1015, 1025, 1035, 1039, 1043, 1050, 1062, 1069, 1074, 1080, 110, 129, 137, 152, 164, 177];

function StockDemo() {
  const cols = [PHOTOS.slice(0, 6), PHOTOS.slice(6, 12), PHOTOS.slice(10, 16)];
  return (
    <div className="relative -mx-7 -mt-7 h-[230px] overflow-hidden [mask-image:linear-gradient(transparent,black_20%,black_70%,transparent)]">
      <div className="flex gap-2.5 px-4">
        {cols.map((c, ci) => (
          <div key={ci} className="flex-1 overflow-hidden">
            <div className="marquee flex flex-col gap-2.5" style={{ ["--marquee-duration" as string]: `${28 + ci * 8}s`, animationDirection: ci === 1 ? "reverse" : "normal", animationName: "marqueeY" }}>
              {[...c, ...c].map((id, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={`https://picsum.photos/id/${id}/240/${i % 3 ? 300 : 220}`} alt="" loading="lazy" className="w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="absolute inset-x-6 bottom-6 flex items-center gap-2 rounded-full bg-panel/90 px-4 py-2.5 text-[13px] text-ink-2 shadow-md backdrop-blur">
        <Search size={14} /> <TypeLoop words={["golden hour", "minimal desk", "mountains", "coffee", "city at night"]} />
      </div>
      <style>{`@keyframes marqueeY{from{transform:translateY(0)}to{transform:translateY(-50%)}}`}</style>
    </div>
  );
}

function TypeLoop({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const [n, setN] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const w = words[i];
    const t = setTimeout(
      () => {
        if (!del && n < w.length) setN(n + 1);
        else if (!del) setDel(true);
        else if (n > 0) setN(n - 1);
        else {
          setDel(false);
          setI((i + 1) % words.length);
        }
      },
      !del && n === w.length ? 1400 : del ? 35 : 75,
    );
    return () => clearTimeout(t);
  }, [n, del, i, words]);
  return (
    <span>
      {words[i].slice(0, n)}
      <span className="ml-px inline-block h-[1em] w-px translate-y-[2px] animate-pulse bg-accent" />
    </span>
  );
}

function TextureDemo() {
  const tex = TEXTURES.filter((t) => t.id !== "none");
  const [i, setI] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <div className="grid grid-cols-3 gap-2">
      {tex.map((t, k) => (
        <button
          key={t.id}
          onPointerEnter={() => setI(k)}
          className={cn("relative aspect-square overflow-hidden rounded-xl transition-all duration-500", k === i ? "ring-2 ring-ink" : "ring-1 ring-line")}
          style={{ background: k % 2 ? "#EFE9DD" : "#16150F" }}
        >
          {mounted && <span className="absolute inset-0" style={{ ...textureCSS(t.id, 1, k % 2 === 0) }} />}
          <span className={cn("absolute bottom-1.5 left-2 font-mono text-[9px] tracking-wider uppercase", k % 2 ? "text-black/60" : "text-white/70")}>{t.name}</span>
        </button>
      ))}
    </div>
  );
}

function KeysDemo() {
  const combos = [
    ["Ctrl", "D"],
    ["Ctrl", "Z"],
    ["Ctrl", "Enter"],
    ["←", "→"],
    ["T"],
    ["Ctrl", "E"],
  ];
  const labels = ["Duplicate", "Undo", "Add slide", "Switch slide", "Add text", "Export"];
  const [i, setI] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setI((x) => (x + 1) % combos.length), 1500);
    return () => clearInterval(t);
  }, [inView, combos.length]);
  return (
    <div ref={ref} className="flex h-full flex-col items-center justify-center gap-4 py-4">
      <div className="flex gap-2">
        <AnimatePresence mode="popLayout">
          {combos[i].map((k, j) => (
            <motion.span
              key={`${i}-${k}`}
              initial={{ y: -14, opacity: 0, scale: 0.8 }}
              animate={{ y: [0, 4, 0], opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.45, delay: j * 0.08 }}
              className="grid h-14 min-w-14 place-items-center rounded-xl bg-panel-2 px-4 font-mono text-[15px] font-medium text-ink shadow-[0_0_0_1px_var(--line-2),0_4px_0_var(--line-2)]"
            >
              {k}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        <motion.span key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="font-mono text-[11px] tracking-[.14em] text-muted uppercase">
          {labels[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function ExportDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false });
  const items = [
    { icon: FileImage, name: "carousel-01.png", size: "1.2 MB" },
    { icon: FileText, name: "carousel.pdf", size: "3.8 MB" },
    { icon: FolderArchive, name: "carousel.zip", size: "6.1 MB" },
  ];
  return (
    <div ref={ref} className="flex flex-col gap-2">
      {items.map((it, i) => (
        <div key={it.name} className="relative flex items-center gap-3 overflow-hidden rounded-xl bg-panel-2 px-3 py-2.5">
          <motion.div
            className="absolute inset-y-0 left-0 bg-accent-soft"
            initial={{ width: "0%" }}
            animate={inView ? { width: "100%" } : { width: "0%" }}
            transition={{ duration: 1.4, delay: 0.3 + i * 0.35, ease: [0.65, 0, 0.35, 1] }}
          />
          <it.icon size={16} className="relative text-ink-2" />
          <span className="relative flex-1 font-mono text-[12px]">{it.name}</span>
          <span className="relative text-[11px] text-muted">{it.size}</span>
          <motion.span
            initial={{ scale: 0 }}
            animate={inView ? { scale: 1 } : { scale: 0 }}
            transition={{ type: "spring", delay: 1.6 + i * 0.35 }}
            className="relative grid h-5 w-5 place-items-center rounded-full bg-accent text-accent-ink"
          >
            <Download size={11} />
          </motion.span>
        </div>
      ))}
    </div>
  );
}

function BrandDemo() {
  const [n, setN] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setN((x) => (x % 7) + 1), 1300);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex h-full items-center">
      <div className="flex w-full items-center gap-3 rounded-2xl bg-ink p-4 text-bg">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-accent font-semibold text-accent-ink">A</div>
        <div className="leading-tight">
          <div className="text-[14px] font-semibold">Ava Reyes</div>
          <div className="text-[12px] opacity-60">@avamakes</div>
        </div>
        <div className="flex-1" />
        <span className="font-mono text-[12px] tabular-nums opacity-60">
          <AnimatePresence mode="popLayout">
            <motion.span key={n} className="inline-block" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}>
              0{n}
            </motion.span>
          </AnimatePresence>{" "}
          / 07
        </span>
        <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.3 }} className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-bg/40">
          <ArrowRight size={15} />
        </motion.span>
      </div>
    </div>
  );
}

function PrivateDemo() {
  return (
    <div className="flex h-full items-center justify-center gap-5 py-2">
      <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-panel-2 shadow-sm">
        <HardDrive size={30} className="text-ink-2" />
        <motion.span
          className="absolute -right-2 -bottom-2 grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-ink shadow-md"
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ repeat: Infinity, duration: 2.4 }}
        >
          <Lock size={15} />
        </motion.span>
        <motion.span className="absolute inset-0 rounded-3xl ring-2 ring-accent" animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 2.4 }} />
      </div>
    </div>
  );
}

export function Bento() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-32">
      <SectionHead
        eyebrow="Everything in the box"
        title="All the craft. *None* of the busywork."
        sub="KANVAS covers the parts of carousel-making people actually care about, and skips the parts nobody does."
      />
      <div className="grid auto-rows-[minmax(0,auto)] grid-cols-6 gap-4">
        <Card className="col-span-6 lg:col-span-4" title="Restyle everything in one click" body="Palettes and font pairs are live tokens. Swap them and every slide, highlight and button follows.">
          <PaletteDemo />
        </Card>
        <Card className="col-span-6 sm:col-span-3 lg:col-span-2" delay={0.08} title="Four photo libraries, one search" body="Unsplash, Pexels, Openverse and Picsum. Credits are saved automatically.">
          <StockDemo />
        </Card>
        <Card className="col-span-6 sm:col-span-3 lg:col-span-2" title="Textures that feel printed" body="Film grain, risograph, paper, dot grid. Built from vectors, so they stay crisp at any size.">
          <TextureDemo />
        </Card>
        <Card className="col-span-6 sm:col-span-3 lg:col-span-2" delay={0.08} title="Keyboard-first" body="Every action has a shortcut. You'll rarely need to leave the keys.">
          <KeysDemo />
        </Card>
        <Card className="col-span-6 sm:col-span-3 lg:col-span-2" delay={0.16} title="Export, done" body="PNG, JPG, a LinkedIn-ready PDF, or a ZIP of everything, at up to 3×.">
          <ExportDemo />
        </Card>
        <Card className="col-span-6 md:col-span-3" title="Your brand on every slide" body="Name, handle, avatar, page counter and a swipe cue, added to every slide automatically.">
          <BrandDemo />
        </Card>
        <Card className="col-span-6 md:col-span-3" delay={0.08} title="Private by default" body="No account, no uploads to our servers. Projects are saved in your browser and export as plain JSON.">
          <PrivateDemo />
        </Card>
      </div>
    </section>
  );
}
