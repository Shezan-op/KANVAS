"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, ArchiveRestore, Bot, Copy, Edit3, FileUp, MoreHorizontal, Plus, Search, Trash2, FolderKanban } from "lucide-react";
import { ScaledSlide } from "@/components/slide/SlideRenderer";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button, buttonClass } from "@/components/ui/Button";
import { Toaster, toast } from "@/components/ui/Toast";
import { cn } from "@/components/ui/cn";
import { InstallButton, InstallCard } from "@/components/ui/InstallApp";
import { ASPECTS } from "@/lib/model/constants";
import { TEMPLATES, projectFromTemplate } from "@/lib/model/templates";
import { uid } from "@/lib/model/factory";
import { deleteProject, getPref, importProjectFile, listProjects, saveProject, toggleArchiveProject } from "@/lib/storage";
import type { AspectId, Project } from "@/lib/model/types";
import { useEditor } from "@/store/editor";
import { AUTHOR, tracked } from "@/lib/site";
import { StarButton } from "@/components/ui/StarButton";

function timeAgo(t: number) {
  const s = Math.round((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d}d ago` : new Date(t).toLocaleDateString();
}

export function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [aspect, setAspect] = useState<AspectId>("4:5");
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">("active");
  const [menu, setMenu] = useState<string | null>(null);
  const [menuUp, setMenuUp] = useState(false);

  useEffect(() => {
    if (!menu) return;
    const close = (e: Event) => (e.type === "scroll" || (e as KeyboardEvent).key === "Escape") && setMenu(null);
    window.addEventListener("keydown", close);
    window.addEventListener("scroll", close, { passive: true });
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("scroll", close);
    };
  }, [menu]);

  const fileRef = useRef<HTMLInputElement>(null);

  const loadProjectsList = () => {
    listProjects().then((ps) => {
      const live = useEditor.getState().project;
      setProjects(live ? ps.map((p) => (p.id === live.id ? live : p)) : ps);
    });
  };

  useEffect(() => {
    loadProjectsList();
  }, []);

  const create = async (templateId: string) => {
    const t = TEMPLATES.find((x) => x.id === templateId) ?? TEMPLATES[0];
    const p = projectFromTemplate(t, aspect);
    p.brand = await getPref("brand", p.brand);
    if (t.id === "blank") p.theme = await getPref("myTheme", p.theme);
    await saveProject(p);
    router.push(`/app/edit?id=${p.id}`);
  };

  const duplicate = async (p: Project) => {
    const c: Project = { ...structuredClone(p), id: uid(), name: `${p.name} (copy)`, createdAt: Date.now(), updatedAt: Date.now() };
    await saveProject(c);
    setProjects((ps) => [c, ...(ps ?? [])]);
    toast.ok("Duplicated project");
  };

  const archive = async (p: Project) => {
    const isNowArchived = await toggleArchiveProject(p.id);
    setProjects((ps) => (ps ?? []).map((x) => (x.id === p.id ? { ...x, archived: isNowArchived } : x)));
    toast.ok(isNowArchived ? `Archived "${p.name}"` : `Restored "${p.name}"`);
  };

  const remove = async (p: Project) => {
    await deleteProject(p.id);
    setProjects((ps) => (ps ?? []).filter((x) => x.id !== p.id));
    toast.info(`Deleted "${p.name}"`, {
      label: "Undo",
      run: async () => {
        await saveProject(p);
        loadProjectsList();
      },
    });
  };

  const onImport = async (f: File) => {
    try {
      const raw = JSON.parse(await f.text());
      if (Array.isArray(raw?.slides) && raw.slides[0]?.layout && !raw.theme) {
        const json = new TextEncoder().encode(JSON.stringify(raw));
        let bin = "";
        json.forEach((b) => (bin += String.fromCharCode(b)));
        router.push(`/app/new#j=${btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")}`);
        return;
      }
      const p = await importProjectFile(f);
      p.id = uid();
      p.updatedAt = Date.now();
      await saveProject(p);
      router.push(`/app/edit?id=${p.id}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const previews = useMemo(() => TEMPLATES.map((t) => ({ t, p: projectFromTemplate(t, aspect) })), [aspect]);

  const filtered = useMemo(() => {
    return (projects ?? [])
      .filter((p) => {
        const matchesQuery = p.name.toLowerCase().includes(q.toLowerCase());
        if (!matchesQuery) return false;
        if (activeTab === "archived") return !!p.archived;
        if (activeTab === "active") return !p.archived;
        return true;
      });
  }, [projects, q, activeTab]);

  const counts = useMemo(() => {
    const all = (projects ?? []).length;
    const archived = (projects ?? []).filter((p) => p.archived).length;
    const active = all - archived;
    return { all, active, archived };
  }, [projects]);

  return (
    <div className="min-h-screen bg-bg" onClick={() => setMenu(null)}>
      {/* Apple-grade frosted glass sticky header */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-6 md:px-8">
          <Logo size="md" />
          <div className="flex-1" />
          
          <div className="relative w-64 md:w-80">
            <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your carousels & decks..."
              className="h-9 w-full rounded-xl bg-panel pr-3 pl-9 text-[13.5px] shadow-sm outline-none placeholder:text-muted focus:ring-2 focus:ring-ink/20"
            />
          </div>

          <InstallButton />
          <StarButton />

          <Link href="/agents" className={buttonClass("ghost", "sm")}>
            <Bot size={15} /> AI Agents
          </Link>

          <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
            <FileUp size={15} /> Import
          </Button>
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />

          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        {/* Templates Shelf */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted">Create New Carousel</div>
              <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-ink">Choose a starting canvas</h1>
            </div>
            
            {/* Aspect Picker */}
            <div className="flex items-center gap-1 rounded-xl bg-panel p-1 shadow-sm border border-line">
              {(Object.keys(ASPECTS) as AspectId[]).map((a) => (
                <button
                  key={a}
                  onClick={() => setAspect(a)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors",
                    aspect === a ? "bg-ink text-bg shadow-sm" : "text-muted hover:text-ink"
                  )}
                >
                  {ASPECTS[a].label} · {a}
                </button>
              ))}
            </div>
          </div>

          <div className="no-scrollbar -mx-6 flex gap-4 overflow-x-auto px-6 pb-2 md:mx-0 md:px-0">
            {previews.map(({ t, p }) => (
              <motion.button
                key={t.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => create(t.id)}
                className="group flex w-[200px] shrink-0 flex-col text-left"
              >
                <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-line shadow-sm transition-shadow duration-300 group-hover:shadow-md">
                  <ScaledSlide width={200} slide={p.slides[0]} doc={p} index={0} total={p.slides.length} />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-black shadow-md backdrop-blur-md">
                      Start with this
                    </span>
                  </div>
                </div>
                <div className="mt-2.5 text-[13.5px] font-semibold text-ink">{t.name}</div>
                <div className="text-[11.5px] text-muted">{t.description}</div>
              </motion.button>
            ))}
          </div>
        </section>

        {/* User Projects Shelf with Tabs (Active, Archived, All) */}
        <section className="mt-14">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-[22px] font-semibold tracking-tight text-ink flex items-center gap-2">
                <FolderKanban size={20} className="text-muted" /> Projects
              </h2>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 rounded-xl bg-panel p-1 border border-line">
                <button
                  onClick={() => setActiveTab("active")}
                  className={cn(
                    "rounded-lg px-3 py-1 text-[12.5px] font-medium transition-colors",
                    activeTab === "active" ? "bg-ink text-bg" : "text-muted hover:text-ink"
                  )}
                >
                  Active ({counts.active})
                </button>
                <button
                  onClick={() => setActiveTab("archived")}
                  className={cn(
                    "rounded-lg px-3 py-1 text-[12.5px] font-medium transition-colors",
                    activeTab === "archived" ? "bg-ink text-bg" : "text-muted hover:text-ink"
                  )}
                >
                  Archived ({counts.archived})
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "rounded-lg px-3 py-1 text-[12.5px] font-medium transition-colors",
                    activeTab === "all" ? "bg-ink text-bg" : "text-muted hover:text-ink"
                  )}
                >
                  All ({counts.all})
                </button>
              </div>
            </div>

            <button onClick={() => create("blank")} className={buttonClass("primary", "sm")}>
              <Plus size={14} /> New Blank Carousel
            </button>
          </div>

          {projects === null ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton aspect-4/5 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="grid place-items-center rounded-3xl border border-dashed border-line-2 py-20 text-center">
              <div className="text-[32px] font-bold text-ink">
                {q ? "No matching carousels" : activeTab === "archived" ? "No archived projects" : "Your canvas is clean"}
              </div>
              <p className="mt-2 max-w-sm text-[14px] text-muted">
                {q ? "Try clearing your search keyword." : "Choose any starting template above to build your first carousel."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-6 gap-y-8">
              <AnimatePresence>
                {filtered.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                    className="group relative"
                  >
                    <Link href={`/app/edit?id=${p.id}`} className="block">
                      <div className="relative">
                        {p.slides[1] && (
                          <div className="absolute inset-0 translate-x-2 -translate-y-1 rotate-[4deg] overflow-hidden rounded-2xl opacity-60 transition-transform duration-500 group-hover:translate-x-5 group-hover:rotate-[8deg]">
                            <ScaledSlide width={220} slide={p.slides[1]} doc={p} index={1} total={p.slides.length} />
                          </div>
                        )}
                        <div className="relative overflow-hidden rounded-2xl shadow-sm border border-line transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                          <ScaledSlide width={220} slide={p.slides[0]} doc={p} index={0} total={p.slides.length} />
                        </div>
                      </div>
                    </Link>

                    <div className="mt-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/app/edit?id=${p.id}`} className="block truncate text-[14px] font-semibold text-ink hover:underline">
                          {p.name}
                        </Link>
                        <div className="text-[12px] text-muted flex items-center gap-1.5">
                          <span>{p.slides.length} slides</span>
                          <span>&bull;</span>
                          <span>{p.aspect}</span>
                          <span>&bull;</span>
                          <span>{timeAgo(p.updatedAt)}</span>
                          {p.archived && (
                            <span className="rounded bg-muted/20 px-1 text-[10px] uppercase font-mono">Archived</span>
                          )}
                        </div>
                      </div>

                      {/* Project Options Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuUp(window.innerHeight - e.currentTarget.getBoundingClientRect().bottom < 150);
                            setMenu(menu === p.id ? null : p.id);
                          }}
                          className="grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-line hover:text-ink transition-colors"
                          aria-label="More options"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        
                        <AnimatePresence>
                          {menu === p.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: menuUp ? 4 : -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={cn(
                                "absolute right-0 z-20 w-44 rounded-xl bg-panel p-1.5 shadow-xl border border-line",
                                menuUp ? "bottom-full mb-1 origin-bottom-right" : "top-full mt-1 origin-top-right"
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link
                                href={`/app/edit?id=${p.id}`}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-ink hover:bg-line"
                              >
                                <Edit3 size={14} /> Open in Editor
                              </Link>

                              <button
                                onClick={() => (duplicate(p), setMenu(null))}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-ink hover:bg-line"
                              >
                                <Copy size={14} /> Duplicate
                              </button>

                              <button
                                onClick={() => (archive(p), setMenu(null))}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-ink hover:bg-line"
                              >
                                {p.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                                {p.archived ? "Unarchive" : "Archive"}
                              </button>

                              <div className="my-1 h-px bg-line" />

                              <button
                                onClick={() => (remove(p), setMenu(null))}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] text-red-500 hover:bg-red-500/10"
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        <footer className="mt-20 flex items-center justify-between border-t border-line pt-6 text-[12.5px] text-muted">
          <span>Projects saved locally in browser IndexedDB. Zero cloud tracking.</span>
          <a href="https://github.com/Shezan-op/KANVAS" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
            KANVAS on GitHub
          </a>
        </footer>
      </main>

      <Toaster />
      <InstallCard />
    </div>
  );
}
