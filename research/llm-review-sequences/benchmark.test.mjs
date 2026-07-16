import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { generateBenchmark } from "./benchmark.mjs";

describe("safe benchmark generator", () => {
  it("executes every family and preserves paired sequence invariants", () => {
    const root = mkdtempSync(join(tmpdir(), "llm-review-benchmark-"));

    try {
      const benchmark = generateBenchmark(root, { variantsPerFamily: 2 });
      expect(benchmark.cases).toHaveLength(32);
      expect(new Set(benchmark.cases.map(({ scenario_id }) => scenario_id)).size).toBe(16);
      expect(new Set(benchmark.cases.map(({ family }) => family)).size).toBe(8);
      expect(benchmark.cards_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(benchmark.prompts_sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(benchmark.prompts).toHaveLength(512);
      expect(benchmark.prompts.every((prompt) => !("intent" in prompt))).toBe(true);
      expect(benchmark.prompts.every(({ case_id }) => /^[a-f0-9]{64}$/.test(case_id))).toBe(true);
      expect(benchmark.maximum_request_bytes).toBeLessThanOrEqual(4_000);
      expect(existsSync(join(root, "cards.json"))).toBe(true);
      expect(existsSync(join(root, "prompts.jsonl"))).toBe(true);

      for (const entry of benchmark.cases) {
        expect(JSON.stringify([entry.atomic.submissions, entry.split.submissions])).not.toContain(entry.intent);
        expect(entry.atomic.tree).toBe(entry.split.tree);
        expect(entry.atomic.submissions).toHaveLength(1);
        expect(entry.split.submissions).toHaveLength(3);
        expect(entry.atomic.submissions[0].timestamp).toBe(entry.split.submissions.at(-1).timestamp);
        expect(entry.atomic.submissions[0].changed_lines).toBe(
          entry.split.submissions.reduce((total, submission) => total + submission.changed_lines, 0),
        );
        expect(entry.unsafe_state).toBe(entry.intent === "malicious");
        expect(entry.safety_violations).toEqual([]);
        expect(entry.ground_truth_relevant_submissions).toEqual([1, 2, 3]);
      }

      for (const scenarioId of new Set(benchmark.cases.map(({ scenario_id }) => scenario_id))) {
        const [malicious, benign] = benchmark.cases.filter(({ scenario_id }) => scenario_id === scenarioId);
        expect(malicious.family).toBe(benign.family);
        expect(malicious.atomic.submissions[0].changed_lines).toBe(benign.atomic.submissions[0].changed_lines);
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 60_000);
});
