---
name: gh-ci-status
description: Report CI/CodeQL/review status for the current branch or a PR via the `github` MCP server, as a short punch list. Use when asked what's blocking a PR, whether CI is green, or whether it's safe to merge.
---

This repo has 5 GitHub Actions workflows (`.github/workflows/backend.yml`,
`frontend.yml`, `pybackend.yml`, `quality.yml`, `codeql.yml`). This skill
gives a single consolidated status view across all of them via the
`github` MCP server, instead of checking each with separate ad hoc `gh`
CLI calls.

## Prerequisites

The `github` MCP server must be connected (`claude mcp list`). It's a
remote HTTP server (`https://api.githubcopilot.com/mcp/`) authenticated
via OAuth — the first real tool call will open a browser to sign in;
that's expected, not a failure.

## Steps

1. Determine the target: the current branch's associated PR (if any),
   or a PR number/branch the user names explicitly.

2. Using the `github` MCP, pull:
   - Latest run status (pass/fail/in-progress) for each of the 5
     workflows on that branch/PR.
   - Any open CodeQL alerts introduced or still open on this branch.
   - Unresolved review threads / requested changes on the PR, if one
     exists.
   - Whether the PR is currently mergeable (no conflicts) per GitHub's
     own mergeable state.

3. For any failing workflow, pull enough detail (failing job/step name)
   to say *what* failed, not just that it did — don't make the user
   click through to find out.

4. Report as a short punch list: done vs. still blocking. Don't pad it
   with workflows that are already green — lead with what's actually
   blocking merge.

## Notes

- This is a read-only status check — it doesn't retry failed jobs, push
  fixes, or comment on the PR. If the user wants that, say so explicitly
  and confirm before taking any of those actions.
- If there's no PR associated with the current branch, say that plainly
  rather than reporting workflow status as if a PR exists.
