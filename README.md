# Tack

A tiny issue tracker with a kanban board — demo codebase for Cursor Review,
Bugbot, Approval Agents, cloud agents, and Full Self-Driving.

No external dependencies. Node's standard library only.

## Running

```bash
node --experimental-strip-types src/server.ts
```

Open http://localhost:3000 for the board UI. The server listens on `PORT`
(default `3000`).

## API

| Method | Path                | Description                          |
| ------ | ------------------- | ------------------------------------ |
| GET    | `/api/board`        | Kanban columns with their issues     |
| GET    | `/api/issues`       | All issues                           |
| POST   | `/api/issues`       | Create an issue (`{ "title": … }`)   |
| GET    | `/api/issues/:id`   | Fetch one issue                      |
| PATCH  | `/api/issues/:id`   | Update title / body / status / assignee |

Statuses: `backlog` → `in_progress` → `review` → `done`.

## Layout

| Path | Responsibility |
| ---- | -------------- |
| `src/server.ts` | Bootstrap + seed data |
| `src/router.ts` | HTTP routing |
| `src/store.ts` | Issue storage |
| `src/board.ts` | Board projection |
| `src/issue.ts` | Types + status helpers |
| `public/` | Board UI |
| `.github/CODEOWNERS` | Path owners |
| `.cursor/approval-policies/` | Approval Agent routing |

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Tests

```bash
node --experimental-strip-types --test
```
