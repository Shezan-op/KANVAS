"use client";

import { useEffect } from "react";
import { slideHeight } from "@/lib/model/constants";
import { shape, text } from "@/lib/model/factory";
import { buildLayout, styleFromTemplateId } from "@/lib/model/templates";
import { useEditor, type LeftTab } from "@/store/editor";
import { toast } from "@/components/ui/Toast";

const TAB_KEYS: LeftTab[] = ["templates", "layouts", "text", "photos", "elements", "uploads", "brand"];

function isTyping(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

/** Every editor shortcut in one place. Ctrl and ⌘ are treated the same. */
export function useHotkeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const st = useEditor.getState();
      if (!st.project) return;
      if (st.modal && e.key !== "Escape") return;
      if (isTyping(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      const has = st.selectedIds.length > 0;
      const done = () => e.preventDefault();

      // History
      if (mod && k === "z") return done(), e.shiftKey ? st.redo() : st.undo();
      if (mod && k === "y") return done(), st.redo();

      // Clipboard (paste is handled by the paste event so images work too)
      if (mod && k === "c") return st.copy();
      if (mod && k === "x") return done(), st.cut();
      if (mod && k === "d") return done(), has ? st.duplicateSelected() : st.duplicateSlide();
      if (mod && k === "a") return done(), st.selectAll();
      if (mod && k === "s") return done(), toast.ok("Slyd saves automatically");
      if (mod && k === "e") return done(), st.setModal("export");

      // Slides
      if (mod && k === "enter") {
        done();
        return st.addSlide(buildLayout("blank", styleFromTemplateId(st.project.templateId), st.project.aspect));
      }
      if (k === "pageup") return done(), st.gotoSlide(-1);
      if (k === "pagedown") return done(), st.gotoSlide(1);

      // Layers
      if (mod && e.key === "]") return done(), st.layer(e.shiftKey ? "front" : "forward");
      if (mod && e.key === "[") return done(), st.layer(e.shiftKey ? "back" : "backward");
      if (mod && e.code === "BracketRight") return done(), st.layer(e.shiftKey ? "front" : "forward");
      if (mod && e.code === "BracketLeft") return done(), st.layer(e.shiftKey ? "back" : "backward");

      // Zoom
      if (mod && (k === "=" || k === "+")) return done(), st.setZoom(Math.min(4, (st.zoom === "fit" ? 0.5 : st.zoom) * 1.2));
      if (mod && k === "-") return done(), st.setZoom(Math.max(0.1, (st.zoom === "fit" ? 0.5 : st.zoom) / 1.2));
      if (mod && k === "0") return done(), st.setZoom("fit");

      // Panels
      if (e.altKey && /^[1-7]$/.test(e.key)) return done(), st.setLeftTab(TAB_KEYS[+e.key - 1]);

      if (mod || e.altKey) return;

      // Delete / escape
      if (k === "delete" || k === "backspace") return has && (done(), st.deleteSelected());
      if (k === "escape") return st.modal ? st.setModal(null) : st.select([]);

      // Arrows: nudge selection, or switch slides
      const arrows: Record<string, [number, number]> = { arrowleft: [-1, 0], arrowright: [1, 0], arrowup: [0, -1], arrowdown: [0, 1] };
      if (arrows[k]) {
        done();
        if (has) {
          const m = e.shiftKey ? 10 : 1;
          return st.nudge(arrows[k][0] * m, arrows[k][1] * m);
        }
        if (k === "arrowleft") return st.gotoSlide(-1);
        if (k === "arrowright") return st.gotoSlide(1);
        return;
      }

      if (k === "enter" && st.selectedIds.length === 1) {
        const slide = st.project.slides.find((s) => s.id === st.activeSlideId)!;
        const el = slide.elements.find((x) => x.id === st.selectedIds[0]);
        if (el?.type === "text") return done(), st.setEditing(el.id);
      }

      const H = slideHeight(st.project.aspect);
      if (k === "t") {
        done();
        const el = text({ text: "Double-click to edit", size: 56, weight: 600, font: "$heading", w: 760 });
        st.addElement(el, { center: true });
        requestAnimationFrame(() => useEditor.getState().setEditing(el.id));
        return;
      }
      if (k === "r") return done(), st.addElement(shape("rect", { w: 420, h: 420, y: H / 2 - 210 }), { center: true });
      if (k === "o") return done(), st.addElement(shape("ellipse", { w: 420, h: 420 }), { center: true });
      if (k === "p") return done(), st.setModal("preview");
      if (e.key === "?") return done(), st.setModal("shortcuts");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
