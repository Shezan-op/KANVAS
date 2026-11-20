"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  ArrowRight,
  Bot,
  Copy,
  Edit3,
  FileUp,
  FolderKanban,
  Home,
  LayoutGrid,
  Layers,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Tv2,
  Smartphone,
  Download,
  Share2,
  Palette,
  BadgeCheck
} from "lucide-react";
import { ScaledSlide } from "@/components/slide/SlideRenderer";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Toaster, toast } from "@/components/ui/Toast";
import { cn } from "@/components/ui/cn";
import { InstallButton } from "@/components/ui/InstallApp";
import { ASPECTS } from "@/lib/model/constants";
import { TEMPLATES, projectFromTemplate } from "@/lib/model/templates";
import { uid } from "@/lib/model/factory";
import { deleteProject, getPref, importProjectFile, listProjects, saveProject, toggleArchiveProject } from "@/lib/storage";
import type { AspectId, Project } from "@/lib/model/types";
import { useEditor } from "@/store/editor";

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
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [aspect, setAspect] = useState<AspectId>("4:5");
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "archived">("active");
  const [selectedTemplateTag, setSelectedTemplateTag] = useState<string>("all");
  const [menu, setMenu] = useState<string | null>(null);
  const [menuUp, setMenuUp] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const loadProjects = () => {
    listProjects().then((ps) => {
      const live = useEditor.getState().project;
      setProjects(live ? ps.map((p) => (p.id === live.id ? live : p)) : ps);
    });
  };

  useEffect(() => {
    loadProjects();
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
    toast.ok("Duplicated carousel");
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
        loadProjects();
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

  const templatePreviews = useMemo(() => {
    if (!mounted) return [];
    let list = TEMPLATES;
    if (selectedTemplateTag !== "all") {
      list = list.filter((t) => t.tags.includes(selectedTemplateTag));
    }
    return list.map((t) => ({ t, p: projectFromTemplate(t, aspect) }));
  }, [aspect, selectedTemplateTag, mounted]);

  const filteredProjects = useMemo(() => {
    return (projects ?? []).filter((p) => {
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
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans" onClick={() => setMenu(null)}>
      {/* ------------------------------------------------------------- 
          1. APPLE VISION PRO / HIG FLOATING TOP ORNAMENT NAVIGATION 
      ----------------------------------------------------------------- */}
      <header className="sticky top-0 z-40 w-full border-b border-line bg-bg/85 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: Brand + Studio Tag + Navigation Links */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Logo size="md" />
            <div className="hidden h-5 w-px bg-line md:block" />
            <span className="hidden font-mono text-[11px] uppercase tracking-wider text-muted lg:inline-block">
              Visual Creation Studio
            </span>

            {/* Nav Pill Links matching second reference */}
            <nav className="hidden md:flex items-center gap-1.5 ml-2">
              <Link
                href="/app"
                className="flex items-center gap-1.5 rounded-full bg-panel-2 px-3 py-1.5 text-[12.5px] font-medium text-ink shadow-sm"
              >
                <Home size={14} />
                <span>Home</span>
              </Link>
              <a
                href="#projects"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-muted hover:text-ink hover:bg-panel transition-colors"
              >
                <FolderKanban size={14} />
                <span>Projects</span>
              </a>
              <a
                href="#templates"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-muted hover:text-ink hover:bg-panel transition-colors"
              >
                <LayoutGrid size={14} />
                <span>Templates</span>
              </a>
              <button
                onClick={() => create("blank")}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium text-muted hover:text-ink hover:bg-panel transition-colors"
              >
                <BadgeCheck size={14} />
                <span>Brand</span>
              </button>
            </nav>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Search icon trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  const input = document.getElementById("dashboard-search-input");
                  input?.focus();
                }}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-panel-2 hover:text-ink transition-colors"
                title="Search decks"
              >
                <Search size={16} />
              </button>
            </div>

            <ThemeToggle />

            <Link
              href="/agents"
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-panel-2 transition-colors"
            >
              <Bot size={13} /> <span className="hidden sm:inline">Agent MCP</span>
            </Link>

            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1.5 text-[12px] font-medium text-ink hover:bg-panel-2 transition-colors"
            >
              <FileUp size={13} /> <span className="hidden sm:inline">Import</span>
            </button>
            <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />

            <button
              onClick={() => create("blank")}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-[13px] font-semibold text-bg shadow-sm hover:opacity-90 active:scale-95 transition-all"
            >
              <Plus size={15} /> <span>New Deck</span>
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------- 
          2. HERO LAUNCHPAD: EDITORIAL STATEMENT & INSTANT ACTION
      ----------------------------------------------------------------- */}
      <section className="relative overflow-hidden border-b border-line bg-bg-2 py-10 sm:py-16 px-4 sm:px-6">
        {/* Subtle Spatial Green Glow Mesh Backdrop matching second reference screenshot */}
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden opacity-30 dark:opacity-45">
          <div className="h-[380px] w-[620px] rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-500/25 to-transparent blur-[110px] -translate-y-8 translate-x-32" />
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-muted">
                <Sparkles size={12} className="text-ink" /> Local-First &bull; Offline PWA &bull; Native MCP
              </div>
              <h1 className="mt-4 font-serif text-[38px] sm:text-[48px] md:text-[56px] font-normal leading-[1.02] tracking-tight text-ink">
                Create carousels that <em className="italic font-normal">command attention</em>.
              </h1>
              <p className="mt-3.5 text-[15px] sm:text-[16px] text-muted leading-relaxed max-w-xl">
                High-contrast typography, precision layouts, and client-side instant rendering for LinkedIn, Instagram, and X.
              </p>

              {/* Action Buttons matching screenshot */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => create("blank")}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-[14px] font-semibold text-bg shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <Plus size={16} />
                  <span>Start a Carousel</span>
                </button>
                <a
                  href="#templates"
                  className="inline-flex items-center gap-2 rounded-xl border border-line bg-panel/80 backdrop-blur-md px-5 py-3 text-[14px] font-medium text-ink transition-all hover:bg-panel hover:border-ink"
                >
                  <Tv2 size={16} className="text-muted" />
                  <span>See How It Works</span>
                </a>
              </div>
            </div>

            {/* Visual Canvas Aspect Ratio Card */}
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-panel/90 backdrop-blur-xl p-5 shadow-xl w-full lg:w-[480px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold text-[14px] text-ink">
                  <SlidersHorizontal size={15} className="text-muted" />
                  <span>Canvas Aspect Ratio</span>
                </div>
                <span className="text-[12px] text-muted hidden sm:inline">Choose the right size for your content.</span>
              </div>

              {/* Visual aspect boxes with smooth spatial cards */}
              <div className="grid grid-cols-5 gap-2.5 mt-2">
                {[
                  { id: "1:1" as AspectId, name: "Square", sub: "1:1", iconClass: "w-5 h-5 rounded-[4px]" },
                  { id: "4:5" as AspectId, name: "Portrait", sub: "4:5", iconClass: "w-4 h-5.5 rounded-[4px]" },
                  { id: "3:4" as AspectId, name: "Tall", sub: "3:4", iconClass: "w-4 h-6 rounded-[4px]" },
                  { id: "9:16" as AspectId, name: "Story", sub: "9:16", iconClass: "w-3 h-6.5 rounded-[3px]" },
                  { id: "16:9" as AspectId, name: "Wide", sub: "16:9", iconClass: "w-6 h-3.5 rounded-[3px]" },
                ].map((item) => {
                  const isSelected = aspect === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAspect(item.id)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 py-3.5 px-1 rounded-xl border text-center transition-all",
                        isSelected
                          ? "bg-ink text-bg border-ink shadow-md scale-[1.02]"
                          : "border-line bg-panel-2/40 text-muted hover:border-ink hover:text-ink hover:bg-panel-2"
                      )}
                    >
                      <div className={cn("border-2 flex items-center justify-center transition-colors", item.iconClass, isSelected ? "border-bg" : "border-muted/60")} />
                      <span className="text-[12px] font-medium leading-none">{item.name}</span>
                      <span className={cn("text-[10px] font-mono leading-none", isSelected ? "opacity-80" : "opacity-60")}>{item.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- 
          3. TEMPLATES GALLERY (HORIZONTAL FLUID CURATION)
      ----------------------------------------------------------------- */}
      <section className="py-10 px-6 border-b border-line">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-semibold text-ink">Curated Slide Archetypes</h2>
              <p className="text-[13px] text-muted">Select a starting design to launch the editor immediately.</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Styles" },
                { id: "pro", label: "Obsidian / Dark" },
                { id: "vision-pro", label: "Spatial Glass" },
                { id: "editorial", label: "Minimalist Mono" },
                { id: "serif", label: "Editorial Serif" },
                { id: "bold", label: "Poster Bold" }
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setSelectedTemplateTag(pill.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[11.5px] font-medium transition-colors whitespace-nowrap",
                    selectedTemplateTag === pill.id
                      ? "bg-ink text-bg"
                      : "bg-panel text-muted border border-line hover:text-ink"
                  )}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="no-scrollbar -mx-6 flex gap-5 overflow-x-auto px-6 pb-2 md:mx-0 md:px-0">
            {templatePreviews.map(({ t, p }) => (
              <motion.button
                key={t.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => create(t.id)}
                className="group flex w-[210px] shrink-0 flex-col text-left cursor-pointer"
              >
                <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border border-line bg-panel shadow-sm transition-all duration-300 group-hover:border-ink group-hover:shadow-md">
                  <ScaledSlide width={210} slide={p.slides[0]} doc={p} index={0} total={p.slides.length} />
                  <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <span className="rounded-full bg-bg px-3.5 py-1.5 text-[12px] font-semibold text-ink shadow-md">
                      Open Canvas &rarr;
                    </span>
                  </div>
                </div>
                <div className="mt-3 text-[14px] font-semibold text-ink">{t.name}</div>
                <div className="text-[12px] text-muted line-clamp-1">{t.description}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- 
          4. WORKSPACE PROJECTS SHELF (ACTIVE / ARCHIVED / MANAGEMENT)
      ----------------------------------------------------------------- */}
      <section className="flex-1 py-8 sm:py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-[20px] sm:text-[22px] font-semibold tracking-tight text-ink flex items-center gap-2">
                <FolderKanban size={20} className="text-muted" /> Your Projects
              </h2>
              <p className="text-[13px] text-muted mt-0.5">Manage and continue your carousel projects.</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Status Segmented Tabs */}
              <div className="flex items-center gap-1 rounded-full border border-line bg-panel p-1">
                <button
                  onClick={() => setActiveTab("active")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                    activeTab === "active" ? "bg-ink text-bg" : "text-muted hover:text-ink"
                  )}
                >
                  <Layers size={13} />
                  <span>Active ({counts.active})</span>
                </button>
                <button
                  onClick={() => setActiveTab("archived")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                    activeTab === "archived" ? "bg-ink text-bg" : "text-muted hover:text-ink"
                  )}
                >
                  <Archive size={13} />
                  <span>Archived ({counts.archived})</span>
                </button>
                <button
                  onClick={() => setActiveTab("all")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                    activeTab === "all" ? "bg-ink text-bg" : "text-muted hover:text-ink"
                  )}
                >
                  <span>All ({counts.all})</span>
                </button>
              </div>

              <button
                onClick={() => create("blank")}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-bg hover:opacity-90 transition-opacity"
              >
                <Plus size={14} /> Blank Project
              </button>
            </div>
          </div>

          {projects === null ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-4/5 rounded-2xl border border-line bg-panel animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-panel/50 py-14 px-6 text-center shadow-sm">
              {/* Stacked 3D Card Graphic matching screenshot */}
              <div className="relative mb-6 h-24 w-28 flex items-center justify-center">
                <div className="absolute h-18 w-16 -rotate-12 -translate-x-3 rounded-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5 shadow-lg backdrop-blur-md dark:border-white/15" />
                <div className="absolute h-18 w-16 rotate-0 translate-y-0 rounded-lg border border-white/15 bg-gradient-to-br from-white/15 to-white/10 shadow-xl backdrop-blur-md dark:border-white/20" />
                <div className="absolute h-18 w-16 rotate-12 translate-x-3 rounded-lg border border-white/20 bg-gradient-to-br from-white/20 to-white/10 shadow-2xl backdrop-blur-md dark:border-white/25" />
              </div>

              <div className="font-serif text-[32px] sm:text-[38px] font-normal italic text-ink">
                {q ? "No matching decks found" : activeTab === "archived" ? "Archive is empty" : "No carousels yet"}
              </div>
              <p className="mt-2.5 max-w-sm text-[13.5px] sm:text-[14.5px] text-muted leading-relaxed">
                {q ? "Try clearing your search keyword." : "Select a curated template or start with a blank canvas to create your first project."}
              </p>
              {!q && (
                <button
                  onClick={() => create("blank")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-6 py-3 text-[14px] font-semibold text-bg shadow-md transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <Plus size={16} /> <span>Start with Blank Canvas</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence>
                {filteredProjects.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                    className="group relative flex flex-col"
                  >
                    <Link href={`/app/edit?id=${p.id}`} className="block">
                      <div className="relative">
                        {p.slides[1] && (
                          <div className="absolute inset-0 translate-x-2 -translate-y-1 rotate-[3deg] overflow-hidden rounded-2xl opacity-50 transition-transform duration-500 group-hover:translate-x-4 group-hover:rotate-[6deg]">
                            <ScaledSlide width={240} slide={p.slides[1]} doc={p} index={1} total={p.slides.length} />
                          </div>
                        )}
                        <div className="relative overflow-hidden rounded-2xl border border-line bg-panel shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-ink group-hover:shadow-md">
                          <ScaledSlide width={240} slide={p.slides[0]} doc={p} index={0} total={p.slides.length} />
                        </div>
                      </div>
                    </Link>

                    <div className="mt-3 flex items-start justify-between gap-2 px-1">
                      <div className="min-w-0 flex-1">
                        <Link href={`/app/edit?id=${p.id}`} className="block truncate text-[14px] font-semibold text-ink hover:underline">
                          {p.name}
                        </Link>
                        <div className="text-[12px] text-muted flex items-center gap-1.5 mt-0.5">
                          <span>{p.slides.length} slides</span>
                          <span>&bull;</span>
                          <span className="font-mono">{p.aspect}</span>
                          <span>&bull;</span>
                          <span suppressHydrationWarning>{timeAgo(p.updatedAt)}</span>
                          {p.archived && (
                            <span className="rounded bg-muted/20 px-1.5 py-0.2 text-[10px] uppercase font-mono text-muted">Archived</span>
                          )}
                        </div>
                      </div>

                      {/* Dropdown Menu */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuUp(window.innerHeight - e.currentTarget.getBoundingClientRect().bottom < 150);
                            setMenu(menu === p.id ? null : p.id);
                          }}
                          className="grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-panel-2 hover:text-ink transition-colors"
                          aria-label="Options"
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
                                "absolute right-0 z-30 w-44 rounded-xl border border-line bg-panel p-1.5 shadow-xl",
                                menuUp ? "bottom-full mb-1 origin-bottom-right" : "top-full mt-1 origin-top-right"
                              )}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link
                                href={`/app/edit?id=${p.id}`}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px] text-ink hover:bg-panel-2"
                              >
                                <Edit3 size={14} /> Open in Editor
                              </Link>

                              <button
                                onClick={() => (duplicate(p), setMenu(null))}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px] text-ink hover:bg-panel-2"
                              >
                                <Copy size={14} /> Duplicate
                              </button>

                              <button
                                onClick={() => (archive(p), setMenu(null))}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px] text-ink hover:bg-panel-2"
                              >
                                {p.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                                {p.archived ? "Unarchive" : "Archive"}
                              </button>

                              <div className="my-1 h-px bg-line" />

                              <button
                                onClick={() => (remove(p), setMenu(null))}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12.5px] text-red-500 hover:bg-red-500/10"
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
        </div>

        {/* Get Started Quick Action Grid (matching reference image) */}
        <div className="mx-auto max-w-7xl mt-12 pt-8 border-t border-line">
          <div className="mb-4">
            <h3 className="text-[17px] font-semibold text-ink flex items-center gap-2">
              <Sparkles size={16} className="text-muted" /> Get Started
            </h3>
            <p className="text-[13px] text-muted">Choose a quick action to create, explore, or learn.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              href="#templates"
              className="group flex items-center justify-between p-4 rounded-xl border border-line bg-panel hover:bg-panel-2 hover:border-ink transition-all"
            >
              <div className="flex items-center gap-3.5">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-panel-2 border border-line text-ink">
                  <Layers size={18} />
                </span>
                <div>
                  <h4 className="text-[14.5px] font-medium text-ink">Browse Templates</h4>
                  <p className="text-[12px] text-muted">Pick from curated slide archetypes</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
            </a>

            <button
              onClick={() => {
                const el = document.getElementById("templates");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group flex items-center justify-between p-4 rounded-xl border border-line bg-panel hover:bg-panel-2 hover:border-ink transition-all text-left"
            >
              <div className="flex items-center gap-3.5">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-panel-2 border border-line text-ink">
                  <Tv2 size={18} />
                </span>
                <div>
                  <h4 className="text-[14.5px] font-medium text-ink">See How It Works</h4>
                  <p className="text-[12px] text-muted">Watch the speed and instant workflow</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- 
          5. MINIMALIST FOOTER
      ----------------------------------------------------------------- */}
      <footer className="border-t border-line py-8 px-6 bg-bg text-[12.5px] text-muted">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink">KANVAS</span>
            <span>&bull;</span>
            <span>Local-First Browser Engine &bull; Zero External Tracking</span>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/Shezan-op/KANVAS" target="_blank" rel="noopener noreferrer" className="hover:text-ink">
              GitHub Repository
            </a>
            <Link href="/agents" className="hover:text-ink">
              MCP API
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
          </div>
        </div>
      </footer>

      <Toaster />
    </div>
  );
}
