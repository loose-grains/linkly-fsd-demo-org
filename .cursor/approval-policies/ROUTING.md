- product: Board and domain model
  boundary: "{src/board.ts,src/issue.ts,src/store.ts,src/wip.ts}"
  policies:
    - .cursor/approval-policies/board.md

- product: HTTP API
  boundary: "{src/router.ts,src/server.ts,src/http.ts,src/errors.ts,src/config.ts,src/logger.ts,src/api-keys.ts}"
  policies:
    - .cursor/approval-policies/api.md

- product: Board UI
  boundary: "public/**"
  policies:
    - .cursor/approval-policies/ui.md

- product: CI and ownership policy
  boundary: "{.github/**,docs/**,.cursor/approval-policies/**,README.md}"
  policies:
    - .cursor/approval-policies/infra.md
