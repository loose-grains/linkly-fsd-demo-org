# Linkly

A small URL shortener service, built as a demo codebase.

Linkly exposes a tiny HTTP API for creating short links and tracking clicks.
It has no external dependencies — everything runs on Node's standard library.

## Running

```bash
LINKLY_API_KEY=my-secret node --experimental-strip-types src/server.ts
```

The server listens on `PORT` (default `3000`).

## API

The write and stats endpoints require an API key in the `x-api-key` header.
Requests are rate limited per key (default: 60 requests per minute).

| Method | Path                    | Auth | Description                          |
| ------ | ----------------------- | ---- | ------------------------------------ |
| POST   | `/api/links`            | yes  | Create a short link (`{ "url": … }`) |
| GET    | `/api/links/:slug/stats`| yes  | Click stats for a link               |
| GET    | `/:slug`                | no   | Redirect to the target URL           |

### Configuration

| Variable                 | Default  | Description                       |
| ------------------------ | -------- | --------------------------------- |
| `PORT`                   | `3000`   | HTTP port                         |
| `LINKLY_API_KEY`         | —        | Shared API key for the beta       |
| `LINKLY_RATE_LIMIT`      | `60`     | Requests allowed per window       |
| `LINKLY_RATE_WINDOW_MS`  | `60000`  | Rate limit window in milliseconds |

## Layout

- `src/server.ts` — HTTP server bootstrap and configuration
- `src/router.ts` — request routing, auth, and handlers
- `src/api-keys.ts` — API key validation
- `src/rate-limiter.ts` — sliding-window rate limiter
- `src/store.ts` — in-memory link storage
- `src/slug.ts` — short-slug generation and validation
- `src/analytics.ts` — click tracking

## Tests

```bash
node --experimental-strip-types --test test/
```
