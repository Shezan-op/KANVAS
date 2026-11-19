"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, MonitorDown, X } from "lucide-react";
import { LogoMark } from "./Logo";
import { cn } from "./cn";

/**
 * "Install KANVAS" as a desktop app (PWA). Chrome and Edge offer a real install
 * prompt; Safari on a Mac gets the one-line instruction it needs instead.
 * Nothing shows once KANVAS is running as an installed app.
 */

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferred: InstallEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // we show our own, better-timed prompt
    deferred = e as InstallEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferred = null;
    emit();
  });
}

const standalone = () => typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true);
const macSafari = () => typeof navigator !== "undefined" && /Macintosh/.test(navigator.userAgent) && /^((?!chrome|chromium|android|edg).)*safari/i.test(navigator.userAgent);

type InstallState = "prompt" | "safari" | "none";
let snapshot: InstallState = "none";
const read = (): InstallState => {
  const next: InstallState = installed || standalone() ? "none" : deferred ? "prompt" : macSafari() ? "safari" : "none";
  if (next !== snapshot) snapshot = next;
  return snapshot;
};

export function useInstall() {
  const state = useSyncExternalStore(
    (l) => (listeners.add(l), () => void listeners.delete(l)),
    read,
    () => "none" as InstallState,
  );
  const install = async () => {
    if (!deferred) return false;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    deferred = null;
    emit();
    return outcome === "accepted";
  };
  return { state, install };
}

/** Header button. Only appears when the browser can actually install KANVAS. */
export function InstallButton({ className }: { className?: string }) {
  const { state, install } = useInstall();
  if (state !== "prompt") return null;
  return (
    <button onClick={install} className={cn("inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-[13px] font-medium text-ink-2 transition hover:bg-line hover:text-ink", className)} title="Install KANVAS as an app">
      <Download size={15} /> Install app
    </button>
  );
}

const DISMISS_KEY = "KANVAS-install-dismissed";
const SNOOZE_MS = 1000 * 60 * 60 * 24 * 21;

/** A one-time card in the corner, a few seconds after the dashboard opens. "Not now" hides it for three weeks. */
export function InstallCard() {
  const { state, install } = useInstall();
  const [show, setShow] = useStateDelayed(state !== "none", 4000);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
  };

  return (
    <AnimatePresence>
      {show && state !== "none" && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="fixed right-6 bottom-6 z-40 w-[340px] rounded-2xl bg-panel p-4 shadow-xl ring-1 ring-line"
          role="dialog"
          aria-label="Install KANVAS"
        >
          <button onClick={dismiss} className="absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-line hover:text-ink" aria-label="Close">
            <X size={14} />
          </button>
          <div className="flex gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-bg ring-1 ring-line">
              <LogoMark className="h-7 w-7" />
            </span>
            <div className="min-w-0 pr-5">
              <div className="text-[14px] font-semibold tracking-tight">Install KANVAS on this computer</div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
                {state === "safari" ? (
                  <>
                    In Safari, choose <b className="font-medium text-ink-2">File → Add to Dock</b>. KANVAS then opens in its own window, like any app.
                  </>
                ) : (
                  "Opens in its own window, starts from your dock or taskbar, and your carousels stay right where they are."
                )}
              </p>
            </div>
          </div>
          {state === "prompt" && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={async () => {
                  const ok = await install();
                  if (!ok) dismiss();
                }}
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl bg-ink text-[13px] font-medium text-bg hover:opacity-90"
              >
                <MonitorDown size={15} /> Install
              </button>
              <button onClick={dismiss} className="h-9 rounded-xl px-3 text-[13px] text-ink-2 hover:bg-line">
                Not now
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** true after `delay` ms when `want` holds, unless the user snoozed the card recently. */
function useStateDelayed(want: boolean, delay: number): [boolean, (v: boolean) => void] {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!want) return;
    let snoozed = false;
    try {
      snoozed = Date.now() - Number(localStorage.getItem(DISMISS_KEY) ?? 0) < SNOOZE_MS;
    } catch {}
    if (snoozed) return;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [want, delay, setShow]);
  return [show, setShow];
}
