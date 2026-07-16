import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { generateCallSchedule, summarizeSchedule } from "./design.mjs";

export function generateCollection(
  benchmarkRoot,
  outputRoot,
  { models, trialsPerCell = 3, seed = 20260716, expectedScheduleSha256 = null } = {},
) {
  if (!benchmarkRoot || !outputRoot) throw new Error("benchmarkRoot and outputRoot are required");
  if (!Array.isArray(models) || !models.length) throw new Error("models must not be empty");
  mkdirSync(outputRoot, { recursive: true });
  if (readdirSync(outputRoot).length) throw new Error(`Output directory is not empty: ${outputRoot}`);

  const cards = JSON.parse(readFileSync(join(benchmarkRoot, "cards.json"), "utf8")).cases;
  const prompts = readJsonl(join(benchmarkRoot, "prompts.jsonl"));
  const scenarioIds = new Set(cards.map(({ scenario_id }) => scenario_id));
  if (cards.length !== scenarioIds.size * 2) throw new Error("Benchmark cards are not paired");
  const schedule = generateCallSchedule({
    scenarioCount: scenarioIds.size,
    models,
    trialsPerCell,
    seed,
  });
  if (expectedScheduleSha256 && schedule.sha256 !== expectedScheduleSha256) {
    throw new Error(`Schedule hash mismatch: ${schedule.sha256}`);
  }

  const cardsByCondition = new Map(cards.map((card) => [
    `${card.scenario_id}\u0000${card.intent}`,
    card,
  ]));
  const promptsByCondition = new Map(prompts.map((prompt) => [promptKey(prompt), prompt]));
  if (promptsByCondition.size !== prompts.length) throw new Error("Duplicate prompt condition");

  const calls = [];
  const groundTruth = [];
  for (const scheduled of schedule.rows) {
    const card = cardsByCondition.get(`${scheduled.scenario_id}\u0000${scheduled.intent}`);
    if (!card) throw new Error(`${scheduled.scenario_id}/${scheduled.intent}: missing card`);
    const prompt = promptsByCondition.get(promptKey({ ...scheduled, case_id: card.case_id }));
    if (!prompt) throw new Error(`${scheduled.sequence_id}: missing prompt`);
    const callId = sha256(JSON.stringify({
      schedule_index: scheduled.schedule_index,
      prompt_id: prompt.prompt_id,
      model: scheduled.model,
      trial: scheduled.trial,
    }));
    calls.push({
      call_id: callId,
      schedule_index: scheduled.schedule_index,
      prompt_id: prompt.prompt_id,
      case_id: card.case_id,
      model: scheduled.model,
      trial: scheduled.trial,
    });
    groundTruth.push({
      call_id: callId,
      ...scheduled,
      case_id: card.case_id,
      template_id: card.template_id,
      scenario_family: card.family,
      expected_severity: card.expected_severity,
    });
  }

  const callsJsonl = toJsonl(calls);
  const groundTruthJsonl = toJsonl(groundTruth);
  const summary = {
    schema_version: 1,
    ...summarizeSchedule(schedule.rows),
    schedule_seed: seed,
    schedule_sha256: schedule.sha256,
    prompts_sha256: sha256(readFileSync(join(benchmarkRoot, "prompts.jsonl"))),
    calls_sha256: sha256(callsJsonl),
    ground_truth_sha256: sha256(groundTruthJsonl),
  };
  writeFileSync(join(outputRoot, "calls.jsonl"), callsJsonl);
  writeFileSync(join(outputRoot, "ground-truth.jsonl"), groundTruthJsonl);
  writeFileSync(join(outputRoot, "collection.json"), `${JSON.stringify(summary, null, 2)}\n`);

  return {
    calls,
    ground_truth: groundTruth,
    calls_sha256: summary.calls_sha256,
    ground_truth_sha256: summary.ground_truth_sha256,
    summary,
  };
}

function promptKey({ case_id, decomposition, workflow, context, submission_index }) {
  return [case_id, decomposition, workflow, context, submission_index].join("\u0000");
}

function readJsonl(path) {
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map(JSON.parse);
}

function toJsonl(rows) {
  return `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const study = JSON.parse(readFileSync(join(dirname(process.argv[1]), "study.json"), "utf8"));
    const candidate = study.preregistration_v2_candidate;
    const collection = generateCollection(process.argv[2], process.argv[3], {
      models: study.models.map(({ id }) => id),
      trialsPerCell: candidate.trials_per_cell,
      seed: candidate.schedule_seed,
      expectedScheduleSha256: candidate.schedule_sha256,
    });
    process.stdout.write(`${JSON.stringify(collection.summary, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
