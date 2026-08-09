---
name: sentry-triage
description: Investigate a Sentry issue via the `sentry` MCP server and correlate it with the actual backend source to report a likely root cause and fix location. Read-only — does not edit code. Use when given a Sentry issue ID/URL, or asked to look into a production error.
---

This is an investigation skill, not a fix skill — like `plan-critic`, it
reports what it found and where, and stops there. Use its output as the
input to a normal bug-fix task, don't have it edit code directly.

Sentry is currently wired into the NestJS backend only
(`@sentry/nestjs`/`@sentry/node` in `backend/package.json`, initialized
in `backend/src/main.ts`) — there is no frontend Sentry integration yet,
so issues will point at backend code.

## Prerequisites

The `sentry` MCP server must be connected (`claude mcp list`). It's a
remote HTTP server (`https://mcp.sentry.dev/mcp`) authenticated via
OAuth — the first real tool call will open a browser to sign in; that's
expected, not a failure.

## Steps

1. Get the issue identifier or URL from the user. If only a vague
   description is given ("users are seeing errors on login"), use the
   `sentry` MCP's search/list tools to find matching recent issues
   instead of guessing which one is meant.

2. Pull the full issue via the `sentry` MCP: title, stack trace,
   breadcrumbs, affected release/environment, event frequency, first/last
   seen.

3. From the stack trace, identify the specific backend file and
   function/handler implicated. Open that file with `Read` and read
   enough surrounding context (the controller/service/DTO chain, not
   just the one line) to understand what's actually happening there.

4. Cross-reference against related code that isn't in the stack trace
   but is relevant — e.g. if the error is a Prisma error, check the
   schema and the relevant migration; if it's a queue job failure, check
   the corresponding processor in `backend/src/queues/`.

5. Report:
   - The likely root cause, stated as a concrete mechanism (not "there's
     a bug in X"), citing file:line.
   - Why the stack trace supports that conclusion.
   - Where a fix would go (file/function), without writing the fix.
   - Any edge case or precondition needed to reproduce it, if inferable
     from breadcrumbs/environment data.
   - If the evidence is inconclusive, say so explicitly rather than
     presenting a guess as a finding.

## Notes

- Don't silently assume which Sentry project/org to query if the MCP
  connection has access to more than one — confirm or ask if ambiguous.
- If the issue is stale (hasn't recurred in a long time, or is already
  resolved/ignored in Sentry), say that up front rather than treating it
  as an active bug.
