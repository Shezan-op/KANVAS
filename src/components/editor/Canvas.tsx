"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SlideRenderer, textStyle } from "@/components/slide/SlideRenderer";
import { SLIDE_W, slideHeight } from "@/lib/model/constants";
import type { Project, Slide, SlideElement, TextElement } from "@/lib/model/types";
import { useActiveSlide, useEditor } from "@/store/editor";
import { cn } from "@/components/ui/cn";
import { DND_MIME, filesToPayloads, insertImage, replaceImage, type ImagePayload } from "./insert";
import { ContextMenu, QuickBar, Tips, type CtxState } from "./CanvasChrome";

type Guide = { axis: "x" | "y"; pos: number };
type Handle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

const SNAP = 6;

function elHeight(el: SlideElement) {
  if (el.type !== "text") return el.h;
  const n = document.querySelector<HTMLElement>(`[data-el="${el.id}"]`);
  return n ? n.offsetHeight : el.h;
}

export function Canvas() {
  const project = useEditor((s) => s.project)!;
  const slide = useActiveSlide()!;
  const zoom = useEditor((s) => s.zoom);
  const setZoom = useEditor((s) => s.setZoom);
  const host = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 800, h: 600 });
  const H = slideHeight(project.aspect);

  useLayoutEffect(() => {
    const el = host.current!;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  const fit = Math.max(0.1, Math.min((box.w - 120) / SLIDE_W, (box.h - 116) / H));
  const k = zoom === "fit" ? fit : zoom;

  // Ctrl/⌘ + wheel zoom (trackpad pinch arrives as ctrl+wheel too)
  useEffect(() => {
    const el = host.current!;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const cur = useEditor.getState().zoom;
      const base = cur === "fit" ? fit : cur;
      setZoom(Math.min(4, Math.max(0.1, base * Math.exp(-e.deltaY * 0.01))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [fit, setZoom]);

  const idx = project.slides.findIndex((s) => s.id === slide.id);
  const prev = project.slides[idx - 1];
  const next = project.slides[idx + 1];
  const gotoSlide = useEditor((s) => s.gotoSlide);

  return (
    <div ref={host} className="canvas-bg scroll-thin relative h-full w-full overflow-auto">
      <div className="flex min-h-full min-w-full items-center justify-center" style={{ padding: "40px 60px 76px", width: zoom === "fit" ? undefined : SLIDE_W * k + 240 }}>
        <div className="relative flex items-center">
          {/* Neighbour peeks give the "carousel" feel and are clickable */}
          {prev && <Peek slide={prev} project={project} k={k} side="left" index={idx - 1} onClick={() => gotoSlide(-1)} />}
          <Stage project={project} slide={slide} k={k} index={idx} />
          {next && <Peek slide={next} project={project} k={k} side="right" index={idx + 1} onClick={() => gotoSlide(1)} />}
        </div>
      </div>
      <Tips />
    </div>
  );
}

function Peek({ slide, project, k, side, index, onClick }: { slide: Slide; project: Project; k: number; side: "left" | "right"; index: number; onClick: () => void }) {
  const H = slideHeight(project.aspect);
  const w = 72;
  return (
    <button
      onClick={onClick}
      className={cn("group absolute top-1/2 z-0 -translate-y-1/2 overflow-hidden rounded-md opacity-70 transition-all duration-300 hover:opacity-100", side === "left" ? "right-full mr-5" : "left-full ml-5")}
      style={{
        width: w,
        height: H * k * 0.9,
        // Fade away from the active slide so neighbours read as "more this way", not clutter.
        maskImage: `linear-gradient(to ${side === "left" ? "left" : "right"}, black 20%, transparent)`,
        WebkitMaskImage: `linear-gradient(to ${side === "left" ? "left" : "right"}, black 20%, transparent)`,
      }}
      title={side === "left" ? "Previous slide (←)" : "Next slide (→)"}
    >
      <div className={cn("absolute top-0 h-full", side === "left" ? "right-0" : "left-0")} style={{ width: SLIDE_W * k * 0.9 }}>
        <div style={{ transform: `scale(${k * 0.9})`, transformOrigin: side === "left" ? "100% 0" : "0 0", width: SLIDE_W, height: H, position: "absolute", [side === "left" ? "right" : "left"]: 0 }}>
          <SlideRenderer slide={slide} doc={project} index={index} total={project.slides.length} displayWidth={SLIDE_W * k * 0.9} />
        </div>
      </div>
      <span className="absolute inset-0 grid place-items-center bg-black/0 text-white transition-colors group-hover:bg-black/20">
        {side === "left" ? <ChevronLeft className="opacity-0 group-hover:opacity-100" /> : <ChevronRight className="opacity-0 group-hover:opacity-100" />}
      </span>
    </button>
  );
}

function Stage({ project, slide, k, index }: { project: Project; slide: Slide; k: number; index: number }) {
  const H = slideHeight(project.aspect);
  const stageRef = useRef<HTMLDivElement>(null);
  const selectedIds = useEditor((s) => s.selectedIds);
  const editingId = useEditor((s) => s.editingId);
  const select = useEditor((s) => s.select);
  const mutate = useEditor((s) => s.mutate);
  const setEditing = useEditor((s) => s.setEditing);
  const updateElement = useEditor((s) => s.updateElement);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [marquee, setMarquee] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [dropHint, setDropHint] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  // True while dragging/resizing/rotating: hides the quick bar so it never lags behind the pointer.
  const [busy, setBusy] = useState(false);
  const [ctx, setCtx] = useState<CtxState | null>(null);

  const toSlide = useCallback(
    (cx: number, cy: number) => {
      const r = stageRef.current!.getBoundingClientRect();
      return { x: (cx - r.left) / k, y: (cy - r.top) / k };
    },
    [k],
  );

  /* ------------------------------------------------------------ move -- */
  const startMove = (e: React.PointerEvent, el: SlideElement) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const st = useEditor.getState();
    if (st.editingId === el.id) {
      if (el.type === "image") startPan(e, el);
      return;
    }
    let ids = st.selectedIds;
    if (e.shiftKey || e.metaKey || e.ctrlKey) {
      select([el.id], "toggle");
      return;
    }
    if (!ids.includes(el.id)) {
      ids = [el.id];
      select(ids);
    }
    if (el.locked) return;
    // Alt-drag duplicates, like every design tool
    if (e.altKey) {
      st.duplicateSelected();
      ids = useEditor.getState().selectedIds;
    }
    const start = toSlide(e.clientX, e.clientY);
    const cur = useEditor.getState().project!.slides.find((s) => s.id === slide.id)!;
    const origin = new Map(cur.elements.filter((x) => ids.includes(x.id)).map((x) => [x.id, { x: x.x, y: x.y, w: x.w, h: elHeight(x) }]));
    const others = cur.elements.filter((x) => !ids.includes(x.id) && !x.hidden).map((x) => ({ x: x.x, y: x.y, w: x.w, h: elHeight(x) }));
    const bounds = [...origin.values()].reduce(
      (b, o) => ({ l: Math.min(b.l, o.x), t: Math.min(b.t, o.y), r: Math.max(b.r, o.x + o.w), b: Math.max(b.b, o.y + o.h) }),
      { l: Infinity, t: Infinity, r: -Infinity, b: -Infinity },
    );
    const xs = [0, SLIDE_W / 2, SLIDE_W, 96, SLIDE_W - 96, ...others.flatMap((o) => [o.x, o.x + o.w / 2, o.x + o.w])];
    const ys = [0, H / 2, H, 96, H - 96, ...others.flatMap((o) => [o.y, o.y + o.h / 2, o.y + o.h])];
    let first = true;
    let moved = false;

    const onMove = (ev: PointerEvent) => {
      const p = toSlide(ev.clientX, ev.clientY);
      let dx = p.x - start.x;
      let dy = p.y - start.y;
      if (!moved && Math.hypot(dx, dy) * k < 3) return;
      if (!moved) setBusy(true);
      moved = true;
      if (ev.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) dy = 0;
        else dx = 0;
      }
      const g: Guide[] = [];
      if (!ev.altKey || true) {
        const th = SNAP / k;
        const bx = [bounds.l + dx, (bounds.l + bounds.r) / 2 + dx, bounds.r + dx];
        const by = [bounds.t + dy, (bounds.t + bounds.b) / 2 + dy, bounds.b + dy];
        let best = { d: th, adj: 0, pos: 0 };
        for (const c of xs) for (const v of bx) if (Math.abs(c - v) < best.d) best = { d: Math.abs(c - v), adj: c - v, pos: c };
        if (best.d < th) {
          dx += best.adj;
          g.push({ axis: "x", pos: best.pos });
        }
        best = { d: th, adj: 0, pos: 0 };
        for (const c of ys) for (const v of by) if (Math.abs(c - v) < best.d) best = { d: Math.abs(c - v), adj: c - v, pos: c };
        if (best.d < th) {
          dy += best.adj;
          g.push({ axis: "y", pos: best.pos });
        }
      }
      setGuides(g);
      mutate(
        (d) => {
          const s = d.slides.find((x) => x.id === slide.id)!;
          for (const x of s.elements) {
            const o = origin.get(x.id);
            if (o) {
              x.x = Math.round(o.x + dx);
              x.y = Math.round(o.y + dy);
            }
          }
        },
        { history: first ? undefined : false },
      );
      first = false;
    };
    const onUp = () => {
      setGuides([]);
      setBusy(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  /* ------------------------------------------------------------- pan -- */
  /** Reposition a photo inside its frame (object-position), like cropping without losing pixels. */
  const startPan = (e: React.PointerEvent, el: Extract<SlideElement, { type: "image" }>) => {
    e.preventDefault();
    const start = toSlide(e.clientX, e.clientY);
    const f0 = el.focus ?? { x: 50, y: 50 };
    let first = true;
    const onMove = (ev: PointerEvent) => {
      const p = toSlide(ev.clientX, ev.clientY);
      const clamp = (v: number) => Math.round(Math.min(100, Math.max(0, v)) * 10) / 10;
      const focus = { x: clamp(f0.x - ((p.x - start.x) / el.w) * 120), y: clamp(f0.y - ((p.y - start.y) / el.h) * 120) };
      mutate(
        (d) => {
          const t = d.slides.find((s) => s.id === slide.id)!.elements.find((x) => x.id === el.id);
          if (t && t.type === "image") t.focus = focus;
        },
        { history: first ? undefined : false },
      );
      first = false;
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  /* ---------------------------------------------------------- resize -- */
  const startResize = (e: React.PointerEvent, el: SlideElement, h: Handle) => {
    e.stopPropagation();
    e.preventDefault();
    const start = toSlide(e.clientX, e.clientY);
    const o = { x: el.x, y: el.y, w: el.w, h: elHeight(el), size: el.type === "text" ? el.size : 0 };
    setBusy(true);
    const ratio = o.w / o.h;
    let first = true;
    const onMove = (ev: PointerEvent) => {
      const p = toSlide(ev.clientX, ev.clientY);
      const dx = p.x - start.x;
      const dy = p.y - start.y;
      let { x, y, w, h: hh } = o;
      if (h.includes("e")) w = o.w + dx;
      if (h.includes("w")) {
        w = o.w - dx;
        x = o.x + dx;
      }
      if (h.includes("s")) hh = o.h + dy;
      if (h.includes("n")) {
        hh = o.h - dy;
        y = o.y + dy;
      }
      const corner = h.length === 2;
      const keepRatio = corner && (el.type === "image" || el.type === "icon" || el.type === "text" ? !ev.shiftKey : ev.shiftKey);
      if (keepRatio) {
        const sc = Math.max(w / o.w, hh / o.h);
        w = o.w * sc;
        hh = o.h * sc;
        if (h.includes("w")) x = o.x + o.w - w;
        if (h.includes("n")) y = o.y + o.h - hh;
      }
      if (ev.altKey) {
        // Resize from centre
        x = o.x - (w - o.w) / 2;
        y = o.y - (hh - o.h) / 2;
      }
      w = Math.max(16, w);
      hh = Math.max(el.type === "shape" && (el.shape === "line" || el.shape === "arrow") ? 4 : 16, hh);
      const patch: Partial<SlideElement> & { size?: number } = { x: Math.round(x), y: Math.round(y), w: Math.round(w) };
      if (el.type === "text") {
        if (corner) patch.size = Math.max(8, Math.round((o.size * w) / o.w));
      } else patch.h = Math.round(hh);
      mutate(
        (d) => {
          const t = d.slides.find((s) => s.id === slide.id)!.elements.find((x) => x.id === el.id);
          if (t) Object.assign(t, patch);
        },
        { history: first ? undefined : false },
      );
      first = false;
    };
    const onUp = () => {
      setBusy(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    void ratio;
  };

  /* ---------------------------------------------------------- rotate -- */
  const startRotate = (e: React.PointerEvent, el: SlideElement) => {
    e.stopPropagation();
    e.preventDefault();
    const c = { x: el.x + el.w / 2, y: el.y + elHeight(el) / 2 };
    setBusy(true);
    let first = true;
    const onMove = (ev: PointerEvent) => {
      const p = toSlide(ev.clientX, ev.clientY);
      let deg = (Math.atan2(p.y - c.y, p.x - c.x) * 180) / Math.PI + 90;
      deg = ((deg + 540) % 360) - 180;
      const step = ev.shiftKey ? 15 : 1;
      deg = Math.round(deg / step) * step;
      for (const s of [0, 90, -90, 180, -180, 45, -45]) if (Math.abs(deg - s) < 3) deg = s;
      mutate(
        (d) => {
          const t = d.slides.find((s) => s.id === slide.id)!.elements.find((x) => x.id === el.id);
          if (t) t.rotation = deg;
        },
        { history: first ? undefined : false },
      );
      first = false;
    };
    const onUp = () => {
      setBusy(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  /* --------------------------------------------------------- marquee -- */
  const startMarquee = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const st = useEditor.getState();
    if (st.editingId) setEditing(null);
    const additive = e.shiftKey;
    if (!additive) select([]);
    const a = toSlide(e.clientX, e.clientY);
    const base = additive ? st.selectedIds : [];
    const onMove = (ev: PointerEvent) => {
      const b = toSlide(ev.clientX, ev.clientY);
      const r = { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) };
      if (r.w * k < 4 && r.h * k < 4) return;
      setMarquee(r);
      const hit = slide.elements
        .filter((x) => !x.locked && !x.hidden)
        .filter((x) => {
          const h = elHeight(x);
          return x.x < r.x + r.w && x.x + x.w > r.x && x.y < r.y + r.h && x.y + h > r.y;
        })
        .map((x) => x.id);
      select(Array.from(new Set([...base, ...hit])));
    };
    const onUp = () => {
      setMarquee(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  /* ------------------------------------------------------------ drop -- */
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDropHint(false);
    const at = toSlide(e.clientX, e.clientY);
    const target = (e.target as HTMLElement).closest<HTMLElement>("[data-el]");
    const targetEl = target ? slide.elements.find((x) => x.id === target.dataset.el) : undefined;
    let payloads: ImagePayload[] = [];
    const raw = e.dataTransfer.getData(DND_MIME);
    if (raw) payloads = [JSON.parse(raw)];
    else if (e.dataTransfer.files.length) payloads = await filesToPayloads(e.dataTransfer.files);
    if (!payloads.length) return;
    if (targetEl?.type === "image" && payloads.length === 1) {
      replaceImage(targetEl.id, payloads[0]);
      select([targetEl.id]);
      return;
    }
    payloads.forEach((p, i) => insertImage(p, { x: at.x + i * 30, y: at.y + i * 30 }));
  };

  /* ------------------------------------------------- element wrapper -- */
  const renderElement = (el: SlideElement, content: ReactNode, style: CSSProperties) => {
    const selected = selectedIds.includes(el.id);
    const editing = editingId === el.id;
    const single = selected && selectedIds.length === 1;
    return (
      <div
        key={el.id}
        data-el={el.id}
        style={{
          ...style,
          pointerEvents: el.locked && !selected ? "none" : undefined,
          cursor: el.locked ? "default" : editing ? (el.type === "image" ? "grab" : "text") : "move",
          zIndex: editing ? 5 : undefined,
        }}
        onPointerDown={(e) => startMove(e, el)}
        onPointerEnter={() => setHoverId(el.id)}
        onPointerLeave={() => setHoverId((h) => (h === el.id ? null : h))}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (el.type === "text" && !el.locked) setEditing(el.id);
          if (el.type === "image" && !el.locked && el.fit === "cover") setEditing(el.id);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!useEditor.getState().selectedIds.includes(el.id)) select([el.id]);
          setCtx({ x: e.clientX, y: e.clientY, at: toSlide(e.clientX, e.clientY), el });
        }}
      >
        {editing && el.type === "text" ? (
          <TextEditor
            el={el}
            theme={project.theme}
            onCommit={(text) => {
              if (text !== el.text) updateElement(el.id, { text } as Partial<TextElement>, `text:${el.id}`);
              setEditing(null);
            }}
          />
        ) : (
          content
        )}
        {(selected || (hoverId === el.id && !el.locked)) && (
          <div
            aria-hidden
            className="pointer-events-none absolute"
            style={{
              inset: -1 / k,
              outline: `${(selected ? 1.5 : 1) / k}px solid var(--accent)`,
              opacity: selected ? 1 : 0.6,
            }}
          />
        )}
        {single && !editing && !el.locked && <Handles el={el} k={k} onResize={startResize} onRotate={startRotate} />}
        {editing && el.type === "image" && (
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ outline: `${2 / k}px dashed var(--accent)`, outlineOffset: -1 / k }} />
        )}
      </div>
    );
  };

  const overlay = (
    <>
      {guides.map((g, i) => (
        <div
          key={i}
          className="pointer-events-none absolute z-50"
          style={
            g.axis === "x"
              ? { left: g.pos, top: 0, bottom: 0, width: 1 / k, background: "#FF2D87" }
              : { top: g.pos, left: 0, right: 0, height: 1 / k, background: "#FF2D87" }
          }
        />
      ))}
      {marquee && (
        <div
          className="pointer-events-none absolute z-50"
          style={{ left: marquee.x, top: marquee.y, width: marquee.w, height: marquee.h, background: "rgb(255 90 31 / .08)", outline: `${1 / k}px solid var(--accent)` }}
        />
      )}
    </>
  );

  return (
    <motion.div
      key={slide.id}
      initial={{ opacity: 0.6, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      ref={stageRef}
      data-stage
      className="relative z-10 shrink-0 shadow-[0_40px_80px_-30px_rgb(0_0_0/.35),0_0_0_1px_rgb(0_0_0/.06)]"
      style={{ width: SLIDE_W * k, height: H * k }}
      onPointerDown={startMarquee}
      onContextMenu={(e) => {
        e.preventDefault();
        select([]);
        setCtx({ x: e.clientX, y: e.clientY, at: toSlide(e.clientX, e.clientY) });
      }}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes(DND_MIME) || e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDropHint(true);
        }
      }}
      onDragLeave={() => setDropHint(false)}
      onDrop={onDrop}
    >
      <div style={{ transform: `scale(${k})`, transformOrigin: "0 0", width: SLIDE_W, height: H }}>
        <SlideRenderer slide={slide} doc={project} index={index} total={project.slides.length} renderElement={renderElement} overlay={overlay} />
      </div>
      {(() => {
        if (busy || marquee || selectedIds.length !== 1) return null;
        const el = slide.elements.find((x) => x.id === selectedIds[0]);
        if (!el || el.locked || (editingId === el.id && el.type === "text")) return null;
        if (editingId === el.id && el.type === "image")
          return (
            <div className="pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 rounded-full bg-ink px-3.5 py-1.5 text-[12px] font-medium whitespace-nowrap text-bg shadow-lg" style={{ top: -40 }}>
              Drag to reposition · <kbd className="kbd bg-transparent! text-bg! shadow-none!">Esc</kbd> when done
            </div>
          );
        return <QuickBar key={el.id} el={el} k={k} height={elHeight(el)} theme={project.theme} />;
      })()}
      <ContextMenu ctx={ctx} onClose={() => setCtx(null)} />
      <AnimatePresence>
        {dropHint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 grid place-items-center bg-accent/10 ring-2 ring-accent ring-inset"
          >
            <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-bg shadow-lg">Drop to add · drop on a photo to replace</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Handles({
  el,
  k,
  onResize,
  onRotate,
}: {
  el: SlideElement;
  k: number;
  onResize: (e: React.PointerEvent, el: SlideElement, h: Handle) => void;
  onRotate: (e: React.PointerEvent, el: SlideElement) => void;
}) {
  const s = 11 / k;
  const bw = 1.5 / k;
  const isText = el.type === "text";
  const isLine = el.type === "shape" && (el.shape === "line" || el.shape === "arrow");
  const handles: Handle[] = isText ? ["e", "w", "se", "sw", "ne", "nw"] : isLine ? ["e", "w"] : ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
  const pos: Record<Handle, CSSProperties> = {
    n: { left: "50%", top: 0, cursor: "ns-resize" },
    s: { left: "50%", top: "100%", cursor: "ns-resize" },
    e: { left: "100%", top: "50%", cursor: "ew-resize" },
    w: { left: 0, top: "50%", cursor: "ew-resize" },
    ne: { left: "100%", top: 0, cursor: "nesw-resize" },
    nw: { left: 0, top: 0, cursor: "nwse-resize" },
    se: { left: "100%", top: "100%", cursor: "nwse-resize" },
    sw: { left: 0, top: "100%", cursor: "nesw-resize" },
  };
  return (
    <>
      {handles.map((h) => {
        const side = h.length === 1 && h !== "n" && h !== "s";
        const top = h === "n" || h === "s";
        return (
          <div
            key={h}
            onPointerDown={(e) => onResize(e, el, h)}
            className="absolute z-10 bg-white"
            style={{
              ...pos[h],
              width: side ? s * 0.55 : top ? s * 1.6 : s,
              height: top ? s * 0.55 : side ? s * 1.6 : s,
              transform: "translate(-50%,-50%)",
              borderRadius: h.length === 2 ? 99 : 4 / k,
              border: `${bw}px solid var(--accent)`,
              boxShadow: `0 ${1 / k}px ${4 / k}px rgb(0 0 0 / .25)`,
            }}
          />
        );
      })}
      {!isLine && (
        <div
          onPointerDown={(e) => onRotate(e, el)}
          title="Rotate (Shift snaps 15°)"
          className="absolute z-10 grid place-items-center rounded-full bg-white"
          style={{
            left: "50%",
            top: -34 / k,
            width: 18 / k,
            height: 18 / k,
            transform: "translate(-50%,-50%)",
            border: `${bw}px solid var(--accent)`,
            cursor: "grab",
            boxShadow: `0 ${1 / k}px ${4 / k}px rgb(0 0 0 / .25)`,
          }}
        >
          <svg viewBox="0 0 24 24" width={11 / k} height={11 / k} fill="none" stroke="#FF5A1F" strokeWidth={2.5} strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-3-6.7L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </div>
      )}
      {el.rotation !== 0 && (
        <div className="pointer-events-none absolute rounded bg-ink font-mono text-bg" style={{ left: "100%", top: -28 / k, fontSize: 11 / k, padding: `${2 / k}px ${6 / k}px`, marginLeft: 8 / k }}>
          {Math.round(el.rotation)}°
        </div>
      )}
    </>
  );
}

function TextEditor({ el, theme, onCommit }: { el: TextElement; theme: Project["theme"]; onCommit: (t: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const n = ref.current!;
    n.innerText = el.text;
    n.focus();
    const r = document.createRange();
    r.selectNodeContents(n);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(r);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const commit = () => {
    if (done.current) return;
    done.current = true;
    onCommit(ref.current!.innerText.replace(/\n$/, ""));
  };
  return (
    <div
      ref={ref}
      contentEditable="plaintext-only"
      suppressContentEditableWarning
      spellCheck
      className="slide-edit"
      style={textStyle(el, theme)}
      onPointerDown={(e) => e.stopPropagation()}
      onBlur={commit}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape" || (e.key === "Enter" && (e.metaKey || e.ctrlKey))) {
          e.preventDefault();
          commit();
        }
      }}
    />
  );
}
