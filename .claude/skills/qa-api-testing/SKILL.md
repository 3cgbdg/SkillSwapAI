---
name: qa-api-testing
description: Tests SkillSwapAI HTTP APIs and asynchronous API outcomes, including cookie authentication, DTO validation, authorization, rate limits, persistence, BullMQ jobs, and Socket.IO notifications. Use for API smoke, integration, negative, contract, or regression testing.
---

# QA API Testing

## Build the contract from code

Before sending requests, inspect:

1. `backend/src/main.ts` for global prefix, validation, filters, CORS, and port behavior.
2. The controller for method, path, guards, throttling, and status behavior.
3. The DTO for required fields, transformations, and boundary rules.
4. The service and Prisma schema for state changes, uniqueness, ownership, and side effects.
5. `backend/types` and the frontend service for the client-visible response contract.

Do not invent a status or payload when the implementation is the current source of truth. Flag an implementation/specification contradiction.

## Check prerequisites

- Confirm the target environment and base URL. Local backend defaults to `http://localhost:5200`.
- Check `/health/live` for process liveness and `/health/ready` for database readiness. Do not treat readiness failure as an endpoint defect.
- Record whether Redis, S3, and the AI provider are configured or using a development fallback.
- Use isolated test accounts. Never print cookie values, passwords, tokens, or secrets.

## Execute a useful API matrix

For each endpoint in scope, select relevant checks:

| Area | Checks |
| --- | --- |
| Transport | method, path, content type, status, response/error shape |
| Input | valid, missing, empty, null, wrong type, malformed, min/max, duplicate, undeclared field |
| Auth | anonymous, valid cookie, expired/missing access token, refresh, logout |
| Authorization | owner, unrelated user, nonexistent resource, already-transitioned resource |
| State | database result, idempotency, duplicate prevention, timestamps, related records |
| Resilience | rate limit, dependency unavailable, retry, timeout, repeated/concurrent request |

The global `ValidationPipe` uses `whitelist` and `forbidNonWhitelisted`, so include at least one unexpected-field case for changed DTO-backed endpoints.

## Preserve authenticated sessions

Use an HTTP client with a cookie jar (`curl -c/-b`, Supertest agent, or an equivalent). Login and refresh tokens are httpOnly cookies, not bearer tokens in the response body.

Example local sequence (use disposable credentials and redact output before reporting):

```bash
curl -i -c qa-cookies.txt \
  -H "Content-Type: application/json" \
  -d @login.json \
  http://localhost:5200/api/auth/login

curl -i -b qa-cookies.txt http://localhost:5200/api/auth/profile
```

Put temporary credential/cookie files outside the repository when practical and remove only files created by the test.

## Verify asynchronous endpoints in two phases

Match generation and skill suggestions enqueue work. For these flows:

1. Assert the immediate HTTP acknowledgment and that duplicate submissions are handled correctly.
2. Observe the relevant `matchReady`, `matchFailed`, or `aiSuggestionsReady` socket event when the environment supports it.
3. Poll/read the authoritative API or database state with a bounded timeout; do not use an unbounded wait.
4. Verify failure state and retry behavior separately from the success path.
5. Report whether Redis adapter/queue processing was active. An in-memory fallback is not equivalent evidence for multi-instance behavior.

## Concurrency and abuse checks

Use low, controlled request counts in local or explicitly authorized test environments. Verify duplicate state transitions and throttling without creating a denial of service. Never load test production unless the user explicitly authorizes the target, rate, duration, and cleanup plan.

## Automate at the correct layer

- Pure service behavior: Jest service specs.
- Controller contract with mocked dependencies: Jest controller specs.
- Full Nest transport/validation/guard wiring: Supertest E2E/integration tests.
- Live environment smoke: scripted HTTP checks with redacted logs.

Use `qa-automation` when adding persistent tests. Run focused tests first, then the relevant package suite.

## Report evidence

For each request capture the case ID, sanitized request, expected status/body/state, actual status/body/state, duration when relevant, and command or test name. A `2xx` alone is not a pass when persistence or asynchronous side effects are part of the contract.
