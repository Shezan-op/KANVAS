"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Laptop } from "lucide-react";
import { loadProject, saveProject } from "@/lib/storage";
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
      <div className="hidden h-screen flex-col overflow-hidden lg:flex">
        <TopBar />
        <div className="flex min-h-0 flex-1">
          <LeftPanel />
          <main className="flex min-w-0 flex-1 flex-col">
            <div className="min-h-0 flex-1">
              <Canvas />
            </div>
            <Filmstrip />
          </main>
          <Inspector />
        </div>
      </div>
      <SmallScreen />
      <Modals />
      <Toaster />
    </>
  );
}

function SmallScreen() {
  return (
    <div className="grid h-screen place-items-center p-8 text-center lg:hidden">
      <div className="max-w-sm">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-panel shadow-md">
          <Laptop size={28} className="text-accent" />
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight">
          Best on a <span className="font-serif font-normal italic text-accent">laptop</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">The Slyd editor is built for a keyboard and a bigger screen. Open this page on a laptop or desktop (1024px or wider) to keep going. Your carousel is saved.</p>
        <Link href="/" className="mt-6 inline-block rounded-xl bg-ink px-4 py-2 text-[14px] text-bg">
          Back home
        </Link>
      </div>
    </div>
  );
}
