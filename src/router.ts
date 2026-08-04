import type { IncomingMessage, ServerResponse } from "node:http";

import type { ClickTracker } from "./analytics.ts";
import { generateSlug, isValidSlug } from "./slug.ts";
import type { LinkStore } from "./store.ts";

export interface RouterContext {
  store: LinkStore;
  tracker: ClickTracker;
}

export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  context: RouterContext
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const method = req.method ?? "GET";

  if (method === "POST" && url.pathname === "/api/links") {
    await handleCreateLink(req, res, context);
    return;
  }

  const statsMatch = url.pathname.match(/^\/api\/links\/([^/]+)\/stats$/);
  if (method === "GET" && statsMatch !== null) {
    handleStats(res, statsMatch[1], context);
    return;
  }

  const slugMatch = url.pathname.match(/^\/([^/]+)$/);
  if (method === "GET" && slugMatch !== null) {
    handleRedirect(res, slugMatch[1], context);
    return;
  }

  sendJson(res, 404, { error: "not found" });
}

async function handleCreateLink(
  req: IncomingMessage,
  res: ServerResponse,
  { store }: RouterContext
): Promise<void> {
  let body: { url?: string; slug?: string };
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    sendJson(res, 400, { error: "invalid JSON body" });
    return;
  }

  if (body.url === undefined || !isHttpUrl(body.url)) {
    sendJson(res, 400, { error: "'url' must be an http(s) URL" });
    return;
  }

  const slug = body.slug ?? generateSlug();
  if (!isValidSlug(slug)) {
    sendJson(res, 400, { error: "invalid slug" });
    return;
  }

  try {
    store.create({ slug, targetUrl: body.url, createdAt: Date.now() });
  } catch {
    sendJson(res, 409, { error: "slug already taken" });
    return;
  }

  sendJson(res, 201, { slug, shortUrl: `/${slug}` });
}

function handleStats(
  res: ServerResponse,
  slug: string,
  { store, tracker }: RouterContext
): void {
  if (store.get(slug) === undefined) {
    sendJson(res, 404, { error: "unknown slug" });
    return;
  }
  sendJson(res, 200, tracker.statsFor(slug));
}

function handleRedirect(
  res: ServerResponse,
  slug: string,
  { store, tracker }: RouterContext
): void {
  const link = store.get(slug);
  if (link === undefined) {
    sendJson(res, 404, { error: "unknown slug" });
    return;
  }
  tracker.recordClick(slug);
  res.statusCode = 302;
  res.setHeader("location", link.targetUrl);
  res.end();
}

function isHttpUrl(candidate: string): boolean {
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export function sendJson(
  res: ServerResponse,
  status: number,
  payload: unknown
): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(payload));
}
