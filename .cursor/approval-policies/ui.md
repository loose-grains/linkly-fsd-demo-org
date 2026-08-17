# Board UI — Natalie Sampsell

Owner: **Natalie Sampsell** (`natalie-sampsell`).

Applies to `public/**`.

## Reviewer routing

- Request review from **Natalie Sampsell** on UI changes.
- Prefer a quick visual pass in the browser for layout diffs.

## Auto-approve when ALL are true

- Copy, spacing, or color tweaks with no behavior change.
- Bugbot reports no findings that need a human.

## Never auto-approve

- New client-side fetches or status transitions.
- XSS-sensitive rendering changes (unescaped HTML).
