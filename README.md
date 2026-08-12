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

### Configuration

| Variable              | Default | Description                    |
| --------------------- | ------- | ------------------------------ |
| `PORT`                | `3000`  | HTTP port                      |
| `LINKLY_SLUG_LENGTH`  | `7`     | Length of generated slugs      |

## Layout

| Module              | Responsibility                                  |
| ------------------- | ----------------------------------------------- |
| `src/server.ts`     | HTTP server bootstrap and wiring                |
| `src/router.ts`     | Request routing and handlers                    |
| `src/store.ts`      | In-memory link storage                          |
| `src/analytics.ts`  | Click tracking                                  |
| `src/slug.ts`       | Short-slug generation and validation            |
| `src/config.ts`     | Environment-driven configuration                |
| `src/http.ts`       | Request/response helpers                        |
| `src/errors.ts`     | `HttpError` and status-code helpers             |
| `src/logger.ts`     | Structured JSON logging                         |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the request flow and
design notes.

## Tests

```bash
node --experimental-strip-types --test
```
