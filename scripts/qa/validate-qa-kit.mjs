#!/usr/bin/env node

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { classifyGitBypass } from "../../.codex/hooks/block-git-bypass.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function text(path) {
  return readFile(resolve(root, path), "utf8");
}

function assertSkill(content, expectedName, path) {
  const lines = content.split(/\r?\n/u);
  assert.ok(lines.length < 500, `${path} must stay under 500 lines`);
  assert.match(content, /^---\r?\n/u, `${path} must start with frontmatter`);
  assert.match(content, new RegExp(`\\nname: ${expectedName}\\r?\\n`, "u"));
  const description = content.match(/\ndescription: ([^\r\n]+)/u)?.[1] ?? "";
  assert.ok(description.length > 30, `${path} needs a specific description`);
  assert.ok(
    description.length <= 1024,
    `${path} description exceeds 1024 chars`,
  );
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

const skillNames = [
  "qa-test-strategy",
  "qa-api-testing",
  "qa-browser-testing",
  "qa-automation",
];

for (const name of skillNames) {
  const agentPath = `.agents/skills/${name}/SKILL.md`;
  const claudePath = `.claude/skills/${name}/SKILL.md`;
  const [agentSkill, claudeSkill] = await Promise.all([
    text(agentPath),
    text(claudePath),
  ]);
  assertSkill(agentSkill, name, agentPath);
  assertSkill(claudeSkill, name, claudePath);
  assert.equal(
    claudeSkill,
    agentSkill,
    `${name} drifted between .agents and .claude`,
  );
}

const [codexAgent, claudeAgent, codexConfig, rootMcp] = await Promise.all([
  text(".codex/agents/qa-engineer.toml"),
  text(".claude/agents/qa-engineer.md"),
  text(".codex/config.toml"),
  text(".mcp.json"),
]);

assert.match(codexAgent, /^name = "qa-engineer"$/mu);
assert.match(codexAgent, /^description = ".+"$/mu);
assert.match(codexAgent, /^developer_instructions = """$/mu);
for (const name of skillNames) {
  assert.ok(codexAgent.includes(`\`${name}\``), `Codex agent omits ${name}`);
  assert.ok(claudeAgent.includes(`\`${name}\``), `Claude agent omits ${name}`);
}

assert.match(codexConfig, /\[features\][\s\S]*?hooks\s*=\s*true/u);
assert.match(codexConfig, /\[mcp_servers\.playwright\]/u);
assert.match(rootMcp, /"playwright"\s*:/u);

const claudeSkillNames = (
  await readdir(resolve(root, ".claude/skills"), { withFileTypes: true })
)
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const codexSkillNames = (
  await readdir(resolve(root, ".agents/skills"), { withFileTypes: true })
)
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
for (const name of claudeSkillNames) {
  assert.ok(
    codexSkillNames.includes(name),
    `Codex skill missing for Claude skill: ${name}`,
  );
}

const claudeAgentNames = (
  await readdir(resolve(root, ".claude/agents"), { withFileTypes: true })
)
  .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
  .map((entry) => entry.name.replace(/\.md$/u, ""))
  .sort();
const codexAgentNames = (
  await readdir(resolve(root, ".codex/agents"), { withFileTypes: true })
)
  .filter((entry) => entry.isFile() && entry.name.endsWith(".toml"))
  .map((entry) => entry.name.replace(/\.toml$/u, ""))
  .sort();
for (const name of claudeAgentNames) {
  assert.ok(
    codexAgentNames.includes(name),
    `Codex agent missing for Claude agent: ${name}`,
  );
}

const mcpNames = Object.keys(JSON.parse(rootMcp).mcpServers).sort();
for (const name of mcpNames) {
  assert.match(
    codexConfig,
    new RegExp(`\\[mcp_servers\\.${escapeRegExp(name)}\\]`, "u"),
    `Codex MCP server missing for Claude MCP server: ${name}`,
  );
}

const hooks = JSON.parse(await text(".codex/hooks.json"));
const preToolUse = hooks?.hooks?.PreToolUse;
assert.ok(Array.isArray(preToolUse) && preToolUse.length === 1);
assert.equal(preToolUse[0].matcher, "^Bash$");
assert.equal(preToolUse[0].hooks[0].type, "command");
assert.ok(
  preToolUse[0].hooks[0].commandWindows,
  "Windows hook command missing",
);

const blocked = [
  "git commit --no-verify -m test",
  "git push --no-verify origin main",
  "cd backend && git commit -n -m test",
  "git -c commit.gpgsign=false commit -m test",
  "git -c core.hooksPath= commit -m test",
  "git commit --no-gpg-sign -m test",
  "git commit -m test; git push --no-verify",
];
const allowed = [
  "git commit -m test",
  "git push origin main",
  "git push -n origin main",
  'echo "git commit --no-verify"',
  "git log --grep=commit",
];

for (const command of blocked) {
  assert.ok(classifyGitBypass(command), `expected hook to block: ${command}`);
}
for (const command of allowed) {
  assert.equal(
    classifyGitBypass(command),
    null,
    `expected hook to allow: ${command}`,
  );
}

const hookPath = resolve(root, ".codex/hooks/block-git-bypass.mjs");
const invocation = spawnSync(process.execPath, [hookPath], {
  input: JSON.stringify({
    tool_name: "Bash",
    tool_input: { command: "git commit --no-verify -m test" },
  }),
  encoding: "utf8",
});
assert.equal(invocation.status, 0, invocation.stderr);
const denial = JSON.parse(invocation.stdout);
assert.equal(denial.hookSpecificOutput.hookEventName, "PreToolUse");
assert.equal(denial.hookSpecificOutput.permissionDecision, "deny");

console.log(
  `QA kit valid: ${codexAgentNames.length} Codex agents cover ${claudeAgentNames.length} Claude agents; ` +
    `${codexSkillNames.length} Codex skills cover ${claudeSkillNames.length} Claude skills; ` +
    `${mcpNames.length} MCP servers and 1 Codex hook verified.`,
);
