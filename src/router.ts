import type { IncomingMessage, ServerResponse } from "node:http";

import type { ClickTracker } from "./analytics.ts";
import { HttpError, badRequest, conflict, notFound } from "./errors.ts";
import { isHttpUrl, readBody, sendJson } from "./http.ts";
import { logger } from "./logger.ts";
import { generateSlug, isValidSlug } from "./slug.ts";
import type { LinkStore } from "./store.ts";

export interface RouterContext {
  store: LinkStore;
  tracker: ClickTracker;
  slugLength: number;
}

export async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse,
  context: RouterContext
): Promise<void> {
  try {
    await route(req, res, context);
  } catch (error) {
    if (error instanceof HttpError) {
      sendJson(res, error.status, { error: error.message });
      return;
    }
    logger.error("unhandled request error", { error: String(error) });
    sendJson(res, 500, { error: "internal error" });
  }
}

async function route(
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

  throw notFound("not found");
}

async function handleCreateLink(
  req: IncomingMessage,
  res: ServerResponse,
  { store, slugLength }: RouterContext
): Promise<void> {
  let body: { url?: string; slug?: string };
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    throw badRequest("invalid JSON body");
  }

  if (body.url === undefined || !isHttpUrl(body.url)) {
    throw badRequest("'url' must be an http(s) URL");
  }

  const slug = body.slug ?? generateSlug(slugLength);
  if (!isValidSlug(slug)) {
    throw badRequest("invalid slug");
  }

  try {
    store.create({ slug, targetUrl: body.url, createdAt: Date.now() });
  } catch {
    throw conflict("slug already taken");
  }

  sendJson(res, 201, { slug, shortUrl: `/${slug}` });
}

function handleStats(
  res: ServerResponse,
  slug: string,
  { store, tracker }: RouterContext
): void {
  if (store.get(slug) === undefined) {
    throw notFound("unknown slug");
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
    throw notFound("unknown slug");
  }
  tracker.recordClick(slug);
  logger.info("redirect", { slug, target: link.targetUrl });
  res.statusCode = 302;
  res.setHeader("location", link.targetUrl);
  res.end();
}
