import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateBenchmark } from "./benchmark.mjs";
import { generateCollection } from "./collection.mjs";

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
});
