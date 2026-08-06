import type { IncomingMessage, ServerResponse } from "node:http";

import type { ClickTracker } from "./analytics.ts";
import { isValidApiKey } from "./api-keys.ts";
import { generateSlug, isValidSlug } from "./slug.ts";
import type { LinkStore } from "./store.ts";

export interface RouterContext {
  store: LinkStore;
  tracker: ClickTracker;
  limiter: { allow(key: string, now?: number): boolean };
}

export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  context: RouterContext
): Promise<void> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const method = req.method ?? "GET";

  if (method === "POST" && url.pathname === "/api/links") {
    const apiKey = requireApiKey(req, res, context);
    if (apiKey === null) {
      return;
    }
    await handleCreateLink(req, res, context);
    return;
  }

  const statsMatch = url.pathname.match(/^\/api\/links\/([^/]+)\/stats$/);
  if (method === "GET" && statsMatch !== null) {
    const apiKey = requireApiKey(req, res, context);
    if (apiKey === null) {
      return;
    }
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

/**
 * Authenticate and rate limit an API request. Returns the API key when the
 * request may proceed, or null after writing an error response.
 */
function requireApiKey(
  req: IncomingMessage,
  res: ServerResponse,
  { limiter }: RouterContext
): string | null {
  const header = req.headers["x-api-key"];
  const apiKey = Array.isArray(header) ? header[0] : header;

  if (apiKey === undefined || !isValidApiKey(apiKey)) {
    console.warn(`rejected request with api key: ${apiKey}`);
    sendJson(res, 401, { error: "missing or invalid API key" });
    return null;
  }

  if (!limiter.allow(apiKey)) {
    sendJson(res, 429, { error: "rate limit exceeded" });
    return null;
  }

  return apiKey;
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
