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
        nestedPlan: {
          scenarioIds: ecological.nested_scenario_ids,
          trialsPerCell: 2,
          contexts: ["local", "cumulative"],
        },
        seed: 20260718,
      });

      expect(ecological.cases).toHaveLength(80);
      expect(new Set(ecological.cases.map(({ scenario_id }) => scenario_id)).size).toBe(40);
      expect(new Set(ecological.cases.map(({ template_id }) => template_id)).size).toBe(40);
      expect(new Set(ecological.cases.map(({ family }) => family)).size).toBe(8);
      expect(new Set(ecological.cases.map(({ instance }) => instance))).toEqual(new Set([1]));
      expect(ecological.nested_scenario_ids).toHaveLength(16);
      expect(new Set(ecological.nested_scenario_ids)).toEqual(
        new Set(study.active_subscription_design.design.nested_evaluation.scenario_ids),
      );
      expect(ecological.prompts).toHaveLength(896);
      expect(ecological.maximum_request_bytes).toBeLessThanOrEqual(4_000);
      expect(collection.calls).toHaveLength(2_816);
      const callsById = new Map(collection.calls.map((call) => [call.call_id, call]));
      const promptsById = new Map(ecological.prompts.map((prompt) => [prompt.prompt_id, prompt]));
      expect(collection.ground_truth.every((truth) => {
        const call = callsById.get(truth.call_id);
        const prompt = promptsById.get(call?.prompt_id);
        const supplied = JSON.stringify(prompt?.request ?? null);
        return truth.relevant_submission_ids.some((id) => supplied.includes(id));
      })).toBe(true);
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
      expect(pr.current_artifact.head_revision).toMatch(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/);
      expect(pr.prior_artifacts).toEqual([]);

      const trunk = evidence(ecological.prompts.find((prompt) =>
        prompt.decomposition === "split"
        && prompt.workflow === "trunk"
        && prompt.context === "local"
        && prompt.submission_index === 3
      ));
      expect(trunk.current_artifact.kind).toBe("main_commit");
      expect(trunk.current_artifact.commit_revision).toMatch(/^(?:[a-f0-9]{40}|[a-f0-9]{64})$/);
      expect(trunk.current_artifact.pipeline.trust).toBe("untrusted");
      expect(trunk.prior_artifacts).toEqual([]);

      const cumulative = evidence(ecological.prompts.find((prompt) =>
        ecological.nested_scenario_ids.includes(prompt.scenario_id)
        && prompt.decomposition === "split"
        && prompt.workflow === "pr"
        && prompt.context === "cumulative"
        && prompt.submission_index === 3
      ));
      expect(cumulative.current_artifact.kind).toBe("pull_request");
      expect(cumulative.prior_artifacts).toHaveLength(2);
      expect(cumulative.prior_artifacts.every(({ head_revision }) =>
        /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(head_revision)
      )).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }, 60_000);
});

function evidence(prompt) {
  return JSON.parse(prompt.request.messages[1].content).evidence;
}
