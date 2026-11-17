"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { ScaledSlide } from "@/components/slide/SlideRenderer";
import { TEMPLATES } from "@/lib/model/templates";
import { demo, SHOWCASE_IDS } from "./demo";
import { Eyebrow, SplitWords, Tilt } from "./primitives";

gsap.registerPlugin(ScrollTrigger);

const PLATFORMS = ["Instagram", "LinkedIn", "X / Twitter", "Threads", "TikTok", "Pinterest", "Substack", "Bluesky", "Facebook", "Slides"];
const FONTS = ["font-serif italic", "font-sans font-semibold tracking-tight", "font-mono uppercase text-[0.8em] tracking-widest", "font-sans font-light"];

export function PlatformMarquee() {
  const row = [...PLATFORMS, ...PLATFORMS];
  return (
    <section className="relative border-y border-line py-7">
      <p className="mb-5 text-center font-mono text-[11px] tracking-[.16em] text-muted uppercase">Sized right for every feed</p>
      <div className="marquee-paused relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="marquee flex w-max items-center gap-16 pr-16 text-[28px] text-ink-2" style={{ ["--marquee-duration" as string]: "45s" }}>
          {row.map((p, i) => (
            <span key={i} className={`${FONTS[i % FONTS.length]} flex items-center gap-16 whitespace-nowrap opacity-80 transition-opacity hover:opacity-100`}>
              {p}
              <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Pinned horizontal gallery: vertical scroll drives a horizontal track (GSAP ScrollTrigger),
 * each card counter-rotates slightly as it travels.
 */
export function TemplateGallery() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = section.current!;
    const tr = track.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const ctx = gsap.context(() => {
      const distance = () => tr.scrollWidth - window.innerWidth + 96;
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.8,
          pin: true,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
      gsap.utils.toArray<HTMLElement>(".gallery-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { rotate: i % 2 ? 4 : -4, y: i % 2 ? 40 : -20 },
          {
            rotate: i % 2 ? -3 : 3,
            y: i % 2 ? -20 : 30,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
          },
        );
      });
      gsap.to(".gallery-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: () => `+=${distance()}`, scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} id="templates" className="relative flex h-screen flex-col justify-center overflow-hidden">
      <div className="mx-auto mb-10 flex w-full max-w-6xl items-end justify-between gap-8 px-6">
        <div className="flex flex-col gap-5">
          <Eyebrow>Templates</Eyebrow>
          <h2 className="max-w-2xl text-[clamp(2.2rem,4.4vw,4rem)] leading-[1] font-semibold tracking-[-0.035em]">
            <SplitWords text="Pick a mood. *Make it yours.*" />
          </h2>
        </div>
        <p className="hidden max-w-xs text-[15px] leading-relaxed text-muted lg:block">
          Every template is a theme, not a cage. Change one palette or font pair and the whole carousel restyles itself.
        </p>
      </div>
      <div ref={track} className="flex w-max items-center gap-10 pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] will-change-transform">
        {SHOWCASE_IDS.map((id) => {
          const p = demo(id);
          const t = TEMPLATES.find((x) => x.id === id)!;
          return (
            <Link key={id} href={`/app?template=${id}`} className="gallery-card group block shrink-0" data-cursor="Use">
              <Tilt className="rounded-[22px]" max={8}>
                <div className="overflow-hidden rounded-[22px] shadow-[0_50px_90px_-40px_rgb(0_0_0/.5),0_0_0_1px_var(--line)] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]">
                  <ScaledSlide width={300} slide={p.slides[0]} doc={p} index={0} total={p.slides.length} />
                </div>
              </Tilt>
              <div className="mt-5 flex items-start justify-between gap-4 px-1">
                <div>
                  <div className="text-[17px] font-semibold tracking-tight">{t.name}</div>
                  <div className="mt-0.5 max-w-[240px] text-[13px] text-muted">{t.description}</div>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-panel shadow-sm transition-all duration-500 group-hover:rotate-45 group-hover:bg-accent group-hover:text-accent-ink">
                  <ArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          );
        })}
        <div className="w-[20vw] shrink-0" />
      </div>
      <div className="mx-auto mt-12 h-[2px] w-full max-w-6xl overflow-hidden rounded-full bg-line px-6">
        <div className="gallery-progress h-full origin-left scale-x-0 rounded-full bg-accent" />
      </div>
    </section>
  );
}
