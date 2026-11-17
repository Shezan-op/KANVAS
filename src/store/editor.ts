"use client";

import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { produce, type Draft } from "immer";
import { SLIDE_W, slideHeight } from "@/lib/model/constants";
import { cloneElement, cloneSlide, reflowForAspect, uid } from "@/lib/model/factory";
import type { AspectId, Project, Slide, SlideElement } from "@/lib/model/types";

export type LeftTab = "templates" | "layouts" | "text" | "photos" | "elements" | "uploads" | "brand";
export type SaveState = "saved" | "saving" | "dirty" | "error";

const HISTORY_LIMIT = 200;
const COALESCE_MS = 700;

interface EditorState {
  project: Project | null;
  past: Project[];
  future: Project[];
  lastKey: string | null;
  lastAt: number;

  activeSlideId: string | null;
  selectedIds: string[];
  editingId: string | null;
  clipboard: { kind: "elements"; items: SlideElement[] } | { kind: "slide"; slide: Slide } | null;

  leftTab: LeftTab;
  zoom: number | "fit";
  saveState: SaveState;
  modal: null | "export" | "preview" | "shortcuts" | "settings";

  load: (p: Project) => void;
  mutate: (recipe: (d: Draft<Project>) => void, opts?: { key?: string; history?: boolean }) => void;
  undo: () => void;
  redo: () => void;

  setActiveSlide: (id: string) => void;
  select: (ids: string[], mode?: "replace" | "toggle" | "add") => void;
  setEditing: (id: string | null) => void;
  setLeftTab: (t: LeftTab) => void;
  setZoom: (z: number | "fit") => void;
  setSaveState: (s: SaveState) => void;
  setModal: (m: EditorState["modal"]) => void;

  // element ops
  addElement: (el: SlideElement, opts?: { center?: boolean }) => void;
  updateElement: (id: string, patch: Partial<SlideElement>, key?: string) => void;
  updateSelected: (fn: (el: Draft<SlideElement>) => void, key?: string) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copy: () => void;
  cut: () => void;
  paste: () => void;
  nudge: (dx: number, dy: number) => void;
  layer: (dir: "front" | "back" | "forward" | "backward") => void;
  align: (mode: "left" | "hcenter" | "right" | "top" | "vcenter" | "bottom") => void;
  selectAll: () => void;

  // slide ops
  addSlide: (slide: Slide, at?: number) => void;
  duplicateSlide: (id?: string) => void;
  deleteSlide: (id?: string) => void;
  moveSlide: (from: number, to: number) => void;
  gotoSlide: (delta: number) => void;
  setAspect: (a: AspectId) => void;
}

const findSlide = (p: Draft<Project> | Project, id: string | null) => p.slides.find((s) => s.id === id) ?? p.slides[0];

export const useEditor = create<EditorState>((set, get) => ({
  project: null,
  past: [],
  future: [],
  lastKey: null,
  lastAt: 0,
  activeSlideId: null,
  selectedIds: [],
  editingId: null,
  clipboard: null,
  leftTab: "templates",
  zoom: "fit",
  saveState: "saved",
  modal: null,

  load: (p) =>
    set({
      project: p,
      past: [],
      future: [],
      activeSlideId: p.slides[0]?.id ?? null,
      selectedIds: [],
      editingId: null,
      saveState: "saved",
    }),

  mutate: (recipe, opts = {}) => {
    const { project, past, lastKey, lastAt } = get();
    if (!project) return;
    const next = produce(project, (d) => {
      recipe(d);
      d.updatedAt = Date.now();
    });
    if (next === project) return;
    const now = Date.now();
    const coalesce = opts.history === false || (opts.key && opts.key === lastKey && now - lastAt < COALESCE_MS);
    set({
      project: next,
      past: coalesce ? past : [...past.slice(-HISTORY_LIMIT + 1), project],
      future: coalesce ? get().future : [],
      lastKey: opts.key ?? null,
      lastAt: now,
      saveState: "dirty",
    });
  },

  undo: () => {
    const { past, project, future } = get();
    if (!past.length || !project) return;
    const prev = past[past.length - 1];
    set({
      project: prev,
      past: past.slice(0, -1),
      future: [project, ...future],
      lastKey: null,
      saveState: "dirty",
      editingId: null,
      selectedIds: get().selectedIds.filter((id) => prev.slides.some((s) => s.elements.some((e) => e.id === id))),
      activeSlideId: prev.slides.some((s) => s.id === get().activeSlideId) ? get().activeSlideId : prev.slides[0]?.id,
    });
  },

  redo: () => {
    const { past, project, future } = get();
    if (!future.length || !project) return;
    const next = future[0];
    set({
      project: next,
      past: [...past, project],
      future: future.slice(1),
      lastKey: null,
      saveState: "dirty",
      editingId: null,
      activeSlideId: next.slides.some((s) => s.id === get().activeSlideId) ? get().activeSlideId : next.slides[0]?.id,
    });
  },

  setActiveSlide: (id) => set({ activeSlideId: id, selectedIds: [], editingId: null }),
  select: (ids, mode = "replace") =>
    set((s) => {
      if (mode === "replace") return { selectedIds: ids, editingId: s.editingId && ids.includes(s.editingId) ? s.editingId : null };
      if (mode === "add") return { selectedIds: Array.from(new Set([...s.selectedIds, ...ids])) };
      const sel = new Set(s.selectedIds);
      ids.forEach((id) => (sel.has(id) ? sel.delete(id) : sel.add(id)));
      return { selectedIds: [...sel], editingId: null };
    }),
  setEditing: (id) => set({ editingId: id, selectedIds: id ? [id] : get().selectedIds }),
  setLeftTab: (t) => set({ leftTab: t }),
  setZoom: (z) => set({ zoom: z }),
  setSaveState: (s) => set({ saveState: s }),
  setModal: (m) => set({ modal: m, editingId: null }),

  addElement: (el, opts = {}) => {
    const { project, activeSlideId } = get();
    if (!project) return;
    const H = slideHeight(project.aspect);
    const placed = { ...el };
    if (opts.center) {
      placed.x = Math.round((SLIDE_W - el.w) / 2);
      placed.y = Math.round((H - el.h) / 2);
    }
    get().mutate((d) => findSlide(d, activeSlideId).elements.push(placed));
    set({ selectedIds: [placed.id], editingId: null });
  },

  updateElement: (id, patch, key) =>
    get().mutate(
      (d) => {
        for (const s of d.slides) {
          const el = s.elements.find((e) => e.id === id);
          if (el) Object.assign(el, patch);
        }
      },
      { key: key ?? `el:${id}:${Object.keys(patch).join(",")}` },
    ),

  updateSelected: (fn, key) => {
    const { selectedIds, activeSlideId } = get();
    if (!selectedIds.length) return;
    get().mutate(
      (d) => {
        const s = findSlide(d, activeSlideId);
        s.elements.filter((e) => selectedIds.includes(e.id)).forEach(fn);
      },
      { key: key ?? `sel:${selectedIds.join(",")}` },
    );
  },

  deleteSelected: () => {
    const { selectedIds, activeSlideId } = get();
    if (!selectedIds.length) return;
    get().mutate((d) => {
      const s = findSlide(d, activeSlideId);
      s.elements = s.elements.filter((e) => !selectedIds.includes(e.id) || e.locked);
    });
    set({ selectedIds: [], editingId: null });
  },

  duplicateSelected: () => {
    const { selectedIds, activeSlideId, project } = get();
    if (!selectedIds.length || !project) return;
    const src = findSlide(project, activeSlideId).elements.filter((e) => selectedIds.includes(e.id));
    const copies = src.map((e) => cloneElement(e));
    get().mutate((d) => findSlide(d, activeSlideId).elements.push(...copies));
    set({ selectedIds: copies.map((c) => c.id) });
  },

  copy: () => {
    const { selectedIds, activeSlideId, project } = get();
    if (!project) return;
    const s = findSlide(project, activeSlideId);
    if (selectedIds.length) {
      set({ clipboard: { kind: "elements", items: s.elements.filter((e) => selectedIds.includes(e.id)).map((e) => structuredClone(e)) } });
    } else {
      set({ clipboard: { kind: "slide", slide: structuredClone(s) } });
    }
  },
  cut: () => {
    get().copy();
    get().deleteSelected();
  },
  paste: () => {
    const { clipboard, activeSlideId, project } = get();
    if (!clipboard || !project) return;
    if (clipboard.kind === "elements") {
      const copies = clipboard.items.map((e) => cloneElement(e, 32));
      get().mutate((d) => findSlide(d, activeSlideId).elements.push(...copies));
      set({ selectedIds: copies.map((c) => c.id), clipboard: { kind: "elements", items: copies } });
    } else {
      const idx = project.slides.findIndex((s) => s.id === activeSlideId);
      get().addSlide(cloneSlide(clipboard.slide), idx + 1);
    }
  },

  nudge: (dx, dy) =>
    get().updateSelected((el) => {
      if (el.locked) return;
      el.x += dx;
      el.y += dy;
    }, "nudge"),

  layer: (dir) => {
    const { selectedIds, activeSlideId } = get();
    if (!selectedIds.length) return;
    get().mutate((d) => {
      const s = findSlide(d, activeSlideId);
      const sel = s.elements.filter((e) => selectedIds.includes(e.id));
      const rest = s.elements.filter((e) => !selectedIds.includes(e.id));
      if (dir === "front") s.elements = [...rest, ...sel];
      else if (dir === "back") s.elements = [...sel, ...rest];
      else {
        const arr = [...s.elements];
        const idxs = arr.map((e, i) => (selectedIds.includes(e.id) ? i : -1)).filter((i) => i >= 0);
        const order = dir === "forward" ? idxs.reverse() : idxs;
        for (const i of order) {
          const j = dir === "forward" ? i + 1 : i - 1;
          if (j < 0 || j >= arr.length || selectedIds.includes(arr[j].id)) continue;
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        s.elements = arr;
      }
    });
  },

  align: (mode) => {
    const { project } = get();
    if (!project) return;
    const H = slideHeight(project.aspect);
    get().updateSelected((el) => {
      const h = el.type === "text" ? measureHeight(el.id) ?? el.h : el.h;
      if (mode === "left") el.x = 96;
      if (mode === "right") el.x = SLIDE_W - 96 - el.w;
      if (mode === "hcenter") el.x = Math.round((SLIDE_W - el.w) / 2);
      if (mode === "top") el.y = 96;
      if (mode === "bottom") el.y = H - 96 - h;
      if (mode === "vcenter") el.y = Math.round((H - h) / 2);
    }, `align:${mode}`);
  },

  selectAll: () => {
    const { project, activeSlideId } = get();
    if (!project) return;
    set({ selectedIds: findSlide(project, activeSlideId).elements.filter((e) => !e.locked).map((e) => e.id) });
  },

  addSlide: (slide, at) => {
    const { project, activeSlideId } = get();
    if (!project) return;
    const idx = at ?? project.slides.findIndex((s) => s.id === activeSlideId) + 1;
    get().mutate((d) => {
      d.slides.splice(idx, 0, slide);
    });
    set({ activeSlideId: slide.id, selectedIds: [], editingId: null });
  },

  duplicateSlide: (id) => {
    const { project, activeSlideId } = get();
    if (!project) return;
    const sid = id ?? activeSlideId;
    const idx = project.slides.findIndex((s) => s.id === sid);
    if (idx < 0) return;
    get().addSlide(cloneSlide(project.slides[idx]), idx + 1);
  },

  deleteSlide: (id) => {
    const { project, activeSlideId } = get();
    if (!project || project.slides.length <= 1) return;
    const sid = id ?? activeSlideId;
    const idx = project.slides.findIndex((s) => s.id === sid);
    get().mutate((d) => {
      d.slides.splice(idx, 1);
    });
    const next = get().project!.slides[Math.max(0, idx - 1)];
    if (sid === activeSlideId) set({ activeSlideId: next.id, selectedIds: [] });
    onSlideDeleted?.();
  },

  moveSlide: (from, to) => {
    if (from === to) return;
    get().mutate((d) => {
      const [s] = d.slides.splice(from, 1);
      d.slides.splice(to, 0, s);
    });
  },

  gotoSlide: (delta) => {
    const { project, activeSlideId } = get();
    if (!project) return;
    const idx = project.slides.findIndex((s) => s.id === activeSlideId);
    const next = project.slides[Math.min(project.slides.length - 1, Math.max(0, idx + delta))];
    if (next) get().setActiveSlide(next.id);
  },

  setAspect: (a) => {
    const { project } = get();
    if (!project || project.aspect === a) return;
    const next = reflowForAspect(project, a);
    get().mutate((d) => {
      d.aspect = next.aspect;
      d.slides = next.slides as Draft<Slide>[];
    });
  },
}));

/** Hook for UI feedback (an "Undo" toast) without the store importing UI code. */
let onSlideDeleted: (() => void) | undefined;
export const setOnSlideDeleted = (fn: () => void) => (onSlideDeleted = fn);

/** Text height is content-driven; read it from the DOM when we need it. */
export function measureHeight(id: string): number | null {
  if (typeof document === "undefined") return null;
  const node = document.querySelector<HTMLElement>(`[data-el="${id}"]`);
  return node ? node.offsetHeight : null;
}

export const useActiveSlide = () =>
  useEditor((s) => (s.project ? s.project.slides.find((x) => x.id === s.activeSlideId) ?? s.project.slides[0] : null));

export const useSelectedElements = () =>
  useEditor(useShallow((s: EditorState) => {
    if (!s.project) return EMPTY;
    const slide = s.project.slides.find((x) => x.id === s.activeSlideId) ?? s.project.slides[0];
    return slide.elements.filter((e) => s.selectedIds.includes(e.id));
  }));

const EMPTY: SlideElement[] = [];
export { uid };
