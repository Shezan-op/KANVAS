import { Suspense } from "react";
import { Dashboard } from "@/components/editor/Dashboard";

export const metadata = { title: "Your carousels — KANVAS" };

export default function AppHome() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
