# HTTP API — Natalie Sampsell

Owner: **Natalie Sampsell** (`natalie-sampsell`).

Applies to router, server bootstrap, HTTP helpers, auth, and config.

## Reviewer routing

- Request review from **Natalie Sampsell** on API surface changes.
- Flag any change that logs secrets, tokens, or assignee PII.

## Auto-approve when ALL are true

- Docs-only or comment-only change in API modules.
- Pure refactor with identical request/response behavior and passing tests.
- Bugbot reports no findings that need a human.

## Never auto-approve

- Auth / API-key validation changes.
- New endpoints without tests.
- Error-handling changes that alter status codes clients rely on.
