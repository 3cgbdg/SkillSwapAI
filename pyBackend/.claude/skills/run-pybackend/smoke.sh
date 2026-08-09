#!/usr/bin/env bash
# Smoke-drives the pyBackend FastAPI service: launches it, exercises
# /health, the X-Service-Token gate, and both AI routes, then reports
# pass/fail and tears the server down. Run from pyBackend/.
set -uo pipefail

PORT="${PORT:-8000}"
LOG=/tmp/pybackend.log
PY=.venv/Scripts/python.exe   # .venv/bin/python on Linux/macOS

if [ ! -f .env ]; then
  echo "FAIL: pyBackend/.env not found (needs CORS_ORIGIN, PORT, FASTAPI_SERVICE_TOKEN, OPENAI_API_KEY)"
  exit 1
fi
TOKEN=$(grep '^FASTAPI_SERVICE_TOKEN=' .env | cut -d= -f2-)

echo "== starting uvicorn on :$PORT =="
"$PY" -m uvicorn main:app --host 127.0.0.1 --port "$PORT" > "$LOG" 2>&1 &
SERVER_PID=$!

cleanup() {
  # On Windows/Git-Bash, bash's $! is an MSYS PID that taskkill/netstat
  # don't recognize (they only know the real Windows PID) — so kill by
  # whoever the OS says is actually listening on the port instead.
  win_pid=$(netstat -ano 2>/dev/null | grep ":$PORT " | grep LISTENING | awk '{print $NF}' | head -1)
  if [ -n "${win_pid:-}" ]; then
    taskkill //F //PID "$win_pid" > /dev/null 2>&1
  fi
  kill "$SERVER_PID" > /dev/null 2>&1
}
trap cleanup EXIT

echo "== waiting for readiness =="
ready=0
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:$PORT/health" > /dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 0.5
done
if [ "$ready" -ne 1 ]; then
  echo "FAIL: server never became ready, see $LOG"
  cat "$LOG"
  exit 1
fi

fail=0
check() {
  desc="$1"; expected="$2"; actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "PASS: $desc ($actual)"
  else
    echo "FAIL: $desc (expected $expected, got $actual)"
    fail=1
  fi
}

echo "== /health =="
check "GET /health -> 200" 200 "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:$PORT/health)"

echo "== auth gate on /profile/skills =="
check "no token -> 401" 401 "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:$PORT/profile/skills -H 'Content-Type: application/json' -d '{"skillsToLearn":["Guitar"],"knownSkills":["Python"]}')"
check "wrong token -> 401" 401 "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:$PORT/profile/skills -H 'Content-Type: application/json' -H 'X-Service-Token: wrong' -d '{"skillsToLearn":["Guitar"],"knownSkills":["Python"]}')"
check "missing body -> 422" 422 "$(curl -s -o /dev/null -w '%{http_code}' -X POST http://127.0.0.1:$PORT/profile/skills -H 'Content-Type: application/json' -H "X-Service-Token: $TOKEN" -d '{}')"

echo "== real token, /profile/skills (calls OpenAI) =="
resp=$(curl -s -X POST http://127.0.0.1:$PORT/profile/skills -H 'Content-Type: application/json' -H "X-Service-Token: $TOKEN" -d '{"skillsToLearn":["Guitar"],"knownSkills":["Python"]}')
echo "response: $resp"

echo "== real token, /match/active (calls OpenAI) =="
resp2=$(curl -s -X POST http://127.0.0.1:$PORT/match/active -H 'Content-Type: application/json' -H "X-Service-Token: $TOKEN" -d '{"user1":{"name":"A","id":"1","knownSkills":["Python"],"skillsToLearn":["Guitar"]},"user2":{"name":"B","id":"2","knownSkills":["Guitar"],"skillsToLearn":["Python"]}}')
echo "response: $resp2"

if [ "$fail" -ne 0 ]; then
  echo "== SMOKE TEST: FAIL =="
  exit 1
fi
echo "== SMOKE TEST: PASS (auth gate + routing verified; OpenAI reachability depends on a valid OPENAI_API_KEY in .env) =="
