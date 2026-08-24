---
name: qa-test-strategy
description: Builds risk-based QA plans, exploratory charters, regression scopes, traceability matrices, and evidence-backed test reports for SkillSwapAI. Use when scoping testing, reviewing requirements, preparing release QA, or reporting test results and defects.
---

# QA Test Strategy

Use this skill to decide what to test and to report what was actually verified. Use `qa-api-testing`, `qa-browser-testing`, or `qa-automation` for execution details.

## 1. Establish the test basis

Read the request, applicable `AGENTS.md`, changed files, related controllers/DTOs/services, frontend routes, and existing tests. Turn the behavior into concrete acceptance criteria.

Classify each criterion as:

- **Explicit**: stated by the user, issue, or product copy.
- **Contract**: enforced by DTOs, types, API handlers, schema, or tests.
- **Inferred**: reasonable behavior not backed by an authoritative specification.

Call out contradictions instead of silently choosing one source.

## 2. Map risks

Score relevant risks with Impact and Likelihood from 1 to 3. Use `Priority = Impact × Likelihood`.

Prioritize these SkillSwapAI risk areas when applicable:

- authentication, refresh/logout, authorization, ownership, and user isolation;
- match/request/friend/session state transitions and duplicate actions;
- queued AI work, socket delivery, retries, and eventual consistency;
- degraded Redis, AI provider, S3, database, or network behavior;
- strict DTO validation and client/server contract drift;
- timezone boundaries, overlapping sessions, and calendar rendering;
- cache invalidation, stale data, reconnects, and multi-tab behavior;
- accessibility, responsive layouts, and critical keyboard flows.

## 3. Build lean coverage

For every high-priority risk, include at least one positive and one negative or boundary scenario. Add lower-risk scenarios only when they protect a meaningful regression.

Use the most economical test level:

- unit for pure branching, transformations, and validation;
- component for frontend rendering and local interaction;
- API/integration for transport, auth, validation, persistence, and module wiring;
- browser E2E for critical user journeys and client/server integration;
- exploratory charters for uncertain behavior and cross-feature interactions.

Avoid duplicating the same assertion at every level.

## 4. Define data and environment

Record:

- commit/branch, OS, browser and viewport, base URLs;
- database and Redis state, relevant feature flags, and external-service mode;
- test users and their relationships/roles without recording secrets;
- created data, cleanup ownership, and any irreversible action excluded from scope.

Use unique test data per run. Never use real-user data unless the user explicitly supplies and authorizes it.

## 5. Execute and trace

Give every case an ID. Track `PASS`, `FAIL`, `BLOCKED`, or `NOT RUN` and link it to its acceptance criterion or risk. A case is `PASS` only with direct execution evidence.

Stop and investigate when:

- the environment contradicts expected prerequisites;
- failures cluster around one dependency;
- automation behavior differs from a manual reproduction;
- test data contamination makes the outcome ambiguous.

## 6. Report

Use this compact structure:

```markdown
# QA report: <scope>

## Verdict
<GO / GO WITH RISK / NO-GO> — <one-sentence reason>

## Environment
- Commit: <sha>
- Services/data: <state>
- Client: <browser/viewport or API client>

## Results
| ID | Risk / acceptance criterion | Scenario | Status | Evidence |
| --- | --- | --- | --- | --- |

## Defects
### [Severity] <title>
- Preconditions:
- Steps:
- Expected:
- Actual:
- Reproducibility:
- Impact:
- Evidence:

## Gaps and blockers
- <not run or blocked area and why>

## Recommendation
<next action ordered by release risk>
```

Do not use pass percentages without also showing blocked and not-run cases; percentages can hide untested risk.
