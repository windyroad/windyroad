import { readFileSync } from "node:fs";
import process from "node:process";
import { describe, expect, it } from "vitest";

import {
  buildHierarchicalPowerAudit,
  buildScheduleRecord,
  estimateCost,
  generateCallSchedule,
  runHierarchicalPowerSimulation,
  runPowerSimulation,
  summarizeSchedule,
} from "./design.mjs";

describe("preregistered study design", () => {
  it("simulates power and equivalence assurance deterministically", () => {
    const options = {
      scenarioCounts: [24, 48],
      simulations: 200,
      trialsPerCell: 3,
      seed: 20260716,
    };

    const first = runPowerSimulation(options);
    const second = runPowerSimulation(options);

    expect(first).toEqual(second);
    expect(first.candidates.map(({ scenario_pairs }) => scenario_pairs)).toEqual([24, 48]);
    for (const candidate of first.candidates) {
      expect(candidate.primary_power).toBeGreaterThanOrEqual(0);
      expect(candidate.primary_power).toBeLessThanOrEqual(1);
      expect(candidate.workflow_equivalence_assurance).toBeGreaterThanOrEqual(0);
      expect(candidate.workflow_equivalence_assurance).toBeLessThanOrEqual(1);
      expect(candidate.interaction_power).toBeGreaterThanOrEqual(0);
      expect(candidate.interaction_power).toBeLessThanOrEqual(1);
    }
  });

  it("requires adequate interaction power before selecting a sample size", () => {
    const result = runPowerSimulation({
      scenarioCounts: [160, 320],
      simulations: 1_000,
      trialsPerCell: 3,
      seed: 20260716,
    });

    expect(result.candidates[0].interaction_power).toBeLessThan(0.8);
    expect(result.selected_scenario_pairs).toBe(320);
  });

  it("audits power at the structural-template level deterministically", () => {
    const options = {
      layouts: [
        { structuralTemplates: 8, instancesPerTemplate: 2 },
        { structuralTemplates: 16, instancesPerTemplate: 1 },
      ],
      simulations: 200,
      trialsPerCell: 3,
      seed: 20260717,
    };

    const first = runHierarchicalPowerSimulation(options);
    const second = runHierarchicalPowerSimulation(options);

    expect(first).toEqual(second);
    expect(first.candidates.map(({ scenario_pairs }) => scenario_pairs)).toEqual([16, 16]);
    expect(first.candidates.map(({ structural_templates }) => structural_templates)).toEqual([8, 16]);
    for (const candidate of first.candidates) {
      expect(candidate.intent_discrimination_power).toBeGreaterThanOrEqual(0);
      expect(candidate.intent_discrimination_power).toBeLessThanOrEqual(1);
      expect(candidate.primary_power).toBeGreaterThanOrEqual(0);
      expect(candidate.primary_power).toBeLessThanOrEqual(1);
      expect(candidate.interaction_power).toBeGreaterThanOrEqual(0);
      expect(candidate.interaction_power).toBeLessThanOrEqual(1);
      expect(candidate.context_interaction_power).toBeGreaterThanOrEqual(0);
      expect(candidate.context_interaction_power).toBeLessThanOrEqual(1);
    }
  });

  it.skipIf(process.env.EXHAUSTIVE_POWER !== "1")(
    "reproduces the full hierarchical audit frozen in the study manifest",
    () => {
      const study = JSON.parse(readFileSync("research/llm-review-sequences/study.json", "utf8"));
      const audit = buildHierarchicalPowerAudit(study);

      expect(audit.candidates).toEqual(study.hierarchical_power_audit.candidate_layouts);
      expect(audit.selected_layout).toEqual(
        study.hierarchical_power_audit.selected_amendment_candidate,
      );
    },
    120_000,
  );

  it("generates a deterministic, balanced boundary-level call schedule", () => {
    const options = {
      scenarioCount: 2,
      models: ["model-a", "model-b"],
      trialsPerCell: 2,
      splitSubmissionCount: 3,
      seed: 42,
    };
    const first = generateCallSchedule(options);
    const second = generateCallSchedule(options);
    const otherSeed = generateCallSchedule({ ...options, seed: 43 });
    const summary = summarizeSchedule(first.rows);

    expect(first).toEqual(second);
    expect(first.sha256).not.toBe(otherSeed.sha256);
    expect(summary).toEqual({
      calls: 256,
      sequences: 128,
      calls_by_model: { "model-a": 128, "model-b": 128 },
      calls_by_decomposition: { atomic: 64, split: 192 },
    });
    expect(first.rows.every(({ schedule_index }, index) => schedule_index === index + 1)).toBe(true);
    expect(first.rows.every(({ submission_index, decomposition }) =>
      decomposition === "atomic" ? submission_index === 1 : submission_index >= 1 && submission_index <= 3,
    )).toBe(true);
  });

  it("schedules the scenario identifiers present in a benchmark subset", () => {
    const schedule = generateCallSchedule({
      scenarioIds: ["scenario-001", "scenario-177"],
      models: ["model-a"],
      trialsPerCell: 1,
    });

    expect(new Set(schedule.rows.map(({ scenario_id }) => scenario_id))).toEqual(
      new Set(["scenario-001", "scenario-177"]),
    );
    expect(schedule.rows).toHaveLength(64);
  });

  it("can schedule the subscription study without the cumulative-context ablation", () => {
    const schedule = generateCallSchedule({
      scenarioCount: 40,
      models: ["codex-cli", "claude-code"],
      trialsPerCell: 1,
      contexts: ["local"],
    });

    expect(schedule.rows).toHaveLength(1_280);
    expect(new Set(schedule.rows.map(({ context }) => context))).toEqual(new Set(["local"]));
  });

  it("estimates the maximum inference cost from frozen token ceilings", () => {
    expect(estimateCost({
      callsByModel: { "model-a": 10, "model-b": 20 },
      inputTokensPerCall: 1_500,
      outputTokensPerCall: 180,
      pricingPerMillionTokens: {
        "model-a": { input: 5, output: 30 },
        "model-b": { input: 3, output: 15 },
      },
    })).toEqual({
      by_model_usd: { "model-a": 0.129, "model-b": 0.144 },
      total_usd: 0.273,
    });
  });

  it("reproduces the schedule hash and cost frozen in the study manifest", () => {
    const study = JSON.parse(readFileSync("research/llm-review-sequences/study.json", "utf8"));
    const record = buildScheduleRecord(study);

    expect(record.sha256).toBe(study.randomization.schedule_sha256);
    expect(record.calls).toBe(study.randomization.call_count);
    expect(record.sequences).toBe(study.randomization.sequence_count);
    expect(record.cost.total_usd).toBe(study.inference_budget.estimated_total_usd);
  });

  it("reproduces the preregistration v2 candidate schedule and cost", () => {
    const study = JSON.parse(readFileSync("research/llm-review-sequences/study.json", "utf8"));
    const candidate = study.preregistration_v2_candidate;
    const record = buildScheduleRecord(study, { scenarioCount: candidate.scenario_pairs });

    expect(record.sha256).toBe(candidate.schedule_sha256);
    expect(record.calls).toBe(candidate.call_count);
    expect(record.sequences).toBe(candidate.sequence_count);
    expect(record.cost.total_usd).toBe(candidate.estimated_total_usd);
  });
});
