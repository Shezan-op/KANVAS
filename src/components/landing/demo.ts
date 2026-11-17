import { TEMPLATES, projectFromTemplate } from "@/lib/model/templates";
import type { AspectId, Project } from "@/lib/model/types";

/** Deterministic ids so server and client render identical markup. */
export function demoProject(templateId: string, aspect: AspectId = "4:5", brand?: Partial<Project["brand"]>): Project {
  const t = TEMPLATES.find((x) => x.id === templateId) ?? TEMPLATES[0];
  const p = projectFromTemplate(t, aspect);
  p.id = `demo-${t.id}`;
  p.createdAt = p.updatedAt = 0;
  p.slides.forEach((s, i) => {
    s.id = `${t.id}-${i}`;
    s.elements.forEach((e, j) => (e.id = `${t.id}-${i}-${j}`));
  });
  p.brand = { ...p.brand, name: "Ava Reyes", handle: "@avamakes", ...brand };
  return p;
}

const cache = new Map<string, Project>();
export function demo(templateId: string) {
  if (!cache.has(templateId)) cache.set(templateId, demoProject(templateId));
  return cache.get(templateId)!;
}

export const SHOWCASE_IDS = ["editorial", "noir", "aurora", "swiss", "photo", "notebook", "forest", "clay"];
