# Linkly

A small URL shortener service, built as a demo codebase.

Linkly exposes a tiny HTTP API for creating short links and tracking clicks.
It has no external dependencies — everything runs on Node's standard library.

## Running

```bash
node --experimental-strip-types src/server.ts
```

The server listens on `PORT` (default `3000`).

## API

| Method | Path                    | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| POST   | `/api/links`            | Create a short link (`{ "url": … }`) |
| GET    | `/api/links/:slug/stats`| Click stats for a link               |
| GET    | `/:slug`                | Redirect to the target URL           |

## Layout

- `src/server.ts` — HTTP server bootstrap
- `src/router.ts` — request routing and handlers
- `src/store.ts` — in-memory link storage
- `src/slug.ts` — short-slug generation and validation
- `src/analytics.ts` — click tracking

## Tests

```bash
node --experimental-strip-types --test test/
```
