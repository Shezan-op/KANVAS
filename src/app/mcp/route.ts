import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createSlydServer } from "@/lib/mcp/server";

/**
 * Remote MCP endpoint: https://tryslyd.vercel.app/mcp (Streamable HTTP, stateless).
 * No auth, no storage: every tool is a pure function of its input, so each
 * request gets a fresh server and nothing is kept between calls.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
};

const withCors = (res: Response) => {
  const h = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS)) h.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
};

async function handle(req: Request) {
  // A person opening /mcp in a browser gets the setup page, not a protocol error.
  if (req.method === "GET" && (req.headers.get("accept") ?? "").includes("text/html")) {
    return Response.redirect(new URL("/agents", req.url), 302);
  }
  const server = createSlydServer();
  const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  await server.connect(transport);
  try {
    return withCors(await transport.handleRequest(req));
  } finally {
    // Stateless: release per-request resources once the response is produced.
    queueMicrotask(() => void server.close().catch(() => {}));
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
