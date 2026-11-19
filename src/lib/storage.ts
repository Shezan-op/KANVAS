import { createStore, del, get, set, values } from "idb-keyval";
import type { Project, ProjectMeta } from "./model/types";

/**
 * Projects live in IndexedDB (not localStorage) so uploads and long decks
 * don't hit the 5MB ceiling. Everything stays on the user's machine.
 */
const projects = typeof window !== "undefined" ? createStore("KANVAS", "projects") : undefined;
const prefs = typeof window !== "undefined" ? createStore("KANVAS-prefs", "kv") : undefined;

export async function saveProject(p: Project) {
  if (!projects) return;
  await set(p.id, p, projects);
}

export async function loadProject(id: string): Promise<Project | undefined> {
  if (!projects) return undefined;
  return get<Project>(id, projects);
}

export async function deleteProject(id: string) {
  if (!projects) return;
  await del(id, projects);
  if (prefs) await del(`prev:${id}`, prefs);
}

export async function listProjects(): Promise<Project[]> {
  if (!projects) return [];
  const all = await values<Project>(projects);
  return all.sort((a, b) => b.updatedAt - a.updatedAt);
}

export const toMeta = (p: Project): ProjectMeta => ({
  id: p.id,
  name: p.name,
  aspect: p.aspect,
  slideCount: p.slides.length,
  updatedAt: p.updatedAt,
});

export async function getPref<T>(key: string, fallback: T): Promise<T> {
  if (!prefs) return fallback;
  return ((await get<T>(key, prefs)) ?? fallback) as T;
}

export async function setPref<T>(key: string, value: T) {
  if (!prefs) return;
  await set(key, value, prefs);
}

/** Where the previous version of a carousel is kept when an agent's update replaces it (one level of undo). */
export const previousVersionKey = (projectId: string) => `prev:${projectId}`;

/** Portable project file: a single JSON you can share, back up or commit to git. */
export function exportProjectFile(p: Project) {
  const blob = new Blob([JSON.stringify({ $schema: "KANVAS/project@1", project: p }, null, 2)], { type: "application/json" });
  return blob;
}

export async function importProjectFile(file: File): Promise<Project> {
  const json = JSON.parse(await file.text());
  const p: Project = json.project ?? json;
  if (!p || !Array.isArray(p.slides) || !p.theme) throw new Error("That file doesn't look like a KANVAS project.");
  return p;
}
