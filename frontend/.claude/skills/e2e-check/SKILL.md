---
name: e2e-check
description: Drive the running Next.js frontend through a real browser via the `playwright` MCP server to verify a UI change actually works end-to-end, not just that it typechecks or passes vitest. Use whenever CLAUDE.md's "test the golden path in a browser" requirement applies — after touching anything under frontend/src/app or frontend/src/features.
---

This closes a real gap: there is no e2e/browser tooling in this repo
(no Playwright test suite, no Cypress) — `vitest` only covers
unit/component tests. This skill uses the project-scoped `playwright`
MCP server (see `.mcp.json` at the repo root) to actually open the app
in a browser and interact with it, which is what lets you honestly claim
a UI change "works," per CLAUDE.md's rule that UI changes must be
verified in a browser before being reported done.

## Prerequisites

- The `playwright` MCP server must be connected (`claude mcp list`). It
  shells out to `npx @playwright/mcp@latest`, which downloads a browser
  on first run if one isn't cached — that first run will be slow.
- The frontend dev server must be running and reachable. This skill does
  not manage backend/pyBackend — bring those up first (see
  `backend/.claude/skills/run-backend` and
  `pyBackend/.claude/skills/run-pybackend`) if the flow you're testing
  needs real API responses rather than a mocked/loading state.

## Steps

1. Start the frontend dev server if it isn't already running:

   ```bash
   pnpm --dir frontend dev
   ```

   Wait for the "Ready" line (Turbopack) before proceeding — don't
   fire browser actions at a server that hasn't finished its first compile.

2. Identify the golden path for the change you're verifying — the
   specific user flow that exercises it (e.g. "log in, open a match,
   send a chat message"). If it's not obvious from the task, ask rather
   than guessing which flow matters.

3. Use the `playwright` MCP tools to:
   - Navigate to the relevant route under `http://localhost:3000`.
   - Interact with the page the way a user would (click, type, submit)
     to exercise the golden path.
   - Capture a screenshot at the key state(s) that prove the change
     works (e.g. after the action that was just implemented takes effect).
   - Check the browser console for errors/warnings introduced by the
     change, and check network requests for unexpected 4xx/5xx from the
     backend.

4. Also exercise at least one edge case relevant to the change (empty
   state, validation error, slow/failed network request) — not just the
   happy path.

5. Report pass/fail per checked behavior, including any console errors
   or failed requests observed, even if the visual result looked correct.
   A screenshot that looks right with a console error underneath is not
   a pass.

## Notes

- This skill is a verification step, not a test suite — it doesn't
  replace `pnpm --dir frontend test` (vitest), it complements it by
  covering what unit/component tests structurally can't (real rendering,
  real navigation, real network timing).
- If the golden path requires an authenticated session, expect to drive
  the actual login flow first (there's no seeded/bypass session in dev)
  unless a test user already exists from `backend`'s Prisma seed data.
