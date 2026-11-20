"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Cloud, Download, Keyboard, Loader2, Minus, Play, Plus, Redo2, Settings, Undo2 } from "lucide-react";
import { ASPECTS } from "@/lib/model/constants";
import type { AspectId } from "@/lib/model/types";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LogoMark } from "@/components/ui/Logo";
import { IconButton, Select } from "@/components/ui/controls";
import { buttonClass } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { useEditor } from "@/store/editor";

export function TopBar() {
  const name = useEditor((s) => s.project!.name);
  const aspect = useEditor((s) => s.project!.aspect);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const save = useEditor((s) => s.saveState);
  const zoom = useEditor((s) => s.zoom);
  const st = useEditor.getState;
  const [draft, setDraft] = useState(name);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => setDraft(name), [name]);

  const zoomPct = zoom === "fit" ? "Fit" : `${Math.round(zoom * 100)}%`;
  const step = (dir: 1 | -1) => {
    const cur = st().zoom;
    const base = cur === "fit" ? (document.querySelector<HTMLElement>("[data-stage]")?.getBoundingClientRect().width ?? 540) / 1080 : cur;
    st().setZoom(Math.min(4, Math.max(0.1, +(base * (dir > 0 ? 1.2 : 1 / 1.2)).toFixed(3))));
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-1 border-b border-line bg-panel px-2 sm:px-3">
      {/* Left: Brand + Document Title */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <Link href="/app" className="group flex items-center gap-1.5 rounded-lg py-1.5 pr-2 pl-1.5 text-ink-2 hover:bg-line hover:text-ink shrink-0" title="All carousels">
          <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
          <LogoMark className="h-7 w-7 sm:h-8 sm:w-8" />
        </Link>
        <div className="hidden sm:block h-5 w-px bg-line shrink-0" />
        <div className="relative flex items-center min-w-0">
          <input
            ref={input}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => draft.trim() && draft !== name && st().mutate((d) => void (d.name = draft.trim()))}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter" || e.key === "Escape") input.current?.blur();
            }}
            className="h-8 w-28 sm:w-48 md:w-56 truncate rounded-lg bg-transparent px-1.5 sm:px-2 text-[13px] sm:text-[14px] font-medium outline-none hover:bg-line focus:bg-panel-2 focus:ring-2 focus:ring-accent/40"
            spellCheck={false}
          />
        </div>
        <div className="hidden md:flex">
          <SaveBadge state={save} />
        </div>
      </div>

      {/* Center: Undo / Redo + Aspect Ratio + Zoom Controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Prominent Undo & Redo Controls */}
        <div className="flex items-center rounded-lg bg-panel-2/60 border border-line p-0.5">
          <button
            title="Undo (Ctrl+Z)"
            onClick={() => st().undo()}
            disabled={!canUndo}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-ink-2 transition-colors",
              canUndo ? "hover:bg-line hover:text-ink active:scale-95" : "opacity-35 cursor-not-allowed"
            )}
          >
            <Undo2 size={15} />
          </button>
          <button
            title="Redo (Ctrl+Shift+Z)"
            onClick={() => st().redo()}
            disabled={!canRedo}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-ink-2 transition-colors",
              canRedo ? "hover:bg-line hover:text-ink active:scale-95" : "opacity-35 cursor-not-allowed"
            )}
          >
            <Redo2 size={15} />
          </button>
        </div>

        <div className="w-[110px] sm:w-[145px]">
          <Select
            value={aspect}
            onChange={(v) => st().setAspect(v as AspectId)}
            options={(Object.keys(ASPECTS) as AspectId[]).map((a) => ({ value: a, label: `${ASPECTS[a].label} · ${a}` }))}
          />
        </div>

        <div className="hidden sm:flex items-center rounded-lg bg-panel-2 border border-line/60">
          <IconButton title="Zoom out (Ctrl+-)" onClick={() => step(-1)}>
            <Minus size={14} />
          </IconButton>
          <button onClick={() => st().setZoom("fit")} className="w-11 text-center text-[12px] text-ink-2 tabular-nums hover:text-ink" title="Fit to screen (Ctrl+0)">
            {zoomPct}
          </button>
          <IconButton title="Zoom in (Ctrl+=)" onClick={() => step(1)}>
            <Plus size={14} />
          </IconButton>
        </div>
      </div>

      {/* Right: Actions & Export */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <div className="hidden lg:flex items-center gap-0.5">
          <IconButton title="Keyboard shortcuts (?)" onClick={() => st().setModal("shortcuts")}>
            <Keyboard size={15} />
          </IconButton>
          <IconButton title="Settings" onClick={() => st().setModal("settings")}>
            <Settings size={15} />
          </IconButton>
        </div>
        <ThemeToggle />
        <button
          onClick={() => st().setModal("preview")}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-line bg-panel-2 px-2.5 py-1.5 text-[12.5px] font-medium text-ink hover:bg-line transition"
          title="Preview (P)"
        >
          <Play size={13} /> Preview
        </button>
        <button
          onClick={() => st().setModal("export")}
          className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 sm:px-3.5 py-1.5 text-[12.5px] sm:text-[13px] font-semibold text-bg shadow-sm transition hover:opacity-90 active:scale-95"
          title="Export (Ctrl+E)"
        >
          <Download size={14} /> <span>Export</span>
        </button>
      </div>
    </header>
  );
}

function SaveBadge({ state }: { state: string }) {
  const map = {
    saved: { icon: <Check size={12} />, text: "Saved" },
    saving: { icon: <Loader2 size={12} className="animate-spin" />, text: "Saving" },
    dirty: { icon: <Cloud size={12} />, text: "Edited" },
    error: { icon: <Cloud size={12} />, text: "Couldn't save" },
  } as const;
  const m = map[state as keyof typeof map];
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className={`flex items-center gap-1 text-[11.5px] ${state === "error" ? "text-red-500" : "text-muted"}`}
        title="Projects save automatically to this browser"
      >
        {m.icon} {m.text}
      </motion.span>
    </AnimatePresence>
  );
}
