"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ArrowRight, Cpu, Layers, Shield, Terminal } from "lucide-react";
import { ScaledSlide } from "@/components/slide/SlideRenderer";
import { Github } from "@/components/ui/BrandIcons";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { HeroShader } from "./HeroShader";
import { Eyebrow, Reveal, SplitWords } from "./primitives";
import { demo } from "./demo";
import { ISSUES_URL, REPO_URL } from "@/lib/site";

/* -------------------------------------------------------------
   1. REAL OPERATOR MANIFESTO (BLADER-HUMANISER + SHEZAN STYLE)
---------------------------------------------------------------- */
export function Philosophy() {
  return (
    <section id="capabilities" className="relative mx-auto max-w-5xl px-6 py-28 border-t border-line">
      <Reveal>
        <Eyebrow className="mb-6">The Honest Truth</Eyebrow>
      </Reveal>
      
      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] items-start">
        <h2 className="text-[clamp(1.9rem,3.8vw,3.2rem)] font-medium leading-[1.12] tracking-tight text-ink text-balance">
          Most design tools are bloated traps. We built this <em className="font-serif italic font-normal text-ink">coz we needed it ourselves</em>.
        </h2>

        <div className="space-y-5 text-[15.5px] leading-relaxed text-ink-2">
          <p>
            You want to drop some thoughts, pick a clean typographic vibe, throw in an image, and ship a carousel to LinkedIn or Instagram before you lose your train of thought.
          </p>
          <p>
            You don&apos;t need a $29 monthly subscription. You don&apos;t need an account. And you certainly don&apos;t need a slow cloud canvas that stutters when you paste text. KANVAS runs entirely in your browser, works offline, and keeps every single pixel on your computer.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   2. SPATIAL CAPABILITIES (MAX 8PX CORNER RADIUS)
---------------------------------------------------------------- */
export function Capabilities() {
  const cards = [
    {
      icon: Cpu,
      title: "Real-Time Local Rendering",
      description: "Everything happens in your browser's RAM. Export 4K PNGs or multi-slide PDFs immediately without waiting on a server render queue.",
      tag: "Engine",
    },
    {
      icon: Shield,
      title: "Zero Account, Zero Tracking",
      description: "Your slides stay on your device in local IndexedDB. We don't harvest your drafts, track your engagement, or sell your data.",
      tag: "Privacy",
    },
    {
      icon: Layers,
      title: "Instrument Serif & Modern Sans",
      description: "Curated typography pairings with calibrated weights and optical kerning that make your carousels easy to skim on small screens.",
      tag: "Typography",
    },
    {
      icon: Terminal,
      title: "Direct AI Agent MCP API",
      description: "Hook your Cursor, Claude, or ChatGPT to KANVAS via Model Context Protocol and watch it build out structured decks automatically.",
      tag: "Integration",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <Reveal className="mb-12">
        <Eyebrow className="mb-3">How it works</Eyebrow>
        <h2 className="text-[clamp(2.2rem,4vw,3.6rem)] font-semibold tracking-tight text-ink">
          Built for speed. <em className="font-serif italic font-normal text-ink">Nothing extra.</em>
        </h2>
      </Reveal>

      {/* Cards constrained to max 8px radius (rounded-lg) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <Reveal key={c.title} delay={i * 0.08} className="group relative flex flex-col justify-between rounded-lg border border-line bg-panel p-6 shadow-sm transition-all duration-300 hover:border-ink hover:shadow-lg">
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-panel-2 text-ink">
                  <c.icon size={20} />
                </span>
                <span className="font-mono text-[11px] text-muted uppercase tracking-wider">
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
   3. DEVELOPERS & LEADLINKED (MAX 8PX CORNER RADIUS)
---------------------------------------------------------------- */
export function DeveloperSpotlight() {
  return (
    <section id="developers" className="mx-auto max-w-5xl px-6 py-24">
      {/* Container constrained to max 8px radius (rounded-lg) */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-panel/75 p-8 shadow-2xl backdrop-blur-2xl sm:p-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <Eyebrow className="mb-4">The Developers</Eyebrow>
            <h2 className="text-[clamp(2.2rem,4.5vw,3.4rem)] font-semibold leading-tight tracking-tight text-ink">
              LeadLinked &amp; Shezan
            </h2>
            <p className="mt-3 text-[15.5px] leading-relaxed text-muted">
              Built and maintained by LeadLinked &amp; Shezan. We like shipping clean, punchy tools that solve real problems without corporate fluff.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="https://github.com/Shezan-op/KANVAS"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-[13px] font-semibold text-bg shadow-sm transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <Github size={16} /> LeadLinked GitHub
              </a>
              <a
                href="https://github.com/Shezan-op"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel px-5 py-2.5 text-[13px] font-medium text-ink transition hover:bg-panel-2"
              >
                Shezan Profile <ArrowRight size={14} />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-line bg-panel-2/60 p-6 font-mono text-[12px] sm:min-w-[260px]">
            <div className="flex items-center justify-between text-muted pb-2 border-b border-line">
              <span>Repo</span>
              <span className="text-ink">Shezan-op/KANVAS</span>
            </div>
            <div className="flex items-center justify-between text-muted py-1">
              <span>License</span>
              <span className="text-ink">MIT Free Forever</span>
            </div>
            <div className="flex items-center justify-between text-muted py-1">
              <span>Backend Tracker</span>
              <span className="text-emerald-500 font-semibold">Zero / None</span>
            </div>
            <div className="flex items-center justify-between text-muted pt-2 border-t border-line">
              <span>Architecture</span>
              <span className="text-accent">Local-First</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   4. AGENT BAND (MAX 8PX CORNER RADIUS)
---------------------------------------------------------------- */
export function AgentBand() {
  const lines = [
    { who: "you", text: "Create a 5-slide deck on why consistency beats intensity." },
    { who: "agent", text: "Done. Hook, 3 points with data highlights, and a punchy close. Open editor:" },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="grid items-center gap-12 overflow-hidden rounded-lg bg-ink p-8 text-bg shadow-2xl sm:p-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="font-mono text-[11px] tracking-[.18em] uppercase text-accent">
            AI Agent Integration
          </span>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] leading-none font-semibold tracking-[-0.035em] text-balance">
            <SplitWords text="Or let your AI agent *write the deck.*" />
          </h2>
          <p className="mt-4 max-w-md text-[16px] leading-relaxed text-bg/70">
            Link KANVAS with Claude, Cursor, or ChatGPT using the Model Context Protocol. Prompt your thoughts and get a clean, styled carousel ready to publish.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 rounded-lg bg-bg px-6 py-2.5 text-[14px] font-semibold text-ink shadow-md transition hover:opacity-90"
            >
              Connect MCP Agent <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <Reveal className="flex flex-col gap-3">
          {lines.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className={cn("max-w-[88%] rounded-lg px-4 py-3 text-[14.5px] leading-relaxed", l.who === "you" ? "self-end bg-accent text-accent-ink" : "self-start bg-bg/10")}
            >
              {l.text}
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex max-w-[88%] items-center gap-3 self-start rounded-lg bg-bg p-3 text-ink shadow-xl"
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
              <div className="truncate text-[13.5px] font-semibold">Consistency Wins Deck</div>
              <div className="font-mono text-[11.5px] text-muted">localhost:3000/app/edit?id=…</div>
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------
   5. REAL QUESTIONS (FAQ)
---------------------------------------------------------------- */
const FAQ_ITEMS = [
  ["Is KANVAS truly free or is there a paywall later?", "It's 100% free under the MIT license. No surprise trials, no feature paywalls, and no watermarks on your exports."],
  ["Who is behind this?", "LeadLinked & Shezan. We built this as an open-source tool for creators who care about clean craft and straight-to-the-point software."],
  ["Where do my designs get saved?", "Directly inside your browser's local database (IndexedDB). Your files don't touch our servers, so your drafts stay totally private."],
  ["Can I upload my own custom pictures?", "Yes, you can upload your own photos directly from your hard drive, or pick from millions of free photos via Openverse and Unsplash."],
  ["Can I use this on mobile?", "KANVAS works as a PWA, but the canvas editor is specifically tuned for laptop keyboards and trackpads where you can write and lay out slides quickly."],
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto grid max-w-5xl gap-12 px-6 py-24 lg:grid-cols-[1fr_1.4fr] border-t border-line">
      <div>
        <Eyebrow>Common Questions</Eyebrow>
        <h2 className="mt-4 text-[clamp(2.2rem,4vw,3.4rem)] font-semibold leading-tight tracking-tight text-ink">
          Clear answers. <em className="font-serif italic font-normal text-ink">No corporate speak.</em>
        </h2>
        <p className="mt-4 text-[15px] text-muted leading-relaxed">
          Got feedback or want to ask something directly? Drop an issue on{" "}
          <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-4 hover:text-accent">
            GitHub
          </a>
          .
        </p>
      </div>

      <div className="flex flex-col">
        {FAQ_ITEMS.map(([q, a], i) => (
          <div key={q} className="border-b border-line">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-6 py-5 text-left">
              <span className="text-[17px] font-medium tracking-tight text-ink">{q}</span>
              <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors text-sm", open === i ? "bg-ink text-bg" : "bg-panel-2 text-muted")}>
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
   6. FINAL CTA (MAX 8PX RADIUS)
---------------------------------------------------------------- */
export function FinalCta() {
  return (
    <section className="px-4 pb-6">
      <div className="relative isolate overflow-hidden rounded-lg border border-white/10 bg-panel px-6 py-28 text-center shadow-xl">
        <HeroShader className="absolute inset-0 -z-10 opacity-70" />
        <h2 className="mx-auto max-w-3xl text-[clamp(2.6rem,6vw,5.2rem)] font-semibold leading-[0.96] tracking-[-0.04em] text-ink">
          Stop scrolling. <em className="font-serif italic font-normal text-ink">Start creating.</em>
        </h2>
        <p className="mx-auto mt-5 max-w-md text-[16px] text-ink-2">
          Open the canvas and write your hook. Your next carousel can be live in ten minutes.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 rounded-lg bg-ink px-7 py-3 text-[14.5px] font-semibold text-bg shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
          >
            Open KANVAS Studio <ArrowRight size={15} />
          </Link>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-line bg-panel-2 px-6 py-3 text-[14px] font-medium text-ink transition hover:bg-line"
          >
            <Github size={15} /> Star on GitHub
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
            Fast, clean, offline-first carousel studio. Maintained by LeadLinked &amp; Shezan.
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
          &copy; {new Date().getFullYear()} LeadLinked &amp; Shezan &bull; Free &amp; Open Source
        </span>
        <span>Built with care by LeadLinked &amp; Shezan.</span>
      </div>
    </footer>
  );
}
