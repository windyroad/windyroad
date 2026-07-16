import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";
import { describe, expect, it } from "vitest";

import { generateBenchmark } from "./benchmark.mjs";
import { generateCollection } from "./collection.mjs";
import { generateEcologicalBenchmark } from "./ecological.mjs";

describe("ecological workflow layer", () => {
  it("renders a balanced native-artifact subset with a separate blinded schedule", () => {
    const study = JSON.parse(readFileSync(
      join(process.cwd(), "research/llm-review-sequences/study.json"),
      "utf8",
    ));
    const root = mkdtempSync(join(tmpdir(), "llm-review-ecological-"));
    const controlledRoot = join(root, "controlled");
    const ecologicalRoot = join(root, "ecological");
    const collectionRoot = join(root, "collection");

    try {
      generateBenchmark(controlledRoot);
      const ecological = generateEcologicalBenchmark(controlledRoot, ecologicalRoot);
      const collection = generateCollection(ecologicalRoot, collectionRoot, {
        models: study.active_subscription_design.review_systems.map(({ id }) => id),
        trialsPerCell: 1,
        contexts: ["local"],
        seed: 20260718,
      });

      expect(ecological.cases).toHaveLength(80);
      expect(new Set(ecological.cases.map(({ scenario_id }) => scenario_id)).size).toBe(40);
      expect(new Set(ecological.cases.map(({ template_id }) => template_id)).size).toBe(40);
      expect(new Set(ecological.cases.map(({ family }) => family)).size).toBe(8);
      expect(new Set(ecological.cases.map(({ instance }) => instance))).toEqual(new Set([1]));
      expect(ecological.prompts).toHaveLength(640);
      expect(ecological.maximum_request_bytes).toBeLessThanOrEqual(4_000);
      expect(collection.calls).toHaveLength(1_280);
      expect({
        cards_sha256: ecological.cards_sha256,
        prompts_sha256: ecological.prompts_sha256,
        maximum_request_bytes: ecological.maximum_request_bytes,
        schedule_sha256: collection.summary.schedule_sha256,
        calls_sha256: collection.calls_sha256,
        ground_truth_sha256: collection.ground_truth_sha256,
      }).toEqual({
        cards_sha256: study.ecological_layer.cards_sha256,
        prompts_sha256: study.ecological_layer.prompts_sha256,
        maximum_request_bytes: study.ecological_layer.maximum_request_bytes,
        schedule_sha256: study.ecological_layer.schedule_sha256,
        calls_sha256: study.ecological_layer.calls_sha256,
        ground_truth_sha256: study.ecological_layer.ground_truth_sha256,
      });

      const pr = evidence(ecological.prompts.find((prompt) =>
        prompt.decomposition === "atomic"
        && prompt.workflow === "pr"
        && prompt.context === "local"
      ));
      expect(pr.current_artifact.kind).toBe("pull_request");
      expect(pr.prior_artifacts).toEqual([]);

      const trunk = evidence(ecological.prompts.find((prompt) =>
        prompt.decomposition === "split"
        && prompt.workflow === "trunk"
        && prompt.context === "local"
        && prompt.submission_index === 3
      ));
      expect(trunk.current_artifact.kind).toBe("main_commit");
      expect(trunk.current_artifact.pipeline.trust).toBe("untrusted");
      expect(trunk.prior_artifacts).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 60_000);
});

function evidence(prompt) {
  return JSON.parse(prompt.request.messages[1].content).evidence;
}
