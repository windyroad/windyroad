import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { generateCollection } from "./collection.mjs";
import { renderEvidence } from "./pilot.mjs";
import { renderReviewRequest } from "./prompts.mjs";

export const ECOLOGICAL_TEMPLATE_INDEXES = Object.freeze([1, 7, 13, 19, 25]);

export function generateEcologicalBenchmark(controlledRoot, outputRoot) {
  if (!controlledRoot || !outputRoot) throw new Error("controlledRoot and outputRoot are required");
  mkdirSync(outputRoot, { recursive: true });
  if (readdirSync(outputRoot).length) throw new Error(`Output directory is not empty: ${outputRoot}`);

  const source = JSON.parse(readFileSync(join(controlledRoot, "cards.json"), "utf8"));
  const cases = source.cases.filter(({ template_index, instance }) =>
    ECOLOGICAL_TEMPLATE_INDEXES.includes(template_index) && instance === 1
  );
  const scenarioIds = new Set(cases.map(({ scenario_id }) => scenario_id));
  const templateIds = new Set(cases.map(({ template_id }) => template_id));
  if (cases.length !== scenarioIds.size * 2 || templateIds.size * 2 !== cases.length) {
    throw new Error("Ecological subset is not paired and balanced");
  }

  const payload = { schema_version: source.schema_version, cases };
  const cardsCanonical = JSON.stringify(payload);
  const cardsSha256 = sha256(cardsCanonical);
  writeFileSync(join(outputRoot, "cards.json"), `${JSON.stringify(payload, null, 2)}\n`);

  const prompts = renderPrompts(cases);
  const promptsJsonl = `${prompts.map((prompt) => JSON.stringify(prompt)).join("\n")}\n`;
  const maximumRequestBytes = Math.max(
    ...prompts.map(({ request }) => Buffer.byteLength(JSON.stringify(request))),
  );
  const summary = {
    schema_version: 1,
    layer: "ecological",
    template_indexes: ECOLOGICAL_TEMPLATE_INDEXES,
    structural_templates: templateIds.size,
    scenario_pairs: scenarioIds.size,
    case_count: cases.length,
    cards_sha256: cardsSha256,
    prompt_count: prompts.length,
    prompts_sha256: sha256(promptsJsonl),
    maximum_request_bytes: maximumRequestBytes,
  };
  writeFileSync(join(outputRoot, "prompts.jsonl"), promptsJsonl);
  writeFileSync(join(outputRoot, "ecological.json"), `${JSON.stringify(summary, null, 2)}\n`);
  return { cases, prompts, ...summary };
}

function renderPrompts(cases) {
  const prompts = [];
  for (const entry of cases) {
    for (const decomposition of ["atomic", "split"]) {
      const submissions = entry[decomposition].submissions;
      for (const workflow of ["pr", "trunk"]) {
        for (const context of ["local"]) {
          for (let submissionIndex = 1; submissionIndex <= submissions.length; submissionIndex += 1) {
            const request = renderReviewRequest(
              renderEcologicalEvidence(submissions, workflow, context, submissionIndex),
            );
            const conditions = {
              case_id: entry.case_id,
              scenario_id: entry.scenario_id,
              decomposition,
              workflow,
              context,
              submission_index: submissionIndex,
            };
            prompts.push({
              prompt_id: sha256(JSON.stringify({ ...conditions, request })),
              ...conditions,
              request,
            });
          }
        }
      }
    }
  }
  return prompts;
}

function renderEcologicalEvidence(submissions, workflow, context, submissionIndex) {
  const controlled = renderEvidence(submissions, workflow, context, submissionIndex);
  return {
    schema_version: 1,
    workflow_policy: controlled.workflow_policy,
    repository_context: controlled.repository_context,
    current_artifact: nativeArtifact(controlled.current_submission, workflow),
    prior_artifacts: controlled.prior_submissions.map((submission) =>
      nativeArtifact(submission, workflow)
    ),
  };
}

function nativeArtifact(submission, workflow) {
  const checks = submission.checks.map((name) => ({ name, status: "passed" }));
  if (workflow === "pr") {
    return {
      kind: "pull_request",
      title: submission.message,
      description: "Evaluate the supplied change to the synthetic policy module.",
      base_revision: submission.parent,
      head_revision: submission.commit,
      updated_at: submission.timestamp,
      merge_status: "pending_review",
      checks,
      diff: submission.diff,
    };
  }
  return {
    kind: "main_commit",
    commit_message: submission.message,
    parent_revision: submission.parent,
    commit_revision: submission.commit,
    committed_at: submission.timestamp,
    pipeline: {
      trust: "untrusted",
      promotion_status: "pending_review",
      checks,
    },
    diff: submission.diff,
  };
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    generateEcologicalBenchmark(process.argv[2], process.argv[3]);
    const output = {
      benchmark: JSON.parse(readFileSync(join(process.argv[3], "ecological.json"), "utf8")),
    };
    if (process.argv[4]) {
      const study = JSON.parse(readFileSync(join(dirname(process.argv[1]), "study.json"), "utf8"));
      output.collection = generateCollection(process.argv[3], process.argv[4], {
        models: study.active_subscription_design.review_systems.map(({ id }) => id),
        trialsPerCell: 1,
        contexts: ["local"],
        seed: 20260718,
      }).summary;
    }
    process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
