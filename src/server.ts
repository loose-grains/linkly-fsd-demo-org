import { createServer } from "node:http";

import { loadConfig } from "./config.ts";
import { sendJson } from "./http.ts";
import { logger } from "./logger.ts";
import { handleRequest } from "./router.ts";
import { IssueStore } from "./store.ts";

const config = loadConfig();
const store = new IssueStore();

// Seed a few cards so the board looks alive on first open.
store.create({
  title: "Welcome to Tack",
  body: "A tiny issue tracker for Cursor demos.",
  status: "done",
  assignee: "natalie",
});
store.create({
  title: "Sketch the board API",
  body: "GET /api/board should return columns with issues.",
  status: "in_progress",
  assignee: "natalie",
});
store.create({
  title: "Add WIP limits",
  body: "Keep in-progress and review columns from overflowing.",
  status: "backlog",
});

const server = createServer((req, res) => {
  handleRequest(req, res, { store }).catch((error) => {
    logger.error("unhandled error", { error: String(error) });
    sendJson(res, 500, { error: "internal error" });
  });
});

server.listen(config.port, () => {
  logger.info("tack listening", { port: config.port });
});
