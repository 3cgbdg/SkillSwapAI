#!/usr/bin/env node

import { pathToFileURL } from "node:url";

/**
 * Return a user-facing reason when a git commit/push command bypasses the
 * repository's Husky checks. Return null for commands that are allowed.
 */
export function classifyGitBypass(command) {
  if (typeof command !== "string" || command.trim() === "") return null;

  // Analyze individual shell segments so `cd repo && git ...` is handled while
  // text such as `echo "git commit --no-verify"` is not treated as execution.
  const segments = command.split(/\r?\n|&&|\|\||[;|]/u);

  for (const rawSegment of segments) {
    const segment = rawSegment.trim().replace(/^&\s*/u, "");
    const git = segment.match(/^(?:command\s+)?git(?:\.exe)?\s+(.+)$/iu);
    if (!git) continue;

    const args = git[1];
    const operation = args.match(/(?:^|\s)(commit|push)(?=\s|$)/iu)?.[1];
    if (!operation) continue;

    if (/(?:^|\s)--no-verify(?=\s|=|$)/iu.test(args)) {
      return "--no-verify";
    }
    if (/(?:^|\s)--no-gpg-sign(?=\s|=|$)/iu.test(args)) {
      return "--no-gpg-sign";
    }
    if (/(?:^|\s)-c\s+["']?commit\.gpgsign=false["']?(?=\s|$)/iu.test(args)) {
      return "-c commit.gpgsign=false";
    }
    if (
      /(?:^|\s)-c\s+["']?core\.hooksPath=[^\s"']*["']?(?=\s|$)/iu.test(args)
    ) {
      return "-c core.hooksPath=...";
    }
    if (
      operation.toLowerCase() === "commit" &&
      /(?:^|\s)-n(?=\s|$)/u.test(args)
    ) {
      return "-n (short for --no-verify on git commit)";
    }
  }

  return null;
}

async function main() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;

  let command = "";
  try {
    const payload = JSON.parse(input);
    command = payload?.tool_input?.command ?? "";
  } catch {
    // Invalid hook input fails open. Codex still reports hook process failures,
    // while malformed/missing input must not block unrelated tools.
    return;
  }

  const reason = classifyGitBypass(command);
  if (!reason) return;

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason:
          `Blocked: this git command bypasses repository hooks (${reason}). ` +
          "Run the normal git command so Husky checks execute, or ask the user for explicit permission.",
      },
    }),
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(process.argv[1]).href
  : undefined;

if (invokedPath === import.meta.url) {
  await main();
}
