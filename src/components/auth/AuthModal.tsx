"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, Mail, User, Eye, EyeOff, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { registerUser, loginUser, type Session } from "@/lib/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (session: Session) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        if (!name.trim()) throw new Error("Please enter your name");
        if (!email.trim() || !email.includes("@")) throw new Error("Please enter a valid email");
        if (password.length < 6) throw new Error("Password must be at least 6 characters");
        const account = await registerUser(name, email, password);
        onSuccess({
          user: { id: account.id, name: account.name, email: account.email },
          token: "tok_local",
          loggedInAt: Date.now(),
        });
      } else {
        if (!email.trim()) throw new Error("Please enter your email");
        if (!password) throw new Error("Please enter your password");
        const account = await loginUser(email, password);
        onSuccess({
          user: { id: account.id, name: account.name, email: account.email },
          token: "tok_local",
          loggedInAt: Date.now(),
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-panel p-8 shadow-2xl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 grid h-8 w-8 place-items-center rounded-full text-muted transition hover:bg-panel-2 hover:text-ink"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Apple-style minimalist icon badge */}
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-ink text-bg shadow-lg">
              <Sparkles size={22} />
            </div>

            <h3 className="text-xl font-semibold tracking-tight text-ink">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h3>
            <p className="mt-1 text-[13px] text-muted">
              {mode === "login"
                ? "Sign in to access your local KANVAS workspace"
                : "Experience offline-first, studio-grade carousel design"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-ink-2">Name</label>
                <div className="relative">
                  <User size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="h-11 w-full rounded-xl border border-line bg-panel-2 pl-10 pr-3 text-[14px] text-ink outline-none transition focus:border-ink focus:ring-1 focus:ring-ink"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-ink-2">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-11 w-full rounded-xl border border-line bg-panel-2 pl-10 pr-3 text-[14px] text-ink outline-none transition focus:border-ink focus:ring-1 focus:ring-ink"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-ink-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-line bg-panel-2 pl-10 pr-10 text-[14px] text-ink outline-none transition focus:border-ink focus:ring-1 focus:ring-ink"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted hover:text-ink"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength meter */}
              {mode === "signup" && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex h-1 gap-1 overflow-hidden rounded-full bg-panel-2">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength <= 1 ? "w-1/4 bg-red-500" : strength === 2 ? "w-2/4 bg-amber-500" : strength === 3 ? "w-3/4 bg-blue-500" : "w-full bg-emerald-500"
                      }`}
                    />
                  </div>
                  <span className="mt-1 block text-[11px] text-muted">
                    {strength <= 1 ? "Weak" : strength === 2 ? "Medium" : strength === 3 ? "Good" : "Strong password"}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-[12.5px] text-red-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink font-medium text-[14px] text-bg shadow-sm transition hover:opacity-95 disabled:opacity-50"
            >
              {loading ? (
                "Connecting..."
              ) : mode === "login" ? (
                <>
                  Sign in <ArrowRight size={15} />
                </>
              ) : (
                <>
                  Get Started <CheckCircle size={15} />
                </>
              )}
            </button>
          </form>

          {/* Toggle Login / Signup */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError(null);
              }}
              className="text-[13px] text-muted transition hover:text-ink hover:underline underline-offset-4"
            >
              {mode === "login"
                ? "Don't have an account? Sign up free"
                : "Already have an account? Sign in"}
            </button>
          </div>

          <p className="mt-5 text-center text-[11px] text-muted/70">
            Private, local storage on your device. Zero cloud tracking.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
