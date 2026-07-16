import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import process from "node:process";
import { pathToFileURL } from "node:url";

const DEFAULTS = Object.freeze({
  scenarioCounts: [32, 48, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
  simulations: 5_000,
  trialsPerCell: 3,
  seed: 20260716,
  baselineRecall: 0.65,
  splitPenalty: 0.15,
  workflowEffect: 0,
  interactionEffect: 0.10,
  scenarioLogitSd: 0.75,
  equivalenceMargin: 0.10,
  targetPower: 0.80,
});

export function runPowerSimulation(options = {}) {
  const config = { ...DEFAULTS, ...options };
  const candidates = config.scenarioCounts.map((scenarioPairs) =>
    simulateCandidate(scenarioPairs, config),
  );
  const selected = candidates.find(
    ({ primary_power, workflow_equivalence_assurance, interaction_power }) =>
      primary_power >= config.targetPower
      && workflow_equivalence_assurance >= config.targetPower
      && interaction_power >= config.targetPower,
  ) ?? null;

  return {
    method: "paired scenario-cluster Monte Carlo; sample size requires 80% for the split effect, workflow equivalence, and the decomposition-by-workflow interaction",
    assumptions: {
      simulations: config.simulations,
      trials_per_cell: config.trialsPerCell,
      seed: config.seed,
      central_atomic_recall: config.baselineRecall,
      central_split_penalty: config.splitPenalty,
      central_atomic_workflow_effect: config.workflowEffect,
      central_decomposition_by_workflow_interaction: config.interactionEffect,
      scenario_random_intercept_logit_sd: config.scenarioLogitSd,
      workflow_equivalence_margin: config.equivalenceMargin,
      target_power_or_assurance: config.targetPower,
    },
    selected_scenario_pairs: selected?.scenario_pairs ?? null,
    candidates,
  };
}

function simulateCandidate(scenarioPairs, config) {
  const rng = createRng(config.seed ^ Math.imul(scenarioPairs, 0x9e3779b1));
  let primaryDetections = 0;
  let workflowEquivalences = 0;
  let interactionDetections = 0;

  const intercepts = {
    prAtomic: logit(config.baselineRecall),
    prSplit: logit(config.baselineRecall - config.splitPenalty),
    trunkAtomic: logit(config.baselineRecall + config.workflowEffect),
    trunkSplit: logit(
      config.baselineRecall
      + config.workflowEffect
      - config.splitPenalty
      + config.interactionEffect,
    ),
  };

  for (let simulation = 0; simulation < config.simulations; simulation += 1) {
    const primary = [];
    const workflow = [];
    const interaction = [];

    for (let scenario = 0; scenario < scenarioPairs; scenario += 1) {
      const randomIntercept = normal(rng) * config.scenarioLogitSd;
      const prAtomic = trialMean(rng, logistic(intercepts.prAtomic + randomIntercept), config.trialsPerCell);
      const prSplit = trialMean(rng, logistic(intercepts.prSplit + randomIntercept), config.trialsPerCell);
      const trunkAtomic = trialMean(rng, logistic(intercepts.trunkAtomic + randomIntercept), config.trialsPerCell);
      const trunkSplit = trialMean(rng, logistic(intercepts.trunkSplit + randomIntercept), config.trialsPerCell);

      primary.push(prSplit - prAtomic);
      workflow.push(((trunkAtomic + trunkSplit) - (prAtomic + prSplit)) / 2);
      interaction.push((trunkSplit - trunkAtomic) - (prSplit - prAtomic));
    }

    if (effectDetected(primary, 1.96)) primaryDetections += 1;
    if (equivalent(workflow, config.equivalenceMargin, 1.645)) workflowEquivalences += 1;
    if (effectDetected(interaction, 1.96)) interactionDetections += 1;
  }

  return {
    scenario_pairs: scenarioPairs,
    primary_power: proportion(primaryDetections, config.simulations),
    workflow_equivalence_assurance: proportion(workflowEquivalences, config.simulations),
    interaction_power: proportion(interactionDetections, config.simulations),
  };
}

export function generateCallSchedule({
  scenarioCount,
  models,
  trialsPerCell = 3,
  splitSubmissionCount = 3,
  seed = 20260716,
}) {
  if (!Number.isInteger(scenarioCount) || scenarioCount < 1) throw new Error("scenarioCount must be positive");
  if (!Array.isArray(models) || models.length === 0) throw new Error("models must not be empty");

  const rows = [];
  for (let scenario = 1; scenario <= scenarioCount; scenario += 1) {
    const scenarioId = `scenario-${String(scenario).padStart(3, "0")}`;
    for (const intent of ["malicious", "benign"]) {
      for (const decomposition of ["atomic", "split"]) {
        const submissions = decomposition === "atomic" ? 1 : splitSubmissionCount;
        for (const workflow of ["pr", "trunk"]) {
          for (const context of ["local", "cumulative"]) {
            for (let trial = 1; trial <= trialsPerCell; trial += 1) {
              for (const model of models) {
                const sequenceId = [scenarioId, intent, decomposition, workflow, context, model, `trial-${trial}`].join(":");
                for (let submissionIndex = 1; submissionIndex <= submissions; submissionIndex += 1) {
                  rows.push({
                    sequence_id: sequenceId,
                    scenario_id: scenarioId,
                    intent,
                    decomposition,
                    workflow,
                    context,
                    model,
                    trial,
                    submission_index: submissionIndex,
                    activation_index: submissions,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  shuffle(rows, createRng(seed));
  rows.forEach((row, index) => { row.schedule_index = index + 1; });
  const canonicalJsonl = `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;

  return {
    seed,
    sha256: createHash("sha256").update(canonicalJsonl).digest("hex"),
    rows,
  };
}

export function summarizeSchedule(rows) {
  const callsByModel = {};
  const callsByDecomposition = { atomic: 0, split: 0 };
  const sequences = new Set();

  for (const row of rows) {
    callsByModel[row.model] = (callsByModel[row.model] ?? 0) + 1;
    callsByDecomposition[row.decomposition] += 1;
    sequences.add(row.sequence_id);
  }

  return {
    calls: rows.length,
    sequences: sequences.size,
    calls_by_model: Object.fromEntries(Object.entries(callsByModel).sort(([left], [right]) => left.localeCompare(right))),
    calls_by_decomposition: callsByDecomposition,
  };
}

export function estimateCost({
  callsByModel,
  inputTokensPerCall,
  outputTokensPerCall,
  pricingPerMillionTokens,
}) {
  const byModel = {};
  for (const model of Object.keys(callsByModel).sort()) {
    const pricing = pricingPerMillionTokens[model];
    if (!pricing) throw new Error(`missing pricing for ${model}`);
    byModel[model] = round(
      callsByModel[model]
      * ((inputTokensPerCall * pricing.input) + (outputTokensPerCall * pricing.output))
      / 1_000_000,
      6,
    );
  }

  return {
    by_model_usd: byModel,
    total_usd: round(Object.values(byModel).reduce((total, cost) => total + cost, 0), 6),
  };
}

export function buildScheduleRecord(study) {
  const schedule = generateCallSchedule({
    scenarioCount: study.power_analysis.scenario_pairs,
    models: study.randomization.model_order_before_shuffle,
    trialsPerCell: study.trials_per_cell,
    splitSubmissionCount: study.split_submission_count,
    seed: study.randomization.seed,
  });
  const summary = summarizeSchedule(schedule.rows);
  const pricing = Object.fromEntries(
    study.models.map(({ id, pricing_usd_per_million_tokens }) => [id, pricing_usd_per_million_tokens]),
  );
  const cost = estimateCost({
    callsByModel: summary.calls_by_model,
    inputTokensPerCall: study.inference_budget.maximum_input_tokens_per_call,
    outputTokensPerCall: study.inference_budget.maximum_output_tokens_per_call,
    pricingPerMillionTokens: pricing,
  });

  return { seed: schedule.seed, sha256: schedule.sha256, ...summary, cost };
}

function trialMean(rng, probability, trials) {
  let detections = 0;
  for (let trial = 0; trial < trials; trial += 1) {
    if (rng() < probability) detections += 1;
  }
  return detections / trials;
}

function effectDetected(values, criticalValue) {
  const { mean, standardError } = meanAndStandardError(values);
  return standardError === 0 ? mean !== 0 : Math.abs(mean / standardError) > criticalValue;
}

function equivalent(values, margin, criticalValue) {
  const { mean, standardError } = meanAndStandardError(values);
  return Math.abs(mean) + (criticalValue * standardError) < margin;
}

function meanAndStandardError(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.length > 1
    ? values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / (values.length - 1)
    : 0;
  return { mean, standardError: Math.sqrt(variance / values.length) };
}

function createRng(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4_294_967_296;
  };
}

function normal(rng) {
  const first = Math.max(rng(), Number.EPSILON);
  const second = rng();
  return Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);
}

function shuffle(values, rng) {
  for (let index = values.length - 1; index > 0; index -= 1) {
    const other = Math.floor(rng() * (index + 1));
    [values[index], values[other]] = [values[other], values[index]];
  }
}

function logit(probability) {
  if (probability <= 0 || probability >= 1) throw new Error("probabilities must be between zero and one");
  return Math.log(probability / (1 - probability));
}

function logistic(value) {
  return 1 / (1 + Math.exp(-value));
}

function proportion(numerator, denominator) {
  return round(numerator / denominator, 4);
}

function round(value, digits) {
  const scale = 10 ** digits;
  return Math.round((value + Number.EPSILON) * scale) / scale;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const study = JSON.parse(readFileSync("research/llm-review-sequences/study.json", "utf8"));
  const power = runPowerSimulation({
    simulations: study.power_analysis.simulations,
    trialsPerCell: study.power_analysis.trials_per_cell,
    seed: study.power_analysis.seed,
    baselineRecall: study.power_analysis.central_atomic_recall,
    splitPenalty: study.power_analysis.central_split_penalty,
    workflowEffect: study.power_analysis.central_atomic_workflow_effect,
    interactionEffect: study.power_analysis.central_decomposition_by_workflow_interaction,
    scenarioLogitSd: study.power_analysis.scenario_random_intercept_logit_sd,
    equivalenceMargin: study.power_analysis.workflow_equivalence_margin,
    targetPower: study.power_analysis.target_power_or_assurance,
  });
  const schedule = buildScheduleRecord(study);
  process.stdout.write(`${JSON.stringify({ power, schedule }, null, 2)}\n`);
}
