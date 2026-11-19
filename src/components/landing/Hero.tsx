"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Star, Sparkles, MonitorDown, UserCheck } from "lucide-react";
import { StarButton } from "@/components/ui/StarButton";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ScaledSlide } from "@/components/slide/SlideRenderer";
import { cn } from "@/components/ui/cn";
import { HeroShader } from "./HeroShader";
import { SplitWords } from "./primitives";
import { demo } from "./demo";
import { REPO_URL } from "@/lib/site";
import { AuthModal } from "@/components/auth/AuthModal";
import { getLocalSession, type Session } from "@/lib/auth";
import { useInstall } from "@/components/ui/InstallApp";

export function Nav() {
  const { scrollY } = useScroll();
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    setSession(getLocalSession());
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 400);
    setSolid(y > 24);
  });

  const links = [
    ["Capabilities", "#capabilities"],
    ["Templates", "#templates"],
    ["Developers", "#developers"],
    ["FAQ", "#faq"],
  ];

  const handleEnterKanvas = () => {
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
        className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
      >
        <nav
          className={cn(
            "flex w-full max-w-5xl items-center justify-between rounded-full px-5 py-2.5 transition-all duration-500",
            solid
              ? "border border-white/10 bg-panel/85 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
              : "border border-transparent bg-panel/30 backdrop-blur-md",
          )}
        >
          <Logo />

          <div className="hidden items-center gap-2 md:flex">
            {links.map(([l, h]) => (
              <a
                key={h}
                href={h}
                className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-ink-2 transition-all hover:bg-white/10 hover:text-ink whitespace-nowrap"
              >
                {l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <StarButton className="hidden sm:inline-flex" />
            <button
              onClick={handleEnterKanvas}
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-bg shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
            >
              {session ? (
                <>
                  <UserCheck size={14} className="text-accent" />
                  <span>Dashboard</span>
                </>
              ) : (
                <>
                  <span>Launch Editor</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
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

const DECK_TEMPLATES = ["editorial", "noir", "aurora", "photo", "swiss"];

function DeckFan() {
  const [ti, setTi] = useState(0);
  const [hover, setHover] = useState(false);
  const [mx, setMx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (hover) return;
    const t = setInterval(() => setTi((i) => (i + 1) % DECK_TEMPLATES.length), 3800);
    return () => clearInterval(t);
  }, [hover]);

  if (!mounted) {
    return <div className="h-[480px] w-full" />;
  }

  const p = demo(DECK_TEMPLATES[ti]);
  const slides = p.slides.slice(0, 5);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setMx(0);
      }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setMx((e.clientX - r.left) / r.width - 0.5);
      }}
      className="relative mx-auto h-[480px] w-[980px] max-w-full cursor-pointer select-none perspective-[1600px]"
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {slides.map((s, i) => {
          const mid = (slides.length - 1) / 2;
          const off = i - mid;
          const spread = hover ? 190 : 130;
          const rot = off * (hover ? 4.5 : 3) + mx * 6;
          const tx = off * spread + mx * 40;
          const ty = Math.abs(off) * 14 - (i === Math.round(mid + mx * 2) && hover ? 24 : 0);
          const z = 10 - Math.abs(off);
          return (
            <motion.div
              key={s.id ?? i}
              animate={{ x: tx, y: ty, rotate: rot, zIndex: z }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: 280 }}
            >
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-panel shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:border-ink">
                <ScaledSlide width={280} slide={s} doc={p} index={i} total={slides.length} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function Hero() {
  const router = useRouter();
  const { scrollY } = useScroll();
  const y = useSpring(useTransform(scrollY, [0, 800], [0, 120]), { stiffness: 120, damping: 30 });
  const fade = useTransform(scrollY, [0, 600], [1, 0.2]);
  const [authOpen, setAuthOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const { state: installState, install } = useInstall();

  useEffect(() => {
    setSession(getLocalSession());
  }, []);

  const handleEnterClick = () => {
    if (session) {
      router.push("/app");
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <section className="relative overflow-hidden pt-36 pb-20">
      <HeroShader className="absolute inset-0 -z-10 h-[115%]" />
      
      <motion.div style={{ y, opacity: fade }} className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        {/* Subtle, unboxed byline */}
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 flex items-center gap-2 font-mono text-[12px] tracking-[.18em] text-muted uppercase"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-ink" />
          <span>Built by LeadLinked &amp; Shezan &bull; Free Forever</span>
        </motion.div>

        {/* Master headline featuring Instrument Serif italic contrast */}
        <h1 className="text-[clamp(3.2rem,8.4vw,7.2rem)] font-semibold leading-[0.92] tracking-[-0.045em] text-balance">
          <SplitWords text={"Carousels that make people *actually read.*"} immediate delay={0.1} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-2 sm:text-[19px]"
        >
          Stop fighting sluggish cloud editors and messy Canva templates. KANVAS runs right in your browser, saves straight to your device, and exports crisp 4K decks in a couple of clicks.
        </motion.p>

        {/* Action Controls */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3.5"
        >
          <button
            onClick={handleEnterClick}
            className="group relative inline-flex items-center gap-2.5 rounded-full bg-ink px-8 py-3.5 text-[15px] font-medium text-bg shadow-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            <Sparkles size={16} />
            <span>Start Creating Now</span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {installState === "prompt" && (
            <button
              onClick={install}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-6 py-3.5 text-[14px] font-medium text-ink shadow-md backdrop-blur-xl transition-all hover:bg-panel hover:border-ink"
            >
              <MonitorDown size={16} />
              <span>Install PWA</span>
            </button>
          )}

          <a
            href="#templates"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel-2/60 px-5 py-3.5 text-[14px] font-medium text-ink-2 backdrop-blur-md transition-all hover:bg-panel-2 hover:text-ink"
          >
            Browse Styles
          </a>
        </motion.div>

        {/* Clean, pill-free trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 1 }}
          className="mt-8 flex items-center gap-4 font-mono text-[11px] tracking-[.14em] text-muted uppercase"
        >
          <span>No Login Needed</span>
          <span className="h-1 w-1 rounded-full bg-muted/40" />
          <span>Zero Server Lag</span>
          <span className="h-1 w-1 rounded-full bg-muted/40" />
          <span>100% Offline Capable</span>
        </motion.div>
      </motion.div>

      {/* Floating 3D Carousel Fan */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="mt-10 origin-top scale-[.62] sm:scale-[.8] lg:scale-100"
      >
        <DeckFan />
      </motion.div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => {
          setAuthOpen(false);
          router.push("/app");
        }}
      />
    </section>
  );
}
