import { Suspense } from "react";
import { Dashboard } from "@/components/editor/Dashboard";

export const metadata = { title: "Your carousels — Slyd" };

export default function AppHome() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
