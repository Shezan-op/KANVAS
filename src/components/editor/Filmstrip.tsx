"use client";

import { AnimatePresence, Reorder, motion } from "motion/react";
import { useDeferredValue, useEffect, useRef, useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";
import { ScaledSlide } from "@/components/slide/SlideRenderer";
import { SLIDE_W, slideHeight } from "@/lib/model/constants";
import { LAYOUTS, buildLayout, styleFromTemplateId } from "@/lib/model/templates";
import { cn } from "@/components/ui/cn";
import { useEditor } from "@/store/editor";

const THUMB_H = 92;

export function Filmstrip() {
  // Thumbnails render at low priority so dragging on the canvas never waits on them.
  const project = useDeferredValue(useEditor((s) => s.project)!);
  const activeId = useEditor((s) => s.activeSlideId);
  const setActive = useEditor((s) => s.setActiveSlide);
  const mutate = useEditor((s) => s.mutate);
  const [order, setOrder] = useState(project.slides.map((s) => s.id));
  const dragging = useRef(false);
  const [menu, setMenu] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dragging.current) setOrder(project.slides.map((s) => s.id));
  }, [project.slides]);

  // Keep the active thumbnail in view
  useEffect(() => {
    scroller.current?.querySelector(`[data-thumb="${activeId}"]`)?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [activeId]);

  const H = slideHeight(project.aspect);
  const w = Math.round((THUMB_H * SLIDE_W) / H);
  const byId = new Map(project.slides.map((s) => [s.id, s]));
  const commit = () => {
    dragging.current = false;
    const cur = project.slides.map((s) => s.id).join();
    if (cur === order.join()) return;
    mutate((d) => {
      const map = new Map(d.slides.map((s) => [s.id, s]));
      d.slides = order.map((id) => map.get(id)!).filter(Boolean);
    });
  };

  return (
    <div className="relative flex h-[148px] shrink-0 items-center border-t border-line bg-panel">
      <div ref={scroller} className="no-scrollbar flex h-full flex-1 items-center overflow-x-auto px-5">
        <Reorder.Group axis="x" values={order} onReorder={setOrder} className="flex items-center gap-3">
          {order.map((id, i) => {
            const s = byId.get(id);
            if (!s) return null;
            const active = id === activeId;
            return (
              <Reorder.Item
                key={id}
                value={id}
                data-thumb={id}
                onDragStart={() => (dragging.current = true)}
                onDragEnd={commit}
                whileDrag={{ scale: 1.08, rotate: -2, zIndex: 20, boxShadow: "0 20px 40px -12px rgb(0 0 0 / .45)" }}
                className="group relative shrink-0 cursor-grab rounded-lg active:cursor-grabbing"
                onClick={() => setActive(id)}
              >
                <div className={cn("overflow-hidden rounded-lg transition-shadow duration-200", active ? "ring-2 ring-accent ring-offset-2 ring-offset-panel" : "ring-1 ring-line group-hover:ring-line-2")}>
                  <ScaledSlide width={w} slide={s} doc={project} index={i} total={order.length} />
                </div>
                <span className={cn("absolute -bottom-5 left-0 font-mono text-[10.5px] tabular-nums", active ? "text-accent" : "text-muted")}>{String(i + 1).padStart(2, "0")}</span>
                <div className="absolute -top-2 -right-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      useEditor.getState().duplicateSlide(id);
                    }}
                    className="grid h-6 w-6 place-items-center rounded-full bg-panel text-ink-2 shadow-md hover:text-ink"
                    title="Duplicate slide"
                  >
                    <Copy size={11} />
                  </button>
                  {order.length > 1 && (
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        useEditor.getState().deleteSlide(id);
                      }}
                      className="grid h-6 w-6 place-items-center rounded-full bg-panel text-ink-2 shadow-md hover:text-red-500"
                      title="Delete slide"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
        <div className="relative ml-3 shrink-0">
          <button
            onClick={() => setMenu(!menu)}
            className="grid place-items-center rounded-lg border-2 border-dashed border-line-2 text-muted transition hover:border-accent hover:bg-accent-soft hover:text-accent"
            style={{ width: w, height: THUMB_H }}
            title="Add slide (Ctrl+Enter)"
          >
            <motion.span animate={{ rotate: menu ? 45 : 0 }}>
              <Plus size={20} />
            </motion.span>
          </button>
          <AnimatePresence>
            {menu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  className="absolute bottom-full left-0 z-40 mb-2 w-56 origin-bottom-left rounded-xl bg-panel p-1 shadow-lg"
                >
                  {LAYOUTS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        useEditor.getState().addSlide(buildLayout(l.id, styleFromTemplateId(project.templateId), project.aspect));
                        setMenu(false);
                      }}
                      className="flex w-full flex-col rounded-lg px-2.5 py-1.5 text-left hover:bg-line"
                    >
                      <span className="text-[13px] font-medium">{l.name}</span>
                      <span className="text-[11px] text-muted">{l.hint}</span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div className="pointer-events-none absolute right-5 bottom-2 font-mono text-[10.5px] text-muted">
        {project.slides.length} slides · drag to reorder
      </div>
    </div>
  );
}
