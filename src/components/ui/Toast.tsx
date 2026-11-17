"use client";

import { AnimatePresence, motion } from "motion/react";
import { create } from "zustand";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type Toast = { id: number; text: string; kind: "ok" | "error" | "info" };

const useToasts = create<{ items: Toast[]; push: (t: Omit<Toast, "id">) => void; drop: (id: number) => void }>((set) => ({
  items: [],
  push: (t) => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items.slice(-3), { ...t, id }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((x) => x.id !== id) })), t.kind === "error" ? 5200 : 2600);
  },
  drop: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
}));

export const toast = {
  ok: (text: string) => useToasts.getState().push({ text, kind: "ok" }),
  error: (text: string) => useToasts.getState().push({ text, kind: "error" }),
  info: (text: string) => useToasts.getState().push({ text, kind: "info" }),
};

export function Toaster() {
  const items = useToasts((s) => s.items);
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[150] flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.92, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.96, filter: "blur(4px)" }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-ink py-2 pl-3 pr-4 text-[13px] font-medium text-bg shadow-lg"
          >
            {t.kind === "ok" ? <CheckCircle2 size={16} className="text-accent" /> : t.kind === "error" ? <AlertCircle size={16} className="text-red-400" /> : <Info size={16} />}
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
