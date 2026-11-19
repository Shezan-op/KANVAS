"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Sparkles, MonitorDown, X, Download, ShieldCheck } from "lucide-react";
import { ScaledSlide } from "@/components/slide/SlideRenderer";
import { HeroShader } from "./HeroShader";
import { SplitWords } from "./primitives";
import { demo } from "./demo";
import { AuthModal } from "@/components/auth/AuthModal";
import { getLocalSession, type Session } from "@/lib/auth";
import { useInstall } from "@/components/ui/InstallApp";
import { REPO_URL } from "@/lib/site";

export { Nav } from "./Navbar";

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
              {/* Corner radius max 8px */}
              <div className="group relative overflow-hidden rounded-lg border border-line bg-panel shadow-2xl transition-all duration-300 hover:scale-[1.03] hover:border-ink dark:border-white/10">
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
  const [chooseModalOpen, setChooseModalOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(4);
  const { state: installState, install } = useInstall();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSession(getLocalSession());
  }, []);

  const proceedToDirectEntry = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setChooseModalOpen(false);
    if (session) {
      router.push("/app");
    } else {
      setAuthOpen(true);
    }
  };

  const openChooseModal = () => {
    setSecondsLeft(4);
    setChooseModalOpen(true);
  };

  const closeChooseModal = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setChooseModalOpen(false);
  };

  useEffect(() => {
    if (!chooseModalOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setSecondsLeft(4);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          proceedToDirectEntry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [chooseModalOpen]);

  const handleInstallClick = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setChooseModalOpen(false);
    if (installState === "prompt") {
      await install();
    } else {
      alert("To install KANVAS PWA, tap the install/share icon in your browser URL bar or Add to Home Screen.");
    }
  };

  return (
    <section className="relative overflow-hidden pt-36 pb-20">
      <HeroShader className="absolute inset-0 -z-10 h-[115%]" />
      
      <motion.div style={{ y, opacity: fade }} className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        {/* Exact Slyd-style highlighted pill */}
        <motion.a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="group mb-8 inline-flex items-center gap-2.5 rounded-full border border-line bg-panel/80 py-1 pr-3.5 pl-1.5 text-[13px] text-ink-2 shadow-sm backdrop-blur transition-colors hover:border-ink hover:text-ink dark:border-white/10 dark:bg-panel/70"
        >
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-bg uppercase">
            NEW
          </span>
          <span className="text-[13px] font-medium text-ink">
            Open source, MIT licensed, free forever
          </span>
          <span className="text-accent transition-transform duration-500 group-hover:rotate-[72deg] text-base leading-none">
            ★
          </span>
        </motion.a>

        {/* Master headline with Instrument Serif italic contrast */}
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

        {/* Action Controls - exactly two buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3.5"
        >
          <button
            onClick={openChooseModal}
            className="group relative inline-flex items-center gap-2.5 rounded-lg bg-ink px-7 py-3 text-[14.5px] font-medium text-bg shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles size={16} />
            <span>Start Creating Now</span>
            <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <a
            href="#templates"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel-2/60 px-5 py-3 text-[14px] font-medium text-ink-2 backdrop-blur-md transition-all hover:bg-panel-2 hover:text-ink"
          >
            Browse Styles
          </a>
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

      {/* Choose Entry / Install PWA Modal with 4s auto-redirect */}
      {chooseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={closeChooseModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />
          <div
            className="relative w-full max-w-md rounded-lg border border-line bg-panel p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-[#0b0f14]"
            style={{ borderRadius: "8px" }}
          >
            <button
              onClick={closeChooseModal}
              className="absolute top-4 right-4 rounded-md p-1.5 text-muted transition hover:bg-line hover:text-ink"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-bg">
                <Sparkles size={18} />
              </span>
              <div>
                <h3 className="text-[18px] font-semibold text-ink tracking-tight">How would you like to enter?</h3>
                <p className="text-[13px] text-muted">Choose your preferred experience</p>
              </div>
            </div>

            <div className="space-y-3 my-5">
              <button
                onClick={handleInstallClick}
                className="group flex w-full items-center justify-between rounded-lg border border-line bg-panel-2/50 p-4 text-left transition hover:border-ink hover:bg-panel-2"
                style={{ borderRadius: "8px" }}
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-panel border border-line text-ink">
                    <Download size={18} />
                  </span>
                  <div>
                    <h4 className="text-[14.5px] font-medium text-ink">Install PWA Desktop App</h4>
                    <p className="text-[12px] text-muted">Offline-ready native app experience</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
              </button>

              <button
                onClick={proceedToDirectEntry}
                className="group flex w-full items-center justify-between rounded-lg border border-line bg-panel-2/50 p-4 text-left transition hover:border-ink hover:bg-panel-2"
                style={{ borderRadius: "8px" }}
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-ink text-bg">
                    <ShieldCheck size={18} />
                  </span>
                  <div>
                    <h4 className="text-[14.5px] font-medium text-ink">Direct Web Access</h4>
                    <p className="text-[12px] text-muted">Sign in or create account to proceed</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
              </button>
            </div>

            {/* 4s auto-redirect countdown bar */}
            <div className="mt-4 pt-4 border-t border-line/60 flex items-center justify-between text-[12px] text-muted">
              <span>Auto-entering web app in <strong className="text-ink font-semibold">{secondsLeft}s</strong>...</span>
              <button
                onClick={proceedToDirectEntry}
                className="font-medium text-ink hover:underline"
              >
                Enter now &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

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
