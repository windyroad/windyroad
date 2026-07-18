import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  assertAuthorizedArtifacts,
  assertExecutionAuthorization,
  collectSubscriptionSchedule,
  parseSubscriptionOutput,
  preflightSubscriptionClients,
} from "./subscription-runner.mjs";

describe("subscription collection runner", () => {
  it("pins the exact authenticated subscription clients", () => {
    const outputs = new Map([
      ["/opt/codex --version", "codex-cli 0.137.0\n"],
      ["/opt/codex login status", "Logged in using ChatGPT\n"],
      ["/opt/claude --version", "2.1.211 (Claude Code)\n"],
      ["/opt/claude auth status", JSON.stringify({
        loggedIn: true, authMethod: "claude.ai", subscriptionType: "max",
      })],
    ]);
    const run = (command, args) => ({ stdout: outputs.get(`${command} ${args.join(" ")}`) });
    expect(preflightSubscriptionClients({
      codexBin: "/opt/codex", claudeBin: "/opt/claude", run, env: {},
    })).toMatchObject({ codex_version: "0.137.0", claude_version: "2.1.211" });
    expect(() => preflightSubscriptionClients({
      codexBin: "/opt/codex", claudeBin: "/opt/claude", run: () => ({ stdout: "0.101.0" }), env: {},
    })).toThrow("Codex version drift");
  });

  it("parses structured results and detects tool use", () => {
    const response = {
      verdict: "allow", malicious_probability: 0.1, severity: "none",
      submission_ids: [], evidence: "No unsafe composition.", category: "none",
    };
    expect(parseSubscriptionOutput("codex-cli/gpt-5.5", [
      JSON.stringify({ type: "item.completed", item: { type: "agent_message", text: JSON.stringify(response) } }),
    ].join("\n"))).toMatchObject({ response, tool_deviation: false });
    expect(parseSubscriptionOutput("claude-code/sonnet", JSON.stringify({
      structured_output: response, model: "claude-sonnet-4-6", num_turns: 1,
    }))).toMatchObject({ response, returned_model: "claude-sonnet-4-6" });
  });

  it("writes resumable attempts and results in fixed schedule order", () => {
    const root = mkdtempSync(join(tmpdir(), "subscription-runner-"));
    const benchmark = join(root, "benchmark");
    const collection = join(root, "collection");
    const output = join(root, "output");
    requireDirectory(benchmark);
    requireDirectory(collection);
    const request = { messages: [{ role: "system", content: "Review." }, { role: "user", content: "{}" }] };
    writeFileSync(join(benchmark, "prompts.jsonl"), `${JSON.stringify({ prompt_id: "prompt-1", request })}\n`);
    writeFileSync(join(collection, "calls.jsonl"), `${JSON.stringify({
      call_id: "call-1", schedule_index: 1, prompt_id: "prompt-1", model: "codex-cli/gpt-5.5",
    })}\n`);
    const response = {
      verdict: "allow", malicious_probability: 0.1, severity: "none",
      submission_ids: [], evidence: "No unsafe composition.", category: "none",
    };
    let calls = 0;
    const runReview = () => {
      calls += 1;
      return { stdout: JSON.stringify({
        type: "item.completed", item: { type: "agent_message", text: JSON.stringify(response) },
      }) };
    };
    const options = {
      benchmarkRoot: benchmark, collectionRoot: collection, outputRoot: output,
      codexBin: "/opt/codex", claudeBin: "/opt/claude", runReview,
      preflight: () => ({ codex_version: "0.137.0", claude_version: "2.1.211" }),
      authorize: () => {},
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    expect(calls).toBe(1);
    expect(readFileSync(join(output, "attempts.jsonl"), "utf8")).toContain('"call_id":"call-1"');
    expect(readFileSync(join(output, "results.jsonl"), "utf8")).toContain('"status":"valid"');
  });

  it("keeps suspensions out of the final result ledger before resume", () => {
    const root = mkdtempSync(join(tmpdir(), "subscription-resume-"));
    const benchmark = join(root, "benchmark");
    const collection = join(root, "collection");
    const output = join(root, "output");
    requireDirectory(benchmark);
    requireDirectory(collection);
    const request = { messages: [{ role: "system", content: "Review." }, { role: "user", content: "{}" }] };
    writeFileSync(join(benchmark, "prompts.jsonl"), `${JSON.stringify({ prompt_id: "p", request })}\n`);
    writeFileSync(join(collection, "calls.jsonl"), `${JSON.stringify({
      call_id: "c", schedule_index: 1, prompt_id: "p", model: "codex-cli/gpt-5.5",
    })}\n`);
    const result = collectSubscriptionSchedule({
      benchmarkRoot: benchmark, collectionRoot: collection, outputRoot: output,
      codexBin: "/opt/codex", claudeBin: "/opt/claude",
      preflight: () => ({ codex_version: "0.137.0", claude_version: "2.1.211" }),
      authorize: () => {},
      runReview: () => { throw new Error("usage limit"); },
    });
    expect(result).toMatchObject({ completed: 0, reason: "rate_limit" });
    expect(existsSync(join(output, "results.jsonl"))).toBe(false);
    for (let index = 0; index < 3; index += 1) {
      expect(collectSubscriptionSchedule({
        benchmarkRoot: benchmark, collectionRoot: collection, outputRoot: output,
        codexBin: "/opt/codex", claudeBin: "/opt/claude", authorize: () => {},
        preflight: () => ({ codex_version: "0.137.0", claude_version: "2.1.211" }),
        runReview: () => { throw new Error("usage limit"); },
      })).toMatchObject({ completed: 0, reason: "rate_limit" });
    }
    expect(existsSync(join(output, "results.jsonl"))).toBe(false);
  });

  it("enforces the frozen OSF authorization gate by default", () => {
    const root = mkdtempSync(join(tmpdir(), "subscription-authorization-"));
    const outputRoot = join(root, "output");
    let preflightCalls = 0;
    let reviewCalls = 0;
    expect(() => collectSubscriptionSchedule({
      benchmarkRoot: "/tmp/not-authorized-benchmark",
      collectionRoot: "/tmp/not-authorized-collection",
      outputRoot,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      preflight: () => { preflightCalls += 1; },
      runReview: () => { reviewCalls += 1; },
    })).toThrow("not authorized");
    expect(existsSync(outputRoot)).toBe(false);
    expect(preflightCalls).toBe(0);
    expect(reviewCalls).toBe(0);
  });

  it("ships the registration and execution records fail-closed", () => {
    const study = JSON.parse(readFileSync(join(import.meta.dirname, "study.json"), "utf8"));
    const contentFreeze = JSON.parse(readFileSync(
      join(import.meta.dirname, "registration-content-freeze.json"), "utf8",
    ));
    const executionAuthorization = JSON.parse(readFileSync(
      join(import.meta.dirname, "execution-authorization.json"), "utf8",
    ));
    expect(study.frozen).toBe(false);
    expect(contentFreeze).toMatchObject({
      status: "unfrozen",
      outcome_calls_authorized: false,
    });
    expect(study.active_subscription_design.artifacts).toMatchObject(
      contentFreeze.queues[0].artifacts,
    );
    expect(executionAuthorization).toMatchObject({
      status: "unauthorized-registration-pending",
      outcome_calls_authorized: false,
      authorized_queues: [],
    });
  });

  it("keeps a pre-registration content freeze from authorizing outcome calls", () => {
    const records = authorizationRecords();
    records.executionAuthorization.status = "unauthorized-registration-pending";
    records.executionAuthorization.outcome_calls_authorized = false;
    expect(() => assertExecutionAuthorization(records)).toThrow("not authorized");
    expect(records.study.frozen).toBe(true);
    expect(records.contentFreeze.status).toBe("frozen-pre-submission");
  });

  it("accepts a separate post-registration authorization bound to the frozen packet", () => {
    const records = authorizationRecords();
    expect(assertExecutionAuthorization(records)).toMatchObject({
      queue_id: "confirmatory-subscription-v2",
      artifacts: records.study.active_subscription_design.artifacts,
    });
    expect(records.contentFreeze.outcome_calls_authorized).toBe(false);
  });

  it("rejects drift between the content freeze and execution authorization", () => {
    const records = authorizationRecords();
    records.executionAuthorization.content_freeze.bundle_sha256 = "d".repeat(64);
    expect(() => assertExecutionAuthorization(records)).toThrow("bundle hash");

    const artifactDrift = authorizationRecords();
    artifactDrift.executionAuthorization.authorized_queues[0].artifacts.calls_sha256 = "e".repeat(64);
    expect(() => assertExecutionAuthorization(artifactDrift)).toThrow("artifact hashes");

    const timeDrift = authorizationRecords();
    timeDrift.executionAuthorization.osf_registration.registered_at = "2026-07-19T02:00:00+10:00";
    expect(() => assertExecutionAuthorization(timeDrift)).toThrow("timestamp order");

    const identityDrift = authorizationRecords();
    identityDrift.contentFreeze.study_id = "another-study";
    expect(() => assertExecutionAuthorization(identityDrift)).toThrow("study identity");

    const systemDrift = authorizationRecords();
    systemDrift.executionAuthorization.authorized_queues[0].review_systems = ["codex-cli/gpt-5.5"];
    expect(() => assertExecutionAuthorization(systemDrift)).toThrow("review systems");

    const freezeTimeDrift = authorizationRecords();
    freezeTimeDrift.contentFreeze.frozen_at = "2026-07-19T03:01:00+10:00";
    expect(() => assertExecutionAuthorization(freezeTimeDrift)).toThrow("freeze timestamp");

    const missingRegistration = authorizationRecords();
    missingRegistration.executionAuthorization.osf_registration.id = null;
    expect(() => assertExecutionAuthorization(missingRegistration)).toThrow("OSF registration");

    const missingRecordHash = authorizationRecords();
    missingRecordHash.executionAuthorization.content_freeze.record_sha256 = null;
    expect(() => assertExecutionAuthorization(missingRecordHash)).toThrow("record hash");
  });

  it("hashes the registered bundle and runtime files instead of trusting copied digests", () => {
    const fixture = authorizedArtifactFixture();
    expect(() => assertAuthorizedArtifacts(fixture)).not.toThrow();

    writeFileSync(fixture.bundlePath, "mutated registered bundle\n");
    expect(() => assertAuthorizedArtifacts(fixture)).toThrow("bundle hash");

    const recordDrift = authorizedArtifactFixture();
    const recordPath = join(recordDrift.recordsRoot, "registration-content-freeze.json");
    writeFileSync(recordPath, `${readFileSync(recordPath, "utf8")}\n`);
    expect(() => assertAuthorizedArtifacts(recordDrift)).toThrow("record hash");

    const runtimeDrift = authorizedArtifactFixture();
    writeFileSync(join(runtimeDrift.recordsRoot, "review-schema.json"), "{}\n");
    expect(() => assertAuthorizedArtifacts(runtimeDrift)).toThrow("runtime file");
  });

  it("suspends when a returned model identity changes between calls", () => {
    const root = mkdtempSync(join(tmpdir(), "subscription-drift-"));
    const benchmark = join(root, "benchmark");
    const collection = join(root, "collection");
    const output = join(root, "output");
    requireDirectory(benchmark);
    requireDirectory(collection);
    const request = { messages: [{ role: "system", content: "Review." }, { role: "user", content: "{}" }] };
    writeFileSync(join(benchmark, "prompts.jsonl"), ["p1", "p2"]
      .map((prompt_id) => JSON.stringify({ prompt_id, request })).join("\n") + "\n");
    writeFileSync(join(collection, "calls.jsonl"), ["p1", "p2"].map((prompt_id, index) => JSON.stringify({
      call_id: `c${index + 1}`, schedule_index: index + 1, prompt_id, model: "claude-code/sonnet",
    })).join("\n") + "\n");
    const response = {
      verdict: "allow", malicious_probability: 0.1, severity: "none",
      submission_ids: [], evidence: "No unsafe composition.", category: "none",
    };
    let index = 0;
    const options = {
      benchmarkRoot: benchmark, collectionRoot: collection, outputRoot: output,
      codexBin: "/opt/codex", claudeBin: "/opt/claude", authorize: () => {},
      preflight: () => ({ codex_version: "0.137.0", claude_version: "2.1.211" }),
      runReview: () => ({ stdout: JSON.stringify({
        structured_output: response,
        model: index++ === 0 ? "claude-sonnet-4-6" : "claude-sonnet-5-0",
      }) }),
    };
    for (let resume = 0; resume < 4; resume += 1) {
      expect(collectSubscriptionSchedule(options)).toMatchObject({
        completed: 1, suspended_call_id: "c2", reason: "model_drift",
      });
    }
    expect(readFileSync(join(output, "results.jsonl"), "utf8")).not.toContain('"call_id":"c2"');
  });
});

function requireDirectory(path) {
  mkdirSync(path, { recursive: true });
}

function authorizationRecords() {
  const artifacts = {
    cards_sha256: "1".repeat(64),
    prompts_sha256: "2".repeat(64),
    schedule_sha256: "3".repeat(64),
    calls_sha256: "4".repeat(64),
    ground_truth_sha256: "5".repeat(64),
  };
  const contentCommit = "a".repeat(40);
  const bundleSha256 = "b".repeat(64);
  const contentFreezeSha256 = "c".repeat(64);
  const branch = "confirmatory-only";
  const studyId = "llm-review-sequences-v0";
  const reviewSystems = ["codex-cli/gpt-5.5", "claude-code/sonnet"];
  const runtimeHashValues = ["6", "7", "8", "9", "a"];
  const runtimeFileHashes = Object.fromEntries([
    "study.json",
    "subscription-runner.mjs",
    "subscription.mjs",
    "pilot.mjs",
    "review-schema.json",
  ].map((name, index) => [name, runtimeHashValues[index].repeat(64)]));
  return {
    study: {
      study_id: studyId,
      frozen: true,
      frozen_at: "2026-07-19T03:00:00+10:00",
      authorship: { authors: [{ name: "Tom Howard", orcid: "0009-0001-4714-5747" }] },
      preregistration_v2_draft: {
        template: "OSF Preregistration",
        template_schema_version: 4,
        template_schema_id: "697b72f611a8e98484c6139b",
      },
      active_subscription_design: {
        artifacts,
        review_systems: reviewSystems.map((id) => ({ id })),
      },
    },
    contentFreeze: {
      schema_version: 1,
      study_id: studyId,
      status: "frozen-pre-submission",
      frozen_at: "2026-07-19T03:00:00+10:00",
      content_commit: contentCommit,
      branch,
      osf_schema: {
        name: "OSF Preregistration",
        version: 4,
        id: "697b72f611a8e98484c6139b",
      },
      registration_bundle: { file: "registration-payload.tar.gz", sha256: bundleSha256 },
      runtime_files: { ...runtimeFileHashes },
      outcome_calls_authorized: false,
      queues: [{
        id: "confirmatory-subscription-v2",
        review_systems: reviewSystems,
        artifacts: { ...artifacts },
      }],
    },
    contentFreezeSha256,
    registrationBundleSha256: bundleSha256,
    runtimeFileHashes,
    executionAuthorization: {
      schema_version: 1,
      study_id: studyId,
      status: "authorized-post-registration",
      outcome_calls_authorized: true,
      authorized_at: "2026-07-19T04:00:00+10:00",
      authorized_by: { name: "Tom Howard", orcid: "0009-0001-4714-5747" },
      osf_registration: {
        id: "osf-test-id",
        url: "https://osf.io/osf-test-id/",
        registered_at: "2026-07-19T03:45:00+10:00",
      },
      content_freeze: {
        record_sha256: contentFreezeSha256,
        content_commit: contentCommit,
        branch,
        bundle_sha256: bundleSha256,
      },
      authorized_queues: [{
        id: "confirmatory-subscription-v2",
        review_systems: reviewSystems,
        artifacts: { ...artifacts },
      }],
    },
  };
}

function authorizedArtifactFixture() {
  const recordsRoot = mkdtempSync(join(tmpdir(), "subscription-records-"));
  const benchmarkRoot = join(recordsRoot, "benchmark");
  const collectionRoot = join(recordsRoot, "collection");
  requireDirectory(benchmarkRoot);
  requireDirectory(collectionRoot);
  const cards = [{ card_id: "card-1" }];
  const prompts = `${JSON.stringify({ prompt_id: "prompt-1", request: {} })}\n`;
  const calls = `${JSON.stringify({ call_id: "call-1", prompt_id: "prompt-1" })}\n`;
  const groundTruth = `${JSON.stringify({ call_id: "call-1", intent: "benign" })}\n`;
  const scheduleSha256 = "3".repeat(64);
  writeFileSync(join(benchmarkRoot, "cards.json"), `${JSON.stringify(cards, null, 2)}\n`);
  writeFileSync(join(benchmarkRoot, "prompts.jsonl"), prompts);
  writeFileSync(join(collectionRoot, "calls.jsonl"), calls);
  writeFileSync(join(collectionRoot, "ground-truth.jsonl"), groundTruth);
  writeFileSync(join(collectionRoot, "collection.json"), JSON.stringify({ schedule_sha256: scheduleSha256 }));
  const artifacts = {
    cards_sha256: sha256(JSON.stringify(cards)),
    prompts_sha256: sha256(prompts),
    schedule_sha256: scheduleSha256,
    calls_sha256: sha256(calls),
    ground_truth_sha256: sha256(groundTruth),
  };
  const studyId = "llm-review-sequences-v0";
  const frozenAt = "2026-07-19T03:00:00+10:00";
  const reviewSystems = ["codex-cli/gpt-5.5", "claude-code/sonnet"];
  const study = {
    study_id: studyId,
    frozen: true,
    frozen_at: frozenAt,
    authorship: { authors: [{ name: "Tom Howard", orcid: "0009-0001-4714-5747" }] },
    preregistration_v2_draft: {
      template: "OSF Preregistration",
      template_schema_version: 4,
      template_schema_id: "697b72f611a8e98484c6139b",
    },
    active_subscription_design: {
      artifacts,
      review_systems: reviewSystems.map((id) => ({ id })),
    },
  };
  writeFileSync(join(recordsRoot, "study.json"), `${JSON.stringify(study, null, 2)}\n`);
  for (const [name, value] of Object.entries({
    "subscription-runner.mjs": "runner\n",
    "subscription.mjs": "subscription\n",
    "pilot.mjs": "pilot\n",
    "review-schema.json": "{\"type\":\"object\"}\n",
  })) writeFileSync(join(recordsRoot, name), value);
  const runtimeFiles = Object.fromEntries([
    "study.json",
    "subscription-runner.mjs",
    "subscription.mjs",
    "pilot.mjs",
    "review-schema.json",
  ].map((name) => [name, sha256(readFileSync(join(recordsRoot, name)))]));
  const bundlePath = join(recordsRoot, "registration-payload.tar.gz");
  writeFileSync(bundlePath, "registered bundle\n");
  const bundleSha256 = sha256(readFileSync(bundlePath));
  const contentCommit = "a".repeat(40);
  const contentFreeze = {
    schema_version: 1,
    study_id: studyId,
    status: "frozen-pre-submission",
    frozen_at: frozenAt,
    content_commit: contentCommit,
    branch: "confirmatory-only",
    osf_schema: {
      name: "OSF Preregistration",
      version: 4,
      id: "697b72f611a8e98484c6139b",
    },
    registration_bundle: { file: "registration-payload.tar.gz", sha256: bundleSha256 },
    runtime_files: runtimeFiles,
    outcome_calls_authorized: false,
    queues: [{ id: "confirmatory-subscription-v2", review_systems: reviewSystems, artifacts }],
  };
  const freezeBytes = `${JSON.stringify(contentFreeze, null, 2)}\n`;
  writeFileSync(join(recordsRoot, "registration-content-freeze.json"), freezeBytes);
  const executionAuthorization = {
    schema_version: 1,
    study_id: studyId,
    status: "authorized-post-registration",
    outcome_calls_authorized: true,
    authorized_at: "2026-07-19T04:00:00+10:00",
    authorized_by: { name: "Tom Howard", orcid: "0009-0001-4714-5747" },
    osf_registration: {
      id: "osf-test-id",
      url: "https://osf.io/osf-test-id/",
      registered_at: "2026-07-19T03:45:00+10:00",
    },
    content_freeze: {
      record_sha256: sha256(freezeBytes),
      content_commit: contentCommit,
      branch: "confirmatory-only",
      bundle_sha256: bundleSha256,
    },
    authorized_queues: [{ id: "confirmatory-subscription-v2", review_systems: reviewSystems, artifacts }],
  };
  writeFileSync(
    join(recordsRoot, "execution-authorization.json"),
    `${JSON.stringify(executionAuthorization, null, 2)}\n`,
  );
  return { benchmarkRoot, collectionRoot, recordsRoot, bundlePath };
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
