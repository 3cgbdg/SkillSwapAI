#!/usr/bin/env bash
# Smoke-drives the NestJS backend: brings up Postgres/Redis, applies
# Prisma migrations, launches the API, then exercises the real
# signup -> cookie auth -> protected route -> logout flow over curl.
# Run from backend/. Repo root is assumed to be one level up.
set -uo pipefail

PORT="${PORT:-5200}"
LOG=/tmp/backend.log
ROOT="$(cd .. && pwd)"

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

echo "== docker compose up (postgres + redis) =="
(cd "$ROOT" && docker compose up -d)
for i in $(seq 1 30); do
  status=$(docker inspect -f '{{.State.Health.Status}}' skillswap_db 2>/dev/null || echo "")
  [ "$status" = "healthy" ] && break
  sleep 1
done

echo "== prisma generate + migrate deploy =="
pnpm exec prisma generate > /tmp/prisma-generate.log 2>&1 || { echo "FAIL: prisma generate"; cat /tmp/prisma-generate.log; exit 1; }
pnpm exec prisma migrate deploy > /tmp/prisma-migrate.log 2>&1 || { echo "FAIL: prisma migrate deploy"; cat /tmp/prisma-migrate.log; exit 1; }

echo "== starting backend on :$PORT =="
pnpm start:dev > "$LOG" 2>&1 &

cleanup() {
  # bash's $! is an MSYS PID under Git-Bash/Windows, not the Windows PID
  # netstat/taskkill recognize -- kill whoever the OS says owns the port.
  win_pid=$(netstat -ano 2>/dev/null | grep ":$PORT " | grep LISTENING | awk '{print $NF}' | head -1)
  if [ -n "${win_pid:-}" ]; then
    taskkill //F //PID "$win_pid" > /dev/null 2>&1
  fi
  # Postgres/Redis are left running (shared dev infra) -- `docker compose down` if you want them gone.
}
trap cleanup EXIT

echo "== waiting for readiness (this takes ~15-20s: nest build + Nest bootstrap) =="
ready=0
for i in $(seq 1 60); do
  if curl -sf "http://localhost:$PORT/health/live" > /dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 1
done
if [ "$ready" -ne 1 ]; then
  echo "FAIL: server never became ready, see $LOG"
  tail -50 "$LOG"
  exit 1
fi

COOKIES=/tmp/backend-smoke-cookies.txt
rm -f "$COOKIES"
SUFFIX="$(date +%s)"
EMAIL="skillgen-$SUFFIX@example.com"
NAME="Smoke Test $SUFFIX"   # name has a unique constraint too -- must vary per run, not just email
PASSWORD="Passw0rd123"

echo "== signup =="
signup_body=$(curl -s -c "$COOKIES" -X POST "http://localhost:$PORT/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$NAME\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"confirmPassword\":\"$PASSWORD\",\"knownSkills\":[\"Python\"],\"skillsToLearn\":[\"Guitar\"]}")
echo "response: $signup_body"
case "$signup_body" in
  *"Successfully signed up"*) echo "PASS: signup" ;;
  *) echo "FAIL: signup"; fail=1 ;;
esac

echo "== authenticated /api/auth/profile (via signup cookies) =="
profile_code=$(curl -s -o /dev/null -w '%{http_code}' -b "$COOKIES" "http://localhost:$PORT/api/auth/profile")
check "GET /api/auth/profile with cookies -> 200" 200 "$profile_code"

echo "== unauthenticated /api/matches/active =="
check "GET /api/matches/active with no cookies -> 401" 401 "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:$PORT/api/matches/active)"

echo "== authenticated /api/matches/active =="
check "GET /api/matches/active with cookies -> 200" 200 "$(curl -s -o /dev/null -w '%{http_code}' -b "$COOKIES" http://localhost:$PORT/api/matches/active)"

echo "== login (separately from signup) =="
rm -f "$COOKIES"
login_code=$(curl -s -o /dev/null -w '%{http_code}' -c "$COOKIES" -X POST "http://localhost:$PORT/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
check "POST /api/auth/login -> 201 (Nest's default POST status, no @HttpCode override)" 201 "$login_code"

echo "== logout invalidates the session =="
curl -s -b "$COOKIES" -c "$COOKIES" -X DELETE "http://localhost:$PORT/api/auth/logout" > /dev/null
check "GET /api/auth/profile after logout -> 401" 401 "$(curl -s -o /dev/null -w '%{http_code}' -b "$COOKIES" http://localhost:$PORT/api/auth/profile)"

echo "== composite /health (db reachability) =="
health_body=$(curl -s "http://localhost:$PORT/health")
echo "response: $health_body"

if [ "$fail" -ne 0 ]; then
  echo "== SMOKE TEST: FAIL =="
  exit 1
fi
echo "== SMOKE TEST: PASS =="
