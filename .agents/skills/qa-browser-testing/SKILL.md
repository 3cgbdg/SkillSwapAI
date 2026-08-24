---
name: qa-browser-testing
description: Runs exploratory and end-to-end browser QA for SkillSwapAI with Playwright, covering critical journeys, responsive layouts, accessibility, network failures, realtime updates, and evidence capture. Use for UI testing, smoke tests, visual checks, or browser regressions.
---

# QA Browser Testing

Use the configured Playwright MCP for interactive browser work. Use `qa-automation` when the deliverable is a committed Playwright Test suite.

## Prepare

1. Read the relevant route, component, hook, service, and existing tests before deciding expected behavior.
2. Confirm frontend and backend URLs, test account state, database readiness, and whether Redis/socket behavior is available.
3. Open the app from a clean browser context. Record browser engine and viewport.
4. Keep test credentials out of screenshots, console output, and reports.

## Exercise the user journey

For each scoped journey:

1. Verify direct navigation and refresh, not only navigation from the dashboard.
2. Use role, label, placeholder, and visible-name selectors. Avoid brittle CSS structure and coordinates.
3. Assert the user-observable outcome and, where important, the corresponding API/state change.
4. Check loading, empty, validation, server-error, and retry states.
5. Inspect browser console errors and failed network requests; correlate them to the action rather than dumping unrelated noise.
6. For realtime flows, verify the initiating client, receiving client, reconnect behavior, and eventual cache refresh.

Do not use fixed sleeps as proof. Wait for a meaningful element, response, socket-driven state, or bounded polling condition.

## Accessibility pass

At minimum for changed or critical UI:

- navigate the journey with keyboard only;
- verify focus is visible, ordered, and restored after dialogs/popovers;
- confirm controls have meaningful accessible names and state;
- confirm headings, landmarks, form labels, errors, and live updates are understandable;
- check that color is not the only carrier of meaning;
- test zoom/reflow where layout risk is meaningful.

Record automated accessibility observations as leads, not as proof that the whole page is accessible. Confirm important findings manually.

## Responsive and visual pass

Use at least one narrow mobile viewport and one desktop viewport for layout-affecting changes. Add a mid-width/tablet check when navigation or grid breakpoints are involved.

Look for clipping, overlap, hidden actions, unintended horizontal scrolling, unreadable text, unstable layout, incorrect stacking, and touch targets that are hard to operate. Verify both light and dark themes when the change touches colors, borders, overlays, or semantic tokens.

Prefer screenshots at failure points and final states. Name them with case ID, state, and viewport. Do not treat screenshot similarity alone as functional evidence.

## Failure and resilience pass

Where relevant, simulate or observe:

- anonymous/expired-session redirects and refresh-token recovery;
- `400`, `401`, `403`, `404`, `409`, `429`, and `5xx` responses;
- slow requests, offline/reconnect, duplicate submit, and rapid navigation;
- socket disconnect/reconnect and stale TanStack Query data;
- asynchronous AI completion and failure notifications.

Do not intercept every API call into a fake happy path for an end-to-end claim. Clearly label mocked-network checks.

## Critical SkillSwapAI smoke journeys

Select the journeys affected by the task; do not run all of them mechanically:

- marketing page to signup/login;
- signup, login, refresh behavior, logout, and protected-route redirect;
- profile edit and known/learning skill changes;
- discover/search, request creation, accept/reject, and friend visibility;
- match generation, pending state, ready/failure notification, and match detail;
- chats/inbox messaging and realtime delivery;
- session scheduling, timezone display, status transitions, calendar, and review prompt;
- rating submission and profile rating summary.

## Report

For every result include route, viewport, account/data precondition, exact interaction, expected/actual outcome, console/network evidence when relevant, and screenshot path for visual defects. Reproduce defects from a clean state before assigning severity.
