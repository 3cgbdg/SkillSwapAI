---
name: run-pybackend
description: Build, run, and drive the pyBackend FastAPI AI microservice (match/profile skill suggestions via OpenAI). Use when asked to start pyBackend, run its health check, test its endpoints, or verify a change to api/match.py, api/profile.py, or core/prompts.py works against a live server.
---

pyBackend is a small FastAPI service with no UI — it's driven with `curl`.
Launch it in the background, then run `.claude/skills/run-pybackend/smoke.sh`,
which starts uvicorn, polls `/health`, exercises the `X-Service-Token` auth
gate on both AI routes, and cleans up the process on exit.

All paths below are relative to `pyBackend/`.

## Prerequisites

Python 3.12+ (verified with 3.14.0) and the packages in `requirements.txt`.
No OS packages needed — `pip install` covers everything (fastapi, uvicorn,
openai, mangum, python-dotenv, etc).

## Setup

```bash
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt   # .venv/bin/python on Linux/macOS
```

A `.env` file must exist in `pyBackend/` with:

```bash
CORS_ORIGIN=...              # required — app.add_middleware reads this at import time
PORT=8000                    # optional — uvicorn's --port flag is what actually binds
FASTAPI_SERVICE_TOKEN=...    # required — value the driver must send as X-Service-Token
OPENAI_API_KEY=...           # required for /match/active and /profile/skills to actually
                              # complete; without a valid key the routes still route
                              # correctly and return a 500 with OpenAI's auth error
```

There is no `.env.example` — copy the shape above. This repo's `pyBackend/.env`
already has all four set; the smoke script reads `FASTAPI_SERVICE_TOKEN` out of
it directly so you never have to paste the token into a command.

## Build

No build step — FastAPI runs directly from source via uvicorn.

## Run (agent path)

```bash
cd pyBackend
bash .claude/skills/run-pybackend/smoke.sh
```

This launches `uvicorn main:app` on `:8000` in the background, waits for
`/health` to return 200, then runs through:

| check | expects |
|---|---|
| `GET /health` | 200 |
| `POST /profile/skills` with no `X-Service-Token` | 401 |
| `POST /profile/skills` with a wrong token | 401 |
| `POST /profile/skills` with real token, empty body | 422 (DTO validation) |
| `POST /profile/skills` with real token, real body | prints the response (200 + AI suggestions if `OPENAI_API_KEY` is valid; 500 with OpenAI's error otherwise) |
| `POST /match/active` with real token, two `User` bodies | same as above |

It prints `PASS`/`FAIL` per check and a final `SMOKE TEST: PASS/FAIL` line,
kills the uvicorn process on exit (via `trap ... EXIT`), and exits non-zero
if any check failed. Logs from the run land at `/tmp/pybackend.log`.

Override the port with `PORT=8001 bash .claude/skills/run-pybackend/smoke.sh`.

### Manual curl, for one-off checks

```bash
cd pyBackend
.venv/Scripts/python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 &
TOKEN=$(grep '^FASTAPI_SERVICE_TOKEN=' .env | cut -d= -f2-)
curl -s http://127.0.0.1:8000/health
curl -s -X POST http://127.0.0.1:8000/profile/skills \
  -H "Content-Type: application/json" -H "X-Service-Token: $TOKEN" \
  -d '{"skillsToLearn":["Guitar"],"knownSkills":["Python"]}'
# stop it (Windows/Git-Bash): bash's $! is not the real Windows PID here — kill by port instead:
taskkill //F //PID $(netstat -ano | grep ':8000 ' | grep LISTENING | awk '{print $NF}' | head -1)
# Linux/macOS: kill %1, or lsof -ti:8000 -sTCP:LISTEN | xargs -r kill
```

Interactive API docs are also live at `http://127.0.0.1:8000/docs` while the
server is running (confirmed 200).

## Run (human path)

```bash
cd pyBackend
uvicorn main:app --reload --port 8000
```

Same server, foreground, with reload-on-change. Ctrl-C to stop. Only the
backend's `X-Service-Token`-authenticated calls reach this service in
production — hitting it directly with `curl` as above is the intended way
to exercise it standalone.

## Test

No test suite exists in `pyBackend/` (no `tests/` dir, no pytest config) —
the smoke script above is the verification path for this service.

---

## Gotchas

- **The OpenAI key in this repo's `.env` is not currently valid** — real
  calls to `/match/active` and `/profile/skills` return a 500 wrapping
  OpenAI's `invalid_api_key` error. That's still useful signal: it proves
  routing, DTO validation, and the service-token gate all work correctly up
  to the OpenAI call boundary. Don't treat a 500 with `invalid_request_error`
  in the body as a smoke-test failure — treat a 401/403 on the *service
  token* check, or a non-422 on a malformed body, as the real failure
  signals.
- **`user1`/`user2` are two separate FastAPI body params, not nested under
  a wrapper key you'd guess from the Pydantic model alone** — `POST
  /match/active` expects `{"user1": {...}, "user2": {...}}` because FastAPI
  merges multiple `BaseModel` parameters into one JSON body keyed by
  parameter name.
- **CORS_ORIGIN has no fallback** — `app.add_middleware(CORSMiddleware,
  allow_origins=[f"{getenv('CORS_ORIGIN')}"], ...)` runs at import time, so
  a missing `.env` doesn't crash startup (it becomes the literal string
  `"None"` as an allowed origin) but silently breaks browser CORS. `curl`
  won't surface this — only a real browser client would.
- **`$!` is not the Windows PID under Git-Bash/MSYS.** Backgrounding
  uvicorn with `&` and capturing `$!` gives an MSYS-internal PID that
  `taskkill`/`netstat` don't recognize — `taskkill //F //PID "$!"` silently
  fails with `ERROR: The process "<pid>" not found` and the server keeps
  running (verified: `tasklist` showed a *different* PID than `$!` for the
  same process, and `netstat` agreed with `tasklist`, not with `$!`). The
  smoke script's cleanup instead reads the real PID off `netstat -ano` for
  the bound port and kills that.
