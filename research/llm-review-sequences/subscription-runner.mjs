import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  closeSync,
  constants as fsConstants,
  existsSync,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  unlinkSync,
} from "node:fs";
import { hostname as systemHostname, tmpdir } from "node:os";
import { isAbsolute, join, posix, relative, resolve, sep } from "node:path";
import process from "node:process";
import { pathToFileURL, URL } from "node:url";

import { generateCallSchedule, summarizeSchedule } from "./design.mjs";
import { validateReviewResponse } from "./pilot.mjs";
import { verifyRegistrationPacket } from "./registration-packet.mjs";
import {
  assertSubscriptionAccess,
  buildSubscriptionChildEnv,
  buildSubscriptionCommand,
  CLAUDE_ISOLATION,
  CODEX_ISOLATION,
  CODEX_PERMISSION_PROFILE_DEFINITION,
  CODEX_PERMISSION_PROFILE_ID,
  renderCliPrompt,
} from "./subscription.mjs";

const CODEX_VERSION = "0.137.0";
const CLAUDE_VERSION = "2.1.211";
const CODEX_EXECUTABLE_SHA256 = "2e0cccea4a81dd7bf2c155950dab9a6c6ed9a02569d8ff07a68b7afedc1be21d";
const CLAUDE_EXECUTABLE_SHA256 = "5a728a76198b6eca7f3c7cdbff43bab44b77b48c2108f7a3107d889773382629";
const CLAUDE_RETURNED_MODEL = "claude-sonnet-4-6";
const STUDY_ID = "llm-review-sequences-v0";
const CONFIRMATORY_QUEUE_ID = "confirmatory-subscription-v2";
const CONTENT_FREEZE_RECORD_FILE = "registration-content-freeze.json";
const CODEX_SANDBOX_PROBE_SUCCESS = "study-minimal-sandbox-ok";
const MAX_DISPATCHES_PER_INVOCATION = 16;
const MAX_BATCH_ACCESS_CONFIRMATION_AGE_MS = 15 * 60 * 1000;
const CODEX_MODEL_SHELL_DENY_PROBE_NAME = "model-shell-deny-probe";
const CODEX_MODEL_SHELL_DENY_PROBE_BYTES = Buffer.from(
  "This harmless marker must not be readable by Codex model-shell tools.\n",
);
const CODEX_SANDBOX_PROBE_SCRIPT = [
  "set -eu",
  "/bin/cat /bin/sh >/dev/null",
  "if /bin/cat \"$1\" >/dev/null 2>&1; then exit 91; fi",
  "if /bin/cat \"$2\" >/dev/null 2>&1; then exit 92; fi",
  `/bin/echo ${CODEX_SANDBOX_PROBE_SUCCESS}`,
].join("; ");
const PHASE_ONE_REVIEW_ROLES = Object.freeze(["methods", "reproducibility", "safety"]);
const PHASE_ONE_REVIEW_DISPOSITIONS = Object.freeze([
  "approve",
  "approve-with-documented-limitations",
]);
const REVIEW_ATTESTATION_KEYS = Object.freeze([
  "role",
  "report_file",
  "sha256",
  "reviewed_commit",
  "disposition",
  "unresolved_blockers",
]);
const CONFIRMATORY_REVIEW_SYSTEMS = Object.freeze([
  "codex-cli/gpt-5.5",
  "claude-code/sonnet",
]);
const ARTIFACT_HASH_NAMES = Object.freeze([
  "cards_sha256",
  "prompts_sha256",
  "schedule_sha256",
  "calls_sha256",
  "ground_truth_sha256",
]);
const ACTIVE_ARTIFACT_KEYS = Object.freeze([
  ...ARTIFACT_HASH_NAMES,
  "schedule_seed",
  "maximum_request_bytes",
]);
const RAW_FILE_NAMES = Object.freeze([
  "cards.json",
  "prompts.jsonl",
  "calls.jsonl",
  "ground-truth.jsonl",
  "collection.json",
]);
const REQUIRED_RUNTIME_FILES = Object.freeze([
  "study.json",
  "analyse.mjs",
  "design.mjs",
  "precision-audit.mjs",
  "subscription-runner.mjs",
  "subscription.mjs",
  "pilot.mjs",
  "review-schema.json",
  "registration-packet.mjs",
]);
const CALL_KEYS = Object.freeze([
  "call_id",
  "schedule_index",
  "prompt_id",
  "case_id",
  "model",
  "trial",
]);
const PROMPT_KEYS = Object.freeze([
  "prompt_id",
  "case_id",
  "scenario_id",
  "decomposition",
  "workflow",
  "context",
  "submission_index",
  "request",
]);
const SCHEDULE_KEYS = Object.freeze([
  "sequence_id",
  "scenario_id",
  "intent",
  "decomposition",
  "workflow",
  "context",
  "model",
  "trial",
  "submission_index",
  "activation_index",
  "schedule_index",
]);
const GROUND_TRUTH_KEYS = Object.freeze([
  "call_id",
  ...SCHEDULE_KEYS,
  "case_id",
  "template_id",
  "scenario_family",
  "expected_severity",
  "relevant_submission_ids",
  "submitted_at",
  "sequence_started_at",
]);
const COLLECTION_KEYS = Object.freeze([
  "schema_version",
  "calls",
  "sequences",
  "calls_by_model",
  "calls_by_decomposition",
  "schedule_seed",
  "schedule_sha256",
  "prompts_sha256",
  "calls_sha256",
  "ground_truth_sha256",
]);
const QUEUE_COUNT_KEYS = Object.freeze([
  "sequence_system_trials",
  "review_boundaries",
  "review_boundaries_by_system",
  "review_boundaries_by_decomposition",
]);
const SHA256 = /^[a-f0-9]{64}$/u;
const FULL_GIT_COMMIT = /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/u;
const OSF_GUID = /^[a-z0-9]{5}$/u;
const UTC_MILLISECONDS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const GIT_MODE = /^100(?:644|755)$/u;
const RUN_BINDING_KEYS = Object.freeze([
  "schema_version",
  "study_id",
  "queue_id",
  "content_commit",
  "registration_payload_sha256",
  "registration_member_manifest_sha256",
  "content_freeze_record_sha256",
  "execution_authorization_record_sha256",
  "authorized_queue_sha256",
  "calls_sha256",
  "prompts_sha256",
  "ground_truth_sha256",
  "review_schema_sha256",
]);
const OSF_REGISTRATION_KEYS = Object.freeze([
  "id",
  "type",
  "url",
  "registered_at",
  "registration_schema_id",
  "download_evidence",
]);
const OSF_DOWNLOAD_EVIDENCE_KEYS = Object.freeze([
  "registration_record",
  "providers_list",
  "provider_file_list_pages",
  "downloaded_files",
  "verified_at",
  "verified_by",
]);
const OSF_RAW_EVIDENCE_KEYS = Object.freeze(["file", "url", "sha256"]);
const OSF_DOWNLOADED_FILE_KEYS = Object.freeze([
  "name",
  "file_id",
  "download_url",
  "file",
  "sha256",
]);
const EXECUTION_AUTHORIZATION_KEYS = Object.freeze([
  "schema_version",
  "study_id",
  "status",
  "outcome_calls_authorized",
  "authorized_at",
  "authorized_by",
  "osf_registration",
  "author_confirmation",
  "content_freeze",
  "authorized_queues",
  "subscription_access",
  "rule",
]);
const SUBSCRIPTION_ACCESS_KEYS = Object.freeze([
  "schema_version",
  "confirmed",
  "confirmed_at",
  "confirmed_by",
  "codex",
  "claude",
]);
const SUBSCRIPTION_PROVIDER_ACCESS_KEYS = Object.freeze([
  "expected_auth_status_sha256",
  "account_identity_sha256",
  "usage_evidence",
]);
const SUBSCRIPTION_USAGE_DESCRIPTOR_KEYS = Object.freeze(["file", "sha256"]);
const SUBSCRIPTION_USAGE_EVIDENCE_KEYS = Object.freeze([
  "schema_version",
  "provider",
  "expected_auth_status_sha256",
  "account_identity_sha256",
  "extra_usage_status",
]);
const BATCH_ACCESS_CONFIRMATION_KEYS = Object.freeze([
  "schema_version",
  "confirmed",
  "confirmed_at",
  "confirmed_by",
  "statement",
  "codex",
  "claude",
]);
const BATCH_PROVIDER_ACCESS_KEYS = Object.freeze([
  "account_identity_sha256",
  "extra_usage_status",
]);
const ATTEMPT_PROVENANCE_KEYS = Object.freeze([
  "schema_version",
  "codex_executable",
  "codex_executable_sha256",
  "codex_version",
  "codex_auth",
  "codex_auth_status_sha256",
  "codex_isolation",
  "codex_model_identity",
  "claude_executable",
  "claude_executable_sha256",
  "claude_version",
  "claude_auth",
  "claude_auth_status_sha256",
  "claude_isolation",
  "claude_model_identity",
  "child_env_policy",
  "checked_at",
]);
const CHILD_ENV_POLICY = Object.freeze({
  schema_version: 1,
  allowed_keys: Object.freeze([
    "CODEX_HOME", "HOME", "LANG", "LC_ALL", "NO_COLOR", "PATH", "TERM",
  ]),
  fixed_keys: Object.freeze(["LANG", "LC_ALL", "NO_COLOR", "PATH", "TERM"]),
});

class ModelIdentityError extends Error {
  constructor(message) {
    super(message);
    this.name = "ModelIdentityError";
  }
}

class ModelDriftError extends Error {
  constructor(message) {
    super(message);
    this.name = "ModelDriftError";
  }
}

class ProviderEnvelopeError extends Error {
  constructor(message) {
    super(message);
    this.name = "ProviderEnvelopeError";
  }
}

class AuthorizedSchemaDriftError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthorizedSchemaDriftError";
  }
}

class ClientExecutableDriftError extends Error {
  constructor(message) {
    super(message);
    this.name = "ClientExecutableDriftError";
  }
}

class ClientIsolationDriftError extends Error {
  constructor(message) {
    super(message);
    this.name = "ClientIsolationDriftError";
  }
}

export function preflightSubscriptionClients({
  codexBin,
  claudeBin,
  codexSandboxProbe,
  env = process.env,
  run = runFile,
  inspectExecutable = inspectPinnedExecutable,
}) {
  if (!isAbsolute(codexBin ?? "") || !isAbsolute(claudeBin ?? "")) {
    throw new Error("Absolute CODEX_SUBSCRIPTION_BIN and CLAUDE_SUBSCRIPTION_BIN paths are required");
  }
  const codexExecutable = inspectExecutable(codexBin);
  const claudeExecutable = inspectExecutable(claudeBin);
  const childEnv = buildSubscriptionChildEnv(env);
  const sandboxProbe = validateCodexSandboxProbe(codexSandboxProbe, childEnv);
  if (codexExecutable.sha256 !== CODEX_EXECUTABLE_SHA256) {
    throw new Error("Codex executable byte drift from the pinned 0.137.0 release");
  }
  if (claudeExecutable.sha256 !== CLAUDE_EXECUTABLE_SHA256) {
    throw new Error("Claude Code executable byte drift from the pinned 2.1.211 release");
  }
  const codexVersion = String(run(codexExecutable.realpath, ["--version"], { env: childEnv }).stdout)
    .match(/(\d+\.\d+\.\d+)/u)?.[1];
  const claudeVersion = String(run(claudeExecutable.realpath, ["--version"], { env: childEnv }).stdout)
    .match(/(\d+\.\d+\.\d+)/u)?.[1];
  if (codexVersion !== CODEX_VERSION) throw new Error(`Codex version drift: ${codexVersion ?? "unknown"}`);
  if (claudeVersion !== CLAUDE_VERSION) throw new Error(`Claude Code version drift: ${claudeVersion ?? "unknown"}`);
  assertSupportedHelp(
    String(run(
      codexExecutable.realpath,
      ["--ask-for-approval", "never", "exec", "--help"],
      { env: childEnv },
    ).stdout),
    [
      "--ephemeral", "--ignore-user-config", "--ignore-rules", "--json", "--output-schema",
      "--config",
    ],
    "Codex isolation",
  );
  assertSupportedHelp(
    String(run(codexExecutable.realpath, ["sandbox", "--help"], { env: childEnv }).stdout),
    ["--permissions-profile", "--include-managed-config", "--cd"],
    "Codex custom sandbox-profile proof",
  );
  assertSupportedHelp(
    String(run(claudeExecutable.realpath, ["--help"], { env: childEnv }).stdout),
    [
      "--safe-mode", "--setting-sources", "--strict-mcp-config", "--mcp-config",
      "--disable-slash-commands", "--no-chrome", "--output-format", "--json-schema",
    ],
    "Claude Code isolation",
  );
  const sandboxDelivery = run(
    codexExecutable.realpath,
    codexSandboxProbeArgs(sandboxProbe),
    { env: childEnv },
  );
  const sandboxProof = String(sandboxDelivery.stdout).trim();
  if (sandboxProof !== CODEX_SANDBOX_PROBE_SUCCESS) {
    throw new Error("Codex minimal sandbox-profile proof did not return its exact success marker");
  }
  if (String(sandboxDelivery.stderr ?? "").trim() !== "") {
    throw new Error(
      "Codex minimal sandbox-profile proof emitted a warning; managed-profile fallback is forbidden",
    );
  }
  const codexStatus = String(run(
    codexExecutable.realpath,
    ["login", "status"],
    { env: childEnv },
  ).stdout);
  const claudeStatus = String(run(
    claudeExecutable.realpath,
    ["auth", "status"],
    { env: childEnv },
  ).stdout);
  assertSubscriptionAccess({ codexStatus, claudeStatus, env: childEnv });
  const accountIdentitySha256 = currentAccountIdentitySha256({
    codexStatus,
    claudeStatus,
    childEnv,
  });
  const provenance = {
    schema_version: 3,
    codex_executable: codexExecutable.realpath,
    codex_executable_sha256: codexExecutable.sha256,
    codex_version: codexVersion,
    codex_auth: "chatgpt-subscription",
    codex_auth_status_sha256: sha256(codexStatus),
    codex_isolation: cloneJson(CODEX_ISOLATION),
    codex_model_identity: codexModelIdentityMetadata(),
    claude_executable: claudeExecutable.realpath,
    claude_executable_sha256: claudeExecutable.sha256,
    claude_version: claudeVersion,
    claude_auth: "claude.ai-max-subscription",
    claude_auth_status_sha256: sha256(claudeStatus),
    claude_isolation: cloneJson(CLAUDE_ISOLATION),
    claude_model_identity: claudeModelIdentityMetadata(),
    child_env_policy: cloneJson(CHILD_ENV_POLICY),
    checked_at: new Date().toISOString(),
  };
  validateAttemptProvenance(provenance);
  Object.defineProperty(provenance, "verify_executables", {
    enumerable: false,
    value: () => {
      assertSameExecutable(codexExecutable, inspectExecutable(codexExecutable.realpath), "Codex");
      assertSameExecutable(claudeExecutable, inspectExecutable(claudeExecutable.realpath), "Claude Code");
    },
  });
  Object.defineProperty(provenance, "child_env", {
    enumerable: false,
    value: Object.freeze({ ...childEnv }),
  });
  Object.defineProperty(provenance, "account_identity_sha256", {
    enumerable: false,
    value: accountIdentitySha256,
  });
  return provenance;
}

export function runSubscriptionPreflight({
  codexBin,
  claudeBin,
  env = process.env,
  run = runFile,
  inspectExecutable = inspectPinnedExecutable,
  makeTemporaryRoot = () => mkdtempSync(join(tmpdir(), "llm-review-preflight-")),
}) {
  const root = realpathSync(makeTemporaryRoot());
  let isolation;
  try {
    isolation = prepareIsolatedClientEnvironment({
      root,
      ambientEnv: env,
      requireCodexCredential: true,
    });
    const cwd = ensureContainedDirectory(root, "empty", "preflight working directory");
    const schemaProbe = createContainedFile(
      root,
      "preflight-schema-probe",
      Buffer.from('{"type":"object"}\n'),
      "preflight schema probe",
    );
    const provenance = preflightSubscriptionClients({
      codexBin,
      claudeBin,
      env: isolation.env,
      run,
      inspectExecutable,
      codexSandboxProbe: {
        cwd,
        denied_paths: [isolation.codex_deny_probe.path, schemaProbe],
      },
    });
    return {
      ...provenance,
      account_identity_sha256: cloneJson(provenance.account_identity_sha256),
    };
  } finally {
    cleanupIsolatedClientEnvironment(isolation);
    rmSync(root, { recursive: true, force: true });
  }
}

export function parseSubscriptionOutput(systemId, stdout) {
  const parsed = parseSubscriptionEnvelope(systemId, stdout);
  return { ...parsed, response: validateStructuredResponse(parsed.structured_response) };
}

function parseSubscriptionEnvelope(systemId, stdout) {
  try {
    return parseSubscriptionEnvelopeUnchecked(systemId, stdout);
  } catch (error) {
    if (error instanceof ModelIdentityError
      || error instanceof ModelDriftError
      || error instanceof ProviderEnvelopeError) {
      throw error;
    }
    throw new ProviderEnvelopeError(`Provider envelope is invalid: ${error.message}`);
  }
}

function parseSubscriptionEnvelopeUnchecked(systemId, stdout) {
  if (systemId === "codex-cli/gpt-5.5") {
    const events = String(stdout).split("\n").filter(Boolean).map((line) => JSON.parse(line));
    const reroute = events.find((event) => {
      const errorText = event.type === "item.completed" && event.item?.type === "error"
        ? nonblank(event.item.message) ?? nonblank(event.item.text)
        : event.type === "error"
          ? nonblank(event.message) ?? nonblank(event.error?.message)
          : null;
      return /^model rerouted:/iu.test(errorText ?? "");
    });
    if (reroute) throw new ModelDriftError("Codex reported a model-rerouted event");
    const providerError = events.find((event) => event.type === "error");
    if (providerError) {
      throw new ProviderEnvelopeError("Codex returned a top-level provider error event");
    }
    const message = events.findLast((event) =>
      event.type === "item.completed" && event.item?.type === "agent_message"
    );
    if (!message || !nonblank(message.item?.text)) {
      throw new ProviderEnvelopeError("Codex returned no structured agent message");
    }
    return {
      structured_response: message.item.text,
      returned_model: null,
      model_identity_status: "requested_pinned_client_no_reroute_observable",
      usage: sanitizeUsage(
        events.findLast((event) => event.type === "turn.completed")?.usage,
      ),
      tool_deviation: events.some((event) => event.item?.type
        && !["agent_message", "reasoning"].includes(event.item.type)),
    };
  }
  if (systemId === "claude-code/sonnet") {
    const envelope = JSON.parse(stdout);
    if (!envelope || typeof envelope !== "object" || Array.isArray(envelope)) {
      throw new ProviderEnvelopeError("Claude Code returned a non-object provider envelope");
    }
    if (!Object.hasOwn(envelope, "modelUsage") || Object.hasOwn(envelope, "model_usage")
      || !envelope.modelUsage || typeof envelope.modelUsage !== "object"
      || Array.isArray(envelope.modelUsage)) {
      throw new ModelIdentityError("Claude Code returned no unambiguous model identity metadata");
    }
    const returnedModels = Object.keys(envelope.modelUsage);
    if (returnedModels.length !== 1) {
      throw new ModelIdentityError("Claude Code model identity metadata is not a singleton");
    }
    const [returnedModel] = returnedModels;
    assertReturnedModel(systemId, returnedModel);
    if (!envelope.structured_output) {
      throw new ProviderEnvelopeError("Claude Code returned no structured output");
    }
    return {
      structured_response: envelope.structured_output,
      returned_model: returnedModel,
      model_identity_status: "observed_singleton_model_usage",
      usage: sanitizeUsage(envelope.usage),
      tool_deviation: Number(envelope.num_turns ?? 1) > 1,
    };
  }
  throw new Error(`Unknown subscription review system: ${systemId}`);
}

function sanitizeUsage(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const allowed = [
    "input_tokens",
    "cached_input_tokens",
    "cache_creation_input_tokens",
    "cache_read_input_tokens",
    "output_tokens",
  ];
  const sanitized = Object.fromEntries(allowed
    .filter((key) => Number.isSafeInteger(value[key]) && value[key] >= 0)
    .map((key) => [key, value[key]]));
  return Object.keys(sanitized).length === 0 ? null : sanitized;
}

function validUsage(value) {
  return value === null || sameJson(value, sanitizeUsage(value));
}

function currentAccountIdentitySha256({ claudeStatus, childEnv }) {
  const codexAuth = JSON.parse(readPrivateRelativeFile(
    childEnv.CODEX_HOME,
    "auth.json",
    "isolated Codex auth material",
  ).bytes);
  const accountId = nonblank(codexAuth?.tokens?.account_id)
    ?? nonblank(codexAuth?.tokens?.chatgpt_account_id)
    ?? jwtAccountId(codexAuth?.tokens?.id_token)
    ?? jwtAccountId(codexAuth?.tokens?.access_token);
  const claude = JSON.parse(claudeStatus);
  const email = nonblank(claude?.email)?.toLowerCase();
  const orgId = nonblank(claude?.orgId);
  if (!accountId || !email || !orgId) {
    throw new Error("Current subscription account identity is not observable");
  }
  return Object.freeze({
    codex: sha256(JSON.stringify(canonicalValue({
      provider: "codex",
      account_id: accountId,
    }))),
    claude: sha256(JSON.stringify(canonicalValue({
      provider: "claude",
      email,
      org_id: orgId,
    }))),
  });
}

function jwtAccountId(token) {
  if (!nonblank(token)) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const claims = JSON.parse(Buffer.from(parts[1], "base64url"));
    return nonblank(claims.chatgpt_account_id) ?? nonblank(claims.account_id);
  } catch {
    return null;
  }
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
  lockOptions,
  clientIsolationOptions,
}) {
  for (const value of [benchmarkRoot, collectionRoot, outputRoot]) {
    if (!value) throw new Error("benchmarkRoot, collectionRoot, and outputRoot are required");
  }

  // Authorization reads, hashes, parses, and validates the exact immutable
  // input buffers. No output or client process may exist before this returns.
  const authorization = authorize({ benchmarkRoot, collectionRoot });
  assertExecutionSnapshot(authorization);
  if (preflight === preflightSubscriptionClients) {
    verifyCurrentBatchAccessConfirmation({
      path: env.LLM_REVIEW_BATCH_ACCESS_CONFIRMATION,
      access: authorization.subscription_access,
    });
  }
  const reviewSchemaBytes = Buffer.from(authorization.review_schema_bytes);
  const { prompts, calls } = authorization;
  const security = acquireCollectionLock(outputRoot, lockOptions);
  let clientIsolation;
  try {
    try {
      clientIsolation = prepareIsolatedClientEnvironment({
        root: security.root,
        ambientEnv: env,
        requireCodexCredential: preflight === preflightSubscriptionClients,
        ...clientIsolationOptions,
      });
    } catch (error) {
      cleanupIsolatedClientEnvironment({
        root: security.root,
        home: join(security.root, "client-home"),
      });
      throw error;
    }
    const output = prepareOutputRun({
    outputRoot: security.root,
    runBinding: authorization.run_binding,
    calls,
    reviewSchemaBytes,
    security,
  });
  recoverTerminalResults(output);
  recoverInterruptedAttempts(output);
  const provenance = preflight({
    codexBin,
    claudeBin,
    env: clientIsolation.env,
    codexSandboxProbe: {
      cwd: output.emptyCwd,
      denied_paths: [clientIsolation.codex_deny_probe.path, output.schemaPath],
    },
  });
  validateAttemptProvenance(provenance);
  assertRuntimeChildEnv(provenance.child_env);
  assertCurrentSubscriptionAccess(authorization.subscription_access, provenance);
  verifyIsolatedClientEnvironment(clientIsolation);
  if (output.attemptValidation.provenance_fingerprint
    && output.attemptValidation.provenance_fingerprint !== provenanceFingerprint(provenance)) {
    throw new Error("Current client provenance does not match the existing attempt ledger");
  }
  const {
    resultsPath, attemptsPath, schemaPath, schemaSnapshot, emptyCwd, rawOutputRoot,
  } = output;
  const completed = new Set(output.results
    .filter(({ status }) => ["valid", "abstain", "missing"].includes(status))
    .map(({ call_id }) => call_id));
  const failures = new Map();
  const returnedModels = new Map();
  let dispatches = 0;
  for (const attempt of output.attempts) {
    if (attempt.event === "suspended" && attempt.reason === "client_failure") {
      failures.set(attempt.call_id, (failures.get(attempt.call_id) ?? 0) + 1);
    }
    if (attempt.event === "completed" && nonblank(attempt.returned_model) && attempt.system) {
      returnedModels.set(attempt.system, attempt.returned_model);
    }
  }

  for (const call of calls) {
    if (completed.has(call.call_id)) continue;
    if (dispatches >= MAX_DISPATCHES_PER_INVOCATION) {
      return {
        completed: completed.size,
        remaining: calls.length - completed.size,
        reason: "batch_limit_reached",
        provenance,
      };
    }
    if ((failures.get(call.call_id) ?? 0) >= 3) {
      durableAppend(resultsPath, {
        call_id: call.call_id,
        schedule_index: call.schedule_index,
        system: call.model,
        status: "missing",
        reason: "three_attempts_exhausted",
      }, security);
      completed.add(call.call_id);
      continue;
    }
    const request = prompts.get(call.prompt_id);
    if (!request) throw new Error(`${call.call_id}: missing prompt ${call.prompt_id}`);
    const command = buildSubscriptionCommand(call.model, schemaPath, emptyCwd, {
      codexBin: provenance.codex_executable,
      claudeBin: provenance.claude_executable,
      schemaBytes: reviewSchemaBytes,
    });
    const startedAt = new Date().toISOString();
    durableAppend(attemptsPath, {
      call_id: call.call_id,
      schedule_index: call.schedule_index,
      event: "started",
      started_at: startedAt,
      system: call.model,
      provenance,
    }, security);
    let rawOutputSha256 = null;
    try {
      verifyIsolatedClientEnvironment(clientIsolation);
      verifyEmptyClientDirectory(emptyCwd);
      verifyImmutableFileSnapshot(schemaSnapshot, reviewSchemaBytes, "authorized review schema");
      provenance.verify_executables?.();
      dispatches += 1;
      const delivery = runReview(command.command, command.args, {
        cwd: command.cwd,
        input: renderCliPrompt(request),
        env: clientIsolation.env,
        maxBuffer: 4 * 1024 * 1024,
        timeout: 10 * 60 * 1000,
      });
      rawOutputSha256 = sha256(delivery.stdout);
      persistProviderEnvelope(
        rawOutputRoot,
        call.call_id,
        delivery.stdout,
        rawOutputSha256,
      );
      const parsed = parseSubscriptionEnvelope(call.model, delivery.stdout);
      const baselineModel = returnedModels.get(call.model);
      if (baselineModel && baselineModel !== parsed.returned_model) {
        throw new ModelDriftError(
          `Returned model drift: ${baselineModel} -> ${parsed.returned_model}`,
        );
      }
      if (!baselineModel && nonblank(parsed.returned_model)) {
        returnedModels.set(call.model, parsed.returned_model);
      }
      try {
        parsed.response = validateStructuredResponse(parsed.structured_response);
      } catch (error) {
        durableAppend(attemptsPath, {
          call_id: call.call_id,
          schedule_index: call.schedule_index,
          event: "completed",
          finished_at: terminalTimestamp(startedAt),
          reason: "schema_invalid",
          error_sha256: sha256(String(error.message)),
          system: call.model,
          returned_model: parsed?.returned_model ?? null,
          model_identity_status: parsed.model_identity_status,
          raw_output_sha256: rawOutputSha256,
        }, security);
        durableAppend(resultsPath, {
          call_id: call.call_id,
          schedule_index: call.schedule_index,
          system: call.model,
          status: "abstain",
          reason: "schema_invalid",
          raw_output_sha256: rawOutputSha256,
        }, security);
        completed.add(call.call_id);
        continue;
      }
      const responseSha256 = sha256(JSON.stringify(canonicalValue(parsed.response)));
      durableAppend(attemptsPath, {
        call_id: call.call_id,
        schedule_index: call.schedule_index,
        event: "completed",
        finished_at: terminalTimestamp(startedAt),
        system: call.model,
        response: parsed.response,
        returned_model: parsed.returned_model,
        model_identity_status: parsed.model_identity_status,
        tool_deviation: parsed.tool_deviation,
        usage: parsed.usage,
        raw_output_sha256: rawOutputSha256,
        response_sha256: responseSha256,
      }, security);
      durableAppend(resultsPath, {
        call_id: call.call_id,
        schedule_index: call.schedule_index,
        system: call.model,
        status: "valid",
        response: parsed.response,
        returned_model: parsed.returned_model,
        model_identity_status: parsed.model_identity_status,
        tool_deviation: parsed.tool_deviation,
        usage: parsed.usage,
        raw_output_sha256: rawOutputSha256,
        response_sha256: responseSha256,
      }, security);
      completed.add(call.call_id);
    } catch (error) {
      const reason = error instanceof ModelIdentityError
        ? "model_identity_missing"
        : error instanceof ModelDriftError
          ? "model_drift"
          : error instanceof ProviderEnvelopeError
            ? "provider_envelope_invalid"
            : error instanceof AuthorizedSchemaDriftError
              ? "authorized_schema_drift"
            : error instanceof ClientExecutableDriftError
              ? "client_executable_drift"
            : error instanceof ClientIsolationDriftError
              ? "client_isolation_drift"
            : /rate.?limit|usage.?limit|reset/iu.test(error.message)
          ? "rate_limit"
          : /returned model drift/iu.test(error.message)
            ? "model_drift"
            : "client_failure";
      if (reason === "client_failure") {
        failures.set(call.call_id, (failures.get(call.call_id) ?? 0) + 1);
      }
      durableAppend(attemptsPath, {
        call_id: call.call_id,
        schedule_index: call.schedule_index,
        system: call.model,
        event: "suspended",
        finished_at: terminalTimestamp(startedAt),
        reason,
        error_sha256: sha256(String(error.message)),
        raw_output_sha256: rawOutputSha256,
      }, security);
      return {
        completed: completed.size,
        remaining: calls.length - completed.size,
        suspended_call_id: call.call_id,
        reason,
        provenance,
      };
    }
  }
    return { completed: completed.size, remaining: calls.length - completed.size, provenance };
  } finally {
    try {
      cleanupIsolatedClientEnvironment(clientIsolation);
    } finally {
      releaseCollectionLock(security);
    }
  }
}

export function verifyPhaseOneArtifacts({
  benchmarkRoot,
  collectionRoot,
  recordsRoot = import.meta.dirname,
  repositoryRoot = resolve(recordsRoot, "../.."),
  studyDirectory = "research/llm-review-sequences",
}) {
  const studyBytes = readSafeRelativeFile(recordsRoot, "study.json", "study manifest");
  const contentFreezeBytes = readSafeRelativeFile(
    recordsRoot,
    CONTENT_FREEZE_RECORD_FILE,
    "content-freeze record",
  );
  const study = parseJson(studyBytes, "study.json");
  const contentFreeze = parseJson(contentFreezeBytes, CONTENT_FREEZE_RECORD_FILE);

  // The fixed state gate runs before any record-controlled filename is read.
  assertPhaseOneState(study, contentFreeze);
  const bundleBytes = readSafeRelativeFile(
    recordsRoot,
    contentFreeze.registration_bundle?.file,
    "registration packet",
  );
  const registrationBundleVerification = verifyRegistrationPacket(bundleBytes, {
    expectedStudyId: study.study_id,
    expectedContentCommit: contentFreeze.content_commit,
    repositoryRoot,
    studyDirectory,
  });
  const runtimeFileBuffers = readRuntimeFileBuffers(recordsRoot);
  const runtimeFileHashes = hashNamedBuffers(runtimeFileBuffers);
  const committedRuntimeFiles = readCommittedRuntimeFiles({
    repositoryRoot,
    contentCommit: contentFreeze.content_commit,
    studyDirectory,
    recordsRoot,
    runtimeFileBuffers,
  });
  const reviewAttestationBytes = readReviewAttestationBytes({
    recordsRoot,
    attestations: contentFreeze.review_attestations,
    contentCommit: contentFreeze.content_commit,
  });
  const phaseOne = assertPhaseOneFreeze({
    study,
    contentFreeze,
    contentFreezeSha256: sha256(contentFreezeBytes),
    registrationBundleVerification,
    runtimeFileHashes,
    committedRuntimeFiles,
    reviewAttestationBytes,
  });
  validateAuthorizedSnapshot({
    study,
    authorized: phaseOne,
    buffers: readExecutionArtifactBuffers({ benchmarkRoot, collectionRoot }),
    reviewSchemaBytes: runtimeFileBuffers["review-schema.json"],
  });

  return {
    status: "verified-phase-one",
    study_id: phaseOne.study_id,
    content_commit: phaseOne.content_commit,
    branch: phaseOne.branch,
    content_freeze_record_sha256: phaseOne.content_freeze_record_sha256,
    registration_payload_sha256: phaseOne.registration_payload_sha256,
    registration_member_manifest_sha256: phaseOne.registration_member_manifest_sha256,
    queue_id: phaseOne.queue_id,
    review_systems: [...phaseOne.review_systems],
    review_attestations: phaseOne.review_attestations.map((attestation) => ({ ...attestation })),
    artifacts: { ...phaseOne.artifacts },
    raw_files: { ...phaseOne.raw_files },
    counts: cloneJson(phaseOne.counts),
    outcome_calls_authorized: false,
  };
}

export function assertAuthorizedArtifacts({
  benchmarkRoot,
  collectionRoot,
  recordsRoot = import.meta.dirname,
  repositoryRoot = resolve(recordsRoot, "../.."),
  studyDirectory = "research/llm-review-sequences",
}) {
  const studyBytes = readSafeRelativeFile(recordsRoot, "study.json", "study manifest");
  const contentFreezeBytes = readSafeRelativeFile(
    recordsRoot,
    "registration-content-freeze.json",
    "content-freeze record",
  );
  const executionAuthorizationBytes = readSafeRelativeFile(
    recordsRoot,
    "execution-authorization.json",
    "execution-authorization record",
  );
  const study = parseJson(studyBytes, "study.json");
  const contentFreeze = parseJson(contentFreezeBytes, "registration-content-freeze.json");
  const executionAuthorization = parseJson(
    executionAuthorizationBytes,
    "execution-authorization.json",
  );

  // Fail on the state gate before following any filename stored in an
  // unauthorized record. The checked-in templates therefore remain inert.
  assertAuthorizedState(study, contentFreeze, executionAuthorization);

  const bundleBytes = readSafeRelativeFile(
    recordsRoot,
    contentFreeze.registration_bundle?.file,
    "registration packet",
  );
  const registrationBundleVerification = verifyRegistrationPacket(bundleBytes, {
    expectedStudyId: study.study_id,
    expectedContentCommit: contentFreeze.content_commit,
    repositoryRoot,
    studyDirectory,
  });
  const osfEvidence = readOsfEvidenceInputs(
    recordsRoot,
    executionAuthorization.osf_registration?.download_evidence,
    executionAuthorization.osf_registration?.id,
  );
  const subscriptionAccessEvidence = readSubscriptionAccessEvidenceInputs(
    recordsRoot,
    executionAuthorization.subscription_access,
  );
  const runtimeFileBuffers = readRuntimeFileBuffers(recordsRoot);
  const runtimeFileHashes = hashNamedBuffers(runtimeFileBuffers);
  const committedRuntimeFiles = readCommittedRuntimeFiles({
    repositoryRoot,
    contentCommit: contentFreeze.content_commit,
    studyDirectory,
    recordsRoot,
    runtimeFileBuffers,
  });
  const reviewAttestationBytes = readReviewAttestationBytes({
    recordsRoot,
    attestations: contentFreeze.review_attestations,
    contentCommit: contentFreeze.content_commit,
  });
  const authorized = assertExecutionAuthorization({
    study,
    contentFreeze,
    contentFreezeSha256: sha256(contentFreezeBytes),
    registrationBundleVerification,
    runtimeFileHashes,
    committedRuntimeFiles,
    reviewAttestationBytes,
    osfEvidence,
    subscriptionAccessEvidence,
    executionAuthorizationSha256: sha256(executionAuthorizationBytes),
    executionAuthorization,
  });

  // Each artifact is read exactly once. These same parsed objects are returned
  // to the collector, closing the validation-to-execution race.
  const buffers = readExecutionArtifactBuffers({ benchmarkRoot, collectionRoot });
  return validateAuthorizedSnapshot({
    study,
    authorized,
    buffers,
    reviewSchemaBytes: runtimeFileBuffers["review-schema.json"],
  });
}

export function assertExecutionAuthorization({
  study,
  contentFreeze,
  contentFreezeSha256,
  registrationBundleVerification,
  runtimeFileHashes,
  committedRuntimeFiles,
  reviewAttestationBytes,
  osfEvidence,
  subscriptionAccessEvidence,
  executionAuthorizationSha256,
  executionAuthorization,
}) {
  assertAuthorizedState(study, contentFreeze, executionAuthorization);
  if (executionAuthorization.schema_version !== 5) {
    throw new Error("Unsupported execution-authorization schema");
  }
  assertExactKeys(
    executionAuthorization,
    EXECUTION_AUTHORIZATION_KEYS,
    "Execution authorization",
  );
  if (!nonblank(executionAuthorization.rule)) {
    throw new Error("Execution authorization rule is absent");
  }
  const phaseOne = assertPhaseOneFreeze({
    study,
    contentFreeze,
    contentFreezeSha256,
    registrationBundleVerification,
    runtimeFileHashes,
    committedRuntimeFiles,
    reviewAttestationBytes,
  });
  if (executionAuthorization.study_id !== study.study_id) {
    throw new Error("Execution-authorization study identity does not match");
  }

  const author = assertSoleAuthor(study.authorship);
  assertSameAuthor(executionAuthorization.authorized_by, author, "execution authorizer");

  const osf = executionAuthorization.osf_registration;
  assertExactKeys(osf, OSF_REGISTRATION_KEYS, "OSF registration summary");
  const osfId = nonblank(osf?.id);
  if (!osfId || !OSF_GUID.test(osfId)
    || osf.type !== "registrations"
    || osf.url !== `https://osf.io/${osfId}/`) {
    throw new Error("Execution authorization lacks a canonical OSF registration record");
  }
  if (!nonblank(osf.registration_schema_id)
    || osf.registration_schema_id !== contentFreeze.osf_schema?.id
    || osf.registration_schema_id !== study.preregistration_v2_draft?.template_schema_id) {
    throw new Error("Execution authorization OSF registration schema does not match the frozen study");
  }
  const evidence = osf.download_evidence;
  assertOsfEvidenceDescriptors(evidence, osfId);
  assertSameAuthor(evidence.verified_by, author, "OSF download evidence verifier");
  const confirmation = executionAuthorization.author_confirmation;
  if (confirmation?.confirmed !== true || !nonblank(confirmation.statement)) {
    throw new Error("Explicit author confirmation is absent or incomplete");
  }
  assertSameAuthor(confirmation, author, "author confirmation");
  const subscriptionAccess = validateSubscriptionAccessEvidence({
    access: executionAuthorization.subscription_access,
    evidence: subscriptionAccessEvidence,
    author,
  });

  const timestamps = [
    contentFreeze.frozen_at,
    osf.registered_at,
    evidence.verified_at,
    confirmation.confirmed_at,
    subscriptionAccess.confirmed_at,
    executionAuthorization.authorized_at,
  ];
  if (!timestamps.every(validUtcTimestamp)) {
    throw new Error("Freeze, registration, verification, confirmation, or authorization timestamp is invalid");
  }
  if (!timestamps.every((value, index) => index === 0 || Date.parse(timestamps[index - 1]) < Date.parse(value))) {
    throw new Error("Freeze, registration, verification, confirmation, and authorization timestamp order is invalid");
  }

  const bundle = contentFreeze.registration_bundle;
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
  if (reference.bundle_sha256 !== bundle.sha256) {
    throw new Error("Execution authorization bundle hash does not match");
  }
  if (reference.member_manifest_sha256 !== bundle.member_manifest_sha256) {
    throw new Error("Execution authorization member manifest hash does not match");
  }
  validateOsfEvidence(osfEvidence, {
    osf,
    bundle,
    contentFreezeSha256,
    registrationSchemaId: contentFreeze.osf_schema.id,
  });

  if (!Array.isArray(executionAuthorization.authorized_queues)
    || executionAuthorization.authorized_queues.length !== 1) {
    throw new Error("Execution authorization must contain exactly one confirmatory queue");
  }
  const [authorizedQueue] = executionAuthorization.authorized_queues;
  assertExactKeys(
    authorizedQueue,
    ["id", "review_systems", "artifacts", "raw_files", "counts"],
    "Authorized queue",
  );
  if (authorizedQueue.id !== phaseOne.queue_id) {
    throw new Error("Authorized queue identity is not the confirmatory queue");
  }
  if (!sameJson(authorizedQueue.review_systems, phaseOne.review_systems)) {
    throw new Error("Authorized review systems do not match the frozen queue");
  }
  assertSameArtifacts(phaseOne.artifacts, authorizedQueue.artifacts);
  assertRawFiles(authorizedQueue.raw_files);
  if (!sameJson(authorizedQueue.raw_files, phaseOne.raw_files)) {
    throw new Error("Authorized raw file hashes do not exactly match the frozen queue");
  }
  assertExactKeys(authorizedQueue.counts, QUEUE_COUNT_KEYS, "Authorized queue counts");
  if (!sameJson(authorizedQueue.counts, phaseOne.counts)) {
    throw new Error("Authorized queue counts do not match the frozen queue");
  }
  if (!sameJson(phaseOne.frozen_queue, authorizedQueue)) {
    throw new Error("Authorized queue does not exactly match the frozen queue");
  }

  if (!SHA256.test(executionAuthorizationSha256 ?? "")) {
    throw new Error("Execution authorization record hash is invalid");
  }
  const runBinding = createRunBinding({
    schema_version: 1,
    study_id: study.study_id,
    queue_id: CONFIRMATORY_QUEUE_ID,
    content_commit: contentFreeze.content_commit,
    registration_payload_sha256: bundle.sha256,
    registration_member_manifest_sha256: bundle.member_manifest_sha256,
    content_freeze_record_sha256: contentFreezeSha256,
    execution_authorization_record_sha256: executionAuthorizationSha256,
    authorized_queue_sha256: sha256(JSON.stringify(canonicalValue(authorizedQueue))),
    calls_sha256: phaseOne.artifacts.calls_sha256,
    prompts_sha256: phaseOne.artifacts.prompts_sha256,
    ground_truth_sha256: phaseOne.artifacts.ground_truth_sha256,
    review_schema_sha256: contentFreeze.runtime_files["review-schema.json"].sha256,
  });
  return {
    queue_id: CONFIRMATORY_QUEUE_ID,
    study_id: study.study_id,
    content_commit: contentFreeze.content_commit,
    run_binding: runBinding,
    artifacts: { ...phaseOne.artifacts },
    raw_files: { ...phaseOne.raw_files },
    counts: cloneJson(phaseOne.counts),
    review_systems: [...phaseOne.review_systems],
    subscription_access: subscriptionAccess,
  };
}

function assertPhaseOneFreeze({
  study,
  contentFreeze,
  contentFreezeSha256,
  registrationBundleVerification,
  runtimeFileHashes,
  committedRuntimeFiles,
  reviewAttestationBytes,
}) {
  assertPhaseOneState(study, contentFreeze);
  if (contentFreeze.schema_version !== 3) {
    throw new Error("Unsupported phase-one content-freeze schema");
  }
  if (study.study_id !== STUDY_ID || contentFreeze.study_id !== study.study_id) {
    throw new Error("Phase-one content-freeze study identity does not match");
  }
  if (contentFreeze.frozen_at !== study.frozen_at) {
    throw new Error("Content-freeze timestamp does not match the frozen study manifest");
  }
  const registeredSchema = study.preregistration_v2_draft;
  assertExactKeys(contentFreeze.osf_schema, ["name", "version", "id"], "Frozen OSF schema");
  if (contentFreeze.osf_schema?.name !== registeredSchema?.template
    || contentFreeze.osf_schema?.version !== registeredSchema?.template_schema_version
    || contentFreeze.osf_schema?.id !== registeredSchema?.template_schema_id) {
    throw new Error("Frozen OSF schema does not match the study manifest");
  }

  const bundle = contentFreeze.registration_bundle;
  assertExactKeys(bundle, ["file", "sha256", "member_manifest_sha256"], "Registration bundle");
  if (!FULL_GIT_COMMIT.test(contentFreeze.content_commit ?? "")
    || !safeRelativePath(bundle?.file)
    || !SHA256.test(bundle?.sha256 ?? "")
    || !SHA256.test(bundle?.member_manifest_sha256 ?? "")
    || !SHA256.test(contentFreezeSha256 ?? "")) {
    throw new Error("Content freeze lacks valid commit, registration bundle, or record hashes");
  }
  if (registrationBundleVerification?.study_id !== study.study_id
    || registrationBundleVerification?.content_commit !== contentFreeze.content_commit
    || registrationBundleVerification?.payload_sha256 !== bundle.sha256) {
    throw new Error("registration bundle verification does not match the content freeze");
  }
  if (registrationBundleVerification.member_manifest_sha256 !== bundle.member_manifest_sha256) {
    throw new Error("registration bundle member manifest does not match the content freeze");
  }

  const frozenRuntimeNames = Object.keys(contentFreeze.runtime_files ?? {}).sort();
  if (!sameJson(frozenRuntimeNames, [...REQUIRED_RUNTIME_FILES].sort())) {
    throw new Error("Content freeze does not name the exact required runtime files");
  }
  for (const name of REQUIRED_RUNTIME_FILES) {
    const frozen = contentFreeze.runtime_files[name];
    const committed = committedRuntimeFiles?.[name];
    assertExactKeys(frozen, ["git_mode", "sha256"], `Frozen runtime file ${name}`);
    if (!SHA256.test(frozen.sha256 ?? "")
      || !GIT_MODE.test(frozen.git_mode ?? "")
      || runtimeFileHashes?.[name] !== frozen.sha256
      || committed?.bytes_sha256 !== frozen.sha256
      || committed?.git_mode !== frozen.git_mode
      || committed?.worktree_mode !== frozen.git_mode) {
      throw new Error(`Frozen runtime file bytes or mode do not match the exact Git content commit: ${name}`);
    }
  }
  const packetMemberHashes = new Map(
    (registrationBundleVerification.members ?? []).map(({ path, sha256: memberSha256 }) => [
      path,
      memberSha256,
    ]),
  );
  for (const name of ["study.json", "review-schema.json"]) {
    if (packetMemberHashes.get(name) !== contentFreeze.runtime_files[name].sha256) {
      throw new Error(`registration packet runtime member does not match the frozen runtime file: ${name}`);
    }
  }
  const reviewAttestations = assertReviewAttestations({
    attestations: contentFreeze.review_attestations,
    reportBytes: reviewAttestationBytes,
    contentCommit: contentFreeze.content_commit,
  });

  if (contentFreeze.branch !== "confirmatory-only") {
    throw new Error("Phase one requires the confirmatory-only branch; Ollama requires a separately reviewed runner");
  }
  if (!Array.isArray(contentFreeze.queues) || contentFreeze.queues.length !== 1) {
    throw new Error("Phase-one freeze must contain exactly one confirmatory queue");
  }
  const [frozenQueue] = contentFreeze.queues;
  if (frozenQueue?.id !== CONFIRMATORY_QUEUE_ID) {
    throw new Error("Frozen queue identity is not the confirmatory queue");
  }
  assertExactKeys(
    frozenQueue,
    ["id", "review_systems", "artifacts", "raw_files", "counts"],
    "Frozen queue",
  );
  const active = study.active_subscription_design;
  const activeSystems = active?.review_systems?.map(({ id }) => id);
  if (!sameJson(activeSystems, CONFIRMATORY_REVIEW_SYSTEMS)
    || !sameJson(frozenQueue.review_systems, activeSystems)) {
    throw new Error("Frozen review systems do not match the exact confirmatory manifest");
  }
  const expectedSystemBindings = [
    { id: CONFIRMATORY_REVIEW_SYSTEMS[0], client_version: CODEX_VERSION, requested_model: "gpt-5.5" },
    { id: CONFIRMATORY_REVIEW_SYSTEMS[1], client_version: CLAUDE_VERSION, requested_model: "sonnet" },
  ];
  if (active.review_systems.some((system, index) =>
    Object.entries(expectedSystemBindings[index]).some(([name, value]) => system[name] !== value)
  )) {
    throw new Error("Manifest review systems do not match the pinned clients and requested models");
  }
  assertExactKeys(active?.artifacts, ACTIVE_ARTIFACT_KEYS, "Active artifact schema");
  assertSameArtifacts(active?.artifacts, frozenQueue.artifacts);
  if (!Number.isSafeInteger(active.artifacts.schedule_seed)
    || active.artifacts.schedule_seed < 0
    || !Number.isSafeInteger(active.artifacts.maximum_request_bytes)
    || active.artifacts.maximum_request_bytes < 1) {
    throw new Error("Active artifact schema has an invalid schedule seed or maximum request bytes");
  }
  assertRawFiles(frozenQueue.raw_files);
  const expectedCounts = expectedQueueCounts(active, activeSystems);
  assertExactKeys(frozenQueue.counts, QUEUE_COUNT_KEYS, "Frozen queue counts");
  if (!sameJson(frozenQueue.counts, expectedCounts)) {
    throw new Error("Frozen queue counts do not match the manifest design");
  }

  return {
    queue_id: CONFIRMATORY_QUEUE_ID,
    study_id: study.study_id,
    content_commit: contentFreeze.content_commit,
    branch: contentFreeze.branch,
    content_freeze_record_sha256: contentFreezeSha256,
    registration_payload_sha256: bundle.sha256,
    registration_member_manifest_sha256: bundle.member_manifest_sha256,
    review_attestations: reviewAttestations,
    artifacts: { ...active.artifacts },
    raw_files: { ...frozenQueue.raw_files },
    counts: cloneJson(frozenQueue.counts),
    review_systems: [...activeSystems],
    frozen_queue: cloneJson(frozenQueue),
  };
}

function validateAuthorizedSnapshot({ study, authorized, buffers, reviewSchemaBytes }) {
  for (const name of RAW_FILE_NAMES) {
    if (sha256(buffers[name]) !== authorized.raw_files[name]) {
      throw new Error(`Frozen raw file hash does not match: ${name}`);
    }
  }

  const cards = parseJson(buffers["cards.json"], "cards.json");
  const prompts = parseJsonl(buffers["prompts.jsonl"], "prompts.jsonl");
  const calls = parseJsonl(buffers["calls.jsonl"], "calls.jsonl");
  const groundTruth = parseJsonl(buffers["ground-truth.jsonl"], "ground-truth.jsonl");
  const collection = parseJson(buffers["collection.json"], "collection.json");
  const requestByteLengths = prompts.map(({ request }) => {
    const json = JSON.stringify(request);
    if (typeof json !== "string") {
      throw new Error("Frozen prompt request is not JSON-serializable");
    }
    return Buffer.byteLength(json);
  });
  const maximumRequestBytes = requestByteLengths.length > 0
    ? Math.max(...requestByteLengths)
    : 0;
  if (maximumRequestBytes !== authorized.artifacts.maximum_request_bytes) {
    throw new Error("Recomputed maximum request bytes do not match the active artifact manifest");
  }
  const actualArtifacts = {
    cards_sha256: sha256(JSON.stringify(cards)),
    prompts_sha256: sha256(buffers["prompts.jsonl"]),
    calls_sha256: sha256(buffers["calls.jsonl"]),
    ground_truth_sha256: sha256(buffers["ground-truth.jsonl"]),
  };
  for (const [name, value] of Object.entries(actualArtifacts)) {
    if (value !== authorized.artifacts[name]) {
      throw new Error(`${name} does not match the authorized manifest`);
    }
  }

  if (!Array.isArray(cards?.cases)) throw new Error("cards.json must contain a cases array");
  const scenarioIds = [...new Set(cards.cases.map(({ scenario_id }) => scenario_id))].sort();
  const cardsByCondition = new Map(cards.cases.map((card) => [
    `${card.scenario_id}\u0000${card.intent}`,
    card,
  ]));
  const cardsById = new Map(cards.cases.map((card) => [card.case_id, card]));
  if (scenarioIds.some((id) => !nonblank(id))
    || cards.cases.length !== scenarioIds.length * 2
    || cardsByCondition.size !== cards.cases.length
    || cardsById.size !== cards.cases.length) {
    throw new Error("Benchmark cards are not unique malicious-benign scenario pairs");
  }
  const design = study.active_subscription_design.design;
  if (scenarioIds.length !== design.scenario_pairs) {
    throw new Error("Scenario-pair count does not match the frozen design");
  }
  const nested = design.nested_evaluation;
  if (nested.scenario_ids.some((scenarioId) => !scenarioIds.includes(scenarioId))) {
    throw new Error("Nested-evaluation scenarios do not match the frozen cards");
  }
  const schedule = generateCallSchedule({
    scenarioIds,
    models: authorized.review_systems,
    trialsPerCell: design.trials_per_cell,
    splitSubmissionCount: design.split_submission_count,
    contexts: design.contexts,
    nestedPlan: {
      scenarioIds: nested.scenario_ids,
      trialsPerCell: nested.trials_per_cell,
      contexts: nested.contexts,
    },
    seed: authorized.artifacts.schedule_seed,
  });
  if (schedule.sha256 !== authorized.artifacts.schedule_sha256) {
    throw new Error("Recomputed schedule hash does not match the authorized manifest");
  }
  if (schedule.rows.length !== calls.length || calls.length !== groundTruth.length) {
    throw new Error("Calls, ground truth, and recomputed schedule lengths differ");
  }

  const promptsById = new Map();
  const promptsByCondition = new Map();
  for (const prompt of prompts) {
    assertExactKeys(prompt, PROMPT_KEYS, "Prompt row");
    if (!nonblank(prompt.prompt_id) || promptsById.has(prompt.prompt_id)) {
      throw new Error("Prompt identifiers must be nonblank and unique");
    }
    const card = cardsById.get(prompt.case_id);
    if (!card || prompt.scenario_id !== card.scenario_id || prompt.prompt_id !== promptId(prompt)) {
      throw new Error("Prompt identity or scenario does not match its frozen card and request");
    }
    const key = promptKey(prompt);
    if (promptsByCondition.has(key)) throw new Error("Duplicate prompt condition");
    promptsById.set(prompt.prompt_id, prompt);
    promptsByCondition.set(key, prompt);
  }
  const promptUseCounts = new Map(prompts.map(({ prompt_id }) => [prompt_id, 0]));
  const callIds = new Set();
  for (let index = 0; index < schedule.rows.length; index += 1) {
    const expectedSchedule = schedule.rows[index];
    const call = calls[index];
    const truth = groundTruth[index];
    assertExactKeys(call, CALL_KEYS, `Call row ${index + 1}`);
    assertExactKeys(truth, GROUND_TRUTH_KEYS, `Ground-truth row ${index + 1}`);
    if (!sameJson(scheduleCore(truth), expectedSchedule)) {
      throw new Error(`Ground-truth schedule row ${index + 1} does not match the recomputed schedule`);
    }
    if (call.schedule_index !== index + 1 || truth.schedule_index !== index + 1) {
      throw new Error("Schedule indexes must be unique, contiguous, and in file order");
    }
    if (callIds.has(call.call_id)) throw new Error("Call identifiers must be unique");
    callIds.add(call.call_id);
    const card = cardsByCondition.get(`${expectedSchedule.scenario_id}\u0000${expectedSchedule.intent}`);
    const prompt = promptsByCondition.get(promptKey({ ...expectedSchedule, case_id: card?.case_id }));
    if (!card || !prompt) throw new Error(`Schedule row ${index + 1} has no exact card or prompt`);
    if (call.prompt_id !== prompt.prompt_id
      || call.case_id !== card.case_id
      || call.model !== expectedSchedule.model
      || call.trial !== expectedSchedule.trial
      || call.call_id !== callId(call)) {
      throw new Error(`Call row ${index + 1} does not match the recomputed schedule and prompt`);
    }
    if (truth.call_id !== call.call_id
      || truth.case_id !== card.case_id
      || truth.template_id !== card.template_id
      || truth.scenario_family !== card.family
      || truth.expected_severity !== card.expected_severity) {
      throw new Error(`Ground-truth row ${index + 1} does not match its card and call`);
    }
    const submissions = card[expectedSchedule.decomposition]?.submissions;
    const currentSubmission = submissions?.[expectedSchedule.submission_index - 1];
    const relevantIndexes = new Set(card.ground_truth_relevant_submissions);
    const expectedRelevantIds = submissions
      ?.filter(({ index: submissionIndex }) => relevantIndexes.has(submissionIndex))
      .map(({ commit }) => commit);
    if (!currentSubmission || !Array.isArray(expectedRelevantIds) || expectedRelevantIds.length === 0
      || !sameJson(truth.relevant_submission_ids, expectedRelevantIds)
      || truth.submitted_at !== currentSubmission.timestamp
      || truth.sequence_started_at !== submissions[0]?.timestamp) {
      throw new Error(`Ground-truth submission fields ${index + 1} do not match the exact card`);
    }
    promptUseCounts.set(prompt.prompt_id, promptUseCounts.get(prompt.prompt_id) + 1);
  }
  if ([...promptUseCounts.values()].some((count) => count < authorized.review_systems.length)) {
    throw new Error("Each frozen prompt must be consumed by every review system");
  }

  const summary = summarizeSchedule(schedule.rows);
  const actualCounts = {
    sequence_system_trials: summary.sequences,
    review_boundaries: summary.calls,
    review_boundaries_by_system: summary.calls_by_model,
    review_boundaries_by_decomposition: summary.calls_by_decomposition,
  };
  if (!sameJson(actualCounts, authorized.counts)) {
    throw new Error("Actual queue counts do not match the authorized counts");
  }
  assertExactKeys(collection, COLLECTION_KEYS, "Collection summary");
  const expectedCollection = {
    schema_version: 1,
    ...summary,
    schedule_seed: authorized.artifacts.schedule_seed,
    schedule_sha256: schedule.sha256,
    prompts_sha256: actualArtifacts.prompts_sha256,
    calls_sha256: actualArtifacts.calls_sha256,
    ground_truth_sha256: actualArtifacts.ground_truth_sha256,
  };
  if (!sameJson(collection, expectedCollection)) {
    throw new Error("Collection summary does not match the recomputed schedule and exact artifact bytes");
  }

  return {
    ...authorized,
    review_schema_bytes: Buffer.from(reviewSchemaBytes),
    prompts: new Map(prompts.map(({ prompt_id, request }) => [prompt_id, deepFreeze(request)])),
    calls: calls.map((call) => Object.freeze({ ...call })),
  };
}

function assertExecutionSnapshot(value) {
  if (!value || value.queue_id !== CONFIRMATORY_QUEUE_ID
    || !validRunBinding(value.run_binding)
    || !(value.prompts instanceof Map)
    || !Buffer.isBuffer(value.review_schema_bytes) || value.review_schema_bytes.length === 0
    || !Array.isArray(value.calls)
    || value.calls.some((call, index) => !call || !nonblank(call.call_id)
      || call.schedule_index !== index + 1
      || !nonblank(call.prompt_id) || !value.prompts.has(call.prompt_id)
      || !CONFIRMATORY_REVIEW_SYSTEMS.includes(call.model))
    || new Set(value.calls.map(({ call_id }) => call_id)).size !== value.calls.length) {
    throw new Error("Authorization did not return a complete confirmatory execution authorization snapshot");
  }
  validateSubscriptionAccessStructure(value.subscription_access);
}

function validateSubscriptionAccessStructure(access) {
  assertExactKeys(access, SUBSCRIPTION_ACCESS_KEYS, "Subscription access authorization");
  if (access.schema_version !== 1 || access.confirmed !== true
    || !validUtcTimestamp(access.confirmed_at)) {
    throw new Error("Subscription access authorization is not explicitly confirmed");
  }
  assertExactKeys(access.confirmed_by, ["name", "orcid"], "Subscription access confirmer");
  for (const provider of ["codex", "claude"]) {
    const record = access[provider];
    assertExactKeys(
      record,
      SUBSCRIPTION_PROVIDER_ACCESS_KEYS,
      `${provider} subscription access authorization`,
    );
    assertExactKeys(
      record.usage_evidence,
      SUBSCRIPTION_USAGE_DESCRIPTOR_KEYS,
      `${provider} subscription usage evidence descriptor`,
    );
    if (!SHA256.test(record.expected_auth_status_sha256 ?? "")
      || !SHA256.test(record.account_identity_sha256 ?? "")
      || !safeRelativePath(record.usage_evidence.file)
      || !SHA256.test(record.usage_evidence.sha256 ?? "")) {
      throw new Error(`${provider} subscription access authorization is incomplete`);
    }
  }
  return access;
}

function validateSubscriptionAccessEvidence({ access, evidence, author }) {
  validateSubscriptionAccessStructure(access);
  assertSameAuthor(access.confirmed_by, author, "subscription access confirmer");
  if (!evidence || !sameJson(Object.keys(evidence).sort(), ["claude", "codex"])) {
    throw new Error("Subscription usage evidence must contain exactly Codex and Claude records");
  }
  for (const provider of ["codex", "claude"]) {
    const descriptor = access[provider].usage_evidence;
    const bytes = evidence[provider];
    if (!Buffer.isBuffer(bytes) || sha256(bytes) !== descriptor.sha256) {
      throw new Error(`${provider} subscription usage evidence hash does not match`);
    }
    const record = parseJson(bytes, `${provider} subscription usage evidence`);
    assertExactKeys(
      record,
      SUBSCRIPTION_USAGE_EVIDENCE_KEYS,
      `${provider} subscription usage evidence`,
    );
    if (record.schema_version !== 1 || record.provider !== provider
      || record.expected_auth_status_sha256 !== access[provider].expected_auth_status_sha256
      || record.account_identity_sha256 !== access[provider].account_identity_sha256
      || record.extra_usage_status !== "disabled") {
      throw new Error(`${provider} subscription usage or identity evidence is not authorized`);
    }
  }
  return cloneJson(access);
}

function assertCurrentSubscriptionAccess(access, provenance) {
  validateSubscriptionAccessStructure(access);
  if (provenance.codex_auth_status_sha256 !== access.codex.expected_auth_status_sha256
    || provenance.claude_auth_status_sha256 !== access.claude.expected_auth_status_sha256
    || provenance.account_identity_sha256?.codex !== access.codex.account_identity_sha256
    || provenance.account_identity_sha256?.claude !== access.claude.account_identity_sha256) {
    throw new Error(
      "Current subscription auth status or account identity does not match the authorized evidence",
    );
  }
}

export function verifyCurrentBatchAccessConfirmation({ path, access, now = Date.now() }) {
  validateSubscriptionAccessStructure(access);
  const bytes = readPrivateAbsoluteFile(path, "current batch subscription-access confirmation");
  const record = parseJson(bytes, "current batch subscription-access confirmation");
  assertExactKeys(
    record,
    BATCH_ACCESS_CONFIRMATION_KEYS,
    "Current batch subscription-access confirmation",
  );
  if (record.schema_version !== 1 || record.confirmed !== true || !nonblank(record.statement)) {
    throw new Error("Current batch subscription-access confirmation is incomplete");
  }
  assertSameAuthor(
    record.confirmed_by,
    access.confirmed_by,
    "current batch subscription-access confirmer",
  );
  const confirmedAt = Date.parse(record.confirmed_at);
  if (!validUtcTimestamp(record.confirmed_at)
    || !Number.isFinite(now)
    || confirmedAt > now
    || now - confirmedAt > MAX_BATCH_ACCESS_CONFIRMATION_AGE_MS) {
    throw new Error("Current batch subscription-access confirmation is stale or future-dated");
  }
  for (const provider of ["codex", "claude"]) {
    assertExactKeys(
      record[provider],
      BATCH_PROVIDER_ACCESS_KEYS,
      `${provider} current batch subscription-access confirmation`,
    );
    if (record[provider].account_identity_sha256 !== access[provider].account_identity_sha256
      || record[provider].extra_usage_status !== "disabled") {
      throw new Error(`${provider} current batch extra usage or account identity is not confirmed`);
    }
  }
  return Object.freeze({ confirmed_at: record.confirmed_at, sha256: sha256(bytes) });
}

function assertAuthorizedState(study, contentFreeze, executionAuthorization) {
  assertPhaseOneState(study, contentFreeze);
  if (executionAuthorization?.status !== "authorized-post-registration"
    || executionAuthorization?.outcome_calls_authorized !== true) {
    throw new Error("Subscription collection is not authorized by the frozen OSF-registered packet");
  }
}

function assertPhaseOneState(study, contentFreeze) {
  if (study?.frozen !== true || !validUtcTimestamp(study.frozen_at)
    || contentFreeze?.status !== "frozen-pre-submission"
    || contentFreeze?.outcome_calls_authorized !== false) {
    throw new Error("Phase-one content freeze is incomplete or would authorize outcome calls");
  }
  if (contentFreeze.branch === "confirmatory-only") {
    const active = study.active_subscription_design;
    const ollama = study.exploratory_ollama_cloud_replication;
    if (study.confirmatory_outcomes_collected !== false
      || active?.confirmatory_outcomes_collected !== false
      || ollama?.activation_decision !== "not-activated"
      || ollama?.outcomes_collected !== false
      || ollama?.automated_access_authorized !== false
      || ollama?.outcome_calls_authorized !== false) {
      throw new Error(
        "Confirmatory-only phase-one pre-outcome state requires an uncollected study and not-activated Ollama branch",
      );
    }
  }
}

function assertSameArtifacts(expected, actual) {
  if (!expected || !actual
    || !sameJson(Object.keys(actual).sort(), [...ARTIFACT_HASH_NAMES].sort())
    || ARTIFACT_HASH_NAMES.some((name) =>
    !SHA256.test(expected[name] ?? "") || expected[name] !== actual[name])) {
    throw new Error("Authorized artifact hashes do not match the frozen manifest");
  }
}

function assertRawFiles(value) {
  if (!value || !sameJson(Object.keys(value).sort(), [...RAW_FILE_NAMES].sort())
    || RAW_FILE_NAMES.some((name) => !SHA256.test(value[name] ?? ""))) {
    throw new Error("Frozen queue does not contain the exact raw file hashes");
  }
}

function expectedQueueCounts(active, systems) {
  const design = active?.design;
  if (!design || !Number.isSafeInteger(design.scenario_pairs) || design.scenario_pairs < 1
    || !sameJson(design.intents, ["malicious", "benign"])
    || !sameJson(design.decompositions, ["atomic", "split"])
    || !sameJson(design.workflows, ["pr", "trunk"])
    || !Array.isArray(design.contexts) || design.contexts.length === 0
    || design.contexts.some((context) => !["local", "cumulative"].includes(context))
    || !Number.isSafeInteger(design.trials_per_cell) || design.trials_per_cell < 1
    || !Number.isSafeInteger(design.split_submission_count) || design.split_submission_count < 2) {
    throw new Error("Frozen confirmatory design dimensions are incomplete or invalid");
  }
  const nested = design.nested_evaluation;
  if (!nested || !Array.isArray(nested.scenario_ids)
    || new Set(nested.scenario_ids).size !== nested.scenario_ids.length
    || nested.scenario_ids.some((id) => !nonblank(id))
    || nested.scenario_ids.length > design.scenario_pairs
    || !Array.isArray(nested.contexts) || nested.contexts.length === 0
    || new Set(nested.contexts).size !== nested.contexts.length
    || nested.contexts.some((context) => !["local", "cumulative"].includes(context))
    || design.contexts.some((context) => !nested.contexts.includes(context))
    || !Number.isSafeInteger(nested.trials_per_cell)
    || nested.trials_per_cell < design.trials_per_cell) {
    throw new Error("Frozen confirmatory nested-evaluation design is incomplete or invalid");
  }
  const ordinaryScenarioCount = design.scenario_pairs - nested.scenario_ids.length;
  const scenarioContextTrials = ordinaryScenarioCount
      * design.contexts.length
      * design.trials_per_cell
    + nested.scenario_ids.length
      * nested.contexts.length
      * nested.trials_per_cell;
  const sequenceBase = scenarioContextTrials
    * design.intents.length
    * design.workflows.length;
  const perSystem = sequenceBase * (1 + design.split_submission_count);
  const atomic = sequenceBase * systems.length;
  const split = sequenceBase * systems.length * design.split_submission_count;
  const expected = {
    sequence_system_trials: sequenceBase * design.decompositions.length * systems.length,
    review_boundaries: (atomic + split),
    review_boundaries_by_system: Object.fromEntries(
      systems.map((system) => [system, perSystem]),
    ),
    review_boundaries_by_decomposition: { atomic, split },
  };
  if (design.review_boundaries !== expected.review_boundaries
    || design.boundaries_per_review_system !== perSystem) {
    throw new Error("Frozen design review-boundary counts are inconsistent");
  }
  return expected;
}

function assertSoleAuthor(authorship) {
  if (authorship?.sole_author !== true
    || !Array.isArray(authorship.authors)
    || authorship.authors.length !== 1) {
    throw new Error("Study author record must name exactly one author");
  }
  const [author] = authorship.authors;
  if (!nonblank(author?.name)) throw new Error("Study author name must be nonblank");
  if (!validOrcid(author?.orcid)) throw new Error("Study author ORCID is invalid");
  return { name: author.name.trim(), orcid: author.orcid };
}

function assertSameAuthor(candidate, expected, label) {
  if (!candidate || candidate.name !== expected.name || candidate.orcid !== expected.orcid) {
    throw new Error(`${label} does not match the study author`);
  }
}

function validOrcid(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/u.test(value)) return false;
  const compact = value.replaceAll("-", "");
  let total = 0;
  for (const character of compact.slice(0, 15)) total = (total + Number(character)) * 2;
  const result = (12 - (total % 11)) % 11;
  return compact.at(-1) === (result === 10 ? "X" : String(result));
}

function validUtcTimestamp(value) {
  return typeof value === "string"
    && UTC_MILLISECONDS.test(value)
    && !Number.isNaN(Date.parse(value))
    && new Date(Date.parse(value)).toISOString() === value;
}

function safeRelativePath(value) {
  return typeof value === "string"
    && value.length > 0
    && !isAbsolute(value)
    && !value.includes("\\")
    && !value.includes("\0")
    && !value.split("/").some((segment) => !segment || segment === "." || segment === "..");
}

function readRuntimeFileBuffers(recordsRoot) {
  return Object.fromEntries(REQUIRED_RUNTIME_FILES.map((name) => [
    name,
    readSafeRelativeFile(recordsRoot, name, `runtime file ${name}`),
  ]));
}

function hashNamedBuffers(buffers) {
  return Object.fromEntries(Object.entries(buffers).map(([name, bytes]) => [name, sha256(bytes)]));
}

function readExecutionArtifactBuffers({ benchmarkRoot, collectionRoot }) {
  return {
    "cards.json": readSafeRelativeFile(benchmarkRoot, "cards.json", "benchmark cards"),
    "prompts.jsonl": readSafeRelativeFile(benchmarkRoot, "prompts.jsonl", "benchmark prompts"),
    "calls.jsonl": readSafeRelativeFile(collectionRoot, "calls.jsonl", "collection calls"),
    "ground-truth.jsonl": readSafeRelativeFile(
      collectionRoot,
      "ground-truth.jsonl",
      "collection ground truth",
    ),
    "collection.json": readSafeRelativeFile(
      collectionRoot,
      "collection.json",
      "collection summary",
    ),
  };
}

function readReviewAttestationBytes({ recordsRoot, attestations, contentCommit }) {
  const descriptors = assertReviewAttestationDescriptors(attestations, contentCommit);
  return Object.fromEntries(descriptors.map(({ report_file: reportFile }) => [
    reportFile,
    readSafeRelativeFileSnapshot(
      recordsRoot,
      reportFile,
      `phase-one review report ${reportFile}`,
    ),
  ]));
}

function assertReviewAttestations({ attestations, reportBytes, contentCommit }) {
  const descriptors = assertReviewAttestationDescriptors(attestations, contentCommit);
  assertDistinctReviewReportSnapshots(descriptors, reportBytes);
  for (const descriptor of descriptors) {
    const bytes = reportBytes[descriptor.report_file].bytes;
    if (!Buffer.isBuffer(bytes) || sha256(bytes) !== descriptor.sha256) {
      throw new Error(`Phase-one review report hash does not match: ${descriptor.report_file}`);
    }
    const metadata = parseReviewReportMetadata(bytes, descriptor.report_file);
    if (metadata.role !== descriptor.role
      || metadata.reviewed_commit !== descriptor.reviewed_commit
      || metadata.disposition !== descriptor.disposition
      || !sameJson(metadata.unresolved_blockers, descriptor.unresolved_blockers)) {
      throw new Error(
        `Phase-one review report front matter metadata contradicts its descriptor: ${descriptor.report_file}`,
      );
    }
  }
  return descriptors.map((descriptor) => cloneJson(descriptor));
}

function assertDistinctReviewReportSnapshots(descriptors, reports) {
  const canonicalPaths = new Set();
  const physicalFiles = new Set();
  for (const descriptor of descriptors) {
    const report = reports?.[descriptor.report_file];
    if (!report || !Buffer.isBuffer(report.bytes)
      || !nonblank(report.canonical_path)
      || !Number.isSafeInteger(report.device)
      || !Number.isSafeInteger(report.inode)) {
      throw new Error(`Phase-one review report identity is invalid: ${descriptor.report_file}`);
    }
    const physicalIdentity = `${report.device}:${report.inode}`;
    if (canonicalPaths.has(report.canonical_path) || physicalFiles.has(physicalIdentity)) {
      throw new Error("Phase-one review roles must use distinct physical review report files");
    }
    canonicalPaths.add(report.canonical_path);
    physicalFiles.add(physicalIdentity);
  }
}

function parseReviewReportMetadata(bytes, reportFile) {
  const text = Buffer.from(bytes).toString("utf8");
  const lines = text.split("\n");
  const role = lines[2]?.match(/^role: (methods|reproducibility|safety)$/u)?.[1];
  const reviewedCommit = lines[3]?.match(/^reviewed_commit: ([a-f0-9]{40})$/u)?.[1];
  const disposition = lines[4]?.match(
    /^disposition: (approve|approve-with-documented-limitations)$/u,
  )?.[1];
  if (lines.length < 8
    || lines[0] !== "---"
    || lines[1] !== "phase_one_review_schema: 1"
    || !role
    || !reviewedCommit
    || !disposition
    || lines[5] !== "unresolved_blockers: []"
    || lines[6] !== "---") {
    throw new Error(`Phase-one review report front matter is missing or malformed: ${reportFile}`);
  }
  return {
    role,
    reviewed_commit: reviewedCommit,
    disposition,
    unresolved_blockers: [],
  };
}

function assertReviewAttestationDescriptors(attestations, contentCommit) {
  if (!Array.isArray(attestations) || attestations.length !== PHASE_ONE_REVIEW_ROLES.length) {
    throw new Error("Phase-one freeze must contain the exact three review roles");
  }
  const roles = attestations.map(({ role }) => role).sort();
  if (!sameJson(roles, [...PHASE_ONE_REVIEW_ROLES])) {
    throw new Error("Phase-one freeze must contain exactly methods, reproducibility, and safety review roles");
  }
  const reportFiles = new Set();
  for (const attestation of attestations) {
    assertExactKeys(attestation, REVIEW_ATTESTATION_KEYS, `Phase-one ${attestation?.role} review attestation`);
    if (!/^reviews\/[^/]+\.md$/u.test(attestation.report_file ?? "")
      || !safeRelativePath(attestation.report_file)) {
      throw new Error("Phase-one review report file must be a safe relative reviews/*.md path");
    }
    if (reportFiles.has(attestation.report_file)) {
      throw new Error("Phase-one review roles must use distinct report files");
    }
    reportFiles.add(attestation.report_file);
    if (!SHA256.test(attestation.sha256 ?? "")) {
      throw new Error(`Phase-one ${attestation.role} review report hash is invalid`);
    }
    if (attestation.reviewed_commit !== contentCommit) {
      throw new Error(`Phase-one ${attestation.role} reviewed commit does not match the content commit`);
    }
    if (!PHASE_ONE_REVIEW_DISPOSITIONS.includes(attestation.disposition)) {
      throw new Error(`Phase-one ${attestation.role} review disposition is not approval`);
    }
    if (!Array.isArray(attestation.unresolved_blockers)
      || attestation.unresolved_blockers.length !== 0) {
      throw new Error(`Phase-one ${attestation.role} review has an unresolved blocker`);
    }
  }
  return [...attestations].sort((left, right) => left.role.localeCompare(right.role));
}

function readSafeRelativeFile(root, relativePath, label) {
  return readSafeRelativeFileSnapshot(root, relativePath, label).bytes;
}

function readSubscriptionAccessEvidenceInputs(recordsRoot, access) {
  if (!access || typeof access !== "object") {
    throw new Error("Subscription access authorization is absent");
  }
  return Object.fromEntries(["codex", "claude"].map((provider) => {
    const descriptor = access[provider]?.usage_evidence;
    const snapshot = readPrivateRelativeFile(
      recordsRoot,
      descriptor?.file,
      `${provider} private subscription usage evidence`,
    );
    return [provider, snapshot.bytes];
  }));
}

function readPrivateRelativeFile(root, relativePath, label) {
  const snapshot = readSafeRelativeFileSnapshot(root, relativePath, label);
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  if ((snapshot.mode & 0o777) !== 0o600
    || (uid !== null && snapshot.uid !== uid)) {
    throw new Error(`${label} must be a private 0600 file owned by the current user`);
  }
  return snapshot;
}

function readPrivateAbsoluteFile(path, label) {
  if (!isAbsolute(path ?? "")) throw new Error(`${label} file must be absolute`);
  const stat = lstatSync(path);
  const fd = openSync(path, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0));
  try {
    const opened = fstatSync(fd);
    const bytes = readFileSync(fd);
    const after = fstatSync(fd);
    const uid = typeof process.getuid === "function" ? process.getuid() : null;
    if (!stat.isFile() || stat.isSymbolicLink() || !opened.isFile()
      || stat.dev !== opened.dev || stat.ino !== opened.ino
      || opened.dev !== after.dev || opened.ino !== after.ino
      || opened.size !== after.size || opened.nlink !== 1
      || (opened.mode & 0o777) !== 0o600
      || (uid !== null && opened.uid !== uid)) {
      throw new Error(`${label} must be one stable current-user-owned 0600 regular file`);
    }
    return bytes;
  } finally {
    closeSync(fd);
  }
}

function readSafeRelativeFileSnapshot(root, relativePath, label) {
  if (!safeRelativePath(relativePath)) throw new Error(`${label} file must be a safe relative path`);
  const canonicalRoot = realpathSync(root);
  const candidate = resolve(canonicalRoot, relativePath);
  const stat = lstatSync(candidate);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${label} must be a regular non-symbolic file`);
  }
  const canonicalCandidate = realpathSync(candidate);
  assertContainedPath(canonicalRoot, canonicalCandidate, label);
  const fd = openSync(canonicalCandidate, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0));
  try {
    const opened = fstatSync(fd);
    if (!opened.isFile()) throw new Error(`${label} must be a regular file`);
    if (stat.dev !== opened.dev || stat.ino !== opened.ino) {
      throw new Error(`${label} changed physical identity while it was opened`);
    }
    return {
      bytes: readFileSync(fd),
      canonical_path: canonicalCandidate,
      device: opened.dev,
      inode: opened.ino,
      mode: opened.mode,
      uid: opened.uid,
    };
  } finally {
    closeSync(fd);
  }
}

function assertContainedPath(root, candidate, label) {
  const pathFromRoot = relative(root, candidate);
  if (pathFromRoot === "" || pathFromRoot === ".."
    || pathFromRoot.startsWith(`..${sep}`) || isAbsolute(pathFromRoot)) {
    throw new Error(`${label} resolves outside its containing root`);
  }
}

function readCommittedRuntimeFiles({
  repositoryRoot,
  contentCommit,
  studyDirectory,
  recordsRoot,
  runtimeFileBuffers,
}) {
  if (typeof repositoryRoot !== "string" || !isAbsolute(repositoryRoot)) {
    throw new Error("An absolute repository root is required for runtime Git binding");
  }
  if (!safeRelativePath(studyDirectory) || !FULL_GIT_COMMIT.test(contentCommit ?? "")) {
    throw new Error("Runtime Git binding requires a safe study directory and exact content commit");
  }
  const root = realpathSync(repositoryRoot);
  const resolvedCommit = gitText(root, ["rev-parse", "--verify", `${contentCommit}^{commit}`]);
  if (resolvedCommit !== contentCommit) {
    throw new Error("Runtime content commit is not the exact full Git commit");
  }
  return Object.fromEntries(REQUIRED_RUNTIME_FILES.map((name) => {
    const gitPath = posix.join(studyDirectory, name);
    const entry = gitText(root, ["ls-tree", contentCommit, "--", gitPath], { allowEmpty: true });
    const match = entry.match(/^([0-9]{6}) blob ([0-9a-f]+)\t(.+)$/u);
    if (!match || match[3] !== gitPath || !GIT_MODE.test(match[1])) {
      throw new Error(`Committed runtime file is missing or not a regular Git blob: ${name}`);
    }
    const committedBytes = gitBytes(root, ["show", `${contentCommit}:${gitPath}`]);
    const liveBytes = runtimeFileBuffers[name];
    const liveStat = lstatSync(join(recordsRoot, name));
    const worktreeMode = liveStat.mode & 0o111 ? "100755" : "100644";
    if (!Buffer.from(liveBytes).equals(committedBytes)) {
      throw new Error(`Runtime file bytes do not match the exact Git content commit: ${name}`);
    }
    return [name, {
      bytes_sha256: sha256(committedBytes),
      git_mode: match[1],
      worktree_mode: worktreeMode,
    }];
  }));
}

function gitText(repositoryRoot, args, { allowEmpty = false } = {}) {
  const value = gitBytes(repositoryRoot, args).toString("utf8").trimEnd();
  if (!allowEmpty && !value) throw new Error(`Git command returned no data: git ${args[0]}`);
  return value;
}

function gitBytes(repositoryRoot, args) {
  const result = spawnSync("git", ["--no-replace-objects", ...args], {
    cwd: repositoryRoot,
    encoding: null,
    env: sanitizedGitEnvironment(),
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) throw new Error(`Git command failed: ${result.error.message}`);
  if (result.status !== 0) {
    const detail = Buffer.from(result.stderr ?? []).toString("utf8").trim();
    throw new Error(`Git command failed: git ${args[0]}${detail ? `: ${detail}` : ""}`);
  }
  return Buffer.from(result.stdout ?? []);
}

function sanitizedGitEnvironment() {
  const env = { ...process.env };
  const redirects = new Set([
    "GIT_ALTERNATE_OBJECT_DIRECTORIES", "GIT_CEILING_DIRECTORIES", "GIT_COMMON_DIR",
    "GIT_CONFIG", "GIT_CONFIG_COUNT", "GIT_CONFIG_GLOBAL", "GIT_CONFIG_NOSYSTEM",
    "GIT_CONFIG_PARAMETERS", "GIT_CONFIG_SYSTEM", "GIT_DIR", "GIT_DISCOVERY_ACROSS_FILESYSTEM",
    "GIT_EXEC_PATH", "GIT_GRAFT_FILE", "GIT_INDEX_FILE", "GIT_NAMESPACE",
    "GIT_OBJECT_DIRECTORY", "GIT_REPLACE_REF_BASE", "GIT_SHALLOW_FILE", "GIT_WORK_TREE",
  ]);
  for (const key of Object.keys(env)) {
    if (redirects.has(key) || /^GIT_CONFIG_(?:KEY|VALUE)_\d+$/u.test(key)) delete env[key];
  }
  env.GIT_CONFIG_GLOBAL = process.platform === "win32" ? "NUL" : "/dev/null";
  env.GIT_CONFIG_NOSYSTEM = "1";
  env.GIT_NO_REPLACE_OBJECTS = "1";
  return env;
}

function modelMatches(systemId, returned) {
  if (systemId === "claude-code/sonnet") return returned === CLAUDE_RETURNED_MODEL;
  return false;
}

function assertReturnedModel(systemId, returned) {
  if (!modelMatches(systemId, returned)) {
    throw new ModelDriftError(`Returned model drift: ${returned}`);
  }
}

function assertModelIdentity(systemId, returned, status) {
  if (systemId === "codex-cli/gpt-5.5") {
    if (returned !== null
      || status !== "requested_pinned_client_no_reroute_observable") {
      throw new ModelIdentityError("Codex model identity metadata contradicts its documented envelope");
    }
    return;
  }
  if (status !== "observed_singleton_model_usage") {
    throw new ModelIdentityError("Claude Code model identity status is invalid");
  }
  assertReturnedModel(systemId, returned);
}

function codexModelIdentityMetadata() {
  return {
    requested_model: "gpt-5.5",
    returned_model_observable: false,
    reroute_policy: "reject",
    evidence: "official-codex-exec-json-rust-v0.137.0",
  };
}

function claudeModelIdentityMetadata() {
  return {
    requested_model: "sonnet",
    returned_model_observable: true,
    envelope_path: "modelUsage singleton key",
    evidence: "pinned-claude-code-2.1.211-json-result-contract",
  };
}

function inspectPinnedExecutable(path) {
  const canonical = realpathSync(path);
  const stat = lstatSync(canonical);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error("Pinned subscription executable must resolve to a regular file");
  }
  return { realpath: canonical, sha256: sha256(readFileSync(canonical)) };
}

function assertSameExecutable(expected, actual, label) {
  if (!sameJson(expected, actual)) {
    throw new ClientExecutableDriftError(
      `${label} executable bytes or resolved path drifted after preflight`,
    );
  }
}

function assertSupportedHelp(help, flags, label) {
  if (flags.some((flag) => !help.includes(flag))) {
    throw new Error(`${label} flags are not supported by the pinned client help`);
  }
}

function validateCodexSandboxProbe(value, childEnv) {
  assertExactKeys(value, ["cwd", "denied_paths"], "Codex sandbox probe");
  if (!Array.isArray(value.denied_paths) || value.denied_paths.length !== 2
    || new Set(value.denied_paths).size !== 2) {
    throw new Error("Codex sandbox probe requires two distinct denied files");
  }
  const cwd = inspectPrivateProbeDirectory(value.cwd, "Codex sandbox probe working directory");
  const deniedPaths = value.denied_paths.map((path, index) =>
    inspectPrivateProbeFile(path, `Codex sandbox denied file ${index + 1}`));
  const home = realpathSync(childEnv.HOME);
  const codexHome = realpathSync(childEnv.CODEX_HOME);
  if (!isStrictlyContainedPath(codexHome, deniedPaths[0])) {
    throw new Error("First Codex sandbox denied file must be inside isolated CODEX_HOME");
  }
  if (isStrictlyContainedPath(home, deniedPaths[1]) || deniedPaths[1] === home) {
    throw new Error("Second Codex sandbox denied file must be outside isolated HOME");
  }
  if (isStrictlyContainedPath(home, cwd) || cwd === home) {
    throw new Error("Codex sandbox probe working directory must be outside isolated HOME");
  }
  return { cwd, denied_paths: deniedPaths };
}

function inspectPrivateProbeDirectory(path, label) {
  if (!isAbsolute(path ?? "")) throw new Error(`${label} must be absolute`);
  const stat = lstatSync(path);
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o777) !== 0o700
    || (uid !== null && stat.uid !== uid)) {
    throw new Error(`${label} must be a current-user-owned 0700 real directory`);
  }
  return realpathSync(path);
}

function inspectPrivateProbeFile(path, label) {
  if (!isAbsolute(path ?? "")) throw new Error(`${label} must be absolute`);
  const stat = lstatSync(path);
  const canonical = realpathSync(path);
  const fd = openSync(canonical, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0));
  try {
    const opened = fstatSync(fd);
    const uid = typeof process.getuid === "function" ? process.getuid() : null;
    if (!stat.isFile() || stat.isSymbolicLink() || !opened.isFile()
      || stat.dev !== opened.dev || stat.ino !== opened.ino
      || (opened.mode & 0o777) !== 0o600 || (uid !== null && opened.uid !== uid)) {
      throw new Error(`${label} must be a current-user-owned 0600 real file`);
    }
    return canonical;
  } finally {
    closeSync(fd);
  }
}

function isStrictlyContainedPath(root, candidate) {
  const fromRoot = relative(root, candidate);
  return fromRoot !== "" && fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`)
    && !isAbsolute(fromRoot);
}

function codexSandboxProbeArgs(probe) {
  return [
    "sandbox", "--permissions-profile", CODEX_PERMISSION_PROFILE_ID,
    "--include-managed-config",
    "--config", CODEX_PERMISSION_PROFILE_DEFINITION,
    "--cd", probe.cwd,
    "--", "/bin/sh", "-c", CODEX_SANDBOX_PROBE_SCRIPT,
    "codex-study-minimal-probe", ...probe.denied_paths,
  ];
}

function validateStructuredResponse(value) {
  const response = typeof value === "string" ? JSON.parse(value) : value;
  return validateReviewResponse(response);
}

function acquireCollectionLock(outputRoot, options = {}) {
  const root = prepareOutputRoot(outputRoot);
  const hostname = nonblank(options?.hostname) ?? systemHostname();
  const pid = options?.pid ?? process.pid;
  const isProcessAlive = options?.isProcessAlive ?? processLiveness;
  if (!Number.isSafeInteger(pid) || pid <= 0 || typeof isProcessAlive !== "function") {
    throw new Error("Collection lock identity or liveness probe is invalid");
  }
  const lockPath = join(root, "collection.lock");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const record = {
      schema_version: 1,
      hostname,
      pid,
      acquired_at: new Date().toISOString(),
    };
    const bytes = Buffer.from(`${JSON.stringify(record)}\n`);
    try {
      const fd = openSync(
        lockPath,
        fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL
          | (fsConstants.O_NOFOLLOW ?? 0),
        0o600,
      );
      try {
        const stat = fstatSync(fd);
        if (!stat.isFile() || (stat.mode & 0o777) !== 0o600) {
          throw new Error("Collection lock must be a private regular file");
        }
        appendFileSync(fd, bytes);
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
      const lockIdentity = capturePrivateFileIdentity(lockPath, "collection lock");
      return {
        root,
        root_identity: capturePrivateDirectoryIdentity(root, "output root"),
        lock_path: lockPath,
        lock_identity: lockIdentity,
        lock_sha256: sha256(bytes),
        files: new Map(),
      };
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      recoverStaleCollectionLock({ root, lockPath, hostname, isProcessAlive });
    }
  }
  throw new Error("Collection lock could not be acquired after stale-lock recovery");
}

function prepareIsolatedClientEnvironment({
  root,
  ambientEnv,
  requireCodexCredential = false,
  credentialSources,
}) {
  // Validate and reject ambient credential/routing variables before replacing
  // the environment with the isolated allowlist.
  buildSubscriptionChildEnv(ambientEnv);
  const clientHome = join(root, "client-home");
  removeIsolatedClientEnvironment(clientHome, root);
  mkdirSync(clientHome, { mode: 0o700 });
  const codexHome = join(clientHome, ".codex");
  const claudeHome = join(clientHome, ".claude");
  mkdirSync(codexHome, { mode: 0o700 });
  mkdirSync(claudeHome, { mode: 0o700 });

  const ambientHome = isAbsolute(ambientEnv?.HOME ?? "") ? ambientEnv.HOME : null;
  const ambientCodexHome = isAbsolute(ambientEnv?.CODEX_HOME ?? "")
    ? ambientEnv.CODEX_HOME
    : ambientHome
      ? join(ambientHome, ".codex")
      : null;
  const sources = credentialSources ?? {
    codex: ambientCodexHome ? join(ambientCodexHome, "auth.json") : null,
    claude: ambientHome ? join(ambientHome, ".claude", ".credentials.json") : null,
  };
  if (sources.codex && existsSync(sources.codex)) {
    const bytes = readPrivateCredentialSource(sources.codex, ambientHome, "Codex auth material");
    createContainedFile(codexHome, "auth.json", bytes, "isolated Codex auth material");
  } else if (requireCodexCredential) {
    throw new Error(
      "Activation blocked: isolated Codex HOME has no verified private subscription auth material",
    );
  }
  if (sources.claude && existsSync(sources.claude)) {
    const bytes = readPrivateCredentialSource(sources.claude, ambientHome, "Claude auth material");
    createContainedFile(
      claudeHome,
      ".credentials.json",
      bytes,
      "isolated Claude auth material",
    );
  }
  const codexDenyProbePath = createContainedFile(
    codexHome,
    CODEX_MODEL_SHELL_DENY_PROBE_NAME,
    CODEX_MODEL_SHELL_DENY_PROBE_BYTES,
    "Codex model-shell deny probe",
  );
  const codexDenyProbe = readPrivateRelativeFile(
    codexHome,
    CODEX_MODEL_SHELL_DENY_PROBE_NAME,
    "Codex model-shell deny probe",
  );
  const env = buildSubscriptionChildEnv({ HOME: clientHome, CODEX_HOME: codexHome });
  const isolation = {
    root,
    home: clientHome,
    env,
    codex_deny_probe: {
      path: codexDenyProbePath,
      device: codexDenyProbe.device,
      inode: codexDenyProbe.inode,
      sha256: sha256(codexDenyProbe.bytes),
    },
  };
  verifyIsolatedClientEnvironment(isolation);
  return isolation;
}

function readPrivateCredentialSource(path, ambientHome, label) {
  if (!isAbsolute(path) || !ambientHome) {
    throw new Error(`${label} source must be inside an absolute ambient HOME`);
  }
  const canonicalHome = realpathSync(ambientHome);
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${label} source must be a real regular file`);
  }
  const canonicalPath = realpathSync(path);
  assertContainedPath(canonicalHome, canonicalPath, label);
  const fd = openSync(canonicalPath, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0));
  try {
    const opened = fstatSync(fd);
    const uid = typeof process.getuid === "function" ? process.getuid() : null;
    if (!opened.isFile() || opened.dev !== stat.dev || opened.ino !== stat.ino
      || (opened.mode & 0o777) !== 0o600 || (uid !== null && opened.uid !== uid)) {
      throw new Error(`${label} source must be a current-user-owned 0600 regular file`);
    }
    return readFileSync(fd);
  } finally {
    closeSync(fd);
  }
}

function verifyIsolatedClientEnvironment(isolation) {
  if (!isolation) throw new Error("Isolated subscription client HOME is absent");
  const canonicalHome = realpathSync(isolation.home);
  assertContainedPath(isolation.root, canonicalHome, "isolated subscription client HOME");
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  const pending = [canonicalHome];
  while (pending.length > 0) {
    const path = pending.pop();
    const stat = lstatSync(path);
    if (stat.isSymbolicLink() || (uid !== null && stat.uid !== uid)) {
      throw new ClientIsolationDriftError(
        "Isolated subscription client HOME contains a symbolic link or foreign owner",
      );
    }
    if (stat.isDirectory()) {
      if ((stat.mode & 0o777) !== 0o700) {
        throw new ClientIsolationDriftError(
          "Isolated subscription client HOME directory privacy drifted",
        );
      }
      for (const name of readdirSync(path)) pending.push(join(path, name));
    } else if (!stat.isFile() || (stat.mode & 0o077) !== 0) {
      throw new ClientIsolationDriftError(
        "Isolated subscription client HOME contains a non-private or non-regular entry",
      );
    }
  }
  const rebuilt = buildSubscriptionChildEnv(isolation.env);
  if (!sameJson(rebuilt, isolation.env)
    || isolation.env.HOME !== canonicalHome
    || isolation.env.CODEX_HOME !== join(canonicalHome, ".codex")) {
    throw new ClientIsolationDriftError("Isolated subscription child environment drifted");
  }
  let currentProbe;
  try {
    currentProbe = readPrivateRelativeFile(
      isolation.env.CODEX_HOME,
      CODEX_MODEL_SHELL_DENY_PROBE_NAME,
      "Codex model-shell deny probe",
    );
  } catch (error) {
    throw new ClientIsolationDriftError(
      `Codex model-shell deny probe became invalid: ${error.message}`,
    );
  }
  if (!isolation.codex_deny_probe
    || currentProbe.canonical_path !== isolation.codex_deny_probe.path
    || currentProbe.device !== isolation.codex_deny_probe.device
    || currentProbe.inode !== isolation.codex_deny_probe.inode
    || sha256(currentProbe.bytes) !== isolation.codex_deny_probe.sha256
    || !currentProbe.bytes.equals(CODEX_MODEL_SHELL_DENY_PROBE_BYTES)) {
    throw new ClientIsolationDriftError(
      "Codex model-shell deny probe bytes or physical identity drifted",
    );
  }
}

function cleanupIsolatedClientEnvironment(isolation) {
  if (!isolation) return;
  removeIsolatedClientEnvironment(isolation.home, isolation.root);
}

function removeIsolatedClientEnvironment(path, root) {
  if (!existsSync(path)) return;
  const stat = lstatSync(path);
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error("Isolated subscription client HOME cleanup target is not a real directory");
  }
  const canonical = realpathSync(path);
  assertContainedPath(root, canonical, "isolated subscription client HOME cleanup target");
  rmSync(canonical, { recursive: true, force: true });
}

function recoverStaleCollectionLock({ root, lockPath, hostname, isProcessAlive }) {
  const lock = readPrivateRelativeFile(root, "collection.lock", "collection lock");
  const record = parseJson(lock.bytes, "collection lock");
  assertExactKeys(record, ["schema_version", "hostname", "pid", "acquired_at"], "Collection lock");
  if (record.schema_version !== 1 || !nonblank(record.hostname)
    || !Number.isSafeInteger(record.pid) || record.pid <= 0
    || !validUtcTimestamp(record.acquired_at)) {
    throw new Error("Collection lock record is invalid or ambiguous");
  }
  if (record.hostname !== hostname) {
    throw new Error("Collection lock belongs to a foreign host and cannot be recovered automatically");
  }
  const liveness = isProcessAlive(record.pid);
  if (liveness !== false) {
    throw new Error(liveness === true
      ? "Collection lock belongs to an active process"
      : "Collection lock process liveness is ambiguous");
  }
  const forensicName = `stale-lock-${sha256(lock.bytes)}.json`;
  const forensicPath = join(root, forensicName);
  if (existsSync(forensicPath)) {
    const forensic = readPrivateRelativeFile(root, forensicName, "stale collection-lock forensic record");
    if (forensic.device !== lock.device || forensic.inode !== lock.inode
      || !forensic.bytes.equals(lock.bytes)) {
      throw new Error("Stale collection-lock forensic record conflicts with the current lock");
    }
  } else {
    linkSync(lockPath, forensicPath);
    const forensic = readPrivateRelativeFile(root, forensicName, "stale collection-lock forensic record");
    if (forensic.device !== lock.device || forensic.inode !== lock.inode
      || !forensic.bytes.equals(lock.bytes)) {
      throw new Error("Stale collection-lock forensic record did not preserve lock identity");
    }
  }
  unlinkSync(lockPath);
}

function processLiveness(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error?.code === "ESRCH") return false;
    return null;
  }
}

function releaseCollectionLock(security) {
  assertOutputSecurity(security, security.root);
  unlinkSync(security.lock_path);
}

function assertOutputSecurity(security, expectedRoot) {
  if (!security || security.root !== expectedRoot
    || !sameFileIdentity(
      capturePrivateDirectoryIdentity(expectedRoot, "output root"),
      security.root_identity,
    )) {
    throw new Error("Output root identity, ownership, or privacy drifted during collection");
  }
  const lock = readPrivateRelativeFile(expectedRoot, "collection.lock", "collection lock");
  if (!sameFileIdentity(lock, security.lock_identity)
    || sha256(lock.bytes) !== security.lock_sha256) {
    throw new Error("Collection lock identity or bytes drifted during collection");
  }
}

function capturePrivateDirectoryIdentity(path, label) {
  const stat = lstatSync(path);
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o777) !== 0o700
    || (uid !== null && stat.uid !== uid) || realpathSync(path) !== path) {
    throw new Error(`${label} must be a private 0700 real directory owned by the current user`);
  }
  return { device: stat.dev, inode: stat.ino, mode: stat.mode, uid: stat.uid };
}

function capturePrivateFileIdentity(path, label) {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${label} must remain a regular non-symbolic file`);
  }
  const fd = openSync(path, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0));
  try {
    const opened = fstatSync(fd);
    const uid = typeof process.getuid === "function" ? process.getuid() : null;
    if (!opened.isFile() || opened.dev !== stat.dev || opened.ino !== stat.ino
      || (opened.mode & 0o777) !== 0o600 || (uid !== null && opened.uid !== uid)) {
      throw new Error(`${label} inode, ownership, or 0600 privacy is invalid`);
    }
    return {
      device: opened.dev,
      inode: opened.ino,
      mode: opened.mode,
      uid: opened.uid,
      link_count: opened.nlink,
      size: opened.size,
      sha256: sha256(readOpenedFile(fd, opened.size)),
    };
  } finally {
    closeSync(fd);
  }
}

function sameFileIdentity(left, right) {
  return Boolean(left && right && left.device === right.device && left.inode === right.inode
    && left.mode === right.mode && left.uid === right.uid);
}

function sameLedgerState(left, right) {
  return sameFileIdentity(left, right)
    && left.link_count === 1
    && right.link_count === 1
    && left.size === right.size
    && left.sha256 === right.sha256;
}

function readOpenedFile(fd, size) {
  const bytes = Buffer.alloc(size);
  let offset = 0;
  while (offset < size) {
    const count = readSync(fd, bytes, offset, size - offset, offset);
    if (count === 0) throw new Error("Private file changed size while being read");
    offset += count;
  }
  return bytes;
}

function prepareOutputRun({ outputRoot, runBinding, calls, reviewSchemaBytes, security }) {
  const canonicalRoot = prepareOutputRoot(outputRoot);
  assertOutputSecurity(security, canonicalRoot);
  const callMap = new Map(calls.map((call) => [call.call_id, call]));
  const attemptsPath = join(canonicalRoot, "attempts.jsonl");
  const resultsPath = join(canonicalRoot, "results.jsonl");
  const attemptLedger = readOrCreateLedger({
    root: canonicalRoot,
    name: "attempts.jsonl",
    runBinding,
    validateRows: (rows) => validateAttemptLedger(rows, callMap),
  });
  const resultLedger = readOrCreateLedger({
    root: canonicalRoot,
    name: "results.jsonl",
    runBinding,
    validateRows: (rows) => validateResultLedger(rows, callMap),
  });
  validateLedgerConsistency(
    attemptLedger.validation,
    resultLedger.rows,
  );
  const rawOutputRoot = ensurePrivateArchiveDirectory(
    canonicalRoot,
    "raw-provider-envelopes",
    "private raw provider-envelope archive",
  );
  validateRawProviderArchive(rawOutputRoot, callMap, attemptLedger.validation);
  const schemaPath = writeImmutableContainedFile(
    canonicalRoot,
    "authorized-review-schema.json",
    reviewSchemaBytes,
    "authorized review schema",
  );
  const schemaSnapshot = captureImmutableFileSnapshot(
    schemaPath,
    reviewSchemaBytes,
    "authorized review schema",
  );
  const emptyCwd = ensureContainedDirectory(canonicalRoot, "empty", "empty client working directory");
  security.files.set(attemptsPath, capturePrivateFileIdentity(attemptsPath, "attempt ledger"));
  security.files.set(resultsPath, capturePrivateFileIdentity(resultsPath, "result ledger"));
  return {
    attempts: attemptLedger.rows,
    results: resultLedger.rows,
    attemptsPath,
    resultsPath,
    schemaPath,
    schemaSnapshot,
    emptyCwd,
    rawOutputRoot,
    security,
    attemptValidation: attemptLedger.validation,
  };
}

function prepareOutputRoot(outputRoot) {
  const candidate = resolve(outputRoot);
  if (!existsSync(candidate)) mkdirSync(candidate, { recursive: true, mode: 0o700 });
  const stat = lstatSync(candidate);
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o777) !== 0o700
    || (uid !== null && stat.uid !== uid)) {
    throw new Error("Output root must be a private 0700 real directory owned by the current user");
  }
  return realpathSync(candidate);
}

function readOrCreateLedger({ root, name, runBinding, validateRows }) {
  const path = join(root, name);
  if (!existsSync(path)) {
    createContainedFile(root, name, Buffer.from(`${JSON.stringify({
      record_type: "run_binding",
      run_binding: runBinding,
    })}\n`), `${name} run-binding header`);
  }
  const rows = parseJsonl(readPrivateRelativeFile(root, name, name).bytes, name);
  const header = rows.shift();
  if (!header || !sameJson(header, { record_type: "run_binding", run_binding: runBinding })) {
    throw new Error(`${name} run binding does not match this authorization`);
  }
  return { rows, validation: validateRows(rows) };
}

function validateAttemptProvenance(value) {
  assertExactKeys(value, ATTEMPT_PROVENANCE_KEYS, "Attempt provenance");
  if (value.schema_version !== 3
    || !isAbsolute(value.codex_executable ?? "")
    || value.codex_executable_sha256 !== CODEX_EXECUTABLE_SHA256
    || value.codex_version !== CODEX_VERSION
    || value.codex_auth !== "chatgpt-subscription"
    || !SHA256.test(value.codex_auth_status_sha256 ?? "")
    || !sameJson(value.codex_isolation, CODEX_ISOLATION)
    || !sameJson(value.codex_model_identity, codexModelIdentityMetadata())
    || !isAbsolute(value.claude_executable ?? "")
    || value.claude_executable_sha256 !== CLAUDE_EXECUTABLE_SHA256
    || value.claude_version !== CLAUDE_VERSION
    || value.claude_auth !== "claude.ai-max-subscription"
    || !SHA256.test(value.claude_auth_status_sha256 ?? "")
    || !sameJson(value.claude_isolation, CLAUDE_ISOLATION)
    || !sameJson(value.claude_model_identity, claudeModelIdentityMetadata())
    || !sameJson(value.child_env_policy, CHILD_ENV_POLICY)
    || !validUtcTimestamp(value.checked_at)) {
    throw new Error("Attempt provenance does not match the pinned authenticated isolated clients");
  }
  return value;
}

function assertRuntimeChildEnv(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || !sameJson(Object.keys(value).sort(), [...CHILD_ENV_POLICY.allowed_keys].sort())
    || !isAbsolute(value.HOME ?? "")
    || value.CODEX_HOME !== join(value.HOME, ".codex")
    || value.LANG !== "C" || value.LC_ALL !== "C" || value.NO_COLOR !== "1"
    || value.PATH !== "/usr/bin:/bin:/usr/sbin:/sbin" || value.TERM !== "dumb") {
    throw new Error("Preflight did not return the exact minimal subscription child environment");
  }
}

function provenanceFingerprint(value) {
  const comparable = cloneJson(value);
  delete comparable.checked_at;
  return sha256(JSON.stringify(canonicalValue(comparable)));
}

function terminalTimestamp(startedAt) {
  return new Date(Math.max(Date.now(), Date.parse(startedAt) + 1)).toISOString();
}

function recoverTerminalResults(output) {
  const resultsByCall = new Map(output.results.map((row) => [row.call_id, row]));
  for (const [callId, terminal] of output.attemptValidation.terminalByCall.entries()) {
    const candidate = terminal.result_candidate;
    if (!candidate) continue;
    const existing = resultsByCall.get(callId);
    if (existing) {
      if (!sameJson(existing, candidate)) {
        throw new Error("Result ledger conflicts with its unique consuming terminal attempt");
      }
      continue;
    }
    durableAppend(output.resultsPath, candidate, output.security);
    output.results.push(candidate);
    resultsByCall.set(callId, candidate);
  }
  validateLedgerConsistency(output.attemptValidation, output.results);
}

function recoverInterruptedAttempts(output) {
  for (const interrupted of output.attemptValidation.open_attempts) {
    const call = output.attempts.findLast((row) => row.call_id === interrupted.call_id);
    const recovered = {
      call_id: interrupted.call_id,
      schedule_index: call.schedule_index,
      system: call.system,
      event: "suspended",
      finished_at: new Date(Date.parse(interrupted.started_at) + 1).toISOString(),
      reason: "interrupted_process",
      error_sha256: sha256(
        "Recovered a fsynced started attempt with no terminal row; no result was accepted.",
      ),
      raw_output_sha256: null,
    };
    durableAppend(output.attemptsPath, recovered, output.security);
    output.attempts.push(recovered);
  }
  output.attemptValidation.open_attempts = [];
}

function validateAttemptLedger(rows, callMap) {
  const open = new Map();
  const returnedModels = new Map();
  let provenanceFingerprintValue = null;
  const terminalByCall = new Map();
  const terminal = (callId) => {
    const value = terminalByCall.get(callId) ?? {
      successful_models: new Set(),
      successful_results: new Set(),
      schema_invalid: 0,
      schema_invalid_outputs: new Set(),
      raw_outputs: new Set(),
      client_failures: 0,
      result_candidate: null,
    };
    terminalByCall.set(callId, value);
    return value;
  };
  for (const row of rows) {
    const call = assertLedgerCall(row, callMap, "Attempt ledger");
    if (row.event === "started") {
      if (terminalByCall.get(call.call_id)?.result_candidate) {
        throw new Error("Attempt ledger contains a start after a consuming terminal");
      }
      assertExactKeys(
        row,
        ["call_id", "schedule_index", "event", "started_at", "system", "provenance"],
        "Attempt ledger started row",
      );
      if (!validUtcTimestamp(row.started_at) || open.has(call.call_id)) {
        throw new Error("Attempt ledger contains an invalid or duplicate started row");
      }
      validateAttemptProvenance(row.provenance);
      if (Date.parse(row.provenance.checked_at) > Date.parse(row.started_at)) {
        throw new Error("Attempt ledger provenance was checked after the attempt started");
      }
      const fingerprint = provenanceFingerprint(row.provenance);
      if (provenanceFingerprintValue && provenanceFingerprintValue !== fingerprint) {
        throw new Error("Attempt ledger client provenance drifted between attempts");
      }
      provenanceFingerprintValue ??= fingerprint;
      open.set(call.call_id, { started_at: row.started_at, provenance: row.provenance });
      continue;
    }
    const started = open.get(call.call_id);
    if (!started) {
      throw new Error("Attempt ledger terminal row has no matching started row");
    }
    if (row.event === "suspended") {
      assertExactKeys(
        row,
        [
          "call_id", "schedule_index", "system", "event", "finished_at", "reason",
          "error_sha256", "raw_output_sha256",
        ],
        "Attempt ledger suspended row",
      );
      if (!validUtcTimestamp(row.finished_at)
        || Date.parse(row.finished_at) <= Date.parse(started.started_at)
        || ![
          "rate_limit", "model_identity_missing", "model_drift", "provider_envelope_invalid",
          "authorized_schema_drift", "client_executable_drift", "client_isolation_drift",
          "client_failure", "interrupted_process",
        ]
          .includes(row.reason)
        || !SHA256.test(row.error_sha256 ?? "")
        || (row.raw_output_sha256 !== null
          && !SHA256.test(row.raw_output_sha256 ?? ""))) {
        throw new Error("Attempt ledger contains an invalid suspended row");
      }
      if (row.raw_output_sha256) terminal(call.call_id).raw_outputs.add(row.raw_output_sha256);
      if (row.reason === "client_failure") terminal(call.call_id).client_failures += 1;
      open.delete(call.call_id);
      continue;
    }
    if (row.event === "completed" && row.reason === "schema_invalid") {
      assertExactKeys(
        row,
        [
          "call_id", "schedule_index", "event", "finished_at", "reason", "error_sha256",
          "system",
          "returned_model", "model_identity_status", "raw_output_sha256",
        ],
        "Attempt ledger invalid-schema row",
      );
      if (!validUtcTimestamp(row.finished_at)
        || Date.parse(row.finished_at) <= Date.parse(started.started_at)
        || !SHA256.test(row.error_sha256 ?? "")
        || !SHA256.test(row.raw_output_sha256 ?? "")) {
        throw new Error("Attempt ledger contains an invalid schema-abstention row");
      }
      assertModelIdentity(call.model, row.returned_model, row.model_identity_status);
      assertConsistentReturnedModel(returnedModels, call.model, row.returned_model);
      if (terminal(call.call_id).result_candidate) {
        throw new Error("Attempt ledger contains multiple consuming terminals for one call");
      }
      terminal(call.call_id).schema_invalid += 1;
      terminal(call.call_id).schema_invalid_outputs.add(row.raw_output_sha256);
      terminal(call.call_id).raw_outputs.add(row.raw_output_sha256);
      terminal(call.call_id).result_candidate = {
        call_id: row.call_id,
        schedule_index: row.schedule_index,
        system: row.system,
        status: "abstain",
        reason: "schema_invalid",
        raw_output_sha256: row.raw_output_sha256,
      };
      open.delete(call.call_id);
      continue;
    }
    if (row.event === "completed") {
      assertExactKeys(
        row,
        [
          "call_id", "schedule_index", "event", "finished_at", "system", "response",
          "returned_model", "model_identity_status", "tool_deviation", "usage", "raw_output_sha256",
          "response_sha256",
        ],
        "Attempt ledger completed row",
      );
      if (!validUtcTimestamp(row.finished_at)
        || Date.parse(row.finished_at) <= Date.parse(started.started_at)
        || typeof row.tool_deviation !== "boolean"
        || !validUsage(row.usage)
        || !SHA256.test(row.raw_output_sha256 ?? "")
        || !SHA256.test(row.response_sha256 ?? "")) {
        throw new Error("Attempt ledger contains an invalid completed row");
      }
      assertModelIdentity(call.model, row.returned_model, row.model_identity_status);
      assertConsistentReturnedModel(returnedModels, call.model, row.returned_model);
      validateReviewResponse(row.response);
      if (row.response_sha256 !== sha256(JSON.stringify(canonicalValue(row.response)))) {
        throw new Error("Attempt ledger response digest is invalid");
      }
      if (terminal(call.call_id).result_candidate) {
        throw new Error("Attempt ledger contains multiple consuming terminals for one call");
      }
      terminal(call.call_id).successful_models.add(modelIdentityKey(
        row.returned_model,
        row.model_identity_status,
      ));
      terminal(call.call_id).successful_results.add(resultDigestKey(row));
      terminal(call.call_id).raw_outputs.add(row.raw_output_sha256);
      terminal(call.call_id).result_candidate = {
        call_id: row.call_id,
        schedule_index: row.schedule_index,
        system: row.system,
        status: "valid",
        response: row.response,
        returned_model: row.returned_model,
        model_identity_status: row.model_identity_status,
        tool_deviation: row.tool_deviation,
        usage: row.usage,
        raw_output_sha256: row.raw_output_sha256,
        response_sha256: row.response_sha256,
      };
      open.delete(call.call_id);
      continue;
    }
    throw new Error("Attempt ledger contains an unknown event");
  }
  if (open.size > 1) {
    throw new Error("Attempt ledger contains multiple unclosed started rows");
  }
  return {
    terminalByCall,
    returnedModels,
    open_attempts: [...open.entries()].map(([call_id, value]) => ({ call_id, ...value })),
    provenance_fingerprint: provenanceFingerprintValue,
  };
}

function validateResultLedger(rows, callMap) {
  const seen = new Set();
  const returnedModels = new Map();
  for (const row of rows) {
    const call = assertLedgerCall(row, callMap, "Result ledger");
    if (seen.has(call.call_id)) throw new Error("Result ledger contains a duplicate call");
    seen.add(call.call_id);
    if (row.status === "valid") {
      assertExactKeys(
        row,
        [
          "call_id", "schedule_index", "system", "status", "response", "returned_model",
          "model_identity_status", "tool_deviation", "usage", "raw_output_sha256",
          "response_sha256",
        ],
        "Valid result ledger row",
      );
      assertModelIdentity(call.model, row.returned_model, row.model_identity_status);
      assertConsistentReturnedModel(returnedModels, call.model, row.returned_model);
      validateReviewResponse(row.response);
      if (typeof row.tool_deviation !== "boolean" || !validUsage(row.usage)) {
        throw new Error("Result ledger contains invalid tool-deviation or usage metadata");
      }
      if (!SHA256.test(row.raw_output_sha256 ?? "")
        || !SHA256.test(row.response_sha256 ?? "")
        || row.response_sha256 !== sha256(JSON.stringify(canonicalValue(row.response)))) {
        throw new Error("Result ledger response or envelope digest is invalid");
      }
      continue;
    }
    if (row.status === "abstain") {
      assertExactKeys(
        row,
        ["call_id", "schedule_index", "system", "status", "reason", "raw_output_sha256"],
        "Abstention result ledger row",
      );
      if (row.reason !== "schema_invalid" || !SHA256.test(row.raw_output_sha256 ?? "")) {
        throw new Error("Result ledger contains an invalid abstention reason");
      }
      continue;
    }
    if (row.status === "missing") {
      assertExactKeys(
        row,
        ["call_id", "schedule_index", "system", "status", "reason"],
        "Missing result ledger row",
      );
      if (row.reason !== "three_attempts_exhausted") {
        throw new Error("Result ledger contains an invalid missingness reason");
      }
      continue;
    }
    throw new Error("Result ledger contains an unknown status");
  }
  return { returnedModels };
}

function validateLedgerConsistency(attempts, results) {
  for (const result of results) {
    const terminal = attempts.terminalByCall.get(result.call_id);
    if (result.status === "valid"
      && (!terminal
        || !terminal.successful_models.has(modelIdentityKey(
          result.returned_model,
          result.model_identity_status,
        ))
        || !terminal.successful_results.has(resultDigestKey(result)))) {
      throw new Error("Result ledger has no matching completed attempt");
    }
    if (result.status === "abstain" && (!terminal || terminal.schema_invalid < 1
      || !terminal.schema_invalid_outputs.has(result.raw_output_sha256))) {
      throw new Error("Abstention result ledger has no matching invalid-schema attempt");
    }
    if (result.status === "missing" && (!terminal || terminal.client_failures < 3)) {
      throw new Error("Missing result ledger has fewer than three matching client failures");
    }
  }
}

function assertConsistentReturnedModel(baselines, system, returnedModel) {
  if (!nonblank(returnedModel)) return;
  const baseline = baselines.get(system);
  if (baseline && baseline !== returnedModel) {
    throw new Error(`Resume ledger returned-model drift: ${baseline} -> ${returnedModel}`);
  }
  if (!baseline) baselines.set(system, returnedModel);
}

function modelIdentityKey(returnedModel, status) {
  return `${status}\u0000${returnedModel ?? ""}`;
}

function resultDigestKey({ raw_output_sha256: rawOutputSha256, response_sha256: responseSha256 }) {
  return `${rawOutputSha256}\u0000${responseSha256}`;
}

function assertLedgerCall(row, callMap, label) {
  const call = callMap.get(row?.call_id);
  if (!call || row.schedule_index !== call.schedule_index || row.system !== call.model) {
    throw new Error(`${label} row does not match an authorized call`);
  }
  return call;
}

function writeImmutableContainedFile(root, name, bytes, label) {
  if (existsSync(join(root, name))) {
    const existing = readSafeRelativeFile(root, name, label);
    if (!existing.equals(Buffer.from(bytes))) {
      throw new Error(`${label} does not match the immutable authorized bytes`);
    }
    return join(root, name);
  }
  return createContainedFile(root, name, bytes, label);
}

function captureImmutableFileSnapshot(path, expectedBytes, label) {
  try {
    const fd = openSync(path, fsConstants.O_RDONLY | (fsConstants.O_NOFOLLOW ?? 0));
    try {
      const before = fstatSync(fd);
      const bytes = readFileSync(fd);
      const after = fstatSync(fd);
      const uid = typeof process.getuid === "function" ? process.getuid() : null;
      if (!before.isFile() || before.dev !== after.dev || before.ino !== after.ino
        || before.size !== after.size || (before.mode & 0o777) !== 0o600
        || (uid !== null && before.uid !== uid)
        || !bytes.equals(Buffer.from(expectedBytes))) {
        throw new Error(`${label} changed while it was snapshotted`);
      }
      return {
        path,
        dev: before.dev,
        ino: before.ino,
        mode: before.mode,
        uid: before.uid,
        size: before.size,
        sha256: sha256(bytes),
      };
    } finally {
      closeSync(fd);
    }
  } catch (error) {
    throw new AuthorizedSchemaDriftError(`${label} snapshot failed: ${error.message}`);
  }
}

function verifyImmutableFileSnapshot(snapshot, expectedBytes, label) {
  const current = captureImmutableFileSnapshot(snapshot.path, expectedBytes, label);
  if (!sameJson(current, snapshot)) {
    throw new AuthorizedSchemaDriftError(`${label} bytes, inode, or metadata drifted before dispatch`);
  }
}

function createContainedFile(root, name, bytes, label) {
  if (!safeRelativePath(name) || name.includes("/")) {
    throw new Error(`${label} filename is not a safe contained name`);
  }
  const path = join(root, name);
  const fd = openSync(
    path,
    fsConstants.O_WRONLY | fsConstants.O_CREAT | fsConstants.O_EXCL
      | (fsConstants.O_NOFOLLOW ?? 0),
    0o600,
  );
  try {
    if (!fstatSync(fd).isFile()) throw new Error(`${label} must be a regular file`);
    appendFileSync(fd, Buffer.from(bytes));
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  return path;
}

function persistProviderEnvelope(rawRoot, callIdValue, rawBytes, expectedDigest) {
  const bytes = Buffer.isBuffer(rawBytes) ? Buffer.from(rawBytes) : Buffer.from(String(rawBytes));
  if (sha256(bytes) !== expectedDigest) {
    throw new Error("Raw provider-envelope bytes do not match their recorded digest");
  }
  const name = rawProviderEnvelopeName(callIdValue, expectedDigest);
  writeImmutableContainedFile(
    rawRoot,
    name,
    bytes,
    "private raw provider envelope",
  );
  const snapshot = readPrivateRelativeFile(rawRoot, name, "private raw provider envelope");
  if (sha256(snapshot.bytes) !== expectedDigest) {
    throw new Error("Private raw provider-envelope archive digest does not match");
  }
}

function rawProviderEnvelopeName(callIdValue, rawDigest) {
  return `${sha256(callIdValue)}-${rawDigest}.bin`;
}

function ensurePrivateArchiveDirectory(root, name, label) {
  const path = join(root, name);
  if (!existsSync(path)) mkdirSync(path, { mode: 0o700 });
  const stat = lstatSync(path);
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o777) !== 0o700
    || (uid !== null && stat.uid !== uid)) {
    throw new Error(`${label} must be a private 0700 directory owned by the current user`);
  }
  const canonical = realpathSync(path);
  assertContainedPath(root, canonical, label);
  return canonical;
}

function validateRawProviderArchive(rawRoot, callMap, attemptValidation) {
  const callIdsByHash = new Map([...callMap.keys()].map((callIdValue) => [
    sha256(callIdValue),
    callIdValue,
  ]));
  const archived = new Set();
  for (const name of readdirSync(rawRoot)) {
    const match = name.match(/^([a-f0-9]{64})-([a-f0-9]{64})\.bin$/u);
    const callIdValue = match ? callIdsByHash.get(match[1]) : null;
    if (!match || !callIdValue) {
      throw new Error("Private raw provider-envelope archive contains an unauthorized filename");
    }
    const snapshot = readPrivateRelativeFile(
      rawRoot,
      name,
      "private raw provider envelope",
    );
    if (sha256(snapshot.bytes) !== match[2]) {
      throw new Error("Private raw provider-envelope archive contains digest drift");
    }
    archived.add(`${callIdValue}\u0000${match[2]}`);
  }
  for (const [callIdValue, terminal] of attemptValidation.terminalByCall.entries()) {
    for (const digest of terminal.raw_outputs) {
      if (!archived.has(`${callIdValue}\u0000${digest}`)) {
        throw new Error("Attempt lacks its private raw provider envelope");
      }
    }
  }
  const expected = new Set([...attemptValidation.terminalByCall.entries()]
    .flatMap(([callIdValue, terminal]) =>
      [...terminal.raw_outputs].map((digest) => `${callIdValue}\u0000${digest}`)));
  if ([...archived].some((key) => !expected.has(key))) {
    throw new Error("Private raw provider-envelope archive contains an orphan");
  }
}

function ensureContainedDirectory(root, name, label) {
  const path = join(root, name);
  if (!existsSync(path)) mkdirSync(path, { mode: 0o700 });
  const stat = lstatSync(path);
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o777) !== 0o700
    || (uid !== null && stat.uid !== uid)) {
    throw new Error(`${label} must be a private contained real directory, not a symbolic link`);
  }
  const canonical = realpathSync(path);
  assertContainedPath(root, canonical, label);
  if (readdirSync(canonical).length !== 0) {
    throw new Error(`${label} must be empty before subscription collection`);
  }
  return canonical;
}

function verifyEmptyClientDirectory(path) {
  const stat = lstatSync(path);
  const uid = typeof process.getuid === "function" ? process.getuid() : null;
  if (!stat.isDirectory() || stat.isSymbolicLink() || (stat.mode & 0o777) !== 0o700
    || (uid !== null && stat.uid !== uid)
    || realpathSync(path) !== path || readdirSync(path).length !== 0) {
    throw new ClientIsolationDriftError(
      "Empty client working directory bytes, identity, privacy, or contents drifted before dispatch",
    );
  }
}

function parseJson(bytes, label) {
  try {
    return JSON.parse(Buffer.from(bytes).toString("utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

function parseJsonl(bytes, label) {
  const text = Buffer.from(bytes).toString("utf8");
  try {
    return text.split("\n").filter(Boolean).map((line) => JSON.parse(line));
  } catch (error) {
    throw new Error(`${label} is not valid JSONL: ${error.message}`);
  }
}

function promptKey({ case_id, decomposition, workflow, context, submission_index }) {
  return [case_id, decomposition, workflow, context, submission_index].join("\u0000");
}

function callId({ schedule_index, prompt_id, model, trial }) {
  return sha256(JSON.stringify({ schedule_index, prompt_id, model, trial }));
}

function promptId({
  case_id,
  scenario_id,
  decomposition,
  workflow,
  context,
  submission_index,
  request,
}) {
  return sha256(JSON.stringify({
    case_id,
    scenario_id,
    decomposition,
    workflow,
    context,
    submission_index,
    request,
  }));
}

function scheduleCore(row) {
  return Object.fromEntries(SCHEDULE_KEYS.map((key) => [key, row[key]]));
}

function assertExactKeys(value, expected, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  if (!sameJson(actual, [...expected].sort())) {
    throw new Error(`${label} keys do not exactly match the frozen schema`);
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function nonblank(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function sameJson(left, right) {
  return JSON.stringify(canonicalValue(left)) === JSON.stringify(canonicalValue(right));
}

function readOsfEvidenceInputs(recordsRoot, descriptor, registrationId) {
  assertOsfEvidenceDescriptors(descriptor, registrationId);
  return {
    registration_record: {
      bytes: readSafeRelativeFile(
        recordsRoot,
        descriptor.registration_record.file,
        "OSF registration-record evidence",
      ),
    },
    providers_list: {
      bytes: readSafeRelativeFile(
        recordsRoot,
        descriptor.providers_list.file,
        "OSF providers-list evidence",
      ),
    },
    provider_file_list_pages: descriptor.provider_file_list_pages.map((page, index) => ({
      bytes: readSafeRelativeFile(
        recordsRoot,
        page.file,
        `OSF provider file-list evidence page ${index + 1}`,
      ),
    })),
    downloaded_files: descriptor.downloaded_files.map((file) => ({
      bytes: readSafeRelativeFile(recordsRoot, file.file, `OSF downloaded attachment ${file.name}`),
    })),
  };
}

function assertOsfEvidenceDescriptors(evidence, registrationId) {
  assertExactKeys(evidence, OSF_DOWNLOAD_EVIDENCE_KEYS, "OSF download evidence");
  if (!OSF_GUID.test(registrationId ?? "")) {
    throw new Error("OSF download evidence has no valid registration binding");
  }
  const apiRoot = `https://api.osf.io/v2/registrations/${registrationId}`;
  for (const [name, expectedUrl] of [
    ["registration_record", `${apiRoot}/`],
    ["providers_list", `${apiRoot}/files/`],
  ]) {
    const descriptor = evidence?.[name];
    assertExactKeys(descriptor, OSF_RAW_EVIDENCE_KEYS, `OSF ${name} evidence`);
    if (!safeRelativePath(descriptor.file) || !SHA256.test(descriptor.sha256 ?? "")
      || descriptor.url !== expectedUrl) {
      throw new Error(`OSF ${name} evidence descriptor is invalid`);
    }
  }
  if (!Array.isArray(evidence.provider_file_list_pages)
    || evidence.provider_file_list_pages.length < 1) {
    throw new Error("OSF provider file-list evidence pages are absent");
  }
  for (const [index, descriptor] of evidence.provider_file_list_pages.entries()) {
    assertExactKeys(descriptor, OSF_RAW_EVIDENCE_KEYS, "OSF provider file-list evidence page");
    if (!safeRelativePath(descriptor.file) || !SHA256.test(descriptor.sha256 ?? "")
      || (index === 0 && descriptor.url !== `${apiRoot}/files/osfstorage/`)
      || !validOsfApiPageUrl(descriptor.url, registrationId)) {
      throw new Error("OSF provider file-list evidence page descriptor is invalid");
    }
  }
  if (new Set(evidence.provider_file_list_pages.map(({ url }) => url)).size
      !== evidence.provider_file_list_pages.length
    || new Set(evidence.provider_file_list_pages.map(({ file }) => file)).size
      !== evidence.provider_file_list_pages.length) {
    throw new Error("OSF provider file-list evidence pages must have distinct URLs and files");
  }
  if (!Array.isArray(evidence.downloaded_files) || evidence.downloaded_files.length !== 2) {
    throw new Error("OSF downloaded attachment inventory must contain exactly two files");
  }
  for (const descriptor of evidence.downloaded_files) {
    assertExactKeys(descriptor, OSF_DOWNLOADED_FILE_KEYS, "OSF downloaded attachment evidence");
    if (!safeRelativePath(descriptor.file) || !nonblank(descriptor.file_id)
      || !SHA256.test(descriptor.sha256 ?? "")
      || !validOsfDownloadUrl(descriptor.download_url, registrationId)) {
      throw new Error("OSF downloaded attachment evidence descriptor is invalid");
    }
  }
  const names = evidence.downloaded_files.map(({ name }) => name).sort();
  if (!sameJson(names, [CONTENT_FREEZE_RECORD_FILE, "registration-payload.json"].sort())
    || new Set(evidence.downloaded_files.map(({ file_id: id }) => id)).size !== 2
    || new Set(evidence.downloaded_files.map(({ file }) => file)).size !== 2
    || new Set(evidence.downloaded_files.map(({ download_url: url }) => url)).size !== 2) {
    throw new Error("OSF downloaded attachment evidence inventory is not exact and distinct");
  }
}

function validateOsfEvidence(
  evidenceInputs,
  { osf, bundle, contentFreezeSha256, registrationSchemaId },
) {
  const descriptor = osf.download_evidence;
  if (!evidenceInputs || typeof evidenceInputs !== "object") {
    throw new Error("OSF raw evidence inputs are absent");
  }
  const rawEvidence = [
    [descriptor.registration_record, evidenceInputs.registration_record?.bytes],
    [descriptor.providers_list, evidenceInputs.providers_list?.bytes],
    ...descriptor.provider_file_list_pages.map((page, index) => [
      page,
      evidenceInputs.provider_file_list_pages?.[index]?.bytes,
    ]),
  ];
  for (const [record, bytes] of rawEvidence) {
    if (!Buffer.isBuffer(bytes) || record.sha256 !== sha256(bytes)) {
      throw new Error("OSF raw evidence hash does not match the immutable evidence bytes");
    }
  }

  const registration = parseJson(
    evidenceInputs.registration_record.bytes,
    "OSF registration-record evidence",
  );
  const data = registration?.data;
  if (!registration || typeof registration !== "object" || Array.isArray(registration)
    || !data || typeof data !== "object" || Array.isArray(data)
    || !OSF_GUID.test(data.id ?? "") || data.id !== osf.id) {
    throw new Error("OSF raw evidence registration GUID does not match the recorded registration");
  }
  if (data.type !== "registrations" || data.type !== osf.type) {
    throw new Error("OSF raw evidence type is not the recorded registrations resource");
  }
  if (data.links?.html !== osf.url) {
    throw new Error("OSF raw evidence HTML URL does not match the recorded registration");
  }
  const rawRegisteredAt = normalizeProviderInstant(data.attributes?.date_registered);
  if (rawRegisteredAt !== osf.registered_at) {
    throw new Error("OSF raw evidence registration instant does not match the recorded registration");
  }
  const rawSchemaId = data.relationships?.registration_schema?.data?.id;
  if (!nonblank(rawSchemaId)
    || rawSchemaId !== osf.registration_schema_id
    || rawSchemaId !== registrationSchemaId) {
    throw new Error("OSF raw evidence registration schema does not match the frozen study");
  }
  if (data.links?.self !== descriptor.registration_record.url) {
    throw new Error("OSF raw evidence registration API URL does not match its source descriptor");
  }

  const providers = parseJson(
    evidenceInputs.providers_list.bytes,
    "OSF providers-list evidence",
  );
  if (!Array.isArray(providers?.data) || providers.data.length !== 1
    || providers.links?.self !== descriptor.providers_list.url
    || providers.links?.next !== null) {
    throw new Error("OSF provider evidence does not prove one complete provider inventory");
  }
  const [provider] = providers.data;
  if (provider?.type !== "files" || provider.id !== `${osf.id}:osfstorage`
    || provider.attributes?.name !== "osfstorage"
    || provider.links?.files !== `https://api.osf.io/v2/registrations/${osf.id}/files/osfstorage/`) {
    throw new Error("OSF provider evidence is not canonically bound to osfstorage");
  }

  const resources = [];
  for (const [index, pageDescriptor] of descriptor.provider_file_list_pages.entries()) {
    const page = parseJson(
      evidenceInputs.provider_file_list_pages[index].bytes,
      `OSF provider file-list evidence page ${index + 1}`,
    );
    if (!Array.isArray(page?.data) || page.links?.self !== pageDescriptor.url) {
      throw new Error("OSF provider file-list evidence page is malformed or source-substituted");
    }
    const expectedNext = descriptor.provider_file_list_pages[index + 1]?.url ?? null;
    if (page.links?.next !== expectedNext) {
      throw new Error("OSF provider file-list evidence pagination is incomplete or reordered");
    }
    resources.push(...page.data);
  }

  if (resources.length !== 2) {
    throw new Error("OSF file inventory must contain exactly two file resources");
  }
  const resourcesByName = new Map();
  const resourceIds = new Set();
  for (const resource of resources) {
    const name = resource?.attributes?.name;
    if (resource?.type !== "files" || !nonblank(resource.id) || resourceIds.has(resource.id)
      || resource.attributes?.kind !== "file" || resource.attributes?.provider !== "osfstorage"
      || resource.relationships?.node?.data?.type !== "registrations"
      || resource.relationships?.node?.data?.id !== osf.id
      || !validOsfDownloadUrl(resource.links?.download, osf.id)
      || resourcesByName.has(name)) {
      throw new Error("OSF file resource inventory has a folder, duplicate, or provider binding drift");
    }
    resourceIds.add(resource.id);
    resourcesByName.set(name, resource);
  }
  if (!sameJson([...resourcesByName.keys()].sort(), [
    CONTENT_FREEZE_RECORD_FILE,
    bundle.file,
  ].sort()) || bundle.file !== "registration-payload.json") {
    throw new Error("OSF file resource inventory does not contain the exact two registered filenames");
  }

  if (!Array.isArray(evidenceInputs.downloaded_files)
    || evidenceInputs.downloaded_files.length !== descriptor.downloaded_files.length) {
    throw new Error("OSF downloaded attachment bytes do not match the evidence inventory");
  }
  const expectedHashes = new Map([
    [CONTENT_FREEZE_RECORD_FILE, contentFreezeSha256],
    [bundle.file, bundle.sha256],
  ]);
  for (const [index, downloadDescriptor] of descriptor.downloaded_files.entries()) {
    const bytes = evidenceInputs.downloaded_files[index]?.bytes;
    const resource = resourcesByName.get(downloadDescriptor.name);
    if (!Buffer.isBuffer(bytes) || sha256(bytes) !== downloadDescriptor.sha256
      || downloadDescriptor.sha256 !== expectedHashes.get(downloadDescriptor.name)
      || resource?.id !== downloadDescriptor.file_id
      || resource?.links?.download !== downloadDescriptor.download_url) {
      throw new Error("OSF downloaded attachment bytes or source identity do not match the frozen artifacts");
    }
  }
  return registration;
}

function normalizeProviderInstant(value) {
  if (typeof value !== "string"
    || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u.test(value)
    || Number.isNaN(Date.parse(value))) {
    throw new Error("OSF raw evidence registration instant is missing or invalid");
  }
  return new Date(Date.parse(value)).toISOString();
}

function validOsfApiPageUrl(value, registrationId) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "api.osf.io"
      && url.username === "" && url.password === "" && url.hash === ""
      && url.pathname === `/v2/registrations/${registrationId}/files/osfstorage/`;
  } catch {
    return false;
  }
}

function validOsfDownloadUrl(value, registrationId) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "files.osf.io"
      && url.username === "" && url.password === "" && url.hash === ""
      && url.pathname.startsWith(`/v1/resources/${registrationId}/providers/osfstorage/`);
  } catch {
    return false;
  }
}

function createRunBinding(fields) {
  assertExactKeys(fields, RUN_BINDING_KEYS, "Run binding");
  const binding = { ...fields };
  binding.fingerprint = sha256(JSON.stringify(canonicalValue(fields)));
  if (!validRunBinding(binding)) throw new Error("Generated run binding is invalid");
  return Object.freeze(binding);
}

function validRunBinding(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  try {
    assertExactKeys(value, [...RUN_BINDING_KEYS, "fingerprint"], "Run binding");
  } catch {
    return false;
  }
  const fields = Object.fromEntries(RUN_BINDING_KEYS.map((key) => [key, value[key]]));
  return value.schema_version === 1
    && nonblank(value.study_id)
    && value.queue_id === CONFIRMATORY_QUEUE_ID
    && FULL_GIT_COMMIT.test(value.content_commit ?? "")
    && RUN_BINDING_KEYS
      .filter((key) => key.endsWith("_sha256"))
      .every((key) => SHA256.test(value[key] ?? ""))
    && SHA256.test(value.fingerprint ?? "")
    && value.fingerprint === sha256(JSON.stringify(canonicalValue(fields)));
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue(value[key])]));
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function sha256(value) {
  return createHash("sha256").update(Buffer.isBuffer(value) ? value : String(value)).digest("hex");
}

function durableAppend(path, value, security) {
  assertOutputSecurity(security, security.root);
  const expected = security.files.get(path);
  if (!expected) throw new Error("Ledger append target has no captured private identity");
  if (!sameLedgerState(capturePrivateFileIdentity(path, "ledger append target"), expected)) {
    throw new Error("Ledger link, size, content, inode, ownership, or privacy drifted before append");
  }
  const bytes = Buffer.from(`${JSON.stringify(value)}\n`);
  const fd = openSync(
    path,
    fsConstants.O_RDWR | fsConstants.O_APPEND | (fsConstants.O_NOFOLLOW ?? 0),
  );
  try {
    const opened = fstatSync(fd);
    const before = {
      device: opened.dev,
      inode: opened.ino,
      mode: opened.mode,
      uid: opened.uid,
      link_count: opened.nlink,
      size: opened.size,
      sha256: sha256(readOpenedFile(fd, opened.size)),
    };
    if (!opened.isFile() || !sameLedgerState(before, expected)) {
      throw new Error("Ledger target must remain the captured private regular file");
    }
    appendFileSync(fd, bytes);
    fsyncSync(fd);
    const after = fstatSync(fd);
    const afterState = {
      device: after.dev,
      inode: after.ino,
      mode: after.mode,
      uid: after.uid,
      link_count: after.nlink,
      size: after.size,
      sha256: sha256(readOpenedFile(fd, after.size)),
    };
    if (!sameFileIdentity(afterState, expected)
      || afterState.link_count !== 1
      || afterState.size !== expected.size + bytes.length
      || afterState.sha256 !== sha256(Buffer.concat([
        readOpenedFile(fd, expected.size),
        bytes,
      ]))) {
      throw new Error("Ledger identity, links, size, or content drifted during append");
    }
    security.files.set(path, afterState);
  } finally {
    closeSync(fd);
  }
}

function runFile(command, args, options = {}) {
  const result = spawnSync(command, args, options);
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = String(result.stderr?.length ? result.stderr : result.stdout ?? "");
    throw new Error(`${command} exited ${result.status}: ${detail}`.trim());
  }
  return {
    stdout: result.stdout?.length ? result.stdout : result.stderr,
    stderr: result.stderr,
  };
}

function main(args) {
  const usage = "Usage: subscription-runner.mjs --preflight | --verify-phase-one REPOSITORY_ROOT BENCHMARK_ROOT COLLECTION_ROOT | BENCHMARK_ROOT COLLECTION_ROOT OUTPUT_ROOT";
  const option = args[0];
  if (option?.startsWith("--")) {
    if (option === "--verify-phase-one") {
      if (args.length !== 4) throw new Error(usage);
      const repositoryRoot = resolve(args[1]);
      const studyDirectory = "research/llm-review-sequences";
      process.stdout.write(`${JSON.stringify(verifyPhaseOneArtifacts({
        repositoryRoot,
        recordsRoot: join(repositoryRoot, studyDirectory),
        benchmarkRoot: resolve(args[2]),
        collectionRoot: resolve(args[3]),
        studyDirectory,
      }), null, 2)}\n`);
      return;
    }
    if (option === "--preflight") {
      if (args.length !== 1) throw new Error(usage);
      const codexBin = process.env.CODEX_SUBSCRIPTION_BIN;
      const claudeBin = process.env.CLAUDE_SUBSCRIPTION_BIN;
      process.stdout.write(`${JSON.stringify(
        runSubscriptionPreflight({ codexBin, claudeBin }),
        null,
        2,
      )}\n`);
      return;
    }
    throw new Error(usage);
  }
  if (args.length !== 3) {
    throw new Error(usage);
  }
  const codexBin = process.env.CODEX_SUBSCRIPTION_BIN;
  const claudeBin = process.env.CLAUDE_SUBSCRIPTION_BIN;
  process.stdout.write(`${JSON.stringify(collectSubscriptionSchedule({
    benchmarkRoot: args[0],
    collectionRoot: args[1],
    outputRoot: args[2],
    codexBin,
    claudeBin,
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
