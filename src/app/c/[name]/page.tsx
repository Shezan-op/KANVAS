import { OpenSpec } from "@/components/editor/OpenSpec";

export const metadata = { title: "Opening carousel — KANVAS", robots: { index: false } };

/**
 * /c/<name>#s=… — the name is only a readable label; the carousel itself is in
 * the fragment after #, which browsers never send to a server.
 */
export default function NamedLink() {
  return <OpenSpec />;
}
