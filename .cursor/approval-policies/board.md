# Board and domain model — Natalie Sampsell

Owner: **Natalie Sampsell** (`natalie-sampsell`).

Applies to `src/board.ts`, `src/issue.ts`, `src/store.ts`, and `src/wip.ts`.

These files define issue status, storage, and WIP enforcement. Mistakes show up
as cards vanishing, wrong columns, or overflowing in-progress work.

## Reviewer routing

- Request review from **Natalie Sampsell** on every PR that changes board or store logic.
- Treat WIP-limit changes as high sensitivity — they gate how work moves.

## Auto-approve when ALL are true

- Diff is comments, types, or dead-code cleanup with no behavioral change.
- Or a narrowly scoped bug fix with a new unit test that fails without the fix.
- Bugbot reports no findings that need a human.
- Risk is low.

## Never auto-approve

- Changes to status enums or column ordering.
- WIP limit math or transition rules.
- Store mutations without tests.
