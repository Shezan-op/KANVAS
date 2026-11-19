import { createStore, get, set, values } from "idb-keyval";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: number;
}

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
  loggedInAt: number;
}

const authStore = typeof window !== "undefined" ? createStore("kanvas-auth", "users") : undefined;
const SESSION_KEY = "kanvas_session_v1";

// Simple deterministic hash for browser-local auth demonstration
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return "h_" + Math.abs(hash).toString(36) + "_" + str.length;
}

export async function registerUser(name: string, email: string, pass: string): Promise<UserAccount> {
  if (!authStore) throw new Error("Auth storage unavailable");
  const cleanEmail = email.trim().toLowerCase();
  
  // Check duplicate
  const existing = await get<UserAccount>(cleanEmail, authStore);
  if (existing) {
    throw new Error("An account with this email address already exists.");
  }

  const user: UserAccount = {
    id: "usr_" + Math.random().toString(36).substring(2, 10),
    name: name.trim(),
    email: cleanEmail,
    passwordHash: simpleHash(pass),
    createdAt: Date.now()
  };

  await set(cleanEmail, user, authStore);
  setLocalSession({
    user: { id: user.id, name: user.name, email: user.email },
    token: "tok_" + Math.random().toString(36).substring(2, 12),
    loggedInAt: Date.now()
  });

  return user;
}

export async function loginUser(email: string, pass: string): Promise<UserAccount> {
  if (!authStore) throw new Error("Auth storage unavailable");
  const cleanEmail = email.trim().toLowerCase();
  
  const user = await get<UserAccount>(cleanEmail, authStore);
  if (!user) {
    throw new Error("No account found with this email. Please sign up.");
  }

  if (user.passwordHash !== simpleHash(pass)) {
    throw new Error("Incorrect password. Please verify and try again.");
  }

  setLocalSession({
    user: { id: user.id, name: user.name, email: user.email },
    token: "tok_" + Math.random().toString(36).substring(2, 12),
    loggedInAt: Date.now()
  });

  return user;
}

export function getLocalSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalSession(session: Session) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {}
}

export function clearLocalSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}
