"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Check, Code2, Cpu, Globe, Laptop, Layers, Lock, Shield, Sparkles, Terminal, Wand2, X } from "lucide-react";
import { ScaledSlide } from "@/components/slide/SlideRenderer";
import { Github } from "@/components/ui/BrandIcons";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { HeroShader } from "./HeroShader";
import { Eyebrow, Reveal, SplitWords } from "./primitives";
import { demo } from "./demo";
import { AUTHOR, GITLAB_REPO_URL, ISSUES_URL, LICENSE_URL, REPO_URL, tracked } from "@/lib/site";

/* -------------------------------------------------------------
   1. SYSTEM PHILOSOPHY (MINIMALIST MANIFESTO)
---------------------------------------------------------------- */
export function Philosophy() {
  return (
    <section id="capabilities" className="relative mx-auto max-w-5xl px-6 py-28 border-t border-line">
      <Reveal>
        <div className="flex items-center gap-2 mb-6">
          <span className="h-2 w-2 rounded-full bg-accent" />
          <Eyebrow>Architecture &amp; Philosophy</Eyebrow>
        </div>
      </Reveal>
      
      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] items-start">
        <p className="text-[clamp(1.9rem,3.8vw,3.2rem)] font-medium leading-[1.12] tracking-tight text-ink text-balance">
          Software should feel like an extension of your mind—quiet, instant, and completely yours.
        </p>

        <div className="space-y-6 text-[15.5px] leading-relaxed text-ink-2">
          <p>
            Developed by <strong className="text-ink font-semibold">LeadLinked &amp; Shezan</strong>, KANVAS abandons bloated subscription paywalls, server queues, and intrusive trackers.
          </p>
          <p>
            Every frame renders client-side via hardware-accelerated SVG and canvas pipelines. Your data stays in your browser&apos;s isolated IndexedDB—never transmitted, indexed, or shared.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   2. SPATIAL CAPABILITIES BENTO (VISION-PRO INSPIRED)
---------------------------------------------------------------- */
export function Capabilities() {
  const cards = [
    {
      icon: Cpu,
      title: "Client-Side Rendering Engine",
      description: "Zero round-trips. Instant 4K export to PNG, SVG, or multi-page PDF right inside your device's memory.",
      tag: "Engine",
    },
    {
      icon: Shield,
      title: "Private Local Architecture",
      description: "IndexedDB persistent storage with offline PWA readiness. No telemetry, analytics, or cloud dependencies.",
      tag: "Security",
    },
    {
      icon: Layers,
      title: "Apple HIG Typography Scales",
      description: "Modular font scales, optical kerning, and calibrated contrast ratios tuned for effortless readability.",
      tag: "Craft",
    },
    {
      icon: Terminal,
      title: "Autonomous Agent MCP API",
      description: "Direct Model Context Protocol integration. Connect Cursor, Claude, or ChatGPT to generate entire slide decks programmatically.",
      tag: "Protocol",
    },
  ];

  return (
    <section id="engine" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal className="mb-14">
        <Eyebrow className="mb-3">System Capabilities</Eyebrow>
        <h2 className="text-[clamp(2.2rem,4vw,3.6rem)] font-semibold tracking-tight text-ink">
          Engineered for creators who value craft over noise.
        </h2>
      </Reveal>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08} className="group relative flex flex-col justify-between rounded-3xl border border-line bg-panel p-6 shadow-sm transition-all duration-300 hover:border-ink hover:shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-panel-2 text-ink">
                  <c.icon size={20} />
                </span>
                <span className="rounded-full border border-line bg-panel-2 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {c.tag}
                </span>
              </div>
              <h3 className="text-[17px] font-semibold text-ink tracking-tight mb-2">{c.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-muted">{c.description}</p>
            </div>
            <div className="mt-6 pt-4 border-t border-line/60 flex items-center justify-between font-mono text-[11px] text-muted">
              <span>0{i + 1}</span>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity text-ink">&rarr;</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   3. DEVELOPERS & LEADLINKED SPOTLIGHT (VISIONOS GLASS CARD)
---------------------------------------------------------------- */
export function DeveloperSpotlight() {
  return (
    <section id="developers" className="mx-auto max-w-5xl px-6 py-24">
      <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-panel/70 p-8 shadow-2xl backdrop-blur-2xl sm:p-12">
        <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
        
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-panel-2 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Creators &amp; Maintainers
            </span>
            <h2 className="mt-4 text-[clamp(2.2rem,4.5vw,3.4rem)] font-semibold leading-tight tracking-tight text-ink">
              LeadLinked &amp; Shezan
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
              Dedicated to building fast, private, and beautifully crafted creative utilities. KANVAS is maintained as an open-source gift to developers, marketers, and spatial designers worldwide.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/Shezan-op/KANVAS"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-bg shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <Github size={16} /> LeadLinked GitHub
              </a>
              <a
                href="https://github.com/Shezan-op"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-5 py-2.5 text-[13px] font-medium text-ink transition hover:bg-panel-2"
              >
                Shezan Profile <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel-2/60 p-6 font-mono text-[12px] sm:min-w-[260px]">
            <div className="flex items-center justify-between text-muted pb-2 border-b border-line">
              <span>Repository</span>
              <span className="text-ink">Shezan-op/KANVAS</span>
            </div>
            <div className="flex items-center justify-between text-muted py-1">
              <span>License</span>
              <span className="text-ink">MIT Free Forever</span>
            </div>
            <div className="flex items-center justify-between text-muted py-1">
              <span>Backend Tracking</span>
              <span className="text-emerald-500 font-semibold">Zero / None</span>
            </div>
            <div className="flex items-center justify-between text-muted pt-2 border-t border-line">
              <span>Status</span>
              <span className="text-accent">Active Release 2.0</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   4. AGENT BAND (MCP INTERACTION)
---------------------------------------------------------------- */
export function AgentBand() {
  const lines = [
    { who: "you", text: "Create a 5-slide product launch carousel for KANVAS with spatial aesthetics." },
    { who: "agent", text: "Generated 5 slides with cover, 3 feature breakdowns, and CTA. Open preview:" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 overflow-hidden rounded-[36px] bg-ink p-8 text-bg shadow-2xl sm:p-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-bg/10 px-3 py-1 font-mono text-[11px] tracking-[.14em] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Model Context Protocol
          </span>
          <h2 className="mt-5 text-[clamp(2rem,4vw,3.4rem)] leading-none font-semibold tracking-[-0.035em] text-balance">
            <SplitWords text="Let your AI agent *design it.*" />
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-bg/70">
            Connect KANVAS to Claude, ChatGPT, Cursor or VS Code with native MCP. Request a deck and receive a direct link opening right into your local editor.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 rounded-full bg-bg px-6 py-3 text-[14px] font-semibold text-ink shadow-md transition hover:opacity-90"
            >
              Connect MCP Agent <ArrowRight size={15} />
            </Link>
          </div>
          <p className="mt-4 font-mono text-[12px] text-bg/50">Zero configuration · Instant URL handoff · Offline safe</p>
        </div>

        <Reveal className="flex flex-col gap-3">
          {lines.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={cn("max-w-[88%] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed", l.who === "you" ? "self-end rounded-br-md bg-accent text-accent-ink" : "self-start rounded-bl-md bg-bg/10")}
            >
              {l.text}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex max-w-[88%] items-center gap-3 self-start rounded-2xl bg-bg p-3 text-ink shadow-xl"
          >
            <div className="flex -space-x-6">
              {["noir", "editorial", "aurora"].map((id, i) => {
                const p = demo(id);
                return (
                  <div key={id} className="overflow-hidden rounded-md shadow-md" style={{ transform: `rotate(${(i - 1) * 6}deg)` }}>
                    <ScaledSlide width={54} slide={p.slides[0]} doc={p} index={0} total={p.slides.length} />
                  </div>
                );
              })}
            </div>
            <div className="min-w-0 pl-2">
              <div className="truncate text-[13.5px] font-semibold">Spatial Design Deck</div>
              <div className="font-mono text-[11.5px] text-muted">localhost:3000/app/edit?id=…</div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   5. MINIMALIST FAQ
---------------------------------------------------------------- */
const FAQ_ITEMS = [
  ["Who builds and maintains KANVAS?", "KANVAS is built and maintained by LeadLinked and Shezan as a modern, privacy-first open-source creation suite."],
  ["Is KANVAS completely free?", "Yes. Released under the permissive MIT license. There are no paid subscriptions, locked features, watermarks, or usage limits."],
  ["Where are my carousels saved?", "Exclusively on your machine inside your browser's IndexedDB storage. Nothing is ever synced to external servers unless you manually export."],
  ["Can I upload my own photos?", "Yes. Use the newly redesigned Photos panel to upload high-resolution local images directly from your computer, or choose from curated royalty-free sources."],
  ["Can I install it as a desktop app?", "Yes. KANVAS is a fully configured Progressive Web App (PWA). Click 'Install PWA' to run it in its own distraction-free window on macOS, Windows, or Linux."],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto grid max-w-5xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.4fr] border-t border-line">
      <div>
        <Eyebrow>Inquiries</Eyebrow>
        <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-tight tracking-tight text-ink">
          Frequently Answered
        </h2>
        <p className="mt-4 text-[15px] text-muted leading-relaxed">
          Need technical support or want to contribute? Connect directly on our{" "}
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-4 hover:text-accent">
            GitHub repository
          </a>
          .
        </p>
      </div>

      <div className="flex flex-col">
        {FAQ_ITEMS.map(([q, a], i) => (
          <div key={q} className="border-b border-line">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left">
              <span className="text-[17px] font-medium tracking-tight text-ink">{q}</span>
              <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors text-sm", open === i ? "bg-ink text-bg" : "bg-panel-2 text-muted")}>
                {open === i ? "−" : "+"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <p className="pb-6 text-[14.5px] leading-relaxed text-muted">{a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   6. FINAL VISIONOS CTA
---------------------------------------------------------------- */
export function FinalCta() {
  return (
    <section className="px-4 pb-6">
      <div className="relative isolate overflow-hidden rounded-[40px] border border-white/10 bg-panel px-6 py-28 text-center shadow-xl">
        <HeroShader className="absolute inset-0 -z-10 opacity-70" />
        <h2 className="mx-auto max-w-3xl text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-ink">
          Craft slides that <em className="font-serif italic font-normal">command attention</em>.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[16px] text-ink-2">
          Open the editor right in your browser. No registration required.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-3.5 text-[15px] font-semibold text-bg shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch Studio <ArrowRight size={16} />
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line bg-panel-2 px-6 py-3.5 text-[15px] font-medium text-ink transition hover:bg-line"
          >
            <Github size={16} /> Star on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   7. CLEAN ARCHITECTURAL FOOTER
---------------------------------------------------------------- */
export function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 pt-16 pb-12 border-t border-line">
      <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 text-[14px] text-muted max-w-sm">
            High-contrast visual carousel and document creation engine. Architected by LeadLinked &amp; Shezan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-[13.5px] font-medium text-ink-2">
          <Link href="/app" className="hover:text-ink transition-colors">Workspace</Link>
          <Link href="/agents" className="hover:text-ink transition-colors">Agent MCP</Link>
          <a href="https://github.com/Shezan-op/KANVAS" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">GitHub</a>
          <a href="https://github.com/Shezan-op" target="_blank" rel="noopener noreferrer" className="hover:text-ink transition-colors">Shezan</a>
          <Link href="/privacy" className="hover:text-ink transition-colors">Privacy</Link>
        </div>
      </div>

      <div className="mt-12 overflow-hidden">
        <div className="font-serif text-[clamp(4.5rem,18vw,16rem)] leading-[0.8] tracking-[-0.04em] text-ink/10 select-none">
          KANVAS
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-line/60 text-[12px] text-muted font-mono">
        <span>
          &copy; {new Date().getFullYear()} LeadLinked &amp; Shezan &bull; MIT Licensed
        </span>
        <span>Built with care by LeadLinked &amp; Shezan.</span>
      </div>
    </footer>
  );
}
