import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
} from "node:fs";
import { isAbsolute, join } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { validateReviewResponse } from "./pilot.mjs";
import { assertSubscriptionAccess, buildSubscriptionCommand, renderCliPrompt } from "./subscription.mjs";

const CODEX_VERSION = "0.137.0";
const CLAUDE_VERSION = "2.1.211";
const CONFIRMATORY_QUEUE_ID = "confirmatory-subscription-v2";
const ARTIFACT_HASH_NAMES = [
  "cards_sha256",
  "prompts_sha256",
  "schedule_sha256",
  "calls_sha256",
  "ground_truth_sha256",
];
const REQUIRED_RUNTIME_FILES = [
  "study.json",
  "subscription-runner.mjs",
  "subscription.mjs",
  "pilot.mjs",
  "review-schema.json",
];

export function preflightSubscriptionClients({
  codexBin,
  claudeBin,
  env = process.env,
  run = runFile,
}) {
  if (!isAbsolute(codexBin ?? "") || !isAbsolute(claudeBin ?? "")) {
    throw new Error("Absolute CODEX_SUBSCRIPTION_BIN and CLAUDE_SUBSCRIPTION_BIN paths are required");
  }
  const codexVersion = String(run(codexBin, ["--version"]).stdout).match(/(\d+\.\d+\.\d+)/)?.[1];
  const claudeVersion = String(run(claudeBin, ["--version"]).stdout).match(/(\d+\.\d+\.\d+)/)?.[1];
  if (codexVersion !== CODEX_VERSION) throw new Error(`Codex version drift: ${codexVersion ?? "unknown"}`);
  if (claudeVersion !== CLAUDE_VERSION) throw new Error(`Claude Code version drift: ${claudeVersion ?? "unknown"}`);
  const codexStatus = String(run(codexBin, ["login", "status"]).stdout);
  const claudeStatus = String(run(claudeBin, ["auth", "status"]).stdout);
  assertSubscriptionAccess({ codexStatus, claudeStatus, env });
  return {
    codex_executable: codexBin,
    codex_version: codexVersion,
    claude_executable: claudeBin,
    claude_version: claudeVersion,
    checked_at: new Date().toISOString(),
  };
}

export function parseSubscriptionOutput(systemId, stdout) {
  if (systemId === "codex-cli/gpt-5.5") {
    const events = String(stdout).split("\n").filter(Boolean).map((line) => JSON.parse(line));
    const message = events.findLast((event) =>
      event.type === "item.completed" && event.item?.type === "agent_message"
    );
    if (!message) throw new Error("Codex returned no structured agent message");
    return {
      response: validateReviewResponse(JSON.parse(message.item.text)),
      returned_model: events.findLast((event) => event.model)?.model ?? null,
      usage: events.findLast((event) => event.usage)?.usage ?? null,
      tool_deviation: events.some((event) => event.item?.type
        && !["agent_message", "reasoning"].includes(event.item.type)),
    };
  }
  if (systemId === "claude-code/sonnet") {
    const envelope = JSON.parse(stdout);
    const response = typeof envelope.structured_output === "string"
      ? JSON.parse(envelope.structured_output)
      : envelope.structured_output;
    if (!response) throw new Error("Claude Code returned no structured output");
    return {
      response: validateReviewResponse(response),
      returned_model: envelope.model ?? null,
      usage: envelope.usage ?? null,
      tool_deviation: Number(envelope.num_turns ?? 1) > 1,
    };
  }
  throw new Error(`Unknown subscription review system: ${systemId}`);
}

export function collectSubscriptionSchedule({
  benchmarkRoot,
  collectionRoot,
  outputRoot,
  codexBin,
  claudeBin,
  env = process.env,
  runReview = runFile,
  preflight = preflightSubscriptionClients,
  authorize = assertAuthorizedArtifacts,
}) {
  for (const value of [benchmarkRoot, collectionRoot, outputRoot]) {
    if (!value) throw new Error("benchmarkRoot, collectionRoot, and outputRoot are required");
  }
  authorize({ benchmarkRoot, collectionRoot });
  mkdirSync(outputRoot, { recursive: true });
  const provenance = preflight({ codexBin, claudeBin, env });
  const prompts = new Map(readJsonl(join(benchmarkRoot, "prompts.jsonl"))
    .map((prompt) => [prompt.prompt_id, prompt.request]));
  const calls = readJsonl(join(collectionRoot, "calls.jsonl"))
    .sort((left, right) => left.schedule_index - right.schedule_index);
  const resultsPath = join(outputRoot, "results.jsonl");
  const attemptsPath = join(outputRoot, "attempts.jsonl");
  const completed = new Set((existsSync(resultsPath) ? readJsonl(resultsPath) : [])
    .filter(({ status }) => ["valid", "abstain", "missing"].includes(status))
    .map(({ call_id }) => call_id));
  const failures = new Map();
  const returnedModels = new Map();
  for (const attempt of existsSync(attemptsPath) ? readJsonl(attemptsPath) : []) {
    if (attempt.event === "suspended" && attempt.reason === "client_failure") {
      failures.set(attempt.call_id, (failures.get(attempt.call_id) ?? 0) + 1);
    }
    if (attempt.event === "completed" && attempt.returned_model && attempt.system) {
      returnedModels.set(attempt.system, attempt.returned_model);
    }
  }
  const schemaPath = join(import.meta.dirname, "review-schema.json");
  const emptyCwd = join(outputRoot, "empty");
  mkdirSync(emptyCwd, { recursive: true });

  for (const call of calls) {
    if (completed.has(call.call_id)) continue;
    if ((failures.get(call.call_id) ?? 0) >= 3) {
      durableAppend(resultsPath, { call_id: call.call_id, status: "missing", reason: "three_attempts_exhausted" });
      completed.add(call.call_id);
      continue;
    }
    const request = prompts.get(call.prompt_id);
    if (!request) throw new Error(`${call.call_id}: missing prompt ${call.prompt_id}`);
    const command = buildSubscriptionCommand(call.model, schemaPath, emptyCwd, { codexBin, claudeBin });
    const startedAt = new Date().toISOString();
    durableAppend(attemptsPath, { call_id: call.call_id, schedule_index: call.schedule_index,
      event: "started", started_at: startedAt, system: call.model, provenance });
    try {
      const delivery = runReview(command.command, command.args, {
        cwd: command.cwd,
        input: renderCliPrompt(request),
        env,
        maxBuffer: 4 * 1024 * 1024,
        timeout: 10 * 60 * 1000,
      });
      let parsed;
      try {
        parsed = parseSubscriptionOutput(call.model, delivery.stdout);
      } catch (error) {
        durableAppend(attemptsPath, { call_id: call.call_id, event: "completed",
          finished_at: new Date().toISOString(), reason: "schema_invalid", error: error.message,
          raw_output_sha256: sha256(delivery.stdout) });
        durableAppend(resultsPath, { call_id: call.call_id, status: "abstain", reason: "schema_invalid" });
        completed.add(call.call_id);
        continue;
      }
      if (parsed.returned_model && !modelMatches(call.model, parsed.returned_model)) {
        throw new Error(`Returned model drift: ${parsed.returned_model}`);
      }
      const baselineModel = returnedModels.get(call.model);
      if (baselineModel && parsed.returned_model && baselineModel !== parsed.returned_model) {
        throw new Error(`Returned model drift: ${baselineModel} -> ${parsed.returned_model}`);
      }
      if (parsed.returned_model && !baselineModel) returnedModels.set(call.model, parsed.returned_model);
      durableAppend(attemptsPath, { call_id: call.call_id, event: "completed",
        finished_at: new Date().toISOString(), system: call.model, returned_model: parsed.returned_model,
        tool_deviation: parsed.tool_deviation, usage: parsed.usage,
        raw_output_sha256: sha256(delivery.stdout) });
      durableAppend(resultsPath, { call_id: call.call_id, status: "valid", response: parsed.response,
        returned_model: parsed.returned_model, tool_deviation: parsed.tool_deviation, usage: parsed.usage });
      completed.add(call.call_id);
    } catch (error) {
      const reason = /rate.?limit|usage.?limit|reset/i.test(error.message)
        ? "rate_limit"
        : /returned model drift/i.test(error.message) ? "model_drift" : "client_failure";
      if (reason === "client_failure") {
        failures.set(call.call_id, (failures.get(call.call_id) ?? 0) + 1);
      }
      durableAppend(attemptsPath, { call_id: call.call_id, event: "suspended",
        finished_at: new Date().toISOString(), reason, error: error.message });
      return { completed: completed.size, remaining: calls.length - completed.size,
        suspended_call_id: call.call_id, reason, provenance };
    }
  }
  return { completed: completed.size, remaining: calls.length - completed.size, provenance };
}

export function assertAuthorizedArtifacts({
  benchmarkRoot,
  collectionRoot,
  recordsRoot = import.meta.dirname,
}) {
  const study = JSON.parse(readFileSync(join(recordsRoot, "study.json"), "utf8"));
  const contentFreezeBytes = readFileSync(join(recordsRoot, "registration-content-freeze.json"));
  const contentFreeze = JSON.parse(contentFreezeBytes.toString("utf8"));
  const executionAuthorization = JSON.parse(readFileSync(
    join(recordsRoot, "execution-authorization.json"), "utf8",
  ));
  assertAuthorizedState(study, contentFreeze, executionAuthorization);
  const bundlePath = packetFile(recordsRoot, contentFreeze.registration_bundle?.file);
  const registrationBundleSha256 = sha256(readFileSync(bundlePath));
  const runtimeFileHashes = Object.fromEntries(REQUIRED_RUNTIME_FILES.map((name) => [
    name,
    sha256(readFileSync(join(recordsRoot, name))),
  ]));
  const authorized = assertExecutionAuthorization({
    study,
    contentFreeze,
    contentFreezeSha256: sha256(contentFreezeBytes),
    registrationBundleSha256,
    runtimeFileHashes,
    executionAuthorization,
  });
  const actual = {
    cards_sha256: sha256(JSON.stringify(JSON.parse(readFileSync(join(benchmarkRoot, "cards.json"), "utf8")))),
    prompts_sha256: sha256(readFileSync(join(benchmarkRoot, "prompts.jsonl"))),
    calls_sha256: sha256(readFileSync(join(collectionRoot, "calls.jsonl"))),
    ground_truth_sha256: sha256(readFileSync(join(collectionRoot, "ground-truth.jsonl"))),
    schedule_sha256: JSON.parse(readFileSync(join(collectionRoot, "collection.json"), "utf8")).schedule_sha256,
  };
  for (const [name, value] of Object.entries(actual)) {
    if (value !== authorized.artifacts[name]) throw new Error(`${name} does not match the authorized manifest`);
  }
}

export function assertExecutionAuthorization({
  study,
  contentFreeze,
  contentFreezeSha256,
  registrationBundleSha256,
  runtimeFileHashes,
  executionAuthorization,
}) {
  assertAuthorizedState(study, contentFreeze, executionAuthorization);
  if (contentFreeze.schema_version !== 1 || executionAuthorization.schema_version !== 1) {
    throw new Error("Unsupported freeze or execution-authorization schema");
  }
  if (!study.study_id || contentFreeze.study_id !== study.study_id
    || executionAuthorization.study_id !== study.study_id) {
    throw new Error("Freeze or authorization study identity does not match");
  }
  if (contentFreeze.frozen_at !== study.frozen_at) {
    throw new Error("Content-freeze timestamp does not match the frozen study manifest");
  }
  const registeredSchema = study.preregistration_v2_draft;
  if (contentFreeze.osf_schema?.name !== registeredSchema?.template
    || contentFreeze.osf_schema?.version !== registeredSchema?.template_schema_version
    || contentFreeze.osf_schema?.id !== registeredSchema?.template_schema_id) {
    throw new Error("Frozen OSF schema does not match the study manifest");
  }
  const osfId = executionAuthorization.osf_registration?.id;
  const osfUrl = String(executionAuthorization.osf_registration?.url ?? "");
  if (!validTimestamp(contentFreeze.frozen_at)
    || !validTimestamp(executionAuthorization.authorized_at)
    || !validTimestamp(executionAuthorization.osf_registration?.registered_at)
    || !osfId
    || !osfUrl.startsWith("https://osf.io/")
    || !osfUrl.includes(`/${osfId}`)) {
    throw new Error("Execution authorization lacks a valid OSF registration record");
  }
  if (Date.parse(contentFreeze.frozen_at) > Date.parse(executionAuthorization.osf_registration.registered_at)
    || Date.parse(executionAuthorization.osf_registration.registered_at)
      > Date.parse(executionAuthorization.authorized_at)) {
    throw new Error("Freeze, registration, and authorization timestamp order is invalid");
  }
  if (!/^[a-f0-9]{40,64}$/.test(contentFreeze.content_commit ?? "")
    || !/^[a-f0-9]{64}$/.test(contentFreeze.registration_bundle?.sha256 ?? "")
    || !/^[a-f0-9]{64}$/.test(contentFreezeSha256 ?? "")) {
    throw new Error("Content freeze lacks valid commit or bundle hashes");
  }
  if (registrationBundleSha256 !== contentFreeze.registration_bundle.sha256) {
    throw new Error("Registered payload bundle hash does not match the content freeze");
  }
  const frozenRuntimeNames = Object.keys(contentFreeze.runtime_files ?? {}).sort();
  if (JSON.stringify(frozenRuntimeNames) !== JSON.stringify([...REQUIRED_RUNTIME_FILES].sort())) {
    throw new Error("Content freeze does not name the exact required runtime files");
  }
  for (const name of REQUIRED_RUNTIME_FILES) {
    if (!/^[a-f0-9]{64}$/.test(contentFreeze.runtime_files[name] ?? "")
      || runtimeFileHashes?.[name] !== contentFreeze.runtime_files[name]) {
      throw new Error(`Frozen runtime file hash does not match: ${name}`);
    }
  }
  const reference = executionAuthorization.content_freeze ?? {};
  if (reference.record_sha256 !== contentFreezeSha256) {
    throw new Error("Execution authorization content-freeze record hash does not match");
  }
  if (reference.content_commit !== contentFreeze.content_commit) {
    throw new Error("Execution authorization content commit does not match");
  }
  if (reference.branch !== contentFreeze.branch) {
    throw new Error("Execution authorization branch does not match");
  }
  if (reference.bundle_sha256 !== contentFreeze.registration_bundle.sha256) {
    throw new Error("Execution authorization bundle hash does not match");
  }
  if (!["confirmatory-only", "confirmatory-plus-ollama-exploratory"].includes(contentFreeze.branch)) {
    throw new Error("Unknown frozen study branch");
  }
  if (!Array.isArray(contentFreeze.queues) || !Array.isArray(executionAuthorization.authorized_queues)) {
    throw new Error("Frozen and authorized queues must be arrays");
  }
  const frozenQueues = contentFreeze.queues.filter(({ id }) => id === CONFIRMATORY_QUEUE_ID);
  const authorizedQueues = executionAuthorization.authorized_queues
    .filter(({ id }) => id === CONFIRMATORY_QUEUE_ID);
  if (frozenQueues.length !== 1 || authorizedQueues.length !== 1) {
    throw new Error("Confirmatory queue is not present in both freeze and authorization records");
  }
  const [frozenQueue] = frozenQueues;
  const [authorizedQueue] = authorizedQueues;
  const active = study.active_subscription_design;
  assertSameArtifacts(active?.artifacts, frozenQueue.artifacts);
  assertSameArtifacts(active?.artifacts, authorizedQueue.artifacts);
  const activeSystems = active?.review_systems?.map(({ id }) => id);
  if (!Array.isArray(activeSystems) || activeSystems.length === 0
    || JSON.stringify(activeSystems) !== JSON.stringify(frozenQueue.review_systems)
    || JSON.stringify(activeSystems) !== JSON.stringify(authorizedQueue.review_systems)) {
    throw new Error("Authorized review systems do not match the frozen manifest");
  }
  if (JSON.stringify(contentFreeze.queues) !== JSON.stringify(executionAuthorization.authorized_queues)) {
    throw new Error("Authorized queues do not exactly match the frozen queues");
  }
  const author = study.authorship?.authors?.[0];
  if (!author || executionAuthorization.authorized_by?.name !== author.name
    || executionAuthorization.authorized_by?.orcid !== author.orcid) {
    throw new Error("Execution authorizer does not match the study author");
  }
  return { queue_id: CONFIRMATORY_QUEUE_ID, artifacts: active.artifacts };
}

function assertAuthorizedState(study, contentFreeze, executionAuthorization) {
  if (!study?.frozen || !validTimestamp(study.frozen_at)
    || contentFreeze?.status !== "frozen-pre-submission"
    || contentFreeze?.outcome_calls_authorized !== false
    || executionAuthorization?.status !== "authorized-post-registration"
    || executionAuthorization?.outcome_calls_authorized !== true) {
    throw new Error("Subscription collection is not authorized by the frozen OSF-registered packet");
  }
}

function assertSameArtifacts(expected, actual) {
  if (!expected || !actual || ARTIFACT_HASH_NAMES.some((name) =>
    !/^[a-f0-9]{64}$/.test(expected[name] ?? "") || expected[name] !== actual[name])) {
    throw new Error("Authorized artifact hashes do not match the frozen manifest");
  }
}

function validTimestamp(value) {
  return typeof value === "string" && value.length > 0 && !Number.isNaN(Date.parse(value));
}

function packetFile(root, relativePath) {
  if (typeof relativePath !== "string" || relativePath.length === 0
    || isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes("..")) {
    throw new Error("Registered payload bundle file must be a safe relative path");
  }
  return join(root, relativePath);
}

function modelMatches(systemId, returned) {
  const value = String(returned).toLowerCase();
  return systemId === "codex-cli/gpt-5.5" ? value.includes("gpt-5.5") : value.includes("sonnet");
}

function sha256(value) {
  return createHash("sha256").update(Buffer.isBuffer(value) ? value : String(value)).digest("hex");
}

function durableAppend(path, value) {
  const fd = openSync(path, "a");
  try {
    appendFileSync(fd, `${JSON.stringify(value)}\n`);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
}

function readJsonl(path) {
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function runFile(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited ${result.status}: ${result.stderr || result.stdout}`.trim());
  }
  return { stdout: result.stdout || result.stderr, stderr: result.stderr };
}

function main(args) {
  const codexBin = process.env.CODEX_SUBSCRIPTION_BIN;
  const claudeBin = process.env.CLAUDE_SUBSCRIPTION_BIN;
  if (args[0] === "--preflight") {
    process.stdout.write(`${JSON.stringify(preflightSubscriptionClients({ codexBin, claudeBin }), null, 2)}\n`);
    return;
  }
  if (args.length !== 3) {
    throw new Error("Usage: subscription-runner.mjs --preflight | BENCHMARK_ROOT COLLECTION_ROOT OUTPUT_ROOT");
  }
  process.stdout.write(`${JSON.stringify(collectSubscriptionSchedule({
    benchmarkRoot: args[0], collectionRoot: args[1], outputRoot: args[2], codexBin, claudeBin,
  }), null, 2)}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
