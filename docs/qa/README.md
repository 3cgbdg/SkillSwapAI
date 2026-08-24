# SkillSwapAI QA agent kit

This repository includes a project-scoped QA engineer for Codex and Claude, four reusable QA skills, Playwright MCP connectivity, and a Codex safety hook matching the existing Claude git-hook policy. Universal QA behavior is generated from the versioned [qa-agent-kit](https://github.com/3cgbdg/qa-agent-kit); `.qa-agent/profile.json` is SkillSwapAI's only project-specific source.

## Use the agent

Codex:

```text
Use the qa-engineer subagent to test the signup, login, refresh, and logout flows.
Cover API contracts and the browser journey, then return an evidence-backed QA report.
```

Claude:

```text
Use the qa-engineer agent to run risk-based regression testing for session scheduling.
```

The agent automatically chooses the relevant repository skills. They can also be invoked directly in Codex:

```text
$qa-test-strategy create a release test plan for the current diff
$qa-api-testing test negative and authorization cases for reviews
$qa-browser-testing smoke-test match generation at mobile and desktop widths
$qa-automation add focused regression tests for this bug
```

## Capability map

| Artifact                            | Purpose                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| `.codex/agents/qa-engineer.toml`    | Native project Codex QA subagent                                                            |
| `.claude/agents/qa-engineer.md`     | Equivalent Claude QA agent                                                                  |
| `qa-test-strategy`                  | Risk analysis, acceptance criteria, exploratory charters, traceability, reporting           |
| `qa-api-testing`                    | HTTP, cookie auth, DTO validation, authorization, rate limits, persistence, queues, sockets |
| `qa-browser-testing`                | User journeys, responsive UI, accessibility, failures, realtime behavior, screenshots       |
| `qa-automation`                     | Jest, Supertest, Vitest, Testing Library, and optional persistent Playwright Test suites    |
| `.codex/hooks.json`                 | Codex lifecycle hook configuration                                                          |
| `.codex/hooks/block-git-bypass.mjs` | Blocks commit/push flags that bypass repository checks                                      |

## Local prerequisites

Install each independently managed package and start infrastructure/app services as needed:

```bash
pnpm install
pnpm --dir frontend install
pnpm --dir backend install
docker compose up -d postgres redis
pnpm --dir backend start:dev
pnpm --dir frontend dev
```

Default URLs are frontend `http://localhost:3000`, backend `http://localhost:5200`, liveness `/health/live`, and database readiness `/health/ready`.

Use disposable test users and unique data. Local API auth is cookie-based, so API sequences need a cookie jar. AI completion and skill suggestions are asynchronous; a complete check observes both the HTTP acknowledgement and the later socket/persisted outcome.

## Verification commands

Validate the agent/skill/hook package:

```bash
pnpm qa:validate
```

This validates the upstream source/version, project-profile and generated-file digests, Claude/Codex parity, MCP parity, and safety-hook behavior.

Run existing automated checks:

```bash
pnpm --dir backend test
pnpm --dir frontend test
pnpm check:types
```

The repository has Playwright MCP configured for interactive testing. A persistent `@playwright/test` suite is intentionally added only when a requested feature needs committed browser regression coverage; the `qa-automation` skill defines that setup standard.

## Updating the agent

Edit `.qa-agent/profile.json` for SkillSwapAI-only facts. Edit the upstream kit for universal QA behavior, then render from a checkout of `qa-agent-kit`:

```bash
node /path/to/qa-agent-kit/scripts/render.mjs --profile .qa-agent/profile.json --target .
pnpm qa:validate
```

Generated agent and skill files are committed for offline use. Do not edit them directly.

## Codex hook trust

Codex project hooks require review after they are added or changed. Open `/hooks`, inspect the project hook, and trust it. The hook is enabled in `.codex/config.toml` and works on Windows and POSIX shells.

The hook is deliberately narrow: it denies `git commit`/`git push` variants that bypass Husky checks, while normal commit/push commands and `git push -n` dry runs remain allowed.

## Claude/Codex parity notes

`pnpm qa:validate` checks that every checked-in `.claude/agents` entry, `.claude/skills` directory, and root MCP server has a Codex counterpart. The Codex hook mirrors the checked-in Claude `PreToolUse` policy with Codex's native hook schema.

Two Claude files are intentionally not copied byte-for-byte:

- `.claude/settings.local.json` is user-local permission state and should not become shared Codex policy.
- `.claude/launch.json` defines Claude launch shortcuts. The Codex desktop equivalent is a Local Environment action, which Codex manages from the app's environment settings and stores in `.codex`; the run commands above are the portable repository fallback.
