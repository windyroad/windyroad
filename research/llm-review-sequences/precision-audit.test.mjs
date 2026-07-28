import { describe, expect, it } from "vitest";

import {
  ACTIVE_DESIGN,
  DEFAULT_ASSUMPTION_SCENARIOS,
  fixedStrataWelchInterval,
  runPrecisionAudit,
  studentTCritical95,
} from "./precision-audit.mjs";

const FAST_OPTIONS = Object.freeze({
  simulations: 40,
  bootstrapReplicates: 100,
  seed: 20260719,
});

describe("active-design precision audit", () => {
  it("matches the frozen two-system base and nested sample counts", () => {
    expect(ACTIVE_DESIGN).toEqual({
      scenario_families: 8,
      base_structural_templates_per_family: 5,
      base_structural_templates: 40,
      nested_structural_templates_per_family: 2,
      nested_structural_templates: 16,
      review_systems: 2,
      base_local_trials_per_cell: 1,
      nested_local_trials_per_cell: 2,
      nested_cumulative_trials_per_cell: 2,
      sequence_trial_count_unit: "one sequence outcome for one review system in one trial",
      sequence_trials: 1408,
      review_boundaries: 2816,
      h1_h3_local_sequence_trials: 640,
      h1_h3_local_review_boundaries: 1280,
      h4_malicious_nested_sequence_trials: 512,
    });
    expect(ACTIVE_DESIGN.h4_malicious_nested_sequence_trials).toBe(
      ACTIVE_DESIGN.nested_structural_templates
      * 2 // decomposition
      * 2 // workflow
      * 2 // context
      * ACTIVE_DESIGN.review_systems
      * ACTIVE_DESIGN.nested_local_trials_per_cell,
    );
  });

  it("is deterministic and outcome-free", () => {
    const first = runPrecisionAudit(FAST_OPTIONS);
    const second = runPrecisionAudit(FAST_OPTIONS);
    const otherSeed = runPrecisionAudit({ ...FAST_OPTIONS, seed: 20260720 });

    expect(first).toEqual(second);
    expect(first).not.toEqual(otherSeed);
    expect(first.outcome_data_used).toBe(false);
    expect(first.design).toEqual(ACTIVE_DESIGN);
    expect(first.scenarios).toHaveLength(DEFAULT_ASSUMPTION_SCENARIOS.length);
  });

  it("reports bounded support, coverage, Monte Carlo error, and interval widths", () => {
    const audit = runPrecisionAudit(FAST_OPTIONS);

    for (const scenario of audit.scenarios) {
      expect(Object.keys(scenario.operating_characteristics_by_method)).toEqual([
        "family_stratified_percentile",
        "family_stratified_basic",
        "template_t",
        "fixed_strata_welch_t",
        "family_mean_t",
      ]);
      for (const method of Object.values(scenario.operating_characteristics_by_method)) {
        for (const hypothesis of ["h1_intent", "h2_split", "h3_workflow", "h4_context"]) {
          const result = method[hypothesis];
          expect(result.support_fraction).toBeGreaterThanOrEqual(0);
          expect(result.support_fraction).toBeLessThanOrEqual(1);
          expect(result.support_fraction_monte_carlo_se).toBeGreaterThanOrEqual(0);
          expect(result.coverage_fraction_around_simulated_mean_estimand).toBeGreaterThanOrEqual(0);
          expect(result.coverage_fraction_around_simulated_mean_estimand).toBeLessThanOrEqual(1);
          expect(result.expected_interval_width).toBeGreaterThanOrEqual(0);
          expect(result.interval_width_quantiles_10_50_90).toHaveLength(3);
        }
      }
    }
  });

  it("pins a small reproducibility fixture", () => {
    const audit = runPrecisionAudit({
      simulations: 20,
      bootstrapReplicates: 50,
      seed: 7,
      assumptionScenarios: [DEFAULT_ASSUMPTION_SCENARIOS[1]],
    });
    const central = audit.scenarios[0];

    expect(central.id).toBe("central_effects");
    expect(central.simulated_mean_estimands).toEqual({
      h1_intent: 0.49375,
      h2_split: -0.13875,
      h3_workflow: 0.081875,
      h4_context: 0.086328,
    });
  });

  it("labels the registered support interval and sensitivity methods accurately", () => {
    const audit = runPrecisionAudit(FAST_OPTIONS);

    expect(audit.analysis_roles).toEqual({
      registered_support_decision_interval: "fixed_strata_welch_t",
      sensitivity_interval: "family_stratified_percentile",
    });
    expect(audit.interval_methods.family_stratified_percentile).toMatchObject({
      registered_current_method: false,
      support_decision_method: false,
      sensitivity_only: true,
      superseded_for_support_decisions: true,
      recommended_as_primary: false,
    });
    expect(audit.interval_methods.family_stratified_basic.registered_current_method).toBe(false);
    expect(audit.interval_methods.template_t.degrees_of_freedom).toEqual({
      h1_h3: 39,
      h4: 15,
    });
    expect(audit.interval_methods.fixed_strata_welch_t).toMatchObject({
      registered_current_method: true,
      support_decision_method: true,
      sensitivity_only: false,
      superseded_for_support_decisions: false,
      recommended_as_primary: true,
    });
    expect(audit.interval_methods.fixed_strata_welch_t.estimand).toMatch(/fixed family/i);
    expect(audit.interval_methods.family_mean_t.degrees_of_freedom).toBe(7);
    expect(audit.interval_methods.family_mean_t.recommended_as_primary).toBe(false);
    expect(audit.simulation).not.toHaveProperty("registered_analysis_bootstrap_replicates");
    expect(audit.simulation.percentile_sensitivity_bootstrap_replicates).toBe(10_000);
    expect(audit.simulation.interval).toMatch(/sensitivity/i);
    expect(audit.simulation.note).toMatch(/sensitivity/i);
    expect(audit.simulation.note).not.toMatch(/\b(?:registered|current|primary|recommended)\b/i);
    expect(Object.values(audit.interval_methods.family_stratified_percentile)
      .filter((value) => typeof value === "string")
      .join(" ")).not.toMatch(/\b(?:registered|current|primary|recommended)\b/i);
    expect(audit.caveats.join(" ")).not.toMatch(/preregistered interval rule/i);
    expect(audit.recommendation).toMatch(/registered support-decision method/i);
    expect(audit.recommendation).not.toMatch(/preregistration amendment/i);
  });

  it("computes the fixed t critical values used by the comparison", () => {
    expect(studentTCritical95(7)).toBeCloseTo(2.364624, 6);
    expect(studentTCritical95(15)).toBeCloseTo(2.13145, 6);
    expect(studentTCritical95(39)).toBeCloseTo(2.022691, 6);
  });

  it("exports the exact fixed-strata Welch interval used by outcome analysis", () => {
    const result = fixedStrataWelchInterval([
      [1, 3],
      [2, 4],
    ]);

    expect(result.estimate).toBe(2.5);
    expect(result.standard_error).toBeCloseTo(Math.sqrt(0.5), 12);
    expect(result.degrees_of_freedom).toBeCloseTo(2, 12);
    expect(result.interval[0]).toBeCloseTo(-0.542435, 6);
    expect(result.interval[1]).toBeCloseTo(5.542435, 6);
    expect(fixedStrataWelchInterval([
      [1, 1],
      [1, 1],
    ])).toEqual({
      estimate: 1,
      standard_error: 0,
      interval: null,
      degrees_of_freedom: null,
      unavailable_reason: "all_within_stratum_variance_components_zero",
    });
    expect(() => fixedStrataWelchInterval([[1], [2, 3]])).toThrow(/two values/i);
    expect(() => fixedStrataWelchInterval([[1, Number.NaN], [2, 3]])).toThrow(/finite/i);
  });

  it("rejects invalid audit controls and malformed assumption scenarios", () => {
    expect(() => runPrecisionAudit({ simulations: 0 })).toThrow(/simulations/);
    expect(() => runPrecisionAudit({ bootstrapReplicates: 19 })).toThrow(/bootstrapReplicates/);
    expect(() => runPrecisionAudit({ seed: -1 })).toThrow(/seed/);
    expect(() => runPrecisionAudit({ assumptionScenarios: [] })).toThrow(/assumptionScenarios/);
    expect(() => runPrecisionAudit({
      ...FAST_OPTIONS,
      assumptionScenarios: [{ id: "broken" }],
    })).toThrow(/scenario/);
  });
});
