# Architecture

Linkly is a small URL shortener that runs on Node's standard library — no web
framework, no database. It is intentionally small so the whole request path
fits in your head.

## Request flow

```
        ┌──────────┐   raw req/res   ┌───────────┐
HTTP ──▶│ server.ts │ ───────────────▶│ router.ts │
        └──────────┘                 └─────┬─────┘
                                           │ dispatch by (method, path)
                       ┌───────────────────┼────────────────────┐
                       ▼                    ▼                    ▼
                 handleCreateLink       handleStats         handleRedirect
                       │                    │                    │
                       ▼                    ▼                    ▼
                   store.ts            analytics.ts          store.ts
```

- **`server.ts`** — boots the HTTP server, loads config, wires the shared
  `LinkStore` and `ClickTracker`, and forwards each request to the router.
- **`router.ts`** — the only place that knows about routes. It matches on
  `(method, pathname)`, delegates to a handler, and converts thrown
  `HttpError`s into JSON responses.
- **`store.ts`** — in-memory link storage keyed by slug.
- **`analytics.ts`** — per-slug click counters, deliberately separate from
  storage so the two can evolve independently.
- **`slug.ts`** — generation and validation of short, human-friendly slugs.

## Cross-cutting modules

- **`config.ts`** — the single reader of `process.env`. Everything else takes a
  resolved `Config`, which keeps handlers easy to test.
- **`http.ts`** — tiny request/response helpers (`sendJson`, `readBody`,
  `isHttpUrl`) shared across handlers.
- **`errors.ts`** — `HttpError` plus `badRequest` / `notFound` / `conflict`
  constructors. Handlers throw; the router catches.
- **`logger.ts`** — one-line structured JSON logging.

## Design notes

- **Errors flow up, not sideways.** Handlers never format their own error
  responses; they throw an `HttpError` and let the router's catch translate it.
  This keeps status-code decisions next to the business logic.
- **State lives at the edge.** `LinkStore` and `ClickTracker` are created once in
  `server.ts` and passed in as context, so handlers stay pure and unit-testable.
- **The standard library is enough.** Swapping the in-memory store for a real
  database would touch only `store.ts` and its context wiring.
