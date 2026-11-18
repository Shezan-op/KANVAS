"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, Image as ImageIcon, LayoutTemplate, Loader2, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { CarouselSpec } from "@/lib/spec/schema";
import { compileSpec, type PendingPhoto } from "@/lib/spec/compile";
import { decodeSpec } from "@/lib/spec/link";
import { defaultProvider, getKeys, getProvider } from "@/lib/stock";
import { getPref, saveProject } from "@/lib/storage";
import type { BrandKit, Project } from "@/lib/model/types";

type Step = "read" | "build" | "photos" | "save";
const STEPS: { id: Step; label: string; icon: typeof Check }[] = [
  { id: "read", label: "Reading the carousel", icon: Sparkles },
  { id: "build", label: "Laying out slides", icon: LayoutTemplate },
  { id: "photos", label: "Finding photos", icon: ImageIcon },
  { id: "save", label: "Saving to your browser", icon: Check },
];

const within = <T,>(p: Promise<T>, ms: number) => Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);

/**
 * Find a real stock photo for each photo described in words. The preferred
 * library (Unsplash/Pexels if the user added a key, else Openverse) and
 * Wikimedia Commons are queried in parallel; the first good answer wins within
 * a short budget, and anything not found keeps its placeholder.
 */
async function resolvePhotos(project: Project, pending: PendingPhoto[], onProgress: (done: number) => void) {
  const keys = getKeys();
  const primary = getProvider(defaultProvider());
  const backup = getProvider("wikimedia");
  type Photo = Awaited<ReturnType<typeof primary.search>>["photos"][number];
  const memo = new Map<string, Promise<Photo | null>>();
  const find = (query: string, portrait: boolean) => {
    const k = `${query}|${portrait}`;
    if (!memo.has(k)) {
      const orientation = portrait ? ("portrait" as const) : ("landscape" as const);
      const a = within(primary.search(query, 1, { orientation, key: keys[primary.id] }), 4500).then((r) => r.photos[0] ?? null);
      const b = within(backup.search(query, 1, { orientation }), 6500).then((r) => r.photos[0] ?? null);
      // Prefer the primary library, but don't wait on it more than 1.2s after the backup has an answer.
      const aOk = a.then((h) => h ?? Promise.reject(new Error("none")));
      const bLate = b.then((h) => (h ? new Promise<Photo>((res) => setTimeout(() => res(h), 1200)) : Promise.reject(new Error("none"))));
      memo.set(k, Promise.any([aOk, bLate]).catch(() => null));
    }
    return memo.get(k)!;
  };
  let done = 0;
  await Promise.all(
    pending.map(async (p) => {
      const hit = await find(p.query, p.target === "background");
      if (hit) {
        hit.track?.();
        const slide = project.slides.find((s) => s.id === p.slideId);
        if (slide && p.target === "background" && slide.background.kind === "image") {
          slide.background.src = hit.full;
          slide.background.credit = hit.credit;
        } else if (slide) {
          const el = slide.elements.find((e) => e.id === p.target);
          if (el?.type === "image") {
            el.src = hit.full;
            el.credit = hit.credit;
          }
        }
      }
      onProgress(++done);
    }),
  );
}

export function OpenSpec() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("read");
  const [photos, setPhotos] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [error, setError] = useState<{ title: string; details: string[] } | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      const hash = window.location.hash;
      // Clear the fragment right away: the carousel's text shouldn't linger in history.
      history.replaceState(null, "", window.location.pathname);
      if (!hash || hash.length < 4) {
        setError({ title: "This link is empty", details: ["Ask your agent to create the carousel again, or start one from the dashboard."] });
        return;
      }
      let raw: unknown;
      try {
        raw = await decodeSpec(hash);
      } catch {
        setError({ title: "This link looks broken", details: ["It may have been cut off when it was copied. Ask your agent for the link again."] });
        return;
      }
      const parsed = CarouselSpec.safeParse(raw);
      if (!parsed.success) {
        setError({
          title: "Slyd couldn't read this carousel",
          details: parsed.error.issues.slice(0, 6).map((i) => `${i.path.join(".") || "spec"}: ${i.message}`),
        });
        return;
      }
      setStep("build");
      const brand = await getPref<BrandKit | undefined>("brand", undefined);
      const { project, pending } = compileSpec(parsed.data, brand);
      if (pending.length) {
        setStep("photos");
        setPhotos({ done: 0, total: pending.length });
        await resolvePhotos(project, pending, (done) => setPhotos({ done, total: pending.length }));
      }
      setStep("save");
      await saveProject(project);
      const open = parsed.data.open && parsed.data.open !== "editor" ? `&open=${parsed.data.open}` : "";
      router.replace(`/app/edit?id=${project.id}${open}`);
    })().catch((e) => setError({ title: "Something went wrong", details: [String((e as Error)?.message ?? e)] }));
  }, [router]);

  const idx = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="grid min-h-screen place-items-center px-6">
      <AnimatePresence mode="wait">
        {error ? (
          <motion.div key="err" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl bg-panel p-7 shadow-md">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-red-500/10 text-red-500">
              <AlertTriangle size={18} />
            </span>
            <h1 className="mt-4 text-[20px] font-semibold tracking-tight">{error.title}</h1>
            <ul className="mt-3 flex flex-col gap-1.5">
              {error.details.map((d) => (
                <li key={d} className="rounded-lg bg-panel-2 px-3 py-2 font-mono text-[12px] leading-relaxed text-ink-2">
                  {d}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex gap-2">
              <Link href="/app" className="rounded-xl bg-ink px-4 py-2 text-[13px] font-medium text-bg">
                Go to dashboard
              </Link>
              <Link href="/agents" className="rounded-xl px-4 py-2 text-[13px] text-ink-2 hover:bg-line">
                Agent docs
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div key="load" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex w-full max-w-sm flex-col items-center">
            <motion.div animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}>
              <LogoMark className="h-14 w-14" />
            </motion.div>
            <h1 className="mt-6 text-[22px] font-semibold tracking-tight">
              Opening your <span className="font-serif font-normal italic text-accent">carousel</span>
            </h1>
            <ul className="mt-6 flex w-full flex-col gap-2">
              {STEPS.map((s, i) => {
                const state = i < idx ? "done" : i === idx ? "active" : "todo";
                return (
                  <li key={s.id} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition-colors", state === "active" ? "bg-panel shadow-sm" : "")}>
                    <span className={cn("grid h-6 w-6 place-items-center rounded-full", state === "done" ? "bg-accent text-accent-ink" : state === "active" ? "bg-accent-soft text-accent" : "bg-line text-muted")}>
                      {state === "done" ? <Check size={13} strokeWidth={3} /> : state === "active" ? <Loader2 size={13} className="animate-spin" /> : <s.icon size={12} />}
                    </span>
                    <span className={state === "todo" ? "text-muted" : "text-ink"}>{s.label}</span>
                    {s.id === "photos" && photos.total > 0 && (
                      <span className="ml-auto font-mono text-[11px] text-muted tabular-nums">
                        {photos.done}/{photos.total}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-center text-[12px] text-muted">Everything happens in your browser. Nothing is uploaded.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
