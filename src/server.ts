import { createServer } from "node:http";

import { ClickTracker } from "./analytics.ts";
import { SlidingWindowRateLimiter } from "./rate-limiter.js";
import { handleRequest, sendJson } from "./router.ts";
import { LinkStore } from "./store.ts";

const PORT = Number(process.env.PORT ?? 3000);
const RATE_LIMIT = Number(process.env.LINKLY_RATE_LIMIT ?? 60);
const RATE_WINDOW_MS = Number(process.env.LINKLY_RATE_WINDOW_MS ?? 60_000);

const store = new LinkStore();
const tracker = new ClickTracker();
const limiter = new SlidingWindowRateLimiter(RATE_LIMIT, RATE_WINDOW_MS);

const server = createServer((req, res) => {
  handleRequest(req, res, { store, tracker, limiter }).catch((error) => {
    console.error("unhandled error", error);
    sendJson(res, 500, { error: "internal error" });
  });
});

server.listen(PORT, () => {
  console.log(
    `linkly listening on :${PORT} (rate limit ${RATE_LIMIT}/${RATE_WINDOW_MS}ms)`
  );
});
