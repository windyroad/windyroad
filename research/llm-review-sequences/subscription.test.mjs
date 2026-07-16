import { join } from "node:path";
import process from "node:process";
import { describe, expect, it } from "vitest";

import {
  assertSubscriptionAccess,
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
      env: {},
    })).not.toThrow();

    expect(() => assertSubscriptionAccess({
      codexStatus: "Logged in using an API key",
      claudeStatus: "{}",
      env: {},
    })).toThrow("ChatGPT subscription");

    expect(() => assertSubscriptionAccess({
      codexStatus: "Logged in using ChatGPT",
      claudeStatus: JSON.stringify({ loggedIn: true, authMethod: "claude.ai", subscriptionType: "max" }),
      env: { ANTHROPIC_API_KEY: "configured" },
    })).toThrow("API credentials");
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
          "exec", "--ephemeral", "--json", "--sandbox", "read-only",
          "--ignore-user-config", "--ignore-rules", "--skip-git-repo-check",
          "--cd", "/tmp/empty", "--model", "gpt-5.5",
          "--output-schema", schemaPath, "-",
        ],
      });
    expect(buildSubscriptionCommand("claude-code/sonnet", schemaPath, "/tmp/empty"))
      .toEqual({
        command: "claude",
        args: [
          "-p", "--output-format", "json", "--json-schema",
          expect.stringContaining("malicious_probability"), "--max-turns", "1",
          "--no-session-persistence", "--tools", "", "--model", "sonnet",
        ],
        cwd: "/tmp/empty",
      });
  });
});
