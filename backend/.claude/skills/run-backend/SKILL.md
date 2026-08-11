---
name: run-backend
description: Build, run, and drive the NestJS backend API (auth, matches, sessions, chats, plans, admin). Use when asked to start the backend, bring up its Postgres/Redis dependencies, exercise a real signup/login/protected-route flow, or verify a change to a controller/service/DTO works against a live server, not just its jest specs.
---

The backend is a REST + WebSocket API with no UI of its own — it's driven
with `curl`. Bring up Postgres/Redis, apply migrations, launch the server,
then run `.claude/skills/run-backend/smoke.sh`, which does all of that and
exercises a real signup -> cookie auth -> protected route -> logout flow.

All paths below are relative to `backend/`. The docker-compose file lives
one level up, at the repo root.

## Prerequisites

Docker (for Postgres + Redis via the repo-root `docker-compose.yaml`),
Node 20+, pnpm 10.21+. Verified with Docker 29.6.1 / Compose v5.2.0, Node
24.12.0, pnpm 10.21.0. On Windows, Docker Desktop must actually be running
before `docker compose up` — if it isn't, the command fails immediately
with `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`;
start Docker Desktop and poll `docker info` until it succeeds (took ~10s
here) before continuing.

## Setup

```bash
pnpm install
```

A `.env` file must exist in `backend/` (see `src/config/env.validation.ts`
for the full Joi schema — required vs optional). At minimum:

```bash
DATABASE_URL=postgresql://postgres:root@localhost:5432/skillswap?schema=public
JWT_SECRET=...
JWT_REFRESH_SECRET=...
OPENAI_API_KEY=...                   # used in-process by backend/src/ai (LangGraph.js)
AWS_REGION=... / AWS_S3_BUCKET_NAME=... / AWS_ACCESS_KEY_ID=... / AWS_SECRET_ACCESS_KEY=...
REDIS_HOST=localhost                 # optional -- omitting it degrades to single-instance in-memory mode
PORT=5200                            # optional, defaults to 5200
CORS_ORIGIN=http://localhost:3000    # optional, that's the default
```

There's no `.env.example`; the shape above is the required-vs-optional
split read straight from the Joi schema. This repo's `backend/.env`
already has all of it filled in.

## Build

No separate build needed to run in dev mode (`start:dev` uses `nest
start --watch`, which compiles on the fly). For a production-style build:
`pnpm build` → `pnpm start:prod` (not exercised by the driver below).

## Run (agent path)

```bash
cd backend
bash .claude/skills/run-backend/smoke.sh
```

This script:

1. `docker compose up -d` from the repo root (Postgres + Redis), polls
   `skillswap_db`'s healthcheck.
2. `pnpm exec prisma generate` + `pnpm exec prisma migrate deploy`.
3. Launches `pnpm start:dev` in the background, polls `GET /health/live`
   until it returns 200 (takes ~15-20s: `nest build` first, then Nest's
   own module bootstrap — don't shortcut the poll with a fixed sleep).
4. Signs up a fresh user (unique name + email per run — see Gotchas),
   confirms the returned cookies authenticate `GET /api/auth/profile` and
   `GET /api/matches/active` (both 401 without cookies, 200 with), logs in
   separately, logs out, confirms the session is dead afterward.
5. Hits the composite `GET /health`, which checks database reachability.
6. Prints `PASS`/`FAIL` per check, kills the backend process on exit via
   a port-based `trap ... EXIT` (see Gotchas), and exits non-zero on any
   failure. **Leaves Postgres/Redis containers running** — they're shared
   dev infra, not the thing under test; `docker compose down` from the
   repo root if you want them gone.

Logs land at `/tmp/backend.log` (server) and `/tmp/prisma-{generate,migrate}.log`.
Override the port with `PORT=5300 bash .claude/skills/run-backend/smoke.sh`.

### Manual curl, for one-off checks

```bash
cd backend
pnpm start:dev &
curl -s http://localhost:5200/health/live   # liveness only, no dependency checks
curl -s -c /tmp/c.txt -X POST http://localhost:5200/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"X1","email":"x1@example.com","password":"Passw0rd123","confirmPassword":"Passw0rd123","knownSkills":["Python"],"skillsToLearn":["Guitar"]}'
curl -s -b /tmp/c.txt http://localhost:5200/api/auth/profile
# stop it (Windows/Git-Bash): bash's $! is not the real Windows PID here -- kill by port instead:
taskkill //F //PID $(netstat -ano | grep ':5200 ' | grep LISTENING | awk '{print $NF}' | head -1)
```

## Run (human path)

```bash
cd backend
pnpm start:dev
```

Foreground, hot-reload on save. Ctrl-C to stop. Same env/dependency
requirements as above.

## Test

```bash
pnpm test
```

Verified: 20 test suites / 20 tests, ~16s, all passing, no external
dependencies needed (Prisma is mocked via `prisma-exports.jest.ts` per
`CLAUDE.md`).

---

## Gotchas

- **`bash`'s `$!` is not the Windows PID under Git-Bash/MSYS.** Backgrounding
  `pnpm start:dev` with `&` and capturing `$!` gives an MSYS-internal PID
  that `taskkill`/`netstat` don't recognize — killing it silently no-ops
  and the server (and the port) stays alive. The driver instead reads the
  real PID off `netstat -ano` for whichever process is bound to the port
  and kills that.
- **`start:dev` takes ~15-20 seconds to become ready**, not instant: `nest
start --watch` first runs a full TS compile ("Found 0 errors, Watching
  for file changes"), _then_ Nest's own bootstrap logs stream in (module
  init, route mapping, `"Nest application successfully started"`). A short
  fixed sleep before the first `curl` will flake — poll `/health/live`
  instead.
- **`User.name` has a `@unique` constraint, not just `email`.** A smoke
  script that varies the email per run but hardcodes the name (e.g.
  `"Smoke Test"`) will pass once, then 409 with `"Name already exists"` on
  every subsequent run against the same database. The driver suffixes
  both with the same timestamp.
- **`POST /api/auth/login` and `/signup` return `201`, not `200`.** Neither
  controller method has an `@HttpCode` override, so they fall through to
  Nest's default status for `@Post()` handlers (201), even though they
  don't return a created resource.
- **Docker Desktop must be started explicitly and polled, not assumed
  running.** `docker compose up` fails instantly with a `npipe` connection
  error if the Docker engine isn't up yet; starting `Docker Desktop.exe`
  and polling `docker info` in a loop (~10s here) is the reliable
  sequence, not a fixed sleep.
