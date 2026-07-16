import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateBenchmark } from "./benchmark.mjs";
import { collectCall, collectCalls, generateCollection } from "./collection.mjs";

describe("blinded collection ledger", () => {
  it("expands the schedule without exposing ground truth to the call queue", () => {
    const root = mkdtempSync(join(tmpdir(), "llm-review-collection-"));
    const benchmarkRoot = join(root, "benchmark");
    const outputRoot = join(root, "collection");

    try {
      const benchmark = generateBenchmark(benchmarkRoot, {
        templateIndexes: [1],
        instancesPerTemplate: 1,
      });
      const collection = generateCollection(benchmarkRoot, outputRoot, {
        models: ["model-a", "model-b"],
        trialsPerCell: 2,
      });

      expect(collection.calls).toHaveLength(benchmark.prompts.length * 4);
      expect(collection.ground_truth).toHaveLength(collection.calls.length);
      expect(new Set(collection.calls.map(({ call_id }) => call_id)).size).toBe(collection.calls.length);
      expect(collection.calls.every((call) => !(
        "intent" in call || "scenario_id" in call || "sequence_id" in call
      ))).toBe(true);
      expect(new Set(collection.calls.map(({ prompt_id }) => prompt_id))).toEqual(
        new Set(benchmark.prompts.map(({ prompt_id }) => prompt_id)),
      );
      expect(collection.ground_truth.every(({ intent }) => ["malicious", "benign"].includes(intent))).toBe(true);
      expect(collection.calls_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(collection.ground_truth_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(existsSync(join(outputRoot, "calls.jsonl"))).toBe(true);
      expect(existsSync(join(outputRoot, "ground-truth.jsonl"))).toBe(true);
      expect(existsSync(join(outputRoot, "collection.json"))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 60_000);

  it("executes the frozen retry and abstention rules without exposing ground truth", async () => {
    const call = {
      call_id: "call-one",
      prompt_id: "prompt-one",
      case_id: "case-one",
      model: "model-a",
      trial: 1,
    };
    const request = { messages: [{ role: "user", content: "review this" }] };
    const model = {
      id: "model-a",
      provider_tag: "provider-a",
      endpoint_snapshot: "provider-a/model-a-snapshot",
    };
    const waits = [];
    const deliveries = [
      { http_status: 429 },
      validDelivery(),
    ];
    const sent = [];
    const collected = await collectCall({
      call,
      request,
      model,
      send: async (input) => {
        sent.push(input);
        return deliveries.shift();
      },
      sleep: async (seconds) => waits.push(seconds),
    });

    expect(sent).toHaveLength(2);
    expect(sent.every((input) => input.call === call && input.request === request)).toBe(true);
    expect(waits).toEqual([2]);
    expect(collected).toMatchObject({
      result: {
        call_id: "call-one",
        status: "valid",
        attempt_count: 2,
        response: { verdict: "block" },
      },
      attempts: [
        { attempt: 1, status: "retryable_http", http_status: 429 },
        { attempt: 2, status: "valid", http_status: 200 },
      ],
    });

    const invalid = await collectCall({
      call,
      request,
      model,
      send: async () => ({ ...validDelivery(), response: { verdict: "allow" } }),
      sleep: async () => { throw new Error("schema-invalid responses must not retry"); },
    });
    expect(invalid).toMatchObject({
      result: { status: "abstain", reason: "schema_invalid", attempt_count: 1 },
      attempts: [{ attempt: 1, status: "schema_invalid" }],
    });

    const routeWaits = [];
    const mismatched = await collectCall({
      call,
      request,
      model,
      send: async () => ({ ...validDelivery(), provider: "wrong-provider" }),
      sleep: async (seconds) => routeWaits.push(seconds),
    });
    expect(routeWaits).toEqual([2, 8]);
    expect(mismatched.result).toMatchObject({
      status: "missing",
      reason: "route_mismatch",
      attempt_count: 3,
    });
    expect(mismatched.attempts.reduce((sum, attempt) => sum + (attempt.cost_usd ?? 0), 0)).toBe(0.003);

    const wrongRouteRefusal = await collectCall({
      call,
      request,
      model,
      send: async () => ({
        ...validDelivery(),
        provider: "wrong-provider",
        refusal: "Cannot review this request.",
      }),
      sleep: async () => {},
    });
    expect(wrongRouteRefusal.result).toMatchObject({
      status: "missing",
      reason: "route_mismatch",
      attempt_count: 3,
    });
  });

  it("suspends before accrued cost plus projected remainder exceeds the ceiling", async () => {
    const calls = ["one", "two"].map((name) => ({
      call_id: `call-${name}`,
      prompt_id: `prompt-${name}`,
      case_id: `case-${name}`,
      model: "model-a",
      trial: 1,
    }));
    const sent = [];
    const collection = await collectCalls({
      calls,
      requests: new Map(calls.map((call) => [call.prompt_id, { messages: [] }])),
      models: new Map([["model-a", {
        id: "model-a",
        provider_tag: "provider-a",
        endpoint_snapshot: "provider-a/model-a-snapshot",
      }]]),
      projectedCosts: new Map(calls.map((call) => [call.call_id, 0.4])),
      spendingCeilingUsd: 1,
      send: async ({ call }) => {
        sent.push(call.call_id);
        return { ...validDelivery(), cost_usd: 0.8 };
      },
    });

    expect(sent).toEqual(["call-one"]);
    expect(collection).toMatchObject({
      status: "suspended",
      reason: "spending_ceiling",
      accrued_cost_usd: 0.8,
      projected_remaining_cost_usd: 0.4,
      completed_calls: 1,
      remaining_calls: 1,
    });

    let retryAttempts = 0;
    const retryCollection = await collectCalls({
      calls: [calls[0]],
      requests: new Map([[calls[0].prompt_id, { messages: [] }]]),
      models: new Map([["model-a", {
        id: "model-a",
        provider_tag: "provider-a",
        endpoint_snapshot: "provider-a/model-a-snapshot",
      }]]),
      projectedCosts: new Map([[calls[0].call_id, 0.4]]),
      spendingCeilingUsd: 0.5,
      sleep: async () => {},
      send: async () => {
        retryAttempts += 1;
        return { ...validDelivery(), provider: "wrong-provider", cost_usd: 0.2 };
      },
    });
    expect(retryAttempts).toBe(1);
    expect(retryCollection).toMatchObject({
      status: "suspended",
      reason: "spending_ceiling",
      accrued_cost_usd: 0.2,
      completed_calls: 1,
    });
  });
});

function validDelivery() {
  return {
    http_status: 200,
    model: "model-a",
    provider: "provider-a",
    endpoint: "provider-a/model-a-snapshot",
    usage: { prompt_tokens: 10, completion_tokens: 4 },
    cost_usd: 0.001,
    response: {
      verdict: "block",
      malicious_probability: 0.8,
      severity: "high",
      submission_ids: ["submission-one"],
      evidence: "The supplied evidence composes into an unsafe policy.",
      category: "policy composition",
    },
  };
}
