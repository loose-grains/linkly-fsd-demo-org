import type { IncomingMessage, ServerResponse } from "node:http";

import { buildBoard } from "./board.ts";
import { HttpError, badRequest, notFound } from "./errors.ts";
import { readBody, sendJson, sendStatic } from "./http.ts";
import { isStatus } from "./issue.ts";
import { logger } from "./logger.ts";
import type { IssueStore } from "./store.ts";

export interface RouterContext {
  store: IssueStore;
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

  if (method === "GET" && url.pathname === "/api/board") {
    sendJson(res, 200, { columns: buildBoard(context.store) });
    return;
  }

  if (method === "GET" && url.pathname === "/api/issues") {
    sendJson(res, 200, { issues: context.store.all() });
    return;
  }

  if (method === "POST" && url.pathname === "/api/issues") {
    await handleCreateIssue(req, res, context);
    return;
  }

  const issueMatch = url.pathname.match(/^\/api\/issues\/(\d+)$/);
  if (issueMatch !== null) {
    const id = Number(issueMatch[1]);
    if (method === "GET") {
      handleGetIssue(res, id, context);
      return;
    }
    if (method === "PATCH") {
      await handleUpdateIssue(req, res, id, context);
      return;
    }
  }

  if (method === "GET" && (await sendStatic(res, url.pathname))) {
    return;
  }

  throw notFound("not found");
}

async function handleCreateIssue(
  req: IncomingMessage,
  res: ServerResponse,
  { store }: RouterContext
): Promise<void> {
  const body = await parseJson(req);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title.length === 0) {
    throw badRequest("'title' is required");
  }

  let status = undefined;
  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !isStatus(body.status)) {
      throw badRequest("invalid status");
    }
    status = body.status;
  }

  const assignee =
    body.assignee === undefined
      ? undefined
      : body.assignee === null
        ? null
        : String(body.assignee);

  const issue = store.create({
    title,
    body: typeof body.body === "string" ? body.body : "",
    status,
    assignee,
  });
  logger.info("issue created", { id: issue.id, status: issue.status });
  sendJson(res, 201, issue);
}

function handleGetIssue(
  res: ServerResponse,
  id: number,
  { store }: RouterContext
): void {
  const issue = store.get(id);
  if (issue === undefined) {
    throw notFound("unknown issue");
  }
  sendJson(res, 200, issue);
}

async function handleUpdateIssue(
  req: IncomingMessage,
  res: ServerResponse,
  id: number,
  { store }: RouterContext
): Promise<void> {
  if (store.get(id) === undefined) {
    throw notFound("unknown issue");
  }

  const body = await parseJson(req);
  const patch: {
    title?: string;
    body?: string;
    status?: ReturnType<typeof requireStatus>;
    assignee?: string | null;
  } = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      throw badRequest("'title' must be a non-empty string");
    }
    patch.title = body.title.trim();
  }
  if (body.body !== undefined) {
    if (typeof body.body !== "string") {
      throw badRequest("'body' must be a string");
    }
    patch.body = body.body;
  }
  if (body.status !== undefined) {
    patch.status = requireStatus(body.status);
  }
  if (body.assignee !== undefined) {
    patch.assignee = body.assignee === null ? null : String(body.assignee);
  }

  const issue = store.update(id, patch);
  logger.info("issue updated", {
    id: issue.id,
    status: issue.status,
    assignee: issue.assignee,
  });
  sendJson(res, 200, issue);
}

function requireStatus(value: unknown) {
  if (typeof value !== "string" || !isStatus(value)) {
    throw badRequest("invalid status");
  }
  return value;
}

async function parseJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  try {
    const raw = await readBody(req);
    const parsed = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw badRequest("invalid JSON body");
    }
    return parsed as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw badRequest("invalid JSON body");
  }
}
