"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Laptop } from "lucide-react";
import { getPref, loadProject, previousVersionKey, saveProject, setPref } from "@/lib/storage";
import type { Project } from "@/lib/model/types";
import { clearDeletedSlides, restoreDeletedSlides, setOnSlideDeleted, useEditor } from "@/store/editor";
import { Toaster, toast } from "@/components/ui/Toast";
import { LogoMark } from "@/components/ui/Logo";
import { TopBar } from "./TopBar";
import { LeftPanel } from "./LeftPanel";
import { Canvas } from "./Canvas";
import { Filmstrip } from "./Filmstrip";
import { Inspector } from "./Inspector";
import { Modals } from "./Modals";
import { useHotkeys } from "./useHotkeys";
import { filesToPayloads, insertImage } from "./insert";

export function Editor() {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");
  const loaded = useEditor((s) => s.project?.id === id && !!id);
  const [missing, setMissing] = useState(false);

  // Load
  useEffect(() => {
    if (!id) return router.replace("/app");
    let alive = true;
    loadProject(id).then((p) => {
      if (!alive) return;
      if (!p) return setMissing(true);
      useEditor.getState().load(p);
    });
    return () => {
      alive = false;
    };
  }, [id, router]);

  // Autosave (debounced) + flush on tab close
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const flush = async () => {
      const { project, setSaveState } = useEditor.getState();
      if (!project) return;
      setSaveState("saving");
      try {
        await saveProject(project);
        if (useEditor.getState().project === project) setSaveState("saved");
      } catch {
        setSaveState("error");
      }
    };
    const unsub = useEditor.subscribe((s, prev) => {
      if (s.project !== prev.project && prev.project && s.project?.id === prev.project.id) {
        clearTimeout(t);
        t = setTimeout(flush, 600);
      }
    });
    const before = () => {
      if (useEditor.getState().saveState === "dirty") flush();
    };
    window.addEventListener("beforeunload", before);
    return () => {
      unsub();
      clearTimeout(t);
      window.removeEventListener("beforeunload", before);
      if (useEditor.getState().saveState === "dirty") flush();
    };
  }, []);

  // Paste: images from clipboard, otherwise internal clipboard
  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const t = e.target as HTMLElement;
      if (t?.isContentEditable || ["INPUT", "TEXTAREA"].includes(t?.tagName)) return;
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
      e.preventDefault();
      if (files.length) {
        const ps = await filesToPayloads(files);
        ps.forEach((p) => insertImage(p));
        toast.ok("Image pasted");
        return;
      }
      useEditor.getState().paste();
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  useHotkeys();

  // Links from agents can ask to land straight in the phone preview or the export dialog.
  const openParam = params.get("open");
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current || !loaded || (openParam !== "preview" && openParam !== "export")) return;
    opened.current = true;
    router.replace(`/app/edit?id=${id}`);
    setTimeout(() => useEditor.getState().setModal(openParam), 350);
  }, [loaded, openParam, id, router]);
  // An agent's update replaced this carousel: say so, and offer to bring back the version before it.
  const updatedParam = params.get("updated");
  const announced = useRef(false);
  useEffect(() => {
    if (announced.current || !loaded || !updatedParam || !id) return;
    announced.current = true;
    if (openParam !== "preview" && openParam !== "export") router.replace(`/app/edit?id=${id}`);
    toast.info(
      "Carousel updated by your AI agent",
      {
        label: "Undo",
        run: async () => {
          const prev = await getPref<Project | undefined>(previousVersionKey(id), undefined);
          if (!prev) return;
          // Keep the agent's link recognisable, so opening it again re-applies the update.
          const restored = { ...prev, sourceHash: undefined, updatedAt: Date.now() };
          await saveProject(restored);
          await setPref(previousVersionKey(id), undefined);
          useEditor.getState().load(restored);
          toast.ok("Previous version restored");
        },
      },
      { key: "agent-update" },
    );
  }, [loaded, updatedParam, openParam, id, router]);

  // One toast for a run of deletes ("3 slides deleted"), and Undo restores exactly those slides.
  useEffect(() => {
    setOnSlideDeleted((n) =>
      toast.info(n === 1 ? "Slide deleted" : `${n} slides deleted`, { label: "Undo", run: restoreDeletedSlides }, { key: "slide-deleted", onClose: clearDeletedSlides }),
    );
  }, []);

  if (missing)
    return (
      <div className="grid h-screen place-items-center text-center">
        <div>
          <div className="font-serif text-[48px] italic">Not found</div>
          <p className="mt-2 text-muted">This carousel isn&apos;t in this browser. It may have been deleted, or made on another device.</p>
          <Link href="/app" className="mt-6 inline-block rounded-xl bg-ink px-4 py-2 text-[14px] text-bg">
            Back to your carousels
          </Link>
        </div>
      </div>
    );

  if (!loaded)
    return (
      <div className="grid h-screen place-items-center">
        <motion.div animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.08, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}>
          <LogoMark className="h-12 w-12" />
        </motion.div>
      </div>
    );

  return (
    <>
      {/* Universal Desktop & Tablet Workspace */}
      <div className="flex h-screen flex-col overflow-hidden">
        <TopBar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Collapsible/Drawer Left Panel on mobile, fixed on desktop */}
          <div className="hidden lg:flex">
            <LeftPanel />
          </div>
          <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1 overflow-hidden">
              <Canvas />
            </div>
            <Filmstrip />
          </main>
          <div className="hidden xl:flex">
            <Inspector />
          </div>
        </div>
      </div>
      <Modals />
      <Toaster />
    </>
  );
}
