import { Suspense } from "react";
import { Dashboard } from "@/components/editor/Dashboard";

export default function Home() {
  return (
    <Suspense>
      <Dashboard />
    </Suspense>
  );
}
