import type { Metadata } from "next";
import { AgentsPage } from "@/components/landing/Agents";

export const metadata: Metadata = {
  title: "Connect your AI agent — KANVAS MCP",
  description: "Let Claude, ChatGPT, Cursor or VS Code create carousels with KANVAS. One URL, no install, no API key.",
  alternates: { canonical: "/agents" },
};

export default function Agents() {
  return <AgentsPage />;
}
