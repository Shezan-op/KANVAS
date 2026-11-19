"use client";

import Link from "next/link";
import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import { ScaledSlide } from "@/components/slide/SlideRenderer";
import { TEMPLATES } from "@/lib/model/templates";
import { demo, SHOWCASE_IDS } from "./demo";
import { SplitWords, Tilt } from "./primitives";

gsap.registerPlugin(ScrollTrigger);

const PLATFORMS: { name: string; icon: string }[] = [
  { name: "LinkedIn", icon: "/linkedin.svg" },
  { name: "Instagram", icon: "/instagram.svg" },
  { name: "X", icon: "/x-formerly-twitter.svg" },
  { name: "Threads", icon: "/threads.svg" },
  { name: "Pinterest", icon: "/pinterest.svg" },
];

export function PlatformMarquee() {
  const row = [...PLATFORMS, ...PLATFORMS, ...PLATFORMS];
  return (
    <section className="relative border-y border-line py-8 bg-panel/30">
      <div className="marquee-paused relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
        <div className="marquee flex w-max items-center gap-14 pr-14" style={{ ["--marquee-duration" as string]: "32s" }}>
          {row.map((p, i) => (
            <div
              key={i}
              className="flex items-center gap-3.5 opacity-80 transition-all duration-300 hover:opacity-100 group"
            >
              <div className="relative h-6 w-6 shrink-0 overflow-hidden flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Image
                  src={p.icon}
                  alt={p.name}
                  width={24}
                  height={24}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-[17px] font-medium tracking-tight text-ink">
                {p.name}
              </span>
              <span className="ml-10 text-muted/30 text-xs">&bull;</span>
            </div>
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
        <div className="flex flex-col gap-4">
          <h2 className="max-w-2xl text-[clamp(2.2rem,4.4vw,4rem)] leading-none font-semibold tracking-[-0.035em]">
            <SplitWords text={"Pick a mood.\n*Make it yours.*"} />
          </h2>
        </div>
        <p className="hidden max-w-xs text-[15px] leading-relaxed text-muted lg:block">
          Every template is a theme, not a cage. Change one palette or font pair and the whole carousel restyles itself.
        </p>
      </div>
      <div ref={track} className="flex w-max items-center gap-10 pl-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] will-change-transform">
        {SHOWCASE_IDS.map((id) => {
          const t = TEMPLATES.find((x) => x.id === id);
          if (!t) return null;
          const p = demo(id);
          return (
            <div key={id} className="gallery-card group flex flex-col will-change-transform" style={{ width: 340 }}>
              <Tilt max={6} className="relative aspect-4/5 overflow-hidden rounded-lg bg-panel shadow-lg ring-1 ring-line">
                <ScaledSlide width={340} slide={p.slides[0]} doc={p} index={0} total={p.slides.length} />
                <Link
                  href={`/app?template=${id}`}
                  className="absolute inset-0 flex items-end p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-label={`Use ${t.name} template`}
                >
                  <div className="flex w-full items-center justify-between rounded-lg bg-panel/95 px-4 py-3 text-[14px] font-medium text-ink shadow-lg backdrop-blur">
                    <span>Use this template</span>
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-ink text-bg">
                      <ArrowUpRight size={15} />
                    </span>
                  </div>
                </Link>
              </Tilt>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <h3 className="text-[17px] font-semibold text-ink">{t.name}</h3>
                  <p className="text-[13px] text-muted">{t.description}</p>
                </div>
                <span className="font-mono text-[11px] text-muted uppercase">{t.style.pair}</span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mx-auto mt-12 h-[2px] w-full max-w-6xl overflow-hidden rounded-full bg-line px-6">
        <div className="gallery-progress h-full origin-left scale-x-0 rounded-full bg-ink" />
      </div>
    </section>
  );
}
