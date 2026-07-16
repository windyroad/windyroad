import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";

import { generateCallSchedule, summarizeSchedule } from "./design.mjs";
import { validateReviewResponse } from "./pilot.mjs";

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
    scenarioIds: [...scenarioIds].sort(),
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

export async function collectCall({
  call,
  request,
  model,
  send,
  sleep = (seconds) => delay(seconds * 1000),
  now = Date.now,
  canRetry = () => true,
}) {
  if (!call?.call_id || !request || !model?.id || typeof send !== "function") {
    throw new Error("call, request, model, and send are required");
  }
  const attempts = [];
  const waits = [2, 8];
  let lastReason = "network_error";

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const started = now();
    let delivery;
    try {
      delivery = await send({ call, request, model });
    } catch (error) {
      lastReason = "network_error";
      attempts.push(attemptRecord(call.call_id, attempt, started, now(), lastReason, {
        error: error.message,
      }));
      if (attempt < 3 && !(await canRetry(attempts))) {
        return collectionResult(call.call_id, "suspended", "spending_ceiling", attempts);
      }
      if (attempt < 3) await sleep(waits[attempt - 1]);
      continue;
    }

    const httpStatus = delivery?.http_status;
    if (retryableHttp(httpStatus)) {
      lastReason = "retryable_http";
      const suppliedRetryAfter = Number(delivery.retry_after_seconds);
      const retryAfter = Number.isFinite(suppliedRetryAfter) && suppliedRetryAfter >= 0
        ? suppliedRetryAfter
        : null;
      attempts.push(attemptRecord(call.call_id, attempt, started, now(), lastReason, {
        http_status: httpStatus,
        retry_after_seconds: retryAfter,
        ...deliveryAccounting(delivery),
      }));
      if (retryAfter > 60) {
        return collectionResult(call.call_id, "suspended", "retry_after_exceeds_60_seconds", attempts);
      }
      if (attempt < 3 && !(await canRetry(attempts))) {
        return collectionResult(call.call_id, "suspended", "spending_ceiling", attempts);
      }
      if (attempt < 3) await sleep(retryAfter ?? waits[attempt - 1]);
      continue;
    }
    if (httpStatus !== 200) {
      if (delivery?.refusal) {
        attempts.push(attemptRecord(call.call_id, attempt, started, now(), "provider_refusal", {
          http_status: httpStatus,
          refusal: String(delivery.refusal),
          ...deliveryAccounting(delivery),
        }));
        return collectionResult(call.call_id, "abstain", "provider_refusal", attempts);
      }
      attempts.push(attemptRecord(call.call_id, attempt, started, now(), "non_retryable_http", {
        http_status: httpStatus,
        ...deliveryAccounting(delivery),
      }));
      return collectionResult(call.call_id, "missing", "non_retryable_http", attempts);
    }
    if (
      delivery.model !== model.id
      || delivery.provider !== model.provider_tag
      || delivery.endpoint !== model.endpoint_snapshot
    ) {
      lastReason = "route_mismatch";
      attempts.push(attemptRecord(call.call_id, attempt, started, now(), lastReason, {
        http_status: httpStatus,
        model: delivery.model,
        provider: delivery.provider,
        endpoint: delivery.endpoint,
        ...deliveryAccounting(delivery),
      }));
      if (attempt < 3 && !(await canRetry(attempts))) {
        return collectionResult(call.call_id, "suspended", "spending_ceiling", attempts);
      }
      if (attempt < 3) await sleep(waits[attempt - 1]);
      continue;
    }
    if (delivery.refusal) {
      attempts.push(attemptRecord(call.call_id, attempt, started, now(), "provider_refusal", {
        http_status: httpStatus,
        refusal: String(delivery.refusal),
        ...deliveryAccounting(delivery),
      }));
      return collectionResult(call.call_id, "abstain", "provider_refusal", attempts);
    }

    try {
      validateReviewResponse(delivery.response);
    } catch (error) {
      attempts.push(attemptRecord(call.call_id, attempt, started, now(), "schema_invalid", {
        http_status: httpStatus,
        error: error.message,
        ...deliveryAccounting(delivery),
      }));
      return collectionResult(call.call_id, "abstain", "schema_invalid", attempts);
    }
    attempts.push(attemptRecord(call.call_id, attempt, started, now(), "valid", {
      http_status: httpStatus,
      model: delivery.model,
      provider: delivery.provider,
      endpoint: delivery.endpoint,
      ...deliveryAccounting(delivery),
    }));
    return {
      attempts,
      result: {
        call_id: call.call_id,
        status: "valid",
        attempt_count: attempts.length,
        response: delivery.response,
      },
    };
  }

  return collectionResult(call.call_id, "missing", lastReason, attempts);
}

export async function collectCalls({
  calls,
  requests,
  models,
  projectedCosts,
  spendingCeilingUsd,
  send,
  sleep,
  now,
}) {
  if (!Array.isArray(calls) || !(requests instanceof Map) || !(models instanceof Map)
    || !(projectedCosts instanceof Map) || !Number.isFinite(spendingCeilingUsd)) {
    throw new Error("calls, requests, models, projectedCosts, and spendingCeilingUsd are required");
  }
  const attempts = [];
  const results = [];
  let accruedCost = 0;
  let projectedRemaining = calls.reduce((total, call) => {
    const cost = projectedCosts.get(call.call_id);
    if (!Number.isFinite(cost) || cost < 0) throw new Error(`${call.call_id}: invalid projected cost`);
    return total + cost;
  }, 0);
  let consecutiveInfrastructureFailures = 0;

  for (const call of calls) {
    if (accruedCost + projectedRemaining > spendingCeilingUsd) {
      return collectionSummary(
        "suspended",
        "spending_ceiling",
        calls,
        attempts,
        results,
        accruedCost,
        projectedRemaining,
      );
    }
    const request = requests.get(call.prompt_id);
    const model = models.get(call.model);
    if (!request) throw new Error(`${call.prompt_id}: missing request`);
    if (!model) throw new Error(`${call.model}: missing model configuration`);

    const collected = await collectCall({
      call,
      request,
      model,
      send,
      sleep,
      now,
      canRetry: (callAttempts) => accruedCost
        + callAttempts.reduce((total, attempt) => total + (attempt.cost_usd ?? 0), 0)
        + projectedRemaining <= spendingCeilingUsd,
    });
    attempts.push(...collected.attempts);
    results.push(collected.result);
    projectedRemaining -= projectedCosts.get(call.call_id);
    accruedCost += collected.attempts.reduce(
      (total, attempt) => total + (attempt.cost_usd ?? 0),
      0,
    );
    const infrastructureFailure = collected.result.status === "missing"
      && ["network_error", "retryable_http", "route_mismatch"].includes(collected.result.reason);
    consecutiveInfrastructureFailures = infrastructureFailure
      ? consecutiveInfrastructureFailures + 1
      : 0;
    if (collected.result.status === "suspended" || consecutiveInfrastructureFailures >= 100) {
      return collectionSummary(
        "suspended",
        collected.result.status === "suspended"
          ? collected.result.reason
          : "100_consecutive_infrastructure_failures",
        calls,
        attempts,
        results,
        accruedCost,
        projectedRemaining,
      );
    }
  }

  return collectionSummary(
    "complete",
    null,
    calls,
    attempts,
    results,
    accruedCost,
    projectedRemaining,
  );
}

function collectionSummary(status, reason, calls, attempts, results, accruedCost, projectedRemaining) {
  return {
    status,
    reason,
    accrued_cost_usd: roundCost(accruedCost),
    projected_remaining_cost_usd: roundCost(projectedRemaining),
    completed_calls: results.length,
    remaining_calls: calls.length - results.length,
    attempts,
    results,
  };
}

function collectionResult(callId, status, reason, attempts) {
  return {
    attempts,
    result: {
      call_id: callId,
      status,
      reason,
      attempt_count: attempts.length,
    },
  };
}

function attemptRecord(callId, attempt, started, completed, status, details) {
  return {
    call_id: callId,
    attempt,
    started_at: new Date(started).toISOString(),
    completed_at: new Date(completed).toISOString(),
    latency_ms: completed - started,
    status,
    ...details,
  };
}

function retryableHttp(status) {
  return [408, 409, 429].includes(status) || (status >= 500 && status <= 599);
}

function deliveryAccounting(delivery) {
  return {
    usage: delivery.usage ?? null,
    cost_usd: delivery.cost_usd ?? null,
  };
}

function roundCost(value) {
  return Math.round(value * 1e12) / 1e12;
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
