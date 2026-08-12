import { createServer } from "node:http";

import { ClickTracker } from "./analytics.ts";
import { loadConfig } from "./config.ts";
import { sendJson } from "./http.ts";
import { logger } from "./logger.ts";
import { handleRequest } from "./router.ts";
import { LinkStore } from "./store.ts";

const config = loadConfig();
const store = new LinkStore();
const tracker = new ClickTracker();

const server = createServer((req, res) => {
  handleRequest(req, res, {
    store,
    tracker,
    slugLength: config.slugLength,
  }).catch((error) => {
    logger.error("unhandled error", { error: String(error) });
    sendJson(res, 500, { error: "internal error" });
  });
});

server.listen(config.port, () => {
  logger.info("linkly listening", { port: config.port });
});
