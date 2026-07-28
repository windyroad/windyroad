import process from "node:process";
import { pathToFileURL } from "node:url";

export const ACTIVE_DESIGN = Object.freeze({
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

const NULL_SCENARIO = Object.freeze({
  id: "global_null",
  label: "Global-null calibration diagnostic",
  benign_false_positive_rate: 0.10,
  malicious_atomic_recall: 0.10,
  split_risk_difference: 0,
  workflow_risk_difference: 0,
  decomposition_workflow_interaction_risk_difference: 0,
  cumulative_main_risk_difference: 0,
  context_mitigation_risk_difference: 0,
  template_random_intercept_logit_sd: 0.75,
  template_split_slope_logit_sd: 0,
  template_workflow_slope_logit_sd: 0,
  template_interaction_slope_logit_sd: 0,
  template_context_slope_logit_sd: 0,
  review_system_logit_offsets: [-0.15, 0.15],
});

const CENTRAL_SCENARIO = Object.freeze({
  id: "central_effects",
  label: "Earlier preregistration central effects extended to the active design",
  benign_false_positive_rate: 0.10,
  malicious_atomic_recall: 0.65,
  split_risk_difference: -0.15,
  workflow_risk_difference: 0.10,
  decomposition_workflow_interaction_risk_difference: 0,
  cumulative_main_risk_difference: 0,
  context_mitigation_risk_difference: 0.10,
  template_random_intercept_logit_sd: 0.75,
  template_split_slope_logit_sd: 0.35,
  template_workflow_slope_logit_sd: 0.35,
  template_interaction_slope_logit_sd: 0.35,
  template_context_slope_logit_sd: 0.35,
  review_system_logit_offsets: [-0.15, 0.15],
});

const SMALLER_SCENARIO = Object.freeze({
  id: "smaller_effects",
  label: "Smaller-effect sensitivity diagnostic",
  benign_false_positive_rate: 0.10,
  malicious_atomic_recall: 0.65,
  split_risk_difference: -0.08,
  workflow_risk_difference: 0.05,
  decomposition_workflow_interaction_risk_difference: 0,
  cumulative_main_risk_difference: 0,
  context_mitigation_risk_difference: 0.05,
  template_random_intercept_logit_sd: 0.75,
  template_split_slope_logit_sd: 0.35,
  template_workflow_slope_logit_sd: 0.35,
  template_interaction_slope_logit_sd: 0.35,
  template_context_slope_logit_sd: 0.35,
  review_system_logit_offsets: [-0.15, 0.15],
});

export const DEFAULT_ASSUMPTION_SCENARIOS = Object.freeze([
  NULL_SCENARIO,
  CENTRAL_SCENARIO,
  SMALLER_SCENARIO,
]);

const HYPOTHESES = Object.freeze({
  h1_intent: Object.freeze({
    sample: "40 structural templates, five in each of eight families",
    support_rule: "lower endpoint of the 95% interval is greater than zero",
    supported: ([lower]) => lower > 0,
  }),
  h2_split: Object.freeze({
    sample: "40 structural templates, five in each of eight families",
    support_rule: "upper endpoint of the 95% interval is less than zero",
    supported: ([, upper]) => upper < 0,
  }),
  h3_workflow: Object.freeze({
    sample: "40 structural templates, five in each of eight families",
    support_rule: "the 95% interval excludes zero in either direction",
    supported: ([lower, upper]) => lower > 0 || upper < 0,
  }),
  h4_context: Object.freeze({
    sample: "16 nested structural templates, two in each of eight families",
    support_rule: "lower endpoint of the 95% interval is greater than zero",
    supported: ([lower]) => lower > 0,
  }),
});

const INTERVAL_METHODS = Object.freeze({
  family_stratified_percentile: Object.freeze({
    registered_current_method: false,
    support_decision_method: false,
    sensitivity_only: true,
    superseded_for_support_decisions: true,
    recommended_as_primary: false,
    estimand: "Equal mean of the eight fixed family strata, with templates resampled within family.",
    assumptions: "Templates are exchangeable within each fixed family; percentile-bootstrap calibration is adequate at five or two templates per stratum.",
  }),
  family_stratified_basic: Object.freeze({
    registered_current_method: false,
    support_decision_method: false,
    sensitivity_only: false,
    superseded_for_support_decisions: false,
    recommended_as_primary: false,
    estimand: "Equal mean of the eight fixed family strata, with templates resampled within family.",
    assumptions: "Templates are exchangeable within each fixed family and bootstrap bias reflection improves finite-sample calibration.",
  }),
  template_t: Object.freeze({
    registered_current_method: false,
    support_decision_method: false,
    sensitivity_only: false,
    superseded_for_support_decisions: false,
    recommended_as_primary: false,
    estimand: "Unstratified mean of template-level paired contrasts; equal family sizes make its point estimate equal the fixed-strata mean.",
    assumptions: "Template contrasts are independent and approximately normal with a common variance across families.",
    degrees_of_freedom: Object.freeze({ h1_h3: 39, h4: 15 }),
  }),
  fixed_strata_welch_t: Object.freeze({
    registered_current_method: true,
    support_decision_method: true,
    sensitivity_only: false,
    superseded_for_support_decisions: false,
    recommended_as_primary: true,
    estimand: "Equal mean of eight fixed family-stratum means.",
    assumptions: "Templates are independent within fixed family strata; each stratum variance is estimated separately and combined with Welch-Satterthwaite degrees of freedom.",
  }),
  family_mean_t: Object.freeze({
    registered_current_method: false,
    support_decision_method: false,
    sensitivity_only: false,
    superseded_for_support_decisions: false,
    recommended_as_primary: false,
    estimand: "Mean of eight family means treated as eight independent observations.",
    assumptions: "The eight purposively selected families behave as a random sample from a family superpopulation; this is not the registered conditional estimand.",
    degrees_of_freedom: 7,
  }),
});

const DEFAULTS = Object.freeze({
  simulations: 1_000,
  bootstrapReplicates: 1_000,
  seed: 20260719,
});

export function runPrecisionAudit(options = {}) {
  const simulations = options.simulations ?? DEFAULTS.simulations;
  const bootstrapReplicates = options.bootstrapReplicates ?? DEFAULTS.bootstrapReplicates;
  const seed = options.seed ?? DEFAULTS.seed;
  const assumptionScenarios = options.assumptionScenarios ?? DEFAULT_ASSUMPTION_SCENARIOS;
  validateControls({ simulations, bootstrapReplicates, seed, assumptionScenarios });

  const scenarios = assumptionScenarios.map((scenario, scenarioIndex) => {
    validateScenario(scenario);
    return simulateScenario({
      scenario,
      scenarioIndex,
      simulations,
      bootstrapReplicates,
      seed,
    });
  });

  return {
    audit_type: "prospective active-design precision and operating-characteristic sensitivity audit",
    diagnostic_only: true,
    outcome_data_used: false,
    guarantees_target_power: false,
    design: ACTIVE_DESIGN,
    analysis_roles: {
      registered_support_decision_interval: "fixed_strata_welch_t",
      sensitivity_interval: "family_stratified_percentile",
    },
    simulation: {
      simulations_per_scenario: simulations,
      diagnostic_bootstrap_replicates: bootstrapReplicates,
      percentile_sensitivity_bootstrap_replicates: 10_000,
      seed,
      interval: "family-stratified structural-template percentile-bootstrap sensitivity interval, 95%",
      note: bootstrapReplicates === 10_000
        ? "The diagnostic uses the planned percentile-bootstrap sensitivity replicate count."
        : "The diagnostic uses fewer bootstrap replicates than the planned percentile-bootstrap sensitivity analysis for routine runtime; this adds Monte Carlo approximation to interval endpoints.",
    },
    data_generating_model: {
      outcome: "Bernoulli blocked-by-activation sequence outcome",
      pairing: "One template intercept is shared across all paired cells; zero-mean treatment slopes are shared across the relevant malicious decomposition, workflow, and context contrasts, review systems, and repeated trials.",
      review_systems: "Two conditionally independent review systems with fixed symmetric logit offsets; systems and repeated trials reduce cell noise but do not increase the structural-template sample size.",
      effect_scale: "Named risk differences set cell probabilities before zero-mean logit-scale template heterogeneity is applied.",
      nested_design: "The first two exchangeable simulated templates per family stand in for the prospectively selected two-template nested stratum.",
      trial_policy: "H1-H3 use only local trial 1 for every template. H4 averages local trials 1 and 2 and cumulative trials 1 and 2 within each nested cell.",
    },
    interval_methods: INTERVAL_METHODS,
    scenarios,
    recommendation: buildRecommendation(scenarios),
    interpretation: "Support fractions, coverage diagnostics, and expected widths are conditional on the stated hypothetical data-generating models. They are sensitivity diagnostics, not guaranteed power, achieved power, or evidence about model effectiveness.",
    caveats: [
      "The 40 templates and two subscription-backed review products are fixed convenience samples, not random samples from all code changes or review systems.",
      "The simulation cannot identify the real products' dependence, calibration, refusal behavior, hidden system instructions, or template-specific effect distribution before outcomes exist.",
      "The family-stratified percentile-bootstrap sensitivity conditions on the eight represented families and has only five templates per family for H1-H3 and two per family for H4.",
      "No multiplicity correction is simulated across H1-H4; each support fraction applies its hypothesis-specific directional interval rule.",
      "Null support fractions diagnose the finite-sample procedure only under the homogeneous global-null assumptions shown here.",
      "A bootstrap-t interval is not included: studentizing family-stratified resamples is unstable when H4 has only two discrete template contrasts per family. The fixed-strata Welch-Satterthwaite interval is the direct studentized comparison used instead.",
      "Expected interval widths can remain large even when a directional support fraction is high; all outcome reporting must retain point estimates and intervals.",
    ],
  };
}

function simulateScenario({ scenario, scenarioIndex, simulations, bootstrapReplicates, seed }) {
  const estimates = Object.fromEntries(Object.keys(HYPOTHESES).map((name) => [name, []]));
  const records = Object.fromEntries(Object.keys(INTERVAL_METHODS).map((method) => [
    method,
    Object.fromEntries(Object.keys(HYPOTHESES).map((name) => [name, []])),
  ]));
  for (let simulation = 0; simulation < simulations; simulation += 1) {
    const dataRng = createRng(mixSeed(seed, scenarioIndex, simulation, 0x51ed270b));
    const baseBootstrapRng = createRng(mixSeed(seed, scenarioIndex, simulation, 0x85ebca6b));
    const nestedBootstrapRng = createRng(mixSeed(seed, scenarioIndex, simulation, 0xc2b2ae35));
    const dataset = simulateDataset(scenario, dataRng);
    const intervals = intervalComparison(
      dataset,
      baseBootstrapRng,
      nestedBootstrapRng,
      bootstrapReplicates,
    );
    for (const name of Object.keys(HYPOTHESES)) {
      estimates[name].push(dataset.estimates[name]);
      for (const method of Object.keys(INTERVAL_METHODS)) {
        records[method][name].push({
          estimate: dataset.estimates[name],
          ...intervals[method][name],
        });
      }
    }
  }

  const simulatedMeans = Object.fromEntries(Object.entries(estimates).map(([name, values]) => [
    name,
    mean(values),
  ]));
  const operatingCharacteristics = Object.fromEntries(Object.entries(records).map(
    ([method, hypothesisRecords]) => [method, Object.fromEntries(
      Object.entries(hypothesisRecords).map(([name, values]) => [
        name,
        summarizeIntervals(values, simulatedMeans[name], simulations, HYPOTHESES[name]),
      ]),
    )],
  ));

  return {
    id: scenario.id,
    label: scenario.label,
    assumptions: scenario,
    simulated_mean_estimands: Object.fromEntries(Object.entries(simulatedMeans)
      .map(([name, value]) => [name, round(value)])),
    operating_characteristics_by_method: operatingCharacteristics,
  };
}

function summarizeIntervals(values, estimand, simulations, hypothesis) {
  const available = values.filter(({ interval }) => Array.isArray(interval));
  const widths = available.map(({ interval: [lower, upper] }) => upper - lower);
  const supported = available.filter(({ interval }) => hypothesis.supported(interval)).length;
  const covered = available.filter(({ interval: [lower, upper] }) =>
    lower <= estimand && estimand <= upper).length;
  const supportFraction = supported / simulations;
  const result = {
    structural_template_sample: hypothesis.sample,
    support_rule: hypothesis.support_rule,
    support_fraction: round(supportFraction),
    support_fraction_monte_carlo_se: round(
      Math.sqrt((supportFraction * (1 - supportFraction)) / simulations),
    ),
    coverage_fraction_around_simulated_mean_estimand: round(covered / simulations),
    interval_unavailable_fraction: round((simulations - available.length) / simulations),
    expected_interval_width: widths.length ? round(mean(widths)) : null,
    interval_width_quantiles_10_50_90: widths.length
      ? [0.10, 0.50, 0.90].map((probability) => round(quantile(widths, probability)))
      : null,
  };
  const degreesOfFreedom = values
    .map(({ degrees_of_freedom: value }) => value)
    .filter(Number.isFinite);
  if (degreesOfFreedom.length) {
    result.effective_degrees_of_freedom_mean = round(mean(degreesOfFreedom));
    result.effective_degrees_of_freedom_quantiles_10_50_90 = [0.10, 0.50, 0.90]
      .map((probability) => round(quantile(degreesOfFreedom, probability)));
  }
  return result;
}

function buildRecommendation(scenarios) {
  const globalNull = scenarios.find(({ id }) => id === "global_null");
  if (!globalNull) {
    return "No interval-method recommendation is made without the global-null simulation diagnostic.";
  }
  const fixedStrata = globalNull.operating_characteristics_by_method.fixed_strata_welch_t;
  const directional = [fixedStrata.h1_intent, fixedStrata.h2_split, fixedStrata.h4_context];
  const nearNominal = directional.every(({ support_fraction }) => support_fraction <= 0.06)
    && fixedStrata.h3_workflow.support_fraction <= 0.07
    && Object.values(fixedStrata).every(
      ({ coverage_fraction_around_simulated_mean_estimand: coverage }) => coverage >= 0.93,
    );
  return nearNominal
    ? "Registered support-decision method: retain the fixed-strata Welch-Satterthwaite t interval. It preserves the equal-weight conditional estimand over the eight fixed families and meets the prespecified near-nominal global-null calibration screen in this assumption-conditional diagnostic. The family-stratified percentile bootstrap is sensitivity only and is superseded for support decisions. Retain the family-mean t interval only as a diagnostic comparison because treating the eight purposive families as random changes the inferential assumption."
    : "Registered support-decision method: retain the prospectively selected fixed-strata Welch-Satterthwaite t interval and report this failed calibration screen prominently; do not change methods based on outcomes. The family-stratified percentile bootstrap remains sensitivity only and superseded for support decisions. Obtain independent methods review before collection if this result comes from the frozen default diagnostic rather than a reduced-runtime test run.";
}

function simulateDataset(scenario, rng) {
  const base = Array.from({ length: ACTIVE_DESIGN.scenario_families }, () => []);
  const nested = Array.from({ length: ACTIVE_DESIGN.scenario_families }, () => []);

  for (let family = 0; family < ACTIVE_DESIGN.scenario_families; family += 1) {
    for (
      let template = 0;
      template < ACTIVE_DESIGN.base_structural_templates_per_family;
      template += 1
    ) {
      const isNested = template < ACTIVE_DESIGN.nested_structural_templates_per_family;
      const effects = {
        intercept: normal(rng) * scenario.template_random_intercept_logit_sd,
        split: normal(rng) * scenario.template_split_slope_logit_sd,
        workflow: normal(rng) * scenario.template_workflow_slope_logit_sd,
        interaction: normal(rng) * scenario.template_interaction_slope_logit_sd,
        context: normal(rng) * scenario.template_context_slope_logit_sd,
      };
      const localTrials = isNested
        ? ACTIVE_DESIGN.nested_local_trials_per_cell
        : ACTIVE_DESIGN.base_local_trials_per_cell;
      const local = new Map();
      for (const intent of ["malicious", "benign"]) {
        for (const decomposition of ["atomic", "split"]) {
          for (const workflow of ["pr", "trunk"]) {
            local.set(
              cellKey(intent, decomposition, workflow),
              simulateCell({
                intent,
                decomposition,
                workflow,
                context: "local",
                trials: localTrials,
                effects,
                scenario,
                rng,
              }),
            );
          }
        }
      }

      const localTrialOne = (intent, decomposition, workflow) =>
        local.get(cellKey(intent, decomposition, workflow)).trial_one_mean;
      const malicious = (decomposition, workflow) =>
        localTrialOne("malicious", decomposition, workflow);
      const intentContrast = mean(["atomic", "split"].flatMap((decomposition) =>
        ["pr", "trunk"].map((workflow) =>
          localTrialOne("malicious", decomposition, workflow)
          - localTrialOne("benign", decomposition, workflow))));
      const splitContrast = mean(["pr", "trunk"].map((workflow) =>
        malicious("split", workflow) - malicious("atomic", workflow)));
      const workflowContrast = mean(["atomic", "split"].map((decomposition) =>
        malicious(decomposition, "trunk") - malicious(decomposition, "pr")));
      base[family].push({
        h1_intent: intentContrast,
        h2_split: splitContrast,
        h3_workflow: workflowContrast,
      });

      if (isNested) {
        const cumulative = new Map();
        for (const decomposition of ["atomic", "split"]) {
          for (const workflow of ["pr", "trunk"]) {
            cumulative.set(
              cellKey("malicious", decomposition, workflow),
              simulateCell({
                intent: "malicious",
                decomposition,
                workflow,
                context: "cumulative",
                trials: ACTIVE_DESIGN.nested_cumulative_trials_per_cell,
                effects,
                scenario,
                rng,
              }),
            );
          }
        }
        const nestedLocal = (decomposition, workflow) =>
          local.get(cellKey("malicious", decomposition, workflow)).all_trials_mean;
        const nestedCumulative = (decomposition, workflow) =>
          cumulative.get(cellKey("malicious", decomposition, workflow)).all_trials_mean;
        const h4 = mean(["pr", "trunk"].map((workflow) =>
          (nestedCumulative("split", workflow) - nestedCumulative("atomic", workflow))
          - (nestedLocal("split", workflow) - nestedLocal("atomic", workflow))));
        nested[family].push({ h4_context: h4 });
      }
    }
  }

  return {
    base,
    nested,
    estimates: {
      h1_intent: stratifiedMean(base, "h1_intent"),
      h2_split: stratifiedMean(base, "h2_split"),
      h3_workflow: stratifiedMean(base, "h3_workflow"),
      h4_context: stratifiedMean(nested, "h4_context"),
    },
  };
}

function simulateCell({ intent, decomposition, workflow, context, trials, effects, scenario, rng }) {
  let targetRisk = intent === "malicious"
    ? scenario.malicious_atomic_recall
    : scenario.benign_false_positive_rate;
  if (intent === "malicious") {
    if (decomposition === "split") targetRisk += scenario.split_risk_difference;
    if (workflow === "trunk") targetRisk += scenario.workflow_risk_difference;
    if (decomposition === "split" && workflow === "trunk") {
      targetRisk += scenario.decomposition_workflow_interaction_risk_difference;
    }
    if (context === "cumulative") {
      targetRisk += scenario.cumulative_main_risk_difference;
      if (decomposition === "split") targetRisk += scenario.context_mitigation_risk_difference;
    }
  }
  const centralLogit = logit(targetRisk);
  let detections = 0;
  let trialOneDetections = 0;
  for (const systemOffset of scenario.review_system_logit_offsets) {
    let cellLogit = centralLogit + effects.intercept + systemOffset;
    if (intent === "malicious") {
      if (decomposition === "split") cellLogit += effects.split;
      if (workflow === "trunk") cellLogit += effects.workflow;
      if (decomposition === "split" && workflow === "trunk") cellLogit += effects.interaction;
      if (context === "cumulative" && decomposition === "split") cellLogit += effects.context;
    }
    const probability = logistic(cellLogit);
    for (let trial = 0; trial < trials; trial += 1) {
      const detected = rng() < probability ? 1 : 0;
      detections += detected;
      if (trial === 0) trialOneDetections += detected;
    }
  }
  return {
    trial_one_mean: trialOneDetections / ACTIVE_DESIGN.review_systems,
    all_trials_mean: detections / (ACTIVE_DESIGN.review_systems * trials),
  };
}

function intervalComparison(dataset, baseRng, nestedRng, replicates) {
  const distributions = {
    h1_intent: [],
    h2_split: [],
    h3_workflow: [],
    h4_context: [],
  };
  for (let replicate = 0; replicate < replicates; replicate += 1) {
    const baseSums = { h1_intent: 0, h2_split: 0, h3_workflow: 0 };
    let baseCount = 0;
    for (const family of dataset.base) {
      for (let draw = 0; draw < family.length; draw += 1) {
        const selected = family[Math.floor(baseRng() * family.length)];
        for (const name of Object.keys(baseSums)) baseSums[name] += selected[name];
        baseCount += 1;
      }
    }
    for (const name of Object.keys(baseSums)) distributions[name].push(baseSums[name] / baseCount);

    let nestedSum = 0;
    let nestedCount = 0;
    for (const family of dataset.nested) {
      for (let draw = 0; draw < family.length; draw += 1) {
        nestedSum += family[Math.floor(nestedRng() * family.length)].h4_context;
        nestedCount += 1;
      }
    }
    distributions.h4_context.push(nestedSum / nestedCount);
  }

  const percentile = Object.fromEntries(Object.entries(distributions).map(([name, values]) => [
    name,
    { interval: [quantile(values, 0.025), quantile(values, 0.975)] },
  ]));
  const basic = Object.fromEntries(Object.entries(percentile).map(([name, { interval }]) => [
    name,
    {
      interval: [
        (2 * dataset.estimates[name]) - interval[1],
        (2 * dataset.estimates[name]) - interval[0],
      ],
    },
  ]));
  return {
    family_stratified_percentile: percentile,
    family_stratified_basic: basic,
    template_t: {
      h1_intent: tInterval(dataset.base.flat().map((row) => row.h1_intent)),
      h2_split: tInterval(dataset.base.flat().map((row) => row.h2_split)),
      h3_workflow: tInterval(dataset.base.flat().map((row) => row.h3_workflow)),
      h4_context: tInterval(dataset.nested.flat().map((row) => row.h4_context)),
    },
    fixed_strata_welch_t: {
      h1_intent: fixedStrataWelchInterval(dataset.base, (row) => row.h1_intent),
      h2_split: fixedStrataWelchInterval(dataset.base, (row) => row.h2_split),
      h3_workflow: fixedStrataWelchInterval(dataset.base, (row) => row.h3_workflow),
      h4_context: fixedStrataWelchInterval(dataset.nested, (row) => row.h4_context),
    },
    family_mean_t: {
      h1_intent: tInterval(dataset.base.map((family) => mean(family.map((row) => row.h1_intent)))),
      h2_split: tInterval(dataset.base.map((family) => mean(family.map((row) => row.h2_split)))),
      h3_workflow: tInterval(dataset.base.map((family) => mean(family.map((row) => row.h3_workflow)))),
      h4_context: tInterval(dataset.nested.map((family) => mean(family.map((row) => row.h4_context)))),
    },
  };
}

function tInterval(values) {
  const estimate = mean(values);
  const degreesOfFreedom = values.length - 1;
  const standardError = Math.sqrt(sampleVariance(values) / values.length);
  const halfWidth = studentTCritical95(degreesOfFreedom) * standardError;
  return {
    interval: [estimate - halfWidth, estimate + halfWidth],
    degrees_of_freedom: degreesOfFreedom,
  };
}

export function fixedStrataWelchInterval(families, valueAccessor = (value) => value) {
  if (!Array.isArray(families) || families.length < 2) {
    throw new Error("fixedStrataWelchInterval requires at least two family strata");
  }
  if (typeof valueAccessor !== "function") throw new Error("valueAccessor must be a function");
  const valuesByFamily = families.map((family) => {
    if (!Array.isArray(family) || family.length < 2) {
      throw new Error("Each fixed family stratum requires at least two values");
    }
    const values = family.map(valueAccessor);
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error("Fixed-strata contrast values must be finite");
    }
    return values;
  });
  const familyMeans = valuesByFamily.map(mean);
  const components = valuesByFamily.map((values) => sampleVariance(values) / values.length);
  const componentSum = components.reduce((total, value) => total + value, 0);
  const estimate = mean(familyMeans);
  if (componentSum === 0) {
    return {
      estimate,
      standard_error: 0,
      interval: null,
      degrees_of_freedom: null,
      unavailable_reason: "all_within_stratum_variance_components_zero",
    };
  }
  const familyCount = families.length;
  const standardError = Math.sqrt(componentSum / (familyCount ** 2));
  const denominator = components.reduce((total, component, index) =>
    total + ((component ** 2) / (valuesByFamily[index].length - 1)), 0);
  const degreesOfFreedom = (componentSum ** 2) / denominator;
  const halfWidth = studentTCritical95(degreesOfFreedom) * standardError;
  return {
    estimate,
    standard_error: standardError,
    interval: [estimate - halfWidth, estimate + halfWidth],
    degrees_of_freedom: degreesOfFreedom,
  };
}

function stratifiedMean(families, name) {
  return mean(families.flatMap((family) => family.map((value) => value[name])));
}

function cellKey(intent, decomposition, workflow) {
  return `${intent}\u0000${decomposition}\u0000${workflow}`;
}

function validateControls({ simulations, bootstrapReplicates, seed, assumptionScenarios }) {
  if (!Number.isInteger(simulations) || simulations < 1) {
    throw new Error("simulations must be a positive integer");
  }
  if (!Number.isInteger(bootstrapReplicates) || bootstrapReplicates < 20) {
    throw new Error("bootstrapReplicates must be an integer of at least 20");
  }
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffff_ffff) {
    throw new Error("seed must be an unsigned 32-bit integer");
  }
  if (!Array.isArray(assumptionScenarios) || !assumptionScenarios.length) {
    throw new Error("assumptionScenarios must be a non-empty array");
  }
}

function validateScenario(scenario) {
  const probabilityFields = ["benign_false_positive_rate", "malicious_atomic_recall"];
  const effectFields = [
    "split_risk_difference",
    "workflow_risk_difference",
    "decomposition_workflow_interaction_risk_difference",
    "cumulative_main_risk_difference",
    "context_mitigation_risk_difference",
  ];
  const deviationFields = [
    "template_random_intercept_logit_sd",
    "template_split_slope_logit_sd",
    "template_workflow_slope_logit_sd",
    "template_interaction_slope_logit_sd",
    "template_context_slope_logit_sd",
  ];
  if (!scenario || typeof scenario.id !== "string" || !scenario.id
    || typeof scenario.label !== "string" || !scenario.label) {
    throw new Error("Each assumption scenario needs a non-empty id and label");
  }
  for (const field of probabilityFields) {
    if (!(scenario[field] > 0 && scenario[field] < 1)) {
      throw new Error(`Invalid scenario probability: ${field}`);
    }
  }
  for (const field of effectFields) {
    if (!Number.isFinite(scenario[field])) throw new Error(`Invalid scenario effect: ${field}`);
  }
  for (const field of deviationFields) {
    if (!Number.isFinite(scenario[field]) || scenario[field] < 0) {
      throw new Error(`Invalid scenario standard deviation: ${field}`);
    }
  }
  if (!Array.isArray(scenario.review_system_logit_offsets)
    || scenario.review_system_logit_offsets.length !== ACTIVE_DESIGN.review_systems
    || scenario.review_system_logit_offsets.some((value) => !Number.isFinite(value))) {
    throw new Error("Invalid scenario review_system_logit_offsets");
  }
  for (const intent of ["malicious", "benign"]) {
    for (const decomposition of ["atomic", "split"]) {
      for (const workflow of ["pr", "trunk"]) {
        for (const context of ["local", "cumulative"]) {
          let probability = intent === "malicious"
            ? scenario.malicious_atomic_recall
            : scenario.benign_false_positive_rate;
          if (intent === "malicious") {
            if (decomposition === "split") probability += scenario.split_risk_difference;
            if (workflow === "trunk") probability += scenario.workflow_risk_difference;
            if (decomposition === "split" && workflow === "trunk") {
              probability += scenario.decomposition_workflow_interaction_risk_difference;
            }
            if (context === "cumulative") {
              probability += scenario.cumulative_main_risk_difference;
              if (decomposition === "split") {
                probability += scenario.context_mitigation_risk_difference;
              }
            }
          }
          if (!(probability > 0 && probability < 1)) {
            throw new Error("Scenario risk differences produce a probability outside (0, 1)");
          }
        }
      }
    }
  }
}

function mixSeed(seed, scenarioIndex, simulation, stream) {
  let value = seed ^ Math.imul(scenarioIndex + 1, 0x9e3779b1);
  value ^= Math.imul(simulation + 1, 0x27d4eb2d);
  value ^= stream;
  value = Math.imul(value ^ (value >>> 16), 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return (value ^ (value >>> 16)) >>> 0;
}

function createRng(seed) {
  let state = seed || 0x6d2b79f5;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 0x1_0000_0000;
  };
}

function normal(rng) {
  const first = Math.max(rng(), Number.EPSILON);
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * rng());
}

function logistic(value) {
  return 1 / (1 + Math.exp(-value));
}

function logit(probability) {
  return Math.log(probability / (1 - probability));
}

export function studentTCritical95(degreesOfFreedom) {
  if (!(degreesOfFreedom > 0)) throw new Error("Student t degrees of freedom must be positive");
  let lower = 0;
  let upper = 2;
  while (studentTCdf(upper, degreesOfFreedom) < 0.975) upper *= 2;
  for (let iteration = 0; iteration < 60; iteration += 1) {
    const midpoint = (lower + upper) / 2;
    if (studentTCdf(midpoint, degreesOfFreedom) < 0.975) lower = midpoint;
    else upper = midpoint;
  }
  return (lower + upper) / 2;
}

function studentTCdf(value, degreesOfFreedom) {
  if (value === 0) return 0.5;
  const x = degreesOfFreedom / (degreesOfFreedom + (value ** 2));
  const tail = 0.5 * regularizedIncompleteBeta(x, degreesOfFreedom / 2, 0.5);
  return value > 0 ? 1 - tail : tail;
}

function regularizedIncompleteBeta(x, alpha, beta) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const factor = Math.exp(
    logGamma(alpha + beta)
    - logGamma(alpha)
    - logGamma(beta)
    + (alpha * Math.log(x))
    + (beta * Math.log1p(-x)),
  );
  return x < (alpha + 1) / (alpha + beta + 2)
    ? (factor * betaContinuedFraction(alpha, beta, x)) / alpha
    : 1 - ((factor * betaContinuedFraction(beta, alpha, 1 - x)) / beta);
}

function betaContinuedFraction(alpha, beta, x) {
  const tiny = 1e-300;
  const epsilon = 3e-14;
  const alphaPlusBeta = alpha + beta;
  const alphaPlusOne = alpha + 1;
  const alphaMinusOne = alpha - 1;
  let c = 1;
  let d = 1 - ((alphaPlusBeta * x) / alphaPlusOne);
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  let result = d;
  for (let iteration = 1; iteration <= 200; iteration += 1) {
    const twice = 2 * iteration;
    let coefficient = (iteration * (beta - iteration) * x)
      / ((alphaMinusOne + twice) * (alpha + twice));
    d = 1 + (coefficient * d);
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + (coefficient / c);
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    result *= d * c;
    coefficient = -((alpha + iteration) * (alphaPlusBeta + iteration) * x)
      / ((alpha + twice) * (alphaPlusOne + twice));
    d = 1 + (coefficient * d);
    if (Math.abs(d) < tiny) d = tiny;
    c = 1 + (coefficient / c);
    if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    const delta = d * c;
    result *= delta;
    if (Math.abs(delta - 1) < epsilon) return result;
  }
  throw new Error("Incomplete beta continued fraction did not converge");
}

function logGamma(value) {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ];
  if (value < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  }
  const shifted = value - 1;
  let sum = 0.9999999999998099;
  for (let index = 0; index < coefficients.length; index += 1) {
    sum += coefficients[index] / (shifted + index + 1);
  }
  const scale = shifted + coefficients.length - 0.5;
  return (0.5 * Math.log(2 * Math.PI))
    + ((shifted + 0.5) * Math.log(scale))
    - scale
    + Math.log(sum);
}

function sampleVariance(values) {
  const average = mean(values);
  return values.reduce((total, value) => total + ((value - average) ** 2), 0)
    / (values.length - 1);
}

function mean(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function quantile(values, probability) {
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return sorted[lower]
    + ((sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower]) * fraction);
}

function round(value) {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

function parseCliOptions(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (!value) throw new Error(`${flag ?? "argument"} requires a value`);
    if (flag === "--simulations") options.simulations = Number(value);
    else if (flag === "--bootstrap-replicates") options.bootstrapReplicates = Number(value);
    else if (flag === "--seed") options.seed = Number(value);
    else throw new Error(`Unknown argument: ${flag}`);
  }
  return options;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.stdout.write(`${JSON.stringify(runPrecisionAudit(parseCliOptions(process.argv.slice(2))), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
