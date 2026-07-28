import { Buffer } from "node:buffer";
import { join } from "node:path";
import process from "node:process";
import { describe, expect, it } from "vitest";

import {
  assertSubscriptionAccess,
  buildSubscriptionChildEnv,
  buildSubscriptionCommand,
  renderCliPrompt,
} from "./subscription.mjs";

describe("subscription-backed review adapter", () => {
  const schemaPath = join(process.cwd(), "research/llm-review-sequences/review-schema.json");

  it("requires subscription auth and rejects API-key billing", () => {
    expect(() => assertSubscriptionAccess({
      codexStatus: "Logged in using ChatGPT",
      claudeStatus: JSON.stringify({
        loggedIn: true,
        authMethod: "claude.ai",
        subscriptionType: "max",
      }),
      env: { HOME: "/Users/reviewer" },
    })).not.toThrow();

    expect(() => assertSubscriptionAccess({
      codexStatus: "Logged in using an API key",
      claudeStatus: "{}",
      env: { HOME: "/Users/reviewer" },
    })).toThrow("ChatGPT subscription");

    expect(() => assertSubscriptionAccess({
      codexStatus: "Logged in using ChatGPT",
      claudeStatus: JSON.stringify({ loggedIn: true, authMethod: "claude.ai", subscriptionType: "max" }),
      env: { HOME: "/Users/reviewer", ANTHROPIC_API_KEY: "configured" },
    })).toThrow("API credentials");
  });

  it("constructs one exact minimal child environment and strips every unknown key", () => {
    expect(buildSubscriptionChildEnv({
      HOME: "/Users/reviewer",
      PATH: "/untrusted/bin",
      LANG: "en_AU.UTF-8",
      SHELL: "/bin/zsh",
      SAFE_BUT_UNLISTED: "discarded",
    })).toEqual({
      CODEX_HOME: "/Users/reviewer/.codex",
      HOME: "/Users/reviewer",
      LANG: "C",
      LC_ALL: "C",
      NO_COLOR: "1",
      PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
      TERM: "dumb",
    });
  });

  it.each([
    "ANTHROPIC_API_KEY",
    "CLAUDE_CODE_OAUTH_TOKEN",
    "OPENAI_BASE_URL",
    "HTTPS_PROXY",
    "AWS_PROFILE",
    "CODEX_BACKEND",
    "CLAUDE_CODE_USE_BEDROCK",
    "CLAUDE_CODE_USE_VERTEX",
    "CLAUDE_CODE_USE_FOUNDRY",
    "ANTHROPIC_MODEL",
    "OPENAI_PROJECT_ID",
    "CLAUDE_CODE_BILLING_ACCOUNT",
  ])("rejects ambient provider routing or billing variable %s", (name) => {
    expect(() => buildSubscriptionChildEnv({
      HOME: "/Users/reviewer",
      [name]: "configured",
    })).toThrow(/environment|variable/i);
  });

  it("renders identical role-labelled input for both clients", () => {
    expect(renderCliPrompt({ messages: [
      { role: "system", content: "Review safely." },
      { role: "user", content: "{\"evidence\":{}}" },
    ] })).toBe("SYSTEM:\nReview safely.\n\nUSER:\n{\"evidence\":{}}\n");
  });

  it("builds fixed non-interactive commands without paid routes", () => {
    expect(buildSubscriptionCommand("codex-cli/gpt-5.5", schemaPath, "/tmp/empty"))
      .toEqual({
        command: "codex",
        args: [
          "--ask-for-approval", "never", "exec", "--ephemeral", "--json",
          "--ignore-user-config", "--ignore-rules",
          "--config", 'default_permissions="study-minimal"',
          "--config", 'permissions={study-minimal={filesystem={":minimal"="read"}}}',
          "--skip-git-repo-check",
          "--cd", "/tmp/empty", "--model", "gpt-5.5",
          "--output-schema", schemaPath, "-",
        ],
      });
    expect(buildSubscriptionCommand("claude-code/sonnet", schemaPath, "/tmp/empty"))
      .toEqual({
        command: "claude",
        args: [
          "-p", "--safe-mode", "--setting-sources", "", "--strict-mcp-config",
          "--mcp-config", "{}", "--disable-slash-commands", "--no-chrome",
          "--output-format", "json", "--json-schema",
          expect.stringContaining("malicious_probability"), "--max-turns", "1",
          "--no-session-persistence", "--tools", "", "--model", "sonnet",
        ],
        cwd: "/tmp/empty",
      });
  });

  it("passes the authorized in-memory schema snapshot to Claude instead of rereading disk", () => {
    const schemaBytes = Buffer.from(JSON.stringify({
      type: "object",
      title: "authorized-snapshot-only",
    }));
    const command = buildSubscriptionCommand(
      "claude-code/sonnet",
      schemaPath,
      "/tmp/empty",
      { schemaBytes },
    );
    const schemaArgument = command.args[command.args.indexOf("--json-schema") + 1];
    expect(JSON.parse(schemaArgument)).toEqual({
      type: "object",
      title: "authorized-snapshot-only",
    });
    expect(schemaArgument).not.toContain("malicious_probability");
  });
});
