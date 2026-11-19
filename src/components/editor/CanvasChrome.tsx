"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDownToLine,
  ArrowUpToLine,
  Bold,
  ClipboardPaste,
  Copy,
  CopyPlus,
  Lock,
  Minus,
  Move,
  Pencil,
  Plus,
  Trash2,
  Type,
  Unlock,
  Wallpaper,
  X,
} from "lucide-react";
import { SLIDE_W } from "@/lib/model/constants";
import { text } from "@/lib/model/factory";
import { resolveColor } from "@/lib/model/resolve";
import type { SlideElement, TextElement, Theme } from "@/lib/model/types";
import { useEditor } from "@/store/editor";
import { cn } from "@/components/ui/cn";
import { setBackgroundImage } from "./insert";

const ALIGN_NEXT = { left: "center", center: "right", right: "left" } as const;

const stop = (e: React.PointerEvent | React.MouseEvent) => e.stopPropagation();

function Btn({ children, title, onClick, active, danger }: { children: ReactNode; title: string; onClick: () => void; active?: boolean; danger?: boolean }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "grid h-7 min-w-7 place-items-center rounded-md px-1 text-ink-2 transition-colors hover:bg-line hover:text-ink",
        active && "bg-line text-ink",
        danger && "hover:bg-red-500/10 hover:text-red-500",
      )}
    >
      {children}
    </button>
  );
}

const Sep = () => <span className="mx-0.5 h-4 w-px bg-line-2" />;

/**
 * Contextual mini toolbar above the selection: the 5–6 things people actually
 * reach for, without travelling to the inspector.
 */
export function QuickBar({ el, k, height, theme }: { el: SlideElement; k: number; height: number; theme: Theme }) {
  const st = useEditor.getState;
  const upd = (patch: Partial<SlideElement>) => st().updateElement(el.id, patch, `qb:${el.id}:${Object.keys(patch).join()}`);
  const above = el.y * k > 56;
  const left = Math.min(Math.max((el.x + el.w / 2) * k, 120), SLIDE_W * k - 120);
  const top = above ? el.y * k - 10 : (el.y + height) * k + 10;

  const swatches: [string, string][] =
    el.type === "text" || el.type === "icon"
      ? [["$ink", "Ink"], ["$accent", "Accent"], ["$muted", "Muted"], ["$bg", "Background"]]
      : [["$accent", "Accent"], ["$ink", "Ink"], ["$surface", "Surface"], ["$bg", "Background"]];
  const current = el.type === "text" ? el.color : el.type === "icon" ? el.color : el.type === "shape" ? el.fill : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: above ? 6 : -6, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 34 }}
      onPointerDown={stop}
      onDoubleClick={stop}
      className="absolute z-30 flex items-center gap-0.5 rounded-xl bg-panel p-1 shadow-[0_12px_32px_-12px_rgb(0_0_0/.35),0_0_0_1px_var(--line-2)]"
      style={{ left, top, translate: above ? "-50% -100%" : "-50% 0" }}
    >
      {el.type !== "image" && (
        <>
          {swatches.map(([tok, name]) => (
            <button
              key={tok}
              title={name}
              onClick={() => upd(el.type === "shape" ? { fill: tok } : ({ color: tok } as Partial<SlideElement>))}
              className={cn("mx-0.5 h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/.15)] transition-transform hover:scale-115", current === tok && "ring-2 ring-accent ring-offset-1 ring-offset-panel")}
              style={{ background: resolveColor(tok, theme) }}
            />
          ))}
          <Sep />
        </>
      )}
      {el.type === "text" && (
        <>
          <Btn title="Smaller" onClick={() => upd({ size: Math.max(8, Math.round((el as TextElement).size / 1.12)) } as Partial<TextElement>)}>
            <Minus size={13} />
          </Btn>
          <span className="w-8 text-center text-[11.5px] text-ink-2 tabular-nums">{el.size}</span>
          <Btn title="Bigger" onClick={() => upd({ size: Math.round(el.size * 1.12) } as Partial<TextElement>)}>
            <Plus size={13} />
          </Btn>
          <Sep />
          <Btn title="Bold" active={el.weight >= 600} onClick={() => upd({ weight: el.weight >= 600 ? 400 : 700 } as Partial<TextElement>)}>
            <Bold size={14} />
          </Btn>
          <Btn title="Cycle alignment" onClick={() => upd({ align: ALIGN_NEXT[el.align] } as Partial<TextElement>)}>
            {el.align === "left" ? <AlignLeft size={14} /> : el.align === "center" ? <AlignCenter size={14} /> : <AlignRight size={14} />}
          </Btn>
          <Btn title="Edit text (Enter)" onClick={() => st().setEditing(el.id)}>
            <Pencil size={13} />
          </Btn>
          <Sep />
        </>
      )}
      {el.type === "image" && (
        <>
          <Btn title="Reposition photo inside frame (double-click)" onClick={() => st().setEditing(el.id)}>
            <span className="flex items-center gap-1 px-1 text-[12px]">
              <Move size={13} /> Reposition
            </span>
          </Btn>
          <Btn
            title="Use as slide background"
            onClick={() => {
              setBackgroundImage({ src: el.src, w: el.w, h: el.h, credit: el.credit });
              st().deleteSelected();
            }}
          >
            <Wallpaper size={14} />
          </Btn>
          <Sep />
        </>
      )}
      <Btn title="Duplicate (Ctrl+D)" onClick={() => st().duplicateSelected()}>
        <CopyPlus size={14} />
      </Btn>
      <Btn title="Delete (Del)" danger onClick={() => st().deleteSelected()}>
        <Trash2 size={14} />
      </Btn>
    </motion.div>
  );
}

/* ------------------------------------------------------------ context menu */

export interface CtxState {
  x: number;
  y: number;
  /** Slide coordinates of the click, for "Add text here". */
  at: { x: number; y: number };
  el?: SlideElement;
}

export function ContextMenu({ ctx, onClose }: { ctx: CtxState | null; onClose: () => void }) {
  useEffect(() => {
    if (!ctx) return;
    const close = () => onClose();
    window.addEventListener("pointerdown", close);
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", esc);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("blur", close);
      window.removeEventListener("resize", close);
      window.removeEventListener("keydown", esc);
    };
  }, [ctx, onClose]);

  if (typeof document === "undefined") return null;
  const st = useEditor.getState;
  const run = (fn: () => void) => () => {
    fn();
    onClose();
  };
  const el = ctx?.el;
  const hasClip = !!st().clipboard;
  const items: ({ label: string; icon: ReactNode; kbd?: string; fn: () => void; danger?: boolean } | "sep")[] = el
    ? [
        ...(el.type === "text" ? [{ label: "Edit text", icon: <Pencil size={14} />, kbd: "Enter", fn: () => st().setEditing(el.id) }] : []),
        ...(el.type === "image"
          ? [
              { label: "Reposition photo", icon: <Move size={14} />, fn: () => st().setEditing(el.id) },
              { label: "Use as background", icon: <Wallpaper size={14} />, fn: () => (setBackgroundImage({ src: el.src, w: el.w, h: el.h, credit: el.credit }), st().deleteSelected()) },
            ]
          : []),
        "sep" as const,
        { label: "Duplicate", icon: <CopyPlus size={14} />, kbd: "Ctrl D", fn: () => st().duplicateSelected() },
        { label: "Copy", icon: <Copy size={14} />, kbd: "Ctrl C", fn: () => st().copy() },
        ...(hasClip ? [{ label: "Paste", icon: <ClipboardPaste size={14} />, kbd: "Ctrl V", fn: () => st().paste() }] : []),
        "sep" as const,
        { label: "Bring to front", icon: <ArrowUpToLine size={14} />, kbd: "Ctrl ⇧ ]", fn: () => st().layer("front") },
        { label: "Send to back", icon: <ArrowDownToLine size={14} />, kbd: "Ctrl ⇧ [", fn: () => st().layer("back") },
        { label: el.locked ? "Unlock" : "Lock", icon: el.locked ? <Unlock size={14} /> : <Lock size={14} />, fn: () => st().updateElement(el.id, { locked: !el.locked }) },
        "sep" as const,
        { label: "Delete", icon: <Trash2 size={14} />, kbd: "Del", danger: true, fn: () => st().deleteSelected() },
      ]
    : [
        {
          label: "Add text here",
          icon: <Type size={14} />,
          kbd: "T",
          fn: () => {
            const t = text({ text: "New text", size: 56, weight: 600, font: "$heading", w: 600, x: Math.round(ctx!.at.x - 40), y: Math.round(ctx!.at.y - 30) });
            st().addElement(t);
            requestAnimationFrame(() => st().setEditing(t.id));
          },
        },
        ...(hasClip ? [{ label: "Paste", icon: <ClipboardPaste size={14} />, kbd: "Ctrl V", fn: () => st().paste() }] : []),
        "sep" as const,
        { label: "Duplicate slide", icon: <CopyPlus size={14} />, kbd: "Ctrl D", fn: () => st().duplicateSlide() },
        ...(st().project && st().project!.slides.length > 1 ? [{ label: "Delete slide", icon: <Trash2 size={14} />, danger: true, fn: () => st().deleteSlide() }] : []),
      ];

  // Keep the menu on screen
  const W = 224;
  const Hh = items.length * 32;
  const x = ctx ? Math.min(ctx.x, window.innerWidth - W - 8) : 0;
  const y = ctx ? Math.min(ctx.y, window.innerHeight - Hh - 8) : 0;

  return createPortal(
    <AnimatePresence>
      {ctx && (
        <motion.div
          key={`${ctx.x}-${ctx.y}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.08 } }}
          transition={{ duration: 0.12 }}
          onPointerDown={stop}
          onContextMenu={(e) => e.preventDefault()}
          className="fixed z-[120] origin-top-left rounded-xl bg-panel p-1 shadow-[0_20px_50px_-12px_rgb(0_0_0/.4),0_0_0_1px_var(--line-2)]"
          style={{ left: x, top: y, width: W }}
        >
          {items.map((it, i) =>
            it === "sep" ? (
              i > 0 && items[i - 1] !== "sep" ? <div key={i} className="mx-2 my-1 h-px bg-line" /> : null
            ) : (
              <button
                key={it.label}
                onClick={run(it.fn)}
                className={cn("flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] hover:bg-line", it.danger ? "text-red-500 hover:bg-red-500/10" : "text-ink")}
              >
                <span className={it.danger ? "" : "text-ink-2"}>{it.icon}</span>
                <span className="flex-1">{it.label}</span>
                {it.kbd && <span className="font-mono text-[10.5px] text-muted">{it.kbd}</span>}
              </button>
            ),
          )}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ------------------------------------------------------------------- tips */

const TIPS_KEY = "KANVAS:tips-v1";

/** A small first-run card. Dismissed once, gone forever. */
export function Tips() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(!localStorage.getItem(TIPS_KEY));
    } catch {
      setShow(false);
    }
  }, []);
  const close = () => {
    setShow(false);
    try {
      localStorage.setItem(TIPS_KEY, "1");
    } catch {}
  };
  const tips: [string, string][] = [
    ["Double-click", "edit text · reposition photos"],
    ["*word*", "highlight"],
    ["Right-click", "quick actions"],
    ["?", "shortcuts"],
  ];
  // A slim strip in the gap under the slide: helpful on first run, never covering the work.
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { delay: 0.8, type: "spring", stiffness: 300, damping: 28 } }}
          exit={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          className="absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full bg-panel/90 py-1.5 pr-1.5 pl-3.5 text-[12px] whitespace-nowrap text-ink-2 shadow-[0_8px_24px_-12px_rgb(0_0_0/.3),0_0_0_1px_var(--line)] backdrop-blur"
        >
          {tips.map(([k, v], i) => (
            <span key={k} className="flex items-center gap-1.5">
              {i > 0 && <span className="mr-1.5 h-3 w-px bg-line-2" />}
              <kbd className="kbd">{k}</kbd>
              {v}
            </span>
          ))}
          <button onClick={close} className="grid h-6 w-6 place-items-center rounded-full text-muted hover:bg-line hover:text-ink" aria-label="Dismiss tips" title="Got it">
            <X size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
