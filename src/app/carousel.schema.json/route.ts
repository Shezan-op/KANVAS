import { z } from "zod";
import { CarouselSpec } from "@/lib/spec/schema";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** The Carousel Spec as JSON Schema, for agents and tools that don't speak MCP. */
export function GET() {
  const schema = { $id: `${SITE_URL}/carousel.schema.json`, title: "KANVAS Carousel Spec", ...z.toJSONSchema(CarouselSpec) };
  return Response.json(schema, { headers: { "Cache-Control": "public, max-age=3600" } });
}
