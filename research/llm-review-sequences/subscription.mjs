import { readFileSync } from "node:fs";
import process from "node:process";

export function assertSubscriptionAccess({ codexStatus, claudeStatus, env = process.env }) {
  if (!String(codexStatus).includes("Logged in using ChatGPT")) {
    throw new Error("Codex must use the ChatGPT subscription login");
  }
  let claude;
  try {
    claude = JSON.parse(claudeStatus);
  } catch {
    throw new Error("Claude Code subscription status is not valid JSON");
  }
  if (!claude.loggedIn || claude.authMethod !== "claude.ai" || claude.subscriptionType !== "max") {
    throw new Error("Claude Code must use the claude.ai Max subscription login");
  }
  if (["OPENAI_API_KEY", "CODEX_API_KEY", "ANTHROPIC_API_KEY"].some((name) => env[name])) {
    throw new Error("API credentials must be absent during subscription collection");
  }
}

export function renderCliPrompt(request) {
  if (!Array.isArray(request?.messages) || request.messages.length !== 2
    || request.messages[0].role !== "system" || request.messages[1].role !== "user") {
    throw new Error("Expected one system and one user message");
  }
  return `SYSTEM:\n${request.messages[0].content}\n\nUSER:\n${request.messages[1].content}\n`;
}

export function buildSubscriptionCommand(
  systemId,
  schemaPath,
  cwd,
  { codexBin = "codex", claudeBin = "claude" } = {},
) {
  if (systemId === "codex-cli/gpt-5.5") {
    return {
      command: codexBin,
      args: [
        "exec", "--ephemeral", "--json", "--sandbox", "read-only",
        "--ignore-user-config", "--ignore-rules", "--skip-git-repo-check",
        "--cd", cwd, "--model", "gpt-5.5", "--output-schema", schemaPath, "-",
      ],
    };
  }
  if (systemId === "claude-code/sonnet") {
    return {
      command: claudeBin,
      args: [
        "-p", "--output-format", "json", "--json-schema",
        JSON.stringify(JSON.parse(readFileSync(schemaPath, "utf8"))),
        "--max-turns", "1", "--no-session-persistence", "--tools", "", "--model", "sonnet",
      ],
      cwd,
    };
  }
  throw new Error(`Unknown subscription review system: ${systemId}`);
}
