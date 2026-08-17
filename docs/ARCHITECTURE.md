# Architecture

Tack is a tiny issue tracker with a kanban board. It runs on Node's standard
library — no web framework, no database — so the whole request path fits in
your head during a demo.

## Request flow

```
        ┌──────────┐   raw req/res   ┌───────────┐
HTTP ──▶│ server.ts │ ───────────────▶│ router.ts │
        └──────────┘                 └─────┬─────┘
                                           │
              ┌────────────────────────────┼──────────────────────┐
              ▼                            ▼                      ▼
         static UI                   /api/board              /api/issues
         (public/)                   board.ts                store.ts
```

- **`server.ts`** — boots HTTP, seeds a few starter issues, wires the store.
- **`router.ts`** — matches routes, validates payloads, converts `HttpError`s.
- **`store.ts`** — in-memory issues keyed by id.
- **`board.ts`** — groups issues into columns for the board API / UI.
- **`issue.ts`** — shared types and status helpers.
- **`public/`** — a small board UI so browsing the repo feels like a product.

## Cross-cutting modules

- **`config.ts`** — single reader of `process.env`.
- **`http.ts`** — `sendJson`, `readBody`, static file serving.
- **`errors.ts`** — `HttpError` helpers.
- **`logger.ts`** — one-line structured JSON logging.

## Ownership

Path ownership lives in `.github/CODEOWNERS`. Approval Agent routing lives in
`.cursor/approval-policies/` — those files are what PR Routing / Approval
Agents read during review.
