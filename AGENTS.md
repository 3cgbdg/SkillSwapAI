# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Repository shape

Two independently-installed services in one repo (**not** a pnpm workspace — each package has its own `pnpm-lock.yaml` and `node_modules`):

- `frontend/` — Next.js 16 App Router, React 19, Tailwind v4, shadcn (`base-nova` style), TanStack Query + Redux Toolkit, Socket.IO client.
- `backend/` — NestJS 11 core API: auth, chats, sessions, matches, plans, friends, requests, admin. Prisma 7 + Postgres, Redis (cache / throttler / BullMQ / Socket.IO adapter), S3, Sentry. AI calls (match generation, skill suggestions) run in-process via LangGraph.js + `@langchain/openai` (`src/ai/`) against `gpt-4o-mini` — there is no separate Python AI service.

`docker-compose.yaml` only brings up Postgres + Redis, not the app services.

## Commands

pnpm is enforced (`only-allow` + `engine-strict`). Node 20+, pnpm 10.21+.

```bash
# install (root tooling + each package separately)
pnpm install && pnpm --dir frontend install && pnpm --dir backend install

# root aggregate checks (run both packages)
pnpm check          # format:check + lint + check:types + test
pnpm check:types    # frontend tsc, then `prisma generate` + backend tsc
pnpm knip           # unused exports/deps; config in knip.json

# dev servers
pnpm --dir frontend dev            # :3000 (turbopack)
pnpm --dir backend start:dev       # :5200 by default (PORT env)

# tests
pnpm --dir backend test                      # jest, *.spec.ts under backend/src
pnpm --dir backend test -- matches.service   # single file by name pattern
pnpm --dir backend test:ci                   # jest with lcov+text coverage, used by CI
pnpm --dir frontend test                     # vitest run, src/**/*.{test,spec}.{ts,tsx}
pnpm --dir frontend exec vitest run src/utils/user.test.ts

# prisma (run from backend/; config lives in backend/prisma.config.ts)
pnpm --dir backend exec prisma generate
pnpm --dir backend exec prisma migrate dev
pnpm --dir backend exec prisma db seed     # runs `tsx prisma/seed.ts`
```

Git hooks: pre-commit runs lint-staged (Prettier + ESLint, invoked via package-local binaries so it works with a minimal PATH on Windows); pre-push runs `pnpm check:types` and tests (backend + frontend); commit-msg runs commitlint against the Conventional Commits config (`commitlint.config.mjs`).

## Backend architecture

**Global setup (`backend/src/main.ts`)** — every route is prefixed `/api` except `health*`; `ValidationPipe` runs with `whitelist` + `forbidNonWhitelisted` (undeclared DTO fields are a 400, so DTOs must be complete); `ThrottlerGuard` is a global `APP_GUARD` with short/medium/long tiers; logging is pino via `nestjs-pino`.

**Prisma is non-standard.** The client is generated into `backend/src/generated/prisma` (provider `prisma-client`, cjs). Never import `@prisma/client` directly — import types/enums from `src/prisma/prisma-exports.js` (the `.js` extension is required, `module: nodenext`) and inject `PrismaService` from `prisma/prisma.service`. `PrismaService` wires a `pg` `Pool` (max 10) through `@prisma/adapter-pg`. Jest maps `prisma-exports` to `prisma-exports.jest.ts` so specs don't need generated output; `tsc` does, hence `check:types` generates first.

**AI work is async and queued.** Match generation and skill suggestions are enqueued onto the BullMQ `ai` queue (`src/queues/`), processed by `AiQueueProcessor`, which calls `AiService` → an in-process LangGraph graph (`src/ai/graphs/`) that invokes `ChatOpenAI` with a zod-validated structured output (guarded by a cockatiel circuit breaker), writes the `Match` + `Plan`/`Module`s in one transaction, then pushes `matchReady` / `matchFailed` / `aiSuggestionsReady` to the user over `RequestGateway`. HTTP handlers return immediately; the frontend learns the result via socket, not the response.

**Multi-instance safety is deliberate.** Socket.IO uses the Redis adapter (`RedisIoAdapter`); recurring maintenance jobs are registered as BullMQ repeatables in `QueueBootstrapService` (not `@nestjs/schedule` crons) and guarded by Postgres advisory locks (`src/tasks/advisory-lock.util.ts`) so only one instance runs auto-accept. Redis is optional in dev — `buildIoredisOptions` returns null without `REDIS_HOST` and everything falls back to in-memory single-instance behaviour.

**Auth** is JWT in httpOnly cookies (`access_token` 15m / `refresh_token`), set by `CookiesService`; `JwtStrategy` extracts from the cookie and caches the user lookup in Redis for 60s. Google OAuth via `google.strategy.ts`.

Env vars are validated with Joi at boot (`src/config/env.validation.ts`) — add new vars there or the app won't start.

## Frontend architecture

**Design-token discipline is enforced by ESLint**, not convention (`frontend/eslint.config.mjs`):

- Anywhere in `src/**`: Tailwind `gray|neutral|slate|zinc-*` utilities and raw hex colors are errors. Use semantic tokens (`bg-muted`, `text-muted-foreground`, `border-border`, `accent-teach`, `accent-learn`, …) defined in `src/styles/globals.css` (oklch, light/dark).
- In `src/app/**` and `src/features/**` (feature/route code): `className` may not set `rounded-*`, `shadow-*`, `border*`, or arbitrary sizes (`h-[…]`, `text-[…]`, `gap-[…]`). Those belong in a reusable component. Layering: `components/ui/` (shadcn primitives) → `components/composites/` (StatTile, SectionPanel, SkillPill, AsyncBoundary…) → `components/layouts/` (AppShell, PageHeader, SplitPane…) → route code. Composites and layouts are consumed through their `index.ts` barrels.

**`api` returns `response.data`, not the Axios response** (`src/services/axiosInstance.ts`). Service functions are typed as the payload directly. The same interceptor performs single-flight 401 → `/auth/refresh` retry with a queue, and toasts 401/429 centrally — don't add per-call auth error handling.

**Data flow:** `services/*Service.ts` (axios) → `hooks/use*.ts` (TanStack Query, string-array query keys like `["matches"]`) → components. `SocketContext` owns the single socket and reacts to server events by invalidating those query keys, so cache invalidation for realtime updates lives there rather than in feature components. `NEXT_PUBLIC_API_URL` includes the `/api` suffix; the socket URL is derived by stripping it to the origin (Socket.IO would treat a path as a namespace).

Route groups: `(auth)` for login/signup, `(main)` for the app shell, with a nested `(chat)` group for `chats/` and `inbox/`.

## Cross-cutting notes

- Adding a feature usually spans: Prisma model + migration → Nest module (controller/service/DTO) → `types/*.d.ts` in `backend/types` → frontend service → hook → UI, plus a socket event if it needs to be realtime.
- Knip runs in CI (`.github/workflows/quality.yml`, alongside CodeQL in `codeql.yml`); new intentionally-unused exports or deps need an entry in `knip.json`.
- Deploys: backend/frontend build to ECR → ECS (`.github/workflows/{backend,frontend}.yml`).
- Several files still contain `// #region agent log` blocks that POST to `127.0.0.1:7877` (`backend/src/main.ts`, `backend/src/auth/auth.controller.ts`, `frontend/src/services/*.ts`, `frontend/src/app/(main)/dashboard/page.tsx`). These are leftover debug instrumentation — delete them when touching those files rather than copying the pattern.
