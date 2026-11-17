import { Suspense } from "react";
import { Editor } from "@/components/editor/Editor";

export const metadata = { title: "Editor — Slyd" };

export default function EditPage() {
  return (
    <Suspense>
      <Editor />
    </Suspense>
  );
}
