import { createServer } from "node:http";

import { ClickTracker } from "./analytics.ts";
import { handleRequest, sendJson } from "./router.ts";
import { LinkStore } from "./store.ts";

const PORT = Number(process.env.PORT ?? 3000);

const store = new LinkStore();
const tracker = new ClickTracker();

const server = createServer((req, res) => {
  handleRequest(req, res, { store, tracker }).catch((error) => {
    console.error("unhandled error", error);
    sendJson(res, 500, { error: "internal error" });
  });
});

server.listen(PORT, () => {
  console.log(`linkly listening on :${PORT}`);
});
