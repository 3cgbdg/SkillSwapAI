---
name: qa-automation
description: Designs, adds, repairs, and reviews maintainable automated tests for SkillSwapAI using backend Jest/Supertest, frontend Vitest/Testing Library, and Playwright for persistent browser E2E. Use when automating regression coverage, fixing flaky tests, or choosing the right test layer.
---

# QA Automation

## Choose the lowest useful layer

Automate at the layer that proves the behavior with the least fragility:

- backend pure logic/service behavior: Jest `*.spec.ts` beside source;
- controller delegation and error mapping: controller Jest specs;
- Nest HTTP wiring, pipes, cookies, guards, and filters: Supertest integration/E2E;
- frontend component and hook behavior: Vitest plus Testing Library;
- critical full user journeys and browser-only behavior: Playwright Test;
- one-time exploratory UI checks: configured Playwright MCP, not a committed suite.

Do not add duplicate coverage solely to increase test counts or coverage percentage.

## Build from a failing risk

1. Name the acceptance criterion or regression risk.
2. Inspect existing nearby tests and reuse their factories/mocks/style.
3. Demonstrate the gap or failure with the narrowest meaningful test when practical.
4. Implement deterministic setup, action, and user-observable assertions.
5. Run the focused test until stable, then the related package suite.
6. Report the exact tests run and any broader suite not run.

## Backend rules

- Use the repository's Jest configuration and Prisma Jest export mapping. Never import generated Prisma internals directly.
- Mock external boundaries (OpenAI, S3, Redis, queue transport) in unit tests, but assert the contract sent to them.
- Prefer real DTO/pipe/module wiring in Supertest tests intended to prove HTTP validation or guards.
- Use `request.agent()` when the flow depends on auth cookies.
- Test ownership and cross-user isolation for user-scoped resources.
- For queued AI work, assert enqueue behavior separately from processor behavior and socket notification.
- Use fake timers only when the behavior genuinely depends on time; restore them after each test.
- Ensure created app/module/Redis/server handles close in teardown so Jest exits cleanly.

Focused command:

```bash
pnpm --dir backend test -- <name-pattern> --runInBand
```

## Frontend rules

- Query by role, label, and visible text. Test IDs are a last resort.
- Assert what the user sees or can do, not hook implementation details.
- Wrap the component with the same Query/Redux/router providers it uses in production; extract a shared test renderer when repetition becomes meaningful.
- Mock at the network/service boundary. Keep mock payloads aligned with frontend types and backend contracts.
- Test loading, empty, success, error, and refetch/realtime invalidation when those states exist.
- Avoid snapshots for interactive behavior; use targeted semantic assertions.

Focused command:

```bash
pnpm --dir frontend exec vitest run <test-file>
```

## Persistent browser E2E

The repository currently has Playwright MCP configuration, but a committed `@playwright/test` suite may not exist. Add persistent Playwright infrastructure only when browser automation is requested.

When adding it:

1. Install `@playwright/test` in `frontend` with pnpm and add explicit test scripts.
2. Add a config with base URL, trace/screenshot/video retention on failure, bounded timeouts, and a web-server strategy appropriate to local/CI use.
3. Keep E2E tests outside `frontend/src` unless the existing project convention says otherwise.
4. Create isolated test users/data through an API or seed fixture; do not depend on execution order.
5. Use storage state only when it does not hide the auth behavior being tested.
6. Wait on user-visible state or specific network/socket outcomes, never arbitrary sleeps.
7. Retain evidence only on failure and avoid recording secrets.

Do not claim cross-browser coverage unless each named browser project actually ran.

## Flake control

- One test owns its mutable data.
- No dependency on wall-clock dates without a controlled clock.
- No order dependence or shared mutable singleton state.
- No unbounded polling, random sleeps, or blanket retries masking defects.
- Prefer deterministic event/data setup over increasing timeouts.
- If a test is quarantined, record the defect and owner; never silently skip it.

## Review checklist

- [ ] The test protects a named behavior or risk.
- [ ] A product regression makes the test fail for the right reason.
- [ ] Assertions are specific enough to avoid false positives.
- [ ] Data and mocks represent realistic contracts.
- [ ] Auth, ownership, negative, and boundary cases are covered where relevant.
- [ ] Resources and created data are cleaned up safely.
- [ ] Focused and related suites pass without skipped or flaky behavior.
