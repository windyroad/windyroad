import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  collectSubscriptionSchedule,
  parseSubscriptionOutput,
  preflightSubscriptionClients,
} from "./subscription-runner.mjs";

describe("subscription collection runner", () => {
  it("pins the exact authenticated subscription clients", () => {
    const outputs = new Map([
      ["/opt/codex --version", "codex-cli 0.137.0\n"],
      ["/opt/codex login status", "Logged in using ChatGPT\n"],
      ["/opt/claude --version", "2.1.211 (Claude Code)\n"],
      ["/opt/claude auth status", JSON.stringify({
        loggedIn: true, authMethod: "claude.ai", subscriptionType: "max",
      })],
    ]);
    const run = (command, args) => ({ stdout: outputs.get(`${command} ${args.join(" ")}`) });
    expect(preflightSubscriptionClients({
      codexBin: "/opt/codex", claudeBin: "/opt/claude", run, env: {},
    })).toMatchObject({ codex_version: "0.137.0", claude_version: "2.1.211" });
    expect(() => preflightSubscriptionClients({
      codexBin: "/opt/codex", claudeBin: "/opt/claude", run: () => ({ stdout: "0.101.0" }), env: {},
    })).toThrow("Codex version drift");
  });

  it("parses structured results and detects tool use", () => {
    const response = {
      verdict: "allow", malicious_probability: 0.1, severity: "none",
      submission_ids: [], evidence: "No unsafe composition.", category: "none",
    };
    expect(parseSubscriptionOutput("codex-cli/gpt-5.5", [
      JSON.stringify({ type: "item.completed", item: { type: "agent_message", text: JSON.stringify(response) } }),
    ].join("\n"))).toMatchObject({ response, tool_deviation: false });
    expect(parseSubscriptionOutput("claude-code/sonnet", JSON.stringify({
      structured_output: response, model: "claude-sonnet-4-6", num_turns: 1,
    }))).toMatchObject({ response, returned_model: "claude-sonnet-4-6" });
  });

  it("writes resumable attempts and results in fixed schedule order", () => {
    const root = mkdtempSync(join(tmpdir(), "subscription-runner-"));
    const benchmark = join(root, "benchmark");
    const collection = join(root, "collection");
    const output = join(root, "output");
    requireDirectory(benchmark);
    requireDirectory(collection);
    const request = { messages: [{ role: "system", content: "Review." }, { role: "user", content: "{}" }] };
    writeFileSync(join(benchmark, "prompts.jsonl"), `${JSON.stringify({ prompt_id: "prompt-1", request })}\n`);
    writeFileSync(join(collection, "calls.jsonl"), `${JSON.stringify({
      call_id: "call-1", schedule_index: 1, prompt_id: "prompt-1", model: "codex-cli/gpt-5.5",
    })}\n`);
    const response = {
      verdict: "allow", malicious_probability: 0.1, severity: "none",
      submission_ids: [], evidence: "No unsafe composition.", category: "none",
    };
    let calls = 0;
    const runReview = () => {
      calls += 1;
      return { stdout: JSON.stringify({
        type: "item.completed", item: { type: "agent_message", text: JSON.stringify(response) },
      }) };
    };
    const options = {
      benchmarkRoot: benchmark, collectionRoot: collection, outputRoot: output,
      codexBin: "/opt/codex", claudeBin: "/opt/claude", runReview,
      preflight: () => ({ codex_version: "0.137.0", claude_version: "2.1.211" }),
      authorize: () => {},
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    expect(calls).toBe(1);
    expect(readFileSync(join(output, "attempts.jsonl"), "utf8")).toContain('"call_id":"call-1"');
    expect(readFileSync(join(output, "results.jsonl"), "utf8")).toContain('"status":"valid"');
  });

  it("keeps suspensions out of the final result ledger before resume", () => {
    const root = mkdtempSync(join(tmpdir(), "subscription-resume-"));
    const benchmark = join(root, "benchmark");
    const collection = join(root, "collection");
    const output = join(root, "output");
    requireDirectory(benchmark);
    requireDirectory(collection);
    const request = { messages: [{ role: "system", content: "Review." }, { role: "user", content: "{}" }] };
    writeFileSync(join(benchmark, "prompts.jsonl"), `${JSON.stringify({ prompt_id: "p", request })}\n`);
    writeFileSync(join(collection, "calls.jsonl"), `${JSON.stringify({
      call_id: "c", schedule_index: 1, prompt_id: "p", model: "codex-cli/gpt-5.5",
    })}\n`);
    const result = collectSubscriptionSchedule({
      benchmarkRoot: benchmark, collectionRoot: collection, outputRoot: output,
      codexBin: "/opt/codex", claudeBin: "/opt/claude",
      preflight: () => ({ codex_version: "0.137.0", claude_version: "2.1.211" }),
      authorize: () => {},
      runReview: () => { throw new Error("usage limit"); },
    });
    expect(result).toMatchObject({ completed: 0, reason: "rate_limit" });
    expect(existsSync(join(output, "results.jsonl"))).toBe(false);
    for (let index = 0; index < 3; index += 1) {
      expect(collectSubscriptionSchedule({
        benchmarkRoot: benchmark, collectionRoot: collection, outputRoot: output,
        codexBin: "/opt/codex", claudeBin: "/opt/claude", authorize: () => {},
        preflight: () => ({ codex_version: "0.137.0", claude_version: "2.1.211" }),
        runReview: () => { throw new Error("usage limit"); },
      })).toMatchObject({ completed: 0, reason: "rate_limit" });
    }
    expect(existsSync(join(output, "results.jsonl"))).toBe(false);
  });

  it("enforces the frozen OSF authorization gate by default", () => {
    expect(() => collectSubscriptionSchedule({
      benchmarkRoot: "/tmp/not-authorized-benchmark",
      collectionRoot: "/tmp/not-authorized-collection",
      outputRoot: mkdtempSync(join(tmpdir(), "subscription-authorization-")),
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
    })).toThrow("not authorized");
  });

  it("suspends when a returned model identity changes between calls", () => {
    const root = mkdtempSync(join(tmpdir(), "subscription-drift-"));
    const benchmark = join(root, "benchmark");
    const collection = join(root, "collection");
    const output = join(root, "output");
    requireDirectory(benchmark);
    requireDirectory(collection);
    const request = { messages: [{ role: "system", content: "Review." }, { role: "user", content: "{}" }] };
    writeFileSync(join(benchmark, "prompts.jsonl"), ["p1", "p2"]
      .map((prompt_id) => JSON.stringify({ prompt_id, request })).join("\n") + "\n");
    writeFileSync(join(collection, "calls.jsonl"), ["p1", "p2"].map((prompt_id, index) => JSON.stringify({
      call_id: `c${index + 1}`, schedule_index: index + 1, prompt_id, model: "claude-code/sonnet",
    })).join("\n") + "\n");
    const response = {
      verdict: "allow", malicious_probability: 0.1, severity: "none",
      submission_ids: [], evidence: "No unsafe composition.", category: "none",
    };
    let index = 0;
    const options = {
      benchmarkRoot: benchmark, collectionRoot: collection, outputRoot: output,
      codexBin: "/opt/codex", claudeBin: "/opt/claude", authorize: () => {},
      preflight: () => ({ codex_version: "0.137.0", claude_version: "2.1.211" }),
      runReview: () => ({ stdout: JSON.stringify({
        structured_output: response,
        model: index++ === 0 ? "claude-sonnet-4-6" : "claude-sonnet-5-0",
      }) }),
    };
    for (let resume = 0; resume < 4; resume += 1) {
      expect(collectSubscriptionSchedule(options)).toMatchObject({
        completed: 1, suspended_call_id: "c2", reason: "model_drift",
      });
    }
    expect(readFileSync(join(output, "results.jsonl"), "utf8")).not.toContain('"call_id":"c2"');
  });
});

function requireDirectory(path) {
  mkdirSync(path, { recursive: true });
}
