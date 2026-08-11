#!/usr/bin/env bash
# PreToolUse hook (matcher: Bash, if: "Bash(git *)") -- see .claude/settings.json.
#
# Blocks git commit/push invocations that bypass the repo's husky hooks
# (.husky/pre-commit runs lint-staged; .husky/pre-push runs check:types +
# backend tests). Mirrors CLAUDE.md's Git Safety Protocol ("NEVER skip
# hooks... unless the user has explicitly asked for it") as a hard
# technical check instead of a soft instruction, so it holds even in an
# agent session that isn't following CLAUDE.md carefully.
#
# Deliberately narrow: only flags git commit/push commands carrying an
# actual bypass flag. Everything else (including "git push -n" dry-run,
# which is unrelated to hooks) passes through untouched.

cmd="$(node -e '
let d = "";
process.stdin.on("data", (c) => { d += c; });
process.stdin.on("end", () => {
  try {
    const j = JSON.parse(d);
    process.stdout.write(j?.tool_input?.command ?? "");
  } catch {
    // Non-JSON or missing field -- treat as no command, let the caller pass through.
  }
});
')"

# Only look at invocations of git commit or git push.
if ! printf '%s' "$cmd" | grep -qE '(^|[;&|]|&&)[[:space:]]*git[[:space:]]+.*\b(commit|push)\b'; then
  exit 0
fi

reason=""
if printf '%s' "$cmd" | grep -qE -- '--no-verify|--no-gpg-sign'; then
  reason="--no-verify/--no-gpg-sign"
elif printf '%s' "$cmd" | grep -qE -- '-c[[:space:]]+commit\.gpgsign=false'; then
  reason="-c commit.gpgsign=false"
elif printf '%s' "$cmd" | grep -qE -- '-c[[:space:]]+core\.hooksPath='; then
  reason="-c core.hooksPath=..."
elif printf '%s' "$cmd" | grep -qE '\bgit[[:space:]]+commit\b' \
     && printf '%s' "$cmd" | grep -qE '(^|[[:space:]])-n([[:space:]]|$)'; then
  # -n is short for --no-verify on "git commit" specifically. On "git push"
  # it means --dry-run, which is unrelated and must not be blocked.
  reason="-n (short for --no-verify on git commit)"
fi

if [ -n "$reason" ]; then
  REASON="$reason" node -e '
    const reason = process.env.REASON;
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          "Blocked: this git command bypasses repo hooks (" + reason + "). " +
          "This repo'\''s .husky/pre-commit (lint-staged) and .husky/pre-push (check:types + backend tests) exist to catch problems before they land. " +
          "Per CLAUDE.md'\''s Git Safety Protocol, skipping them requires the user'\''s explicit request -- run the plain git command instead, or ask the user first.",
      },
    }));
  '
  exit 0
fi

exit 0
