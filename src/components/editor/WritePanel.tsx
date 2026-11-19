"use client";

import { useEffect, useRef } from "react";
import { Plus, PanelsTopLeft } from "lucide-react";
import { text as textEl } from "@/lib/model/factory";
import type { Slide, TextElement } from "@/lib/model/types";
import { useEditor } from "@/store/editor";
import { cn } from "@/components/ui/cn";

/**
 * Every slide's words as a simple document. People who just want to fix the
 * copy never have to find and double-click text on the canvas.
 */

/** A friendly name for each text box, from its role on the slide. */
function labelFor(el: TextElement, slide: Slide, biggest: number) {
  if (el.name) return el.name;
  if (el.size === biggest) return "Headline";
  if (el.uppercase && el.size <= 40) return "Label";
  if (el.background) return "Button";
  return "Text";
}

function AutoText({ el, onFocus }: { el: TextElement; onFocus: () => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  // Grow with the content, so long paragraphs never hide behind a scrollbar.
  useEffect(() => {
    const t = ref.current;
    if (!t) return;
    t.style.height = "0px";
    t.style.height = `${t.scrollHeight}px`;
  }, [el.text]);
  return (
    <textarea
      ref={ref}
      value={el.text}
      rows={1}
      onFocus={onFocus}
      onChange={(e) => useEditor.getState().updateElement(el.id, { text: e.target.value }, `write:${el.id}`)}
      className={cn(
        "w-full resize-none overflow-hidden rounded-lg bg-panel-2 px-3 py-2 text-ink outline-none transition placeholder:text-muted focus:bg-panel focus:ring-2 focus:ring-accent",
        el.size >= 70 ? "text-[14.5px] leading-snug font-semibold" : "text-[13px] leading-relaxed",
      )}
      placeholder="Type here…"
    />
  );
}

export function WritePanel() {
  const slides = useEditor((s) => s.project!.slides);
  const activeId = useEditor((s) => s.activeSlideId);
  const activeRef = useRef<HTMLDivElement>(null);

  // Keep the slide you're looking at on the canvas in view here too.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  const focusSlide = (slide: Slide, elId?: string) => {
    const st = useEditor.getState();
    if (st.activeSlideId !== slide.id) st.setActiveSlide(slide.id);
    if (elId) st.select([elId]);
  };

  return (
    <div className="scroll-thin h-full overflow-y-auto px-4 pb-8">
      <p className="mb-4 text-[12.5px] leading-relaxed text-muted">
        Edit the words on every slide here. Wrap words in <code className="rounded bg-panel-2 px-1 font-mono text-ink">*asterisks*</code> to highlight them.
      </p>
      <div className="flex flex-col gap-3">
        {slides.map((slide, i) => {
          const texts = slide.elements.filter((e): e is TextElement => e.type === "text" && !e.hidden).sort((a, b) => a.y - b.y || a.x - b.x);
          const biggest = Math.max(0, ...texts.map((t) => t.size));
          const active = slide.id === activeId;
          return (
            <div
              key={slide.id}
              ref={active ? activeRef : undefined}
              className={cn("rounded-2xl p-3 transition-colors", active ? "bg-accent-soft/60 ring-1 ring-accent/40" : "bg-panel-2/50")}
            >
              <button onClick={() => focusSlide(slide)} className="mb-2 flex w-full items-center gap-2 text-left">
                <span className={cn("grid h-5 min-w-5 place-items-center rounded-md px-1 font-mono text-[10.5px] tabular-nums", active ? "bg-accent text-accent-ink" : "bg-line text-muted")}>{i + 1}</span>
                <span className="text-[11.5px] font-medium text-ink-2">Slide {i + 1}</span>
              </button>
              <div className="flex flex-col gap-2">
                {texts.map((el) => (
                  <label key={el.id} className="flex flex-col gap-1">
                    <span className="text-[10.5px] font-medium tracking-wide text-muted uppercase">{labelFor(el, slide, biggest)}</span>
                    <AutoText el={el} onFocus={() => focusSlide(slide, el.id)} />
                  </label>
                ))}
                {texts.length === 0 && <p className="text-[12px] text-muted">No text on this slide.</p>}
                <button
                  onClick={() => {
                    focusSlide(slide);
                    useEditor.getState().addElement(textEl({ text: "New text", size: 44 }), { center: true });
                  }}
                  className="flex h-8 items-center justify-center gap-1 rounded-lg text-[12px] text-muted hover:bg-line hover:text-ink"
                >
                  <Plus size={13} /> Add text
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => useEditor.getState().setLeftTab("layouts")}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink text-[12.5px] font-medium text-bg hover:opacity-90"
      >
        <PanelsTopLeft size={14} /> Add a slide
      </button>
    </div>
  );
}
