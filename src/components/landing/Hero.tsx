"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Star, Sparkles, MonitorDown, LogIn, UserCheck } from "lucide-react";
import { StarButton } from "@/components/ui/StarButton";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MagneticLink, buttonClass } from "@/components/ui/Button";
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
    ["Features", "#features"],
    ["Templates", "#templates"],
    ["How it works", "#how"],
    ["Pricing", "#pricing"],
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
            "flex w-full max-w-6xl items-center justify-between rounded-2xl px-3 py-2 pl-4 transition-[background,box-shadow,backdrop-filter] duration-500",
            solid ? "bg-panel/75 shadow-lg backdrop-blur-2xl ring-1 ring-line" : "bg-transparent",
          )}
        >
          <Logo />
          <div className="hidden items-center gap-1 md:flex">
            {links.map(([l, h]) => (
              <a key={h} href={h} className="rounded-lg px-3 py-1.5 text-[14px] text-ink-2 transition-colors hover:bg-line hover:text-ink">
                {l}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <StarButton className="hidden sm:inline-flex" />
            <button
              onClick={handleEnterKanvas}
              className={buttonClass("ink", "sm", "group flex items-center gap-1.5 rounded-full px-4 shadow-sm")}
            >
              {session ? (
                <>
                  <UserCheck size={14} className="text-accent" />
                  <span>Dashboard</span>
                </>
              ) : (
                <>
                  <span>Enter K.A.N.V.A.S.</span>
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
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

/** A fanned stack of real, rendered slides that cycles through templates. */
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
              <div className="group relative overflow-hidden rounded-2xl bg-panel shadow-2xl ring-1 ring-line transition-all duration-300 hover:scale-[1.03] hover:ring-ink">
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
  const y = useSpring(useTransform(scrollY, [0, 800], [0, 140]), { stiffness: 120, damping: 30 });
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
    <section className="relative overflow-hidden pt-32 pb-16">
      <HeroShader className="absolute inset-0 -z-10 h-[115%]" />
      <motion.div style={{ y, opacity: fade }} className="mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <motion.a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="group mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-panel/85 py-1.5 pr-4 pl-1.5 text-[13px] text-ink shadow-sm backdrop-blur-xl hover:border-ink transition-colors"
        >
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-bg">KANVAS 2.0</span>
          <span>Apple HIG Minimalist Carousel Studio &bull; MIT Licensed</span>
          <Star size={13} className="text-accent transition-transform duration-500 group-hover:rotate-[72deg]" />
        </motion.a>

        <h1 className="text-[clamp(3.2rem,8.6vw,7.6rem)] leading-[0.92] font-semibold tracking-[-0.045em] text-balance">
          <SplitWords text={"Visual carousels that\n*command* the feed."} immediate delay={0.1} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
          className="mt-6 max-w-xl text-[18px] leading-relaxed text-ink-2 text-pretty"
        >
          KANVAS is an offline-first visual creation suite designed for creators, founders, and teams. Built with precision typography, spatial glass, curated templates, and zero cloud tracking.
        </motion.p>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={handleEnterClick}
            className="group relative inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 text-[15px] font-medium text-bg shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles size={16} />
            <span>Enter K.A.N.V.A.S.</span>
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {installState === "prompt" && (
            <button
              onClick={install}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-panel/80 px-6 py-3 text-[14px] font-medium text-ink shadow-sm backdrop-blur-md transition-all hover:bg-panel hover:border-ink"
            >
              <MonitorDown size={16} />
              <span>Install App (PWA)</span>
            </button>
          )}

          <MagneticLink href="#templates" variant="soft" cursor="Look">
            Browse templates
          </MagneticLink>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 1 }}
          className="mt-6 flex items-center gap-4 font-mono text-[11px] tracking-[.12em] text-muted uppercase"
        >
          <span>Private Local Auth</span>
          <span className="h-1 w-1 rounded-full bg-muted/50" />
          <span>Works offline</span>
          <span className="h-1 w-1 rounded-full bg-muted/50" />
          <span>Your files stay on device</span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        className="mt-6 origin-top scale-[.62] sm:scale-[.8] lg:scale-100"
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
