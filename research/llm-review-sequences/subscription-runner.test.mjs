import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { hostname, tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { describe, expect, it, vi } from "vitest";

import { generateCallSchedule, summarizeSchedule } from "./design.mjs";
import {
  buildRegistrationPacket,
  verifyRegistrationPacket,
} from "./registration-packet.mjs";
import {
  assertAuthorizedArtifacts,
  assertExecutionAuthorization,
  collectSubscriptionSchedule,
  parseSubscriptionOutput,
  preflightSubscriptionClients,
  runSubscriptionPreflight,
  verifyCurrentBatchAccessConfirmation,
  verifyPhaseOneArtifacts,
} from "./subscription-runner.mjs";

const CONFIRMATORY_QUEUE_ID = "confirmatory-subscription-v2";
const REVIEW_SYSTEMS = ["codex-cli/gpt-5.5", "claude-code/sonnet"];
const RAW_FILE_NAMES = [
  "cards.json",
  "prompts.jsonl",
  "calls.jsonl",
  "ground-truth.jsonl",
  "collection.json",
];
const RUNTIME_FILE_NAMES = [
  "study.json",
  "analyse.mjs",
  "design.mjs",
  "precision-audit.mjs",
  "subscription-runner.mjs",
  "subscription.mjs",
  "pilot.mjs",
  "review-schema.json",
  "registration-packet.mjs",
];
const REVIEW_ROLES = ["methods", "reproducibility", "safety"];
const AUTHOR = Object.freeze({ name: "Tom Howard", orcid: "0009-0001-4714-5747" });
const SAFE_CHILD_ENV = Object.freeze({
  CODEX_HOME: "/Users/reviewer/.codex",
  HOME: "/Users/reviewer",
  LANG: "C",
  LC_ALL: "C",
  NO_COLOR: "1",
  PATH: "/usr/bin:/bin:/usr/sbin:/sbin",
  TERM: "dumb",
});
const CHILD_ENV_POLICY = Object.freeze({
  schema_version: 1,
  allowed_keys: ["CODEX_HOME", "HOME", "LANG", "LC_ALL", "NO_COLOR", "PATH", "TERM"],
  fixed_keys: ["LANG", "LC_ALL", "NO_COLOR", "PATH", "TERM"],
});
const CODEX_AUTH_STATUS = "Logged in using ChatGPT\n";
const CODEX_ACCOUNT_ID = "account-fixture";
const CLAUDE_AUTH_STATUS = JSON.stringify({
  loggedIn: true,
  authMethod: "claude.ai",
  subscriptionType: "max",
  email: "tom@example.test",
  orgId: "org-fixture",
});
const VALID_RESPONSE = Object.freeze({
  verdict: "allow",
  malicious_probability: 0.1,
  severity: "none",
  submission_ids: [],
  evidence: "No unsafe composition.",
  category: "none",
});

describe("subscription collection runner", () => {
  it("pins the exact authenticated subscription clients", () => {
    const sandboxProbe = codexSandboxProbeFixture();
    const outputs = new Map([
      ["/opt/codex-0.137.0 --version", "codex-cli 0.137.0\n"],
      ["/opt/codex-0.137.0 --ask-for-approval never exec --help", "--ephemeral --ignore-user-config --ignore-rules --json --output-schema --config"],
      ["/opt/codex-0.137.0 sandbox --help", "--permissions-profile --include-managed-config --cd"],
      ["/opt/codex-0.137.0 login status", CODEX_AUTH_STATUS],
      ["/opt/claude-2.1.211 --version", "2.1.211 (Claude Code)\n"],
      ["/opt/claude-2.1.211 --help", "--safe-mode --setting-sources --strict-mcp-config --mcp-config --disable-slash-commands --no-chrome --output-format --json-schema"],
      ["/opt/claude-2.1.211 auth status", CLAUDE_AUTH_STATUS],
    ]);
    const runOptions = [];
    const invocations = [];
    const run = (command, args, options) => {
      runOptions.push(options);
      invocations.push([command, args]);
      if (args[0] === "sandbox" && args[1] !== "--help") {
        return { stdout: "study-minimal-sandbox-ok\n" };
      }
      return { stdout: outputs.get(`${command} ${args.join(" ")}`) };
    };
    const inspectExecutable = (path) => path === "/opt/codex"
      ? { realpath: "/opt/codex-0.137.0", sha256: "2e0cccea4a81dd7bf2c155950dab9a6c6ed9a02569d8ff07a68b7afedc1be21d" }
      : { realpath: "/opt/claude-2.1.211", sha256: "5a728a76198b6eca7f3c7cdbff43bab44b77b48c2108f7a3107d889773382629" };
    const provenance = preflightSubscriptionClients({
      codexBin: "/opt/codex", claudeBin: "/opt/claude", run,
      env: {
        HOME: sandboxProbe.home,
        PATH: "/untrusted/bin",
        SHELL: "/bin/zsh",
        UNKNOWN_AMBIENT_VALUE: "discard me",
      },
      codexSandboxProbe: sandboxProbe.probe,
      inspectExecutable,
    });
    expect(provenance).toMatchObject({
      schema_version: 3,
      codex_executable: "/opt/codex-0.137.0",
      codex_executable_sha256: "2e0cccea4a81dd7bf2c155950dab9a6c6ed9a02569d8ff07a68b7afedc1be21d",
      codex_version: "0.137.0",
      codex_auth: "chatgpt-subscription",
      codex_auth_status_sha256: sha256(CODEX_AUTH_STATUS),
      codex_isolation: expect.objectContaining({
        ephemeral: true,
        approval_policy: "never",
        sandbox: "custom-permissions-profile",
        permissions_profile: {
          id: "study-minimal",
          config_overrides: [
            'default_permissions="study-minimal"',
            'permissions={study-minimal={filesystem={":minimal"="read"}}}',
          ],
          filesystem: { ":minimal": "read" },
          network: "restricted",
          managed_requirements: "included-in-offline-proof-with-no-warnings",
        },
        ignore_user_config: true,
        ignore_rules: true,
      }),
      claude_executable: "/opt/claude-2.1.211",
      claude_executable_sha256: "5a728a76198b6eca7f3c7cdbff43bab44b77b48c2108f7a3107d889773382629",
      claude_version: "2.1.211",
      claude_auth: "claude.ai-max-subscription",
      claude_auth_status_sha256: sha256(CLAUDE_AUTH_STATUS),
      claude_isolation: expect.objectContaining({
        safe_mode: true, setting_sources: [], strict_mcp_config: true,
      }),
      child_env_policy: CHILD_ENV_POLICY,
    });
    const expectedChildEnv = {
      ...SAFE_CHILD_ENV,
      CODEX_HOME: join(sandboxProbe.home, ".codex"),
      HOME: sandboxProbe.home,
    };
    expect(runOptions).toHaveLength(8);
    expect(runOptions).toEqual(Array.from({ length: 8 }, () => ({ env: expectedChildEnv })));
    expect(provenance.child_env).toEqual(expectedChildEnv);
    expect(provenance.account_identity_sha256).toEqual(accountIdentitySha256());
    const sandboxInvocation = invocations.find(([, args]) =>
      args[0] === "sandbox" && args[1] !== "--help");
    expect(sandboxInvocation).toEqual(["/opt/codex-0.137.0", [
      "sandbox", "--permissions-profile", "study-minimal",
      "--include-managed-config",
      "--config", 'permissions={study-minimal={filesystem={":minimal"="read"}}}',
      "--cd", realpathSync(sandboxProbe.probe.cwd), "--", "/bin/sh", "-c", expect.any(String),
      "codex-study-minimal-probe",
      ...sandboxProbe.probe.denied_paths.map((path) => realpathSync(path)),
    ]]);
    expect(Object.keys(provenance)).not.toContain("child_env");
    expect(JSON.stringify(provenance)).not.toContain(CODEX_AUTH_STATUS.trim());
    expect(JSON.stringify(provenance)).not.toContain(sandboxProbe.home);
    const driftRun = (command, args) => command === "/opt/codex-0.137.0"
        && args.join(" ") === "--version"
      ? { stdout: "codex-cli 0.101.0\n" }
      : run(command, args);
    expect(() => preflightSubscriptionClients({
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      run: driftRun,
      env: { HOME: sandboxProbe.home },
      codexSandboxProbe: sandboxProbe.probe,
      inspectExecutable,
    })).toThrow("Codex version drift");
  });

  it("runs the standalone preflight in a disposable isolated home", () => {
    const root = mkdtempSync(join(tmpdir(), "standalone-preflight-root-"));
    const ambientHome = mkdtempSync(join(tmpdir(), "standalone-preflight-home-"));
    const codexAuth = join(ambientHome, ".codex", "auth.json");
    const claudeAuth = join(ambientHome, ".claude", ".credentials.json");
    mkdirSync(dirname(codexAuth), { recursive: true, mode: 0o700 });
    mkdirSync(dirname(claudeAuth), { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(
      codexAuth,
      JSON.stringify({ tokens: { account_id: CODEX_ACCOUNT_ID } }),
    );
    writePrivateFixtureFile(claudeAuth, "{}");
    const outputs = new Map([
      ["/opt/codex-0.137.0 --version", "codex-cli 0.137.0\n"],
      ["/opt/codex-0.137.0 --ask-for-approval never exec --help", "--ephemeral --ignore-user-config --ignore-rules --json --output-schema --config"],
      ["/opt/codex-0.137.0 sandbox --help", "--permissions-profile --include-managed-config --cd"],
      ["/opt/codex-0.137.0 login status", CODEX_AUTH_STATUS],
      ["/opt/claude-2.1.211 --version", "2.1.211 (Claude Code)\n"],
      ["/opt/claude-2.1.211 --help", "--safe-mode --setting-sources --strict-mcp-config --mcp-config --disable-slash-commands --no-chrome --output-format --json-schema"],
      ["/opt/claude-2.1.211 auth status", CLAUDE_AUTH_STATUS],
    ]);
    const result = runSubscriptionPreflight({
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      env: { HOME: ambientHome },
      makeTemporaryRoot: () => root,
      inspectExecutable: (path) => path.includes("codex")
        ? { realpath: "/opt/codex-0.137.0", sha256: "2e0cccea4a81dd7bf2c155950dab9a6c6ed9a02569d8ff07a68b7afedc1be21d" }
        : { realpath: "/opt/claude-2.1.211", sha256: "5a728a76198b6eca7f3c7cdbff43bab44b77b48c2108f7a3107d889773382629" },
      run: (command, args) => ({
        stdout: args[0] === "sandbox" && args[1] !== "--help"
          ? "study-minimal-sandbox-ok\n"
          : outputs.get(`${command} ${args.join(" ")}`),
      }),
    });
    expect(result.account_identity_sha256).toEqual(accountIdentitySha256());
    expect(existsSync(root)).toBe(false);
    expect(existsSync(codexAuth)).toBe(true);
  });

  it("uses only authoritative returned-model envelope evidence", () => {
    expect(parseSubscriptionOutput(
      "codex-cli/gpt-5.5",
      authoritativeCodexOutput(VALID_RESPONSE),
    )).toMatchObject({
      response: VALID_RESPONSE,
      returned_model: null,
      model_identity_status: "requested_pinned_client_no_reroute_observable",
    });
    expect(() => parseSubscriptionOutput(
      "codex-cli/gpt-5.5",
      authoritativeCodexOutput(VALID_RESPONSE, [{
        type: "item.completed",
        item: { type: "error", message: "model rerouted: gpt-5.5 -> gpt-5.5-fast (capacity)" },
      }]),
    )).toThrow(/model.*rerout|drift/i);
    expect(() => parseSubscriptionOutput(
      "codex-cli/gpt-5.5",
      toJsonl([{
        type: "item.completed",
        item: { type: "error", message: "model rerouted: gpt-5.5 -> gpt-5.5-fast (capacity)" },
      }]),
    )).toThrow(/model.*rerout|drift/i);
    expect(() => parseSubscriptionOutput(
      "codex-cli/gpt-5.5",
      authoritativeCodexOutput(VALID_RESPONSE, [{
        type: "error",
        message: "model rerouted: gpt-5.5 -> gpt-5.5-fast (capacity)",
      }]),
    )).toThrow(/model.*rerout|drift/i);
    expect(() => parseSubscriptionOutput(
      "codex-cli/gpt-5.5",
      authoritativeCodexOutput(VALID_RESPONSE, [{
        type: "error",
        message: "provider stream failed",
      }]),
    )).toThrow(/provider error/i);
    expect(parseSubscriptionOutput("claude-code/sonnet", JSON.stringify({
      structured_output: VALID_RESPONSE,
      modelUsage: { "claude-sonnet-4-6": { inputTokens: 10, outputTokens: 5 } },
      num_turns: 1,
    }))).toMatchObject({
      response: VALID_RESPONSE,
      returned_model: "claude-sonnet-4-6",
      model_identity_status: "observed_singleton_model_usage",
    });
    expect(() => parseSubscriptionOutput("claude-code/sonnet", JSON.stringify({
      structured_output: VALID_RESPONSE,
      model: "claude-sonnet-4-6",
      num_turns: 1,
    }))).toThrow(/model identity/i);
    expect(() => parseSubscriptionOutput("claude-code/sonnet", JSON.stringify({
      structured_output: VALID_RESPONSE,
      model_usage: {
        "claude-sonnet-4-6": {},
        "claude-sonnet-5-0": {},
      },
      num_turns: 1,
    }))).toThrow(/model identity|model drift/i);
    expect(() => parseSubscriptionOutput("claude-code/sonnet", JSON.stringify({
      structured_output: VALID_RESPONSE,
      model_usage: { "claude-sonnet-4-6": {} },
      num_turns: 1,
    }))).toThrow(/model identity/i);
    expect(() => parseSubscriptionOutput("claude-code/sonnet", JSON.stringify({
      structured_output: VALID_RESPONSE,
      modelUsage: { " CLAUDE-SONNET-4-6 ": {} },
      num_turns: 1,
    }))).toThrow(/model drift/i);
  });

  it("parses structured results using each client's authoritative model-identity contract", () => {
    expect(parseSubscriptionOutput(
      "codex-cli/gpt-5.5",
      codexOutput("gpt-5.5", VALID_RESPONSE),
    )).toMatchObject({
      response: VALID_RESPONSE,
      returned_model: null,
      model_identity_status: "requested_pinned_client_no_reroute_observable",
      tool_deviation: false,
    });
    expect(parseSubscriptionOutput("claude-code/sonnet", JSON.stringify({
      structured_output: VALID_RESPONSE,
      modelUsage: { "claude-sonnet-4-6": {} },
      num_turns: 1,
    }))).toMatchObject({
      response: VALID_RESPONSE,
      returned_model: "claude-sonnet-4-6",
      model_identity_status: "observed_singleton_model_usage",
    });
    expect(() => parseSubscriptionOutput("claude-code/sonnet", JSON.stringify({
      structured_output: VALID_RESPONSE,
      num_turns: 1,
    }))).toThrow("model identity");
  });

  it.each([
    ["codex-cli/gpt-5.5", "{not-json"],
    ["codex-cli/gpt-5.5", `${JSON.stringify({ type: "thread.started" })}\n{not-json`],
    ["claude-code/sonnet", "{not-json"],
    ["claude-code/sonnet", JSON.stringify([])],
  ])("suspends an unparseable or malformed %s provider envelope without a result", (system, stdout) => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    snapshot.calls[0].model = system;
    const result = collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout }),
    });
    expect(result).toMatchObject({ completed: 0, reason: "provider_envelope_invalid" });
    expect(resultRows(fixture.outputRoot)).toEqual([]);
    const [suspended] = readJsonl(join(fixture.outputRoot, "attempts.jsonl"))
      .filter(({ event }) => event === "suspended");
    expect(suspended.raw_output_sha256).toBe(sha256(stdout));
    expect(readFileSync(join(
      fixture.outputRoot,
      "raw-provider-envelopes",
      `${sha256("call-1")}-${sha256(stdout)}.bin`,
    ))).toEqual(Buffer.from(stdout));
  });

  it("retains only allowlisted numeric token counts from provider usage", () => {
    expect(parseSubscriptionOutput("claude-code/sonnet", JSON.stringify({
      structured_output: VALID_RESPONSE,
      modelUsage: { "claude-sonnet-4-6": {} },
      usage: {
        input_tokens: 10,
        output_tokens: 5,
        account_email: "must-not-be-retained@example.test",
        nested: { secret: "must-not-be-retained" },
      },
    })).usage).toEqual({ input_tokens: 10, output_tokens: 5 });
  });

  it("executes the parsed objects returned by authorization without rereading mutable inputs", () => {
    const fixture = collectionExecutionFixture();
    const authorizedRequest = {
      messages: [{ role: "system", content: "Authorized bytes." }, { role: "user", content: "{}" }],
    };
    const snapshot = executionSnapshot(authorizedRequest);
    snapshot.review_schema_bytes = Buffer.from('{"title":"Authorized snapshot schema"}\n');
    writeFileSync(join(fixture.benchmarkRoot, "prompts.jsonl"), `${JSON.stringify({
      prompt_id: "prompt-1",
      request: { messages: [{ role: "system", content: "MUTATED FILE" }] },
    })}\n`);
    writeFileSync(join(fixture.collectionRoot, "calls.jsonl"), `${JSON.stringify({
      call_id: "mutated-call", schedule_index: 999, prompt_id: "missing", model: "unknown",
    })}\n`);
    let reviews = 0;
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      env: { HOME: "/Users/reviewer", UNKNOWN_AMBIENT_VALUE: "must not reach child" },
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: (_command, args, { input, env }) => {
        reviews += 1;
        expect(Object.keys(env).sort()).toEqual(Object.keys(SAFE_CHILD_ENV).sort());
        expect(env.HOME).toMatch(/\/client-home$/u);
        expect(env.HOME).not.toBe("/Users/reviewer");
        expect(env.CODEX_HOME).toBe(join(env.HOME, ".codex"));
        expect(JSON.stringify(env)).not.toContain("UNKNOWN_AMBIENT_VALUE");
        expect(input).toContain("Authorized bytes.");
        expect(input).not.toContain("MUTATED FILE");
        const schemaPath = args[args.indexOf("--output-schema") + 1];
        expect(readFileSync(schemaPath)).toEqual(snapshot.review_schema_bytes);
        return { stdout: codexOutput("gpt-5.5", VALID_RESPONSE) };
      },
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    expect(reviews).toBe(1);
    expect(readFileSync(join(fixture.outputRoot, "results.jsonl"), "utf8"))
      .toContain('"returned_model":null');
  });

  it("limits each collection invocation to sixteen physical dispatches", () => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    snapshot.calls = Array.from({ length: 17 }, (_, index) => ({
      call_id: `call-${index + 1}`,
      schedule_index: index + 1,
      prompt_id: "prompt-1",
      model: "codex-cli/gpt-5.5",
    }));
    let reviews = 0;
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: () => {
        reviews += 1;
        return { stdout: authoritativeCodexOutput(VALID_RESPONSE) };
      },
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({
      completed: 16,
      remaining: 1,
      reason: "batch_limit_reached",
    });
    expect(reviews).toBe(16);
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 17, remaining: 0 });
    expect(reviews).toBe(17);
  });

  it("isolates fake subscription auth from an unrelated ambient HOME sentinel", () => {
    const fixture = collectionExecutionFixture();
    const ambientHome = join(dirname(fixture.outputRoot), "ambient-home");
    const codexSource = join(ambientHome, ".codex", "auth.json");
    const claudeSource = join(ambientHome, ".claude", ".credentials.json");
    mkdirSync(dirname(codexSource), { recursive: true, mode: 0o700 });
    mkdirSync(dirname(claudeSource), { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(codexSource, "fake-codex-subscription-auth-only\n");
    writePrivateFixtureFile(claudeSource, "fake-claude-subscription-auth-only\n");
    writePrivateFixtureFile(join(ambientHome, "unrelated-sentinel"), "must remain invisible\n");
    let isolatedEnv;
    expect(collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      env: { HOME: ambientHome },
      authorize: () => executionSnapshot(),
      clientIsolationOptions: {
        credentialSources: { codex: codexSource, claude: claudeSource },
      },
      preflight: ({ env }) => {
        isolatedEnv = env;
        expect(JSON.stringify(env)).not.toContain(ambientHome);
        return verifiedProvenance();
      },
      runReview: (_command, _args, { env }) => {
        expect(env).toEqual(isolatedEnv);
        const probe = spawnSync("/bin/sh", ["-c", [
          "test ! -e \"$HOME/unrelated-sentinel\"",
          "test ! -e \"$CODEX_HOME/../unrelated-sentinel\"",
          "test -f \"$CODEX_HOME/auth.json\"",
          "test -f \"$HOME/.claude/.credentials.json\"",
        ].join(" && ")], { env, encoding: "utf8" });
        expect(probe.status, probe.stderr).toBe(0);
        expect(readFileSync(join(env.CODEX_HOME, "auth.json"), "utf8"))
          .toBe("fake-codex-subscription-auth-only\n");
        return { stdout: authoritativeCodexOutput(VALID_RESPONSE) };
      },
    })).toMatchObject({ completed: 1, remaining: 0 });
    expect(existsSync(join(fixture.outputRoot, "client-home"))).toBe(false);
    expect(readFileSync(join(fixture.outputRoot, "attempts.jsonl"), "utf8"))
      .not.toContain("fake-codex-subscription-auth-only");
  });

  it("blocks activation before preflight when isolated Codex auth material is unavailable", () => {
    const fixture = collectionExecutionFixture();
    const emptyAmbientHome = join(dirname(fixture.outputRoot), "empty-ambient-home");
    const snapshot = executionSnapshot();
    mkdirSync(emptyAmbientHome, { mode: 0o700 });
    let reviewCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      env: {
        HOME: emptyAmbientHome,
        LLM_REVIEW_BATCH_ACCESS_CONFIRMATION:
          writeBatchAccessConfirmation(dirname(fixture.outputRoot), snapshot.subscription_access),
      },
      authorize: () => snapshot,
      runReview: () => { reviewCalls += 1; },
    })).toThrow(/activation blocked.*isolated Codex HOME/i);
    expect(reviewCalls).toBe(0);
    expect(existsSync(join(fixture.outputRoot, "client-home"))).toBe(false);
    expect(existsSync(join(fixture.outputRoot, "collection.lock"))).toBe(false);
  });

  it("performs no output, preflight, or review side effect before complete authorization", () => {
    const fixture = collectionExecutionFixture();
    let preflightCalls = 0;
    let reviewCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => { throw new Error("not authorized"); },
      preflight: () => { preflightCalls += 1; },
      runReview: () => { reviewCalls += 1; },
    })).toThrow("not authorized");
    expect(existsSync(fixture.outputRoot)).toBe(false);
    expect(preflightCalls).toBe(0);
    expect(reviewCalls).toBe(0);

    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => undefined,
      preflight: () => { preflightCalls += 1; },
      runReview: () => { reviewCalls += 1; },
    })).toThrow("authorization snapshot");
    expect(existsSync(fixture.outputRoot)).toBe(false);
    expect(preflightCalls).toBe(0);
    expect(reviewCalls).toBe(0);
  });

  it.each([
    ["active same-host", hostname(), () => true, /active process/i],
    ["foreign-host", "foreign.example.invalid", () => false, /foreign host/i],
    ["ambiguous same-host", hostname(), () => null, /ambiguous/i],
  ])("fails closed on an %s collection lock", (_name, lockHostname, isProcessAlive, message) => {
    const fixture = collectionExecutionFixture();
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(join(fixture.outputRoot, "collection.lock"), `${JSON.stringify({
      schema_version: 1,
      hostname: lockHostname,
      pid: 101,
      acquired_at: "2026-07-18T18:00:00.000Z",
    })}\n`);
    let preflightCalls = 0;
    let reviewCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => { preflightCalls += 1; return verifiedProvenance(); },
      runReview: () => { reviewCalls += 1; },
      lockOptions: { hostname: hostname(), pid: 202, isProcessAlive },
    })).toThrow(message);
    expect(preflightCalls).toBe(0);
    expect(reviewCalls).toBe(0);
    expect(existsSync(join(fixture.outputRoot, "collection.lock"))).toBe(true);
  });

  it("recovers only a definitely-dead same-host lock and preserves a private forensic record", () => {
    const fixture = collectionExecutionFixture();
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    const staleBytes = `${JSON.stringify({
      schema_version: 1,
      hostname: hostname(),
      pid: 101,
      acquired_at: "2026-07-18T18:00:00.000Z",
    })}\n`;
    writePrivateFixtureFile(join(fixture.outputRoot, "collection.lock"), staleBytes);
    expect(collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout: authoritativeCodexOutput(VALID_RESPONSE) }),
      lockOptions: { hostname: hostname(), pid: 202, isProcessAlive: () => false },
    })).toMatchObject({ completed: 1, remaining: 0 });
    expect(existsSync(join(fixture.outputRoot, "collection.lock"))).toBe(false);
    const [forensicName] = readdirSync(fixture.outputRoot)
      .filter((name) => name.startsWith("stale-lock-"));
    const forensicPath = join(fixture.outputRoot, forensicName);
    expect(readFileSync(forensicPath, "utf8")).toBe(staleBytes);
    expect(statSync(forensicPath).mode & 0o777).toBe(0o600);
  });

  it("rechecks a ledger's private inode before every append", () => {
    const fixture = collectionExecutionFixture();
    let reviewCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => {
        const path = join(fixture.outputRoot, "attempts.jsonl");
        const bytes = readFileSync(path);
        unlinkSync(path);
        writePrivateFixtureFile(path, bytes);
        return verifiedProvenance();
      },
      runReview: () => { reviewCalls += 1; },
    })).toThrow(/ledger.*inode|identity.*append/i);
    expect(reviewCalls).toBe(0);
  });

  it.each([
    ["hard-link alias", (path, fixture) => {
      linkSync(path, join(dirname(fixture.outputRoot), "attempt-ledger-alias.jsonl"));
    }],
    ["same-inode append", (path) => {
      writeFileSync(path, Buffer.concat([readFileSync(path), Buffer.from("tamper\n")]));
    }],
    ["same-inode truncate", (path) => {
      const bytes = readFileSync(path);
      writeFileSync(path, bytes.subarray(0, Math.max(0, bytes.length - 1)));
    }],
  ])("rejects a ledger %s before the next append", (_name, mutate) => {
    const fixture = collectionExecutionFixture();
    let reviewCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => {
        mutate(join(fixture.outputRoot, "attempts.jsonl"), fixture);
        return verifiedProvenance();
      },
      runReview: () => { reviewCalls += 1; throw new Error("must not run"); },
    })).toThrow(/ledger|link|size|content|digest|identity/i);
    expect(reviewCalls).toBe(0);
  });

  it("requires the output root and resume ledgers to remain private", () => {
    const insecure = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    mkdirSync(insecure.outputRoot, { recursive: true, mode: 0o755 });
    chmodSync(insecure.outputRoot, 0o755);
    expect(() => collectSubscriptionSchedule({
      ...insecure,
      env: {
        ...insecure.env,
        LLM_REVIEW_BATCH_ACCESS_CONFIRMATION:
          writeBatchAccessConfirmation(dirname(insecure.outputRoot), snapshot.subscription_access),
      },
      authorize: () => snapshot,
    })).toThrow(/output root.*0700|private/i);

    const fixture = collectionExecutionFixture();
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout: authoritativeCodexOutput(VALID_RESPONSE) }),
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1 });
    chmodSync(join(fixture.outputRoot, "attempts.jsonl"), 0o644);
    expect(() => collectSubscriptionSchedule(options)).toThrow(/attempts\.jsonl|0600|private/i);
  });

  it.each([
    ["missing prompt", (snapshot) => { snapshot.calls[0].prompt_id = "not-in-map"; }],
    ["noncontiguous schedule", (snapshot) => { snapshot.calls[0].schedule_index = 2; }],
  ])("rejects an execution snapshot with %s before output or preflight", (_name, mutate) => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    mutate(snapshot);
    let preflightCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => { preflightCalls += 1; },
      runReview: () => { throw new Error("must not run"); },
    })).toThrow("authorization snapshot");
    expect(existsSync(fixture.outputRoot)).toBe(false);
    expect(preflightCalls).toBe(0);
  });

  it("rejects a structurally valid result that has no corresponding completed attempt", () => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(join(fixture.outputRoot, "results.jsonl"), toJsonl([
      { record_type: "run_binding", run_binding: snapshot.run_binding },
      {
        call_id: "call-1",
        schedule_index: 1,
        system: "codex-cli/gpt-5.5",
        status: "valid",
        response: VALID_RESPONSE,
        returned_model: null,
        model_identity_status: "requested_pinned_client_no_reroute_observable",
        tool_deviation: false,
        usage: null,
        raw_output_sha256: "a".repeat(64),
        response_sha256: canonicalSha256(VALID_RESPONSE),
      },
    ]));
    let preflightCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => { preflightCalls += 1; },
      runReview: () => { throw new Error("must not run"); },
    })).toThrow(/ledger|attempt/i);
    expect(preflightCalls).toBe(0);
  });

  it("rejects returned-model drift already present in a resume ledger", () => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    snapshot.calls[0].model = "claude-code/sonnet";
    snapshot.calls.push({
      call_id: "call-2",
      schedule_index: 2,
      prompt_id: "prompt-1",
      model: "claude-code/sonnet",
    });
    const completedAttempt = (callId, scheduleIndex, model, minute) => [
      {
        call_id: callId,
        schedule_index: scheduleIndex,
        event: "started",
        started_at: `2026-07-18T18:${String(minute).padStart(2, "0")}:00.000Z`,
        system: "claude-code/sonnet",
        provenance: verifiedProvenance(),
      },
      {
        call_id: callId,
        schedule_index: scheduleIndex,
        event: "completed",
        finished_at: `2026-07-18T18:${String(minute).padStart(2, "0")}:30.000Z`,
        system: "claude-code/sonnet",
        response: VALID_RESPONSE,
        returned_model: model,
        model_identity_status: "observed_singleton_model_usage",
        tool_deviation: false,
        usage: null,
        raw_output_sha256: "a".repeat(64),
        response_sha256: canonicalSha256(VALID_RESPONSE),
      },
    ];
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(join(fixture.outputRoot, "attempts.jsonl"), toJsonl([
      { record_type: "run_binding", run_binding: snapshot.run_binding },
      ...completedAttempt("call-1", 1, "claude-sonnet-4-6", 0),
      ...completedAttempt("call-2", 2, "claude-sonnet-5-0", 1),
    ]));
    let preflightCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => { preflightCalls += 1; },
      runReview: () => { throw new Error("must not run"); },
    })).toThrow(/model drift/i);
    expect(preflightCalls).toBe(0);
  });

  it("recovers one fsynced interrupted attempt and retries it exactly once", () => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    const provenance = verifiedProvenance();
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(join(fixture.outputRoot, "attempts.jsonl"), toJsonl([
      { record_type: "run_binding", run_binding: snapshot.run_binding },
      {
        call_id: "call-1",
        schedule_index: 1,
        event: "started",
        started_at: "2026-07-18T18:00:00.000Z",
        system: "codex-cli/gpt-5.5",
        provenance,
      },
    ]));
    let preflightCalls = 0;
    let reviewCalls = 0;
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => { preflightCalls += 1; return provenance; },
      runReview: () => {
        reviewCalls += 1;
        return { stdout: authoritativeCodexOutput(VALID_RESPONSE) };
      },
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    expect(preflightCalls).toBe(2);
    expect(reviewCalls).toBe(1);
    const attemptRows = readJsonl(join(fixture.outputRoot, "attempts.jsonl"))
      .filter(({ record_type: type }) => type !== "run_binding");
    expect(attemptRows.map(({ event, reason }) => [event, reason ?? null])).toEqual([
      ["started", null],
      ["suspended", "interrupted_process"],
      ["started", null],
      ["completed", null],
    ]);
  });

  it("materializes a valid result from its unique fsynced terminal without another provider call", () => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    const responseSha256 = canonicalSha256(VALID_RESPONSE);
    const rawBytes = Buffer.from("manual valid provider envelope");
    const rawDigest = sha256(rawBytes);
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(join(fixture.outputRoot, "attempts.jsonl"), toJsonl([
      { record_type: "run_binding", run_binding: snapshot.run_binding },
      {
        call_id: "call-1",
        schedule_index: 1,
        event: "started",
        started_at: "2026-07-18T18:00:00.000Z",
        system: "codex-cli/gpt-5.5",
        provenance: verifiedProvenance(),
      },
      {
        call_id: "call-1",
        schedule_index: 1,
        event: "completed",
        finished_at: "2026-07-18T18:00:01.000Z",
        system: "codex-cli/gpt-5.5",
        response: VALID_RESPONSE,
        returned_model: null,
        model_identity_status: "requested_pinned_client_no_reroute_observable",
        tool_deviation: false,
        usage: null,
        raw_output_sha256: rawDigest,
        response_sha256: responseSha256,
      },
    ]));
    const rawRoot = join(fixture.outputRoot, "raw-provider-envelopes");
    mkdirSync(rawRoot, { mode: 0o700 });
    writePrivateFixtureFile(
      join(rawRoot, `${sha256("call-1")}-${rawDigest}.bin`),
      rawBytes,
    );
    let reviewCalls = 0;
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: () => { reviewCalls += 1; throw new Error("must not run"); },
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    expect(reviewCalls).toBe(0);
    expect(resultRows(fixture.outputRoot)).toEqual([expect.objectContaining({
      call_id: "call-1",
      status: "valid",
      raw_output_sha256: rawDigest,
      response_sha256: responseSha256,
    })]);
  });

  it("materializes an abstention from its unique fsynced invalid-schema terminal", () => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    const rawBytes = Buffer.from("manual invalid provider envelope");
    const rawDigest = sha256(rawBytes);
    writePrivateFixtureFile(join(fixture.outputRoot, "attempts.jsonl"), toJsonl([
      { record_type: "run_binding", run_binding: snapshot.run_binding },
      {
        call_id: "call-1",
        schedule_index: 1,
        event: "started",
        started_at: "2026-07-18T18:00:00.000Z",
        system: "codex-cli/gpt-5.5",
        provenance: verifiedProvenance(),
      },
      {
        call_id: "call-1",
        schedule_index: 1,
        event: "completed",
        finished_at: "2026-07-18T18:00:01.000Z",
        reason: "schema_invalid",
        error_sha256: sha256("Invalid review response"),
        system: "codex-cli/gpt-5.5",
        returned_model: null,
        model_identity_status: "requested_pinned_client_no_reroute_observable",
        raw_output_sha256: rawDigest,
      },
    ]));
    const rawRoot = join(fixture.outputRoot, "raw-provider-envelopes");
    mkdirSync(rawRoot, { mode: 0o700 });
    writeFileSync(
      join(rawRoot, `${sha256("call-1")}-${rawDigest}.bin`),
      rawBytes,
      { mode: 0o600 },
    );
    let reviewCalls = 0;
    const result = collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: () => { reviewCalls += 1; throw new Error("must not run"); },
    });
    expect(result).toMatchObject({ completed: 1, remaining: 0 });
    expect(reviewCalls).toBe(0);
    expect(resultRows(fixture.outputRoot)).toEqual([{
      call_id: "call-1",
      schedule_index: 1,
      system: "codex-cli/gpt-5.5",
      status: "abstain",
      reason: "schema_invalid",
      raw_output_sha256: rawDigest,
    }]);
  });

  it.each([
    ["valid", () => ({
      call_id: "call-1",
      schedule_index: 1,
      event: "completed",
      finished_at: "2026-07-18T18:00:01.000Z",
      system: "codex-cli/gpt-5.5",
      response: VALID_RESPONSE,
      returned_model: null,
      model_identity_status: "requested_pinned_client_no_reroute_observable",
      tool_deviation: false,
      usage: null,
      raw_output_sha256: "a".repeat(64),
      response_sha256: canonicalSha256(VALID_RESPONSE),
    })],
    ["schema-invalid", (rawDigest) => ({
      call_id: "call-1",
      schedule_index: 1,
      event: "completed",
      finished_at: "2026-07-18T18:00:01.000Z",
      reason: "schema_invalid",
      error_sha256: sha256("Invalid review response"),
      system: "codex-cli/gpt-5.5",
      returned_model: null,
      model_identity_status: "requested_pinned_client_no_reroute_observable",
      raw_output_sha256: rawDigest,
    })],
  ])("rejects a later start and suspension after a consuming %s terminal", (_kind, terminalRow) => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    const rawBytes = Buffer.from("invalid response retained for the terminal fixture");
    const rawDigest = sha256(rawBytes);
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(join(fixture.outputRoot, "attempts.jsonl"), toJsonl([
      { record_type: "run_binding", run_binding: snapshot.run_binding },
      {
        call_id: "call-1",
        schedule_index: 1,
        event: "started",
        started_at: "2026-07-18T18:00:00.000Z",
        system: "codex-cli/gpt-5.5",
        provenance: verifiedProvenance(),
      },
      terminalRow(rawDigest),
      {
        call_id: "call-1",
        schedule_index: 1,
        event: "started",
        started_at: "2026-07-18T18:01:00.000Z",
        system: "codex-cli/gpt-5.5",
        provenance: verifiedProvenance(),
      },
      {
        call_id: "call-1",
        schedule_index: 1,
        system: "codex-cli/gpt-5.5",
        event: "suspended",
        finished_at: "2026-07-18T18:01:01.000Z",
        reason: "rate_limit",
        error_sha256: sha256("rate limit"),
        raw_output_sha256: null,
      },
    ]));
    const rawRoot = join(fixture.outputRoot, "raw-provider-envelopes");
    mkdirSync(rawRoot, { mode: 0o700 });
    writePrivateFixtureFile(
      join(rawRoot, `${sha256("call-1")}-${rawDigest}.bin`),
      rawBytes,
    );
    let preflightCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => { preflightCalls += 1; return verifiedProvenance(); },
      runReview: () => { throw new Error("must not run"); },
    })).toThrow(/consuming terminal|terminal.*start|start.*terminal/i);
    expect(preflightCalls).toBe(0);
  });

  it.each([
    ["missing field", (provenance) => { delete provenance.codex_auth; }],
    ["executable hash", (provenance) => { provenance.codex_executable_sha256 = "f".repeat(64); }],
    ["isolation", (provenance) => { provenance.claude_isolation.safe_mode = false; }],
  ])("rejects existing started-row provenance drift: %s", (_name, mutate) => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    const provenance = verifiedProvenance();
    mutate(provenance);
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(join(fixture.outputRoot, "attempts.jsonl"), toJsonl([
      { record_type: "run_binding", run_binding: snapshot.run_binding },
      {
        call_id: "call-1",
        schedule_index: 1,
        event: "started",
        started_at: "2026-07-18T18:00:00.000Z",
        system: "codex-cli/gpt-5.5",
        provenance,
      },
    ]));
    let preflightCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => { preflightCalls += 1; return verifiedProvenance(); },
      runReview: () => { throw new Error("must not run"); },
    })).toThrow(/provenance/i);
    expect(preflightCalls).toBe(0);
  });

  it.each([
    ["byte drift", (path) => { writeFileSync(path, '{"mutated":true}\n'); }],
    ["same-byte inode substitution", (path, bytes) => { unlinkSync(path); writeFileSync(path, bytes); }],
  ])("rejects authorized review-schema %s immediately before the child call", (_name, mutate) => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    let reviewCalls = 0;
    const result = collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => {
        mutate(join(fixture.outputRoot, "authorized-review-schema.json"), snapshot.review_schema_bytes);
        return verifiedProvenance();
      },
      runReview: () => { reviewCalls += 1; throw new Error("must not run"); },
    });
    expect(result).toMatchObject({ completed: 0, reason: "authorized_schema_drift" });
    expect(reviewCalls).toBe(0);
    expect(resultRows(fixture.outputRoot)).toEqual([]);
  });

  it("rejects a preexisting authorized schema with non-private permissions", () => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    const schemaPath = join(fixture.outputRoot, "authorized-review-schema.json");
    writeFileSync(schemaPath, snapshot.review_schema_bytes);
    chmodSync(schemaPath, 0o644);
    let preflightCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => { preflightCalls += 1; return verifiedProvenance(); },
      runReview: () => { throw new Error("must not run"); },
    })).toThrow(/schema|private|snapshot|changed/i);
    expect(preflightCalls).toBe(0);
  });

  it("requires the isolated client working directory to remain actually empty", () => {
    const fixture = collectionExecutionFixture();
    let reviewCalls = 0;
    const result = collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => {
        writeFileSync(join(fixture.outputRoot, "empty", "unexpected.txt"), "not empty\n");
        return verifiedProvenance();
      },
      runReview: () => { reviewCalls += 1; throw new Error("must not run"); },
    });
    expect(result).toMatchObject({ completed: 0, reason: "client_isolation_drift" });
    expect(reviewCalls).toBe(0);
    expect(resultRows(fixture.outputRoot)).toEqual([]);
  });

  it("rejects executable byte drift immediately before the child call", () => {
    const fixture = collectionExecutionFixture();
    const outputs = new Map([
      ["/opt/codex-0.137.0 --version", "codex-cli 0.137.0\n"],
      ["/opt/codex-0.137.0 --ask-for-approval never exec --help", "--ephemeral --ignore-user-config --ignore-rules --json --output-schema --config"],
      ["/opt/codex-0.137.0 sandbox --help", "--permissions-profile --include-managed-config --cd"],
      ["/opt/codex-0.137.0 login status", "Logged in using ChatGPT\n"],
      ["/opt/claude-2.1.211 --version", "2.1.211 (Claude Code)\n"],
      ["/opt/claude-2.1.211 --help", "--safe-mode --setting-sources --strict-mcp-config --mcp-config --disable-slash-commands --no-chrome --output-format --json-schema"],
      ["/opt/claude-2.1.211 auth status", JSON.stringify({
        loggedIn: true,
        authMethod: "claude.ai",
        subscriptionType: "max",
        email: "tom@example.test",
        orgId: "org-fixture",
      })],
    ]);
    const codexAuthSource = join(fixture.env.HOME, ".codex", "auth.json");
    mkdirSync(dirname(codexAuthSource), { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(
      codexAuthSource,
      JSON.stringify({ tokens: { account_id: CODEX_ACCOUNT_ID } }),
    );
    let inspections = 0;
    const inspectExecutable = (path) => {
      inspections += 1;
      if (path.includes("codex") && inspections > 2) {
        return { realpath: "/opt/codex-0.137.0", sha256: "f".repeat(64) };
      }
      return path.includes("codex")
        ? { realpath: "/opt/codex-0.137.0", sha256: "2e0cccea4a81dd7bf2c155950dab9a6c6ed9a02569d8ff07a68b7afedc1be21d" }
        : { realpath: "/opt/claude-2.1.211", sha256: "5a728a76198b6eca7f3c7cdbff43bab44b77b48c2108f7a3107d889773382629" };
    };
    let reviewCalls = 0;
    const result = collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      env: fixture.env,
      authorize: () => executionSnapshot(),
      clientIsolationOptions: {
        credentialSources: { codex: codexAuthSource, claude: null },
      },
      preflight: (options) => preflightSubscriptionClients({
        ...options,
        inspectExecutable,
        run: (command, args) => ({
          stdout: args[0] === "sandbox" && args[1] !== "--help"
            ? "study-minimal-sandbox-ok\n"
            : outputs.get(`${command} ${args.join(" ")}`),
        }),
      }),
      runReview: () => { reviewCalls += 1; throw new Error("must not run"); },
    });
    expect(result).toMatchObject({ completed: 0, reason: "client_executable_drift" });
    expect(reviewCalls).toBe(0);
    expect(resultRows(fixture.outputRoot)).toEqual([]);
  });

  it("keeps rate-limit suspensions out of the final result ledger", () => {
    const fixture = collectionExecutionFixture();
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => verifiedProvenance(),
      runReview: () => { throw new Error("usage limit"); },
    };
    for (let resume = 0; resume < 4; resume += 1) {
      expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 0, reason: "rate_limit" });
    }
    expect(resultRows(fixture.outputRoot)).toEqual([]);
  });

  it("persists only a digest of client error text", () => {
    const fixture = collectionExecutionFixture();
    const secretMarker = "client-secret-marker-must-not-be-persisted";
    const result = collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => verifiedProvenance(),
      runReview: () => { throw new Error(`client failed: ${secretMarker}`); },
    });
    expect(result).toMatchObject({ completed: 0, reason: "client_failure" });
    const text = readFileSync(join(fixture.outputRoot, "attempts.jsonl"), "utf8");
    expect(text).not.toContain(secretMarker);
    const [suspended] = readJsonl(join(fixture.outputRoot, "attempts.jsonl"))
      .filter(({ event }) => event === "suspended");
    expect(suspended).toEqual(expect.objectContaining({
      reason: "client_failure",
      error_sha256: sha256(`client failed: ${secretMarker}`),
    }));
    expect(suspended).not.toHaveProperty("error");
  });

  it("writes resume-valid terminal timestamps when a failure occurs in the start millisecond", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-18T18:00:00.000Z"));
    try {
      const fixture = collectionExecutionFixture();
      const options = {
        ...fixture,
        codexBin: "/opt/codex",
        claudeBin: "/opt/claude",
        authorize: () => executionSnapshot(),
        preflight: () => verifiedProvenance(),
        runReview: () => { throw new Error("usage limit"); },
      };
      expect(collectSubscriptionSchedule(options)).toMatchObject({ reason: "rate_limit" });
      expect(collectSubscriptionSchedule(options)).toMatchObject({ reason: "rate_limit" });
      const rows = readJsonl(join(fixture.outputRoot, "attempts.jsonl"))
        .filter(({ record_type: type }) => type !== "run_binding");
      expect(rows[1].finished_at).toBe("2026-07-18T18:00:00.001Z");
      expect(rows[3].finished_at).toBe("2026-07-18T18:00:00.001Z");
    } finally {
      vi.useRealTimers();
    }
  });

  it("suspends rather than accepting a response with missing model identity", () => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    snapshot.calls[0].model = "claude-code/sonnet";
    const result = collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout: JSON.stringify({ structured_output: VALID_RESPONSE }) }),
    });
    expect(result).toMatchObject({ completed: 0, reason: "model_identity_missing" });
    expect(resultRows(fixture.outputRoot)).toEqual([]);
    expect(readFileSync(join(fixture.outputRoot, "attempts.jsonl"), "utf8"))
      .toContain('"reason":"model_identity_missing"');
  });

  it.each([
    ["codex-cli/gpt-5.5", "not-gpt-5.5"],
    ["claude-code/sonnet", "not-sonnet"],
  ])("rejects a substring-only returned model identity for %s", (system, returnedModel) => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    snapshot.calls[0].model = system;
    const stdout = system.startsWith("codex")
      ? codexOutput(returnedModel, VALID_RESPONSE)
      : JSON.stringify({ structured_output: VALID_RESPONSE, modelUsage: { [returnedModel]: {} } });
    expect(collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout }),
    })).toMatchObject({ completed: 0, reason: "model_drift" });
  });

  it("checks returned-model drift before durably classifying an invalid response", () => {
    const fixture = collectionExecutionFixture();
    const invalidResponse = { verdict: "allow" };
    const result = collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout: codexOutput("not-gpt-5.5", invalidResponse) }),
    });
    expect(result).toMatchObject({ completed: 0, reason: "model_drift" });
    expect(resultRows(fixture.outputRoot)).toEqual([]);
  });

  it("binds both resume ledgers to the exact authorization snapshot", () => {
    const fixture = collectionExecutionFixture();
    const first = executionSnapshot();
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout: codexOutput("gpt-5.5", VALID_RESPONSE) }),
    };
    expect(collectSubscriptionSchedule({ ...options, authorize: () => first }))
      .toMatchObject({ completed: 1, remaining: 0 });
    for (const name of ["attempts.jsonl", "results.jsonl"]) {
      expect(readJsonl(join(fixture.outputRoot, name))[0]).toEqual({
        record_type: "run_binding",
        run_binding: first.run_binding,
      });
    }

    const changed = executionSnapshot();
    changed.run_binding = makeRunBinding({ content_commit: "b".repeat(40) });
    expect(() => collectSubscriptionSchedule({ ...options, authorize: () => changed }))
      .toThrow("run binding");
  });

  it.each([
    ["response bytes", (row) => { row.response.evidence = "Tampered response."; }],
    ["response bytes and its recomputed digest", (row) => {
      row.response.evidence = "Tampered response.";
      row.response_sha256 = canonicalSha256(row.response);
    }],
    ["raw provider-envelope digest", (row) => { row.raw_output_sha256 = "f".repeat(64); }],
  ])("rejects cross-ledger valid-result tampering: %s", (_name, mutate) => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout: authoritativeCodexOutput(VALID_RESPONSE) }),
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    const resultPath = join(fixture.outputRoot, "results.jsonl");
    const rows = readJsonl(resultPath);
    mutate(rows[1]);
    writeFileSync(resultPath, toJsonl(rows));
    let preflightCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...options,
      preflight: () => { preflightCalls += 1; return verifiedProvenance(); },
      runReview: () => { throw new Error("must not run"); },
    })).toThrow(/digest|attempt/i);
    expect(preflightCalls).toBe(0);
  });

  it("binds an invalid-schema abstention to the matching raw provider envelope", () => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    const rawEnvelope = authoritativeCodexOutput({ verdict: "allow" });
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout: rawEnvelope }),
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    const rawRoot = join(fixture.outputRoot, "raw-provider-envelopes");
    const [rawName] = readdirSync(rawRoot);
    expect(rawName).toBe(`${sha256("call-1")}-${sha256(rawEnvelope)}.bin`);
    expect(readFileSync(join(rawRoot, rawName))).toEqual(Buffer.from(rawEnvelope));
    expect(statSync(rawRoot).mode & 0o777).toBe(0o700);
    expect(statSync(join(rawRoot, rawName)).mode & 0o777).toBe(0o600);
    const resultPath = join(fixture.outputRoot, "results.jsonl");
    const rows = readJsonl(resultPath);
    rows[1].raw_output_sha256 = "f".repeat(64);
    writeFileSync(resultPath, toJsonl(rows));
    expect(() => collectSubscriptionSchedule(options)).toThrow(/abstention|attempt/i);
  });

  it("rejects private raw provider-envelope byte or permission drift on resume", () => {
    const fixture = collectionExecutionFixture();
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout: authoritativeCodexOutput({ verdict: "allow" }) }),
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({ completed: 1, remaining: 0 });
    const rawRoot = join(fixture.outputRoot, "raw-provider-envelopes");
    const rawPath = join(rawRoot, readdirSync(rawRoot)[0]);
    writeFileSync(rawPath, "tampered private provider bytes");
    let preflightCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...options,
      preflight: () => { preflightCalls += 1; return verifiedProvenance(); },
    })).toThrow(/raw provider-envelope archive|digest drift/i);
    expect(preflightCalls).toBe(0);
  });

  it("rejects an orphaned private provider envelope before preflight", () => {
    const fixture = collectionExecutionFixture();
    const rawRoot = join(fixture.outputRoot, "raw-provider-envelopes");
    mkdirSync(rawRoot, { recursive: true, mode: 0o700 });
    const bytes = Buffer.from("orphaned provider envelope");
    writePrivateFixtureFile(
      join(rawRoot, `${sha256("call-1")}-${sha256(bytes)}.bin`),
      bytes,
    );
    let preflightCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => { preflightCalls += 1; return verifiedProvenance(); },
      runReview: () => { throw new Error("must not run"); },
    })).toThrow(/raw provider-envelope archive.*orphan/i);
    expect(preflightCalls).toBe(0);
  });

  it.each([
    ["attempts.jsonl", { event: "suspended", call_id: "unknown", reason: "rate_limit" }],
    ["results.jsonl", { call_id: "unknown", status: "valid", response: VALID_RESPONSE }],
  ])("validates every existing %s row before preflight or use", (ledgerName, forgedRow) => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    writePrivateFixtureFile(join(fixture.outputRoot, ledgerName), toJsonl([
      { record_type: "run_binding", run_binding: snapshot.run_binding },
      forgedRow,
    ]));
    let preflightCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => { preflightCalls += 1; },
      runReview: () => { throw new Error("must not run"); },
    })).toThrow(/ledger|call/i);
    expect(preflightCalls).toBe(0);
  });

  it.each([
    ["authorized-review-schema.json", "file"],
    ["attempts.jsonl", "file"],
    ["results.jsonl", "file"],
    ["empty", "dir"],
  ])("refuses a symbolic-link output target for %s", (name, type) => {
    const fixture = collectionExecutionFixture();
    const outside = join(dirname(fixture.outputRoot), `outside-${name.replaceAll("/", "-")}`);
    mkdirSync(fixture.outputRoot, { recursive: true, mode: 0o700 });
    if (type === "dir") mkdirSync(outside, { recursive: true });
    else writeFileSync(outside, "do not overwrite\n");
    symlinkSync(outside, join(fixture.outputRoot, name), type);
    let reviewCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => verifiedProvenance(),
      runReview: () => { reviewCalls += 1; },
    })).toThrow(/symbolic|regular|output|ledger|schema/i);
    expect(reviewCalls).toBe(0);
    if (type === "file") expect(readFileSync(outside, "utf8")).toBe("do not overwrite\n");
  });

  it("suspends when a returned model identity changes between calls", () => {
    const fixture = collectionExecutionFixture();
    const request = defaultRequest();
    const snapshot = {
      queue_id: CONFIRMATORY_QUEUE_ID,
      subscription_access: subscriptionAccessFixture().access,
      run_binding: makeRunBinding(),
      review_schema_bytes: Buffer.from('{"type":"object"}\n'),
      prompts: new Map([["p1", request], ["p2", request]]),
      calls: [
        { call_id: "c1", schedule_index: 1, prompt_id: "p1", model: "claude-code/sonnet" },
        { call_id: "c2", schedule_index: 2, prompt_id: "p2", model: "claude-code/sonnet" },
      ],
    };
    let index = 0;
    const options = {
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: () => ({ stdout: JSON.stringify({
        structured_output: VALID_RESPONSE,
        modelUsage: { [index++ === 0 ? "claude-sonnet-4-6" : "claude-sonnet-5-0"]: {} },
      }) }),
    };
    expect(collectSubscriptionSchedule(options)).toMatchObject({
      completed: 1, suspended_call_id: "c2", reason: "model_drift",
    });
    expect(readFileSync(join(fixture.outputRoot, "results.jsonl"), "utf8"))
      .not.toContain('"call_id":"c2"');
  });

  it("ships the detached records fail-closed", () => {
    const study = JSON.parse(readFileSync(join(import.meta.dirname, "study.json"), "utf8"));
    const contentFreeze = JSON.parse(readFileSync(
      join(import.meta.dirname, "registration-content-freeze.json"), "utf8",
    ));
    const executionAuthorization = JSON.parse(readFileSync(
      join(import.meta.dirname, "execution-authorization.json"), "utf8",
    ));
    expect(study.frozen).toBe(true);
    expect(contentFreeze).toMatchObject({
      schema_version: 3,
      status: "unfrozen",
      outcome_calls_authorized: false,
    });
    expect(executionAuthorization).toMatchObject({
      schema_version: 5,
      status: "unauthorized-registration-pending",
      outcome_calls_authorized: false,
      authorized_queues: [],
      subscription_access: {
        schema_version: 1,
        confirmed: false,
      },
    });
  });

  it("keeps the checked-in pending authorization template isomorphic to an accepted record", () => {
    const template = JSON.parse(readFileSync(
      join(import.meta.dirname, "execution-authorization.json"),
      "utf8",
    ));
    const records = authorizationRecords();
    const populated = clone(template);
    for (const key of Object.keys(records.executionAuthorization)) {
      if (key !== "rule") populated[key] = clone(records.executionAuthorization[key]);
    }
    expect(Object.keys(template).sort()).toEqual(Object.keys(records.executionAuthorization).sort());
    expect(template.osf_registration).not.toHaveProperty("registered_files");
    expect(Object.keys(template.osf_registration.download_evidence).sort()).toEqual([
      "downloaded_files",
      "provider_file_list_pages",
      "providers_list",
      "registration_record",
      "verified_at",
      "verified_by",
    ]);
    records.executionAuthorization = populated;
    expect(assertExecutionAuthorization(records).queue_id).toBe(CONFIRMATORY_QUEUE_ID);
  });

  it("verifies the exact phase-one package while phase two remains unauthorized", () => {
    const fixture = authorizedArtifactFixture();
    writeFileSync(fixture.authorizationPath, `${JSON.stringify({
      schema_version: 3,
      study_id: "llm-review-sequences-v0",
      status: "unauthorized-registration-pending",
      outcome_calls_authorized: false,
    }, null, 2)}\n`);

    expect(verifyPhaseOneArtifacts(fixture)).toMatchObject({
      status: "verified-phase-one",
      study_id: "llm-review-sequences-v0",
      branch: "confirmatory-only",
      queue_id: CONFIRMATORY_QUEUE_ID,
      outcome_calls_authorized: false,
      review_attestations: REVIEW_ROLES.map((role) => ({ role })),
      counts: {
        sequence_system_trials: 80,
        review_boundaries: 160,
        review_boundaries_by_system: {
          "codex-cli/gpt-5.5": 80,
          "claude-code/sonnet": 80,
        },
        review_boundaries_by_decomposition: { atomic: 40, split: 120 },
      },
    });
  });

  it("exposes phase-one verification as a no-provider CLI command", () => {
    const fixture = authorizedArtifactFixture();
    writeFileSync(fixture.authorizationPath, "not phase-two authorization\n");
    const result = spawnSync(process.execPath, [
      join(import.meta.dirname, "subscription-runner.mjs"),
      "--verify-phase-one",
      fixture.repositoryRoot,
      fixture.benchmarkRoot,
      fixture.collectionRoot,
    ], { encoding: "utf8" });

    expect(result.status, result.stderr).toBe(0);
    expect(JSON.parse(result.stdout)).toMatchObject({
      status: "verified-phase-one",
      content_commit: expect.stringMatching(/^[a-f0-9]{40}$/u),
      outcome_calls_authorized: false,
    });
  });

  it.each([
    ["phase-one verification with two operands", (root, output) => [
      "--verify-phase-one", root, output,
    ]],
    ["preflight with an extra operand", (root) => ["--preflight", root]],
    ["an unknown leading option", (root, output) => ["--unknown", root, output]],
  ])("usage-fails %s before output or provider dispatch", (_name, cliArgs) => {
    const root = mkdtempSync(join(tmpdir(), "subscription-cli-dispatch-"));
    const output = join(root, "must-not-exist");
    const providerMarker = join(root, "provider-invoked");
    const provider = join(root, "provider-stub");
    writeFileSync(provider, [
      "#!/bin/sh",
      `printf invoked >> ${JSON.stringify(providerMarker)}`,
      "printf '0.137.0\\n'",
      "",
    ].join("\n"));
    chmodSync(provider, 0o755);

    const result = spawnSync(process.execPath, [
      join(import.meta.dirname, "subscription-runner.mjs"),
      ...cliArgs(root, output),
    ], {
      encoding: "utf8",
      env: {
        ...process.env,
        CODEX_SUBSCRIPTION_BIN: provider,
        CLAUDE_SUBSCRIPTION_BIN: provider,
      },
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/^Usage:/u);
    expect(existsSync(output)).toBe(false);
    expect(existsSync(providerMarker)).toBe(false);
  });

  it.each([
    ["missing role", (record) => { record.review_attestations.pop(); }, /exact.*review role/i],
    ["duplicate role", (record) => { record.review_attestations[1].role = "methods"; }, /exact.*review role/i],
    ["reviewed commit drift", (record) => { record.review_attestations[0].reviewed_commit = "f".repeat(40); }, /reviewed commit/i],
    ["report hash drift", (record) => { record.review_attestations[0].sha256 = "f".repeat(64); }, /report hash/i],
    ["unapproved disposition", (record) => { record.review_attestations[0].disposition = "do-not-approve"; }, /disposition/i],
    ["unsafe report path", (record) => { record.review_attestations[0].report_file = "../methods.md"; }, /report file|safe relative/i],
    ["unresolved blocker", (record) => { record.review_attestations[0].unresolved_blockers.push("P1"); }, /unresolved blocker/i],
  ])("rejects phase-one review attestation %s", (_name, mutate, message) => {
    const fixture = authorizedArtifactFixture();
    rewritePhaseOneRecord(fixture, mutate);
    expect(() => verifyPhaseOneArtifacts(fixture)).toThrow(message);
  });

  it("hashes the detached review report bytes instead of trusting their attestation", () => {
    const fixture = authorizedArtifactFixture();
    writeFileSync(join(fixture.recordsRoot, "reviews/phase-one-methods.md"), "mutated report\n");
    expect(() => verifyPhaseOneArtifacts(fixture)).toThrow(/review report hash/i);
  });

  it.each([
    ["role", (text) => text.replace("role: methods", "role: safety")],
    ["reviewed commit", (text) => text.replace(
      /^reviewed_commit: [a-f0-9]{40}$/mu,
      `reviewed_commit: ${"f".repeat(40)}`,
    )],
    ["disposition", (text) => text.replace(
      "disposition: approve-with-documented-limitations",
      "disposition: approve",
    )],
    ["blocker", (text) => text.replace("unresolved_blockers: []", "unresolved_blockers: [P1]")],
    ["missing front matter", (text) => text.slice(text.indexOf("# "))],
    ["malformed front matter", (text) => text.replace(
      "phase_one_review_schema: 1",
      "phase_one_review_schema: one",
    )],
  ])("rejects review-report %s contradiction after its hash is rebound", (_name, mutate) => {
    const records = authorizationRecords();
    rewriteReviewReportSnapshot(records, "methods", mutate);
    expect(() => assertExecutionAuthorization(records)).toThrow(/front matter|metadata/i);
  });

  it("requires a distinct detached report for every review role", () => {
    const fixture = authorizedArtifactFixture();
    rewritePhaseOneRecord(fixture, (record) => {
      record.review_attestations[1].report_file = record.review_attestations[0].report_file;
    });
    expect(() => verifyPhaseOneArtifacts(fixture)).toThrow(/distinct report/i);
  });

  it("requires review roles to use distinct physical files, not hard links", () => {
    const fixture = authorizedArtifactFixture();
    const methodsFile = "reviews/phase-one-methods.md";
    const hardlinkFile = "reviews/phase-one-safety-hardlink.md";
    linkSync(join(fixture.recordsRoot, methodsFile), join(fixture.recordsRoot, hardlinkFile));
    rewritePhaseOneRecord(fixture, (record) => {
      const methods = record.review_attestations.find(({ role }) => role === "methods");
      const safety = record.review_attestations.find(({ role }) => role === "safety");
      safety.report_file = hardlinkFile;
      safety.sha256 = methods.sha256;
    });
    expect(() => verifyPhaseOneArtifacts(fixture)).toThrow(/distinct physical review report/i);
  });

  it("rejects case-alias reuse of a review report where the filesystem supports it", () => {
    const fixture = authorizedArtifactFixture();
    const caseAliasFile = "reviews/PHASE-ONE-METHODS.md";
    if (!existsSync(join(fixture.recordsRoot, caseAliasFile))) return;
    rewritePhaseOneRecord(fixture, (record) => {
      const methods = record.review_attestations.find(({ role }) => role === "methods");
      const safety = record.review_attestations.find(({ role }) => role === "safety");
      safety.report_file = caseAliasFile;
      safety.sha256 = methods.sha256;
    });
    expect(() => verifyPhaseOneArtifacts(fixture)).toThrow(/distinct physical review report/i);
  });

  it("rejects a symbolic-link detached review report", () => {
    const fixture = authorizedArtifactFixture();
    const reportPath = join(fixture.recordsRoot, "reviews/phase-one-safety.md");
    const target = join(fixture.recordsRoot, "outside-review.md");
    writeFileSync(target, "replacement review\n");
    unlinkSync(reportPath);
    symlinkSync(target, reportPath, "file");
    expect(() => verifyPhaseOneArtifacts(fixture)).toThrow(/review report|symbolic|regular/i);
  });

  it.each([
    ["authorization flag", (record) => { record.outcome_calls_authorized = true; }, /phase-one|authorize/i],
    ["schema", (record) => { record.schema_version = 2; }, /schema/i],
    ["study identity", (record) => { record.study_id = "other-study"; }, /study identity/i],
    ["freeze timestamp", (record) => { record.frozen_at = "2026-07-18T17:00:00+00:00"; }, /timestamp/i],
    ["branch", (record) => { record.branch = "confirmatory-plus-ollama-exploratory"; }, /confirmatory-only/i],
    ["queue count", (record) => { record.queues[0].counts.review_boundaries += 1; }, /count/i],
    ["normalized artifact", (record) => { record.queues[0].artifacts.calls_sha256 = "f".repeat(64); }, /artifact/i],
  ])("rejects phase-one %s drift", (_name, mutate, message) => {
    const fixture = authorizedArtifactFixture();
    rewritePhaseOneRecord(fixture, mutate);
    expect(() => verifyPhaseOneArtifacts(fixture)).toThrow(message);
  });

  it.each([
    ["study confirmatory outcomes", (study) => { study.confirmatory_outcomes_collected = true; }],
    ["active-design confirmatory outcomes", (study) => {
      study.active_subscription_design.confirmatory_outcomes_collected = true;
    }],
    ["pending Ollama activation", (study) => {
      study.exploratory_ollama_cloud_replication.activation_decision = "pending";
    }],
    ["Ollama outcomes", (study) => {
      study.exploratory_ollama_cloud_replication.outcomes_collected = true;
    }],
    ["automated Ollama access", (study) => {
      study.exploratory_ollama_cloud_replication.automated_access_authorized = true;
    }],
    ["Ollama outcome calls", (study) => {
      study.exploratory_ollama_cloud_replication.outcome_calls_authorized = true;
    }],
  ])("rejects confirmatory-only pre-outcome state drift: %s", (_name, mutate) => {
    const records = authorizationRecords();
    mutate(records.study);
    expect(() => assertExecutionAuthorization(records)).toThrow(/pre-outcome|not-activated/i);
  });

  it("does not infer Ollama activation from a terms assessment or provider correspondence", () => {
    const records = authorizationRecords();
    const ollama = records.study.exploratory_ollama_cloud_replication;
    ollama.activation_decision = "pending";
    ollama.terms_conformance_assessment = {
      status: "operational-basis-established",
      documented_automation_permission_condition_satisfied: true,
    };
    ollama.permission_request = {
      written_permission_received: true,
      human_response_received: true,
    };
    expect(() => assertExecutionAuthorization(records)).toThrow(/pre-outcome|not-activated/i);
    expect(ollama.automated_access_authorized).toBe(false);
    expect(ollama.outcome_calls_authorized).toBe(false);
  });

  it.each([
    ["unknown field", (artifacts) => { artifacts.unregistered_sha256 = "f".repeat(64); }],
    ["missing maximum", (artifacts) => { delete artifacts.maximum_request_bytes; }],
  ])("rejects active artifact schema drift: %s", (_name, mutate) => {
    const records = authorizationRecords();
    mutate(records.study.active_subscription_design.artifacts);
    expect(() => assertExecutionAuthorization(records)).toThrow(/active artifact schema/i);
  });

  it("recomputes maximum request bytes from the frozen prompt requests", () => {
    const fixture = authorizedArtifactFixture();
    rewriteStudyRuntimeRecord(fixture, (study) => {
      study.active_subscription_design.artifacts.maximum_request_bytes += 1;
    });
    refreezeFixture(fixture);
    expect(() => verifyPhaseOneArtifacts(fixture)).toThrow(/maximum request bytes/i);
  });

  it.each([
    ["payload", (fixture) => writeFileSync(fixture.bundlePath, "mutated payload\n"), /packet|JSON/i],
    ["runtime", (fixture) => writeFileSync(join(fixture.recordsRoot, "design.mjs"), "mutated runtime\n"), /runtime|Git content commit/i],
    ["raw prompt", (fixture) => appendText(join(fixture.benchmarkRoot, "prompts.jsonl"), "\n"), /raw file/i],
  ])("rejects phase-one %s byte drift", (_name, mutate, message) => {
    const fixture = authorizedArtifactFixture();
    mutate(fixture);
    expect(() => verifyPhaseOneArtifacts(fixture)).toThrow(message);
  });

  it("accepts only a separately authorized, evidence-bound confirmatory queue", () => {
    const records = authorizationRecords();
    expect(assertExecutionAuthorization(records)).toMatchObject({
      queue_id: CONFIRMATORY_QUEUE_ID,
      subscription_access: records.executionAuthorization.subscription_access,
      artifacts: records.study.active_subscription_design.artifacts,
      raw_files: records.contentFreeze.queues[0].raw_files,
      counts: records.contentFreeze.queues[0].counts,
    });
    expect(records.contentFreeze.outcome_calls_authorized).toBe(false);
    expect(records.contentFreeze.runtime_files["design.mjs"]).toEqual({
      git_mode: "100644",
      sha256: records.runtimeFileHashes["design.mjs"],
    });
    expect(assertExecutionAuthorization(records).run_binding).toMatchObject({
      content_commit: records.contentFreeze.content_commit,
      registration_payload_sha256: records.contentFreeze.registration_bundle.sha256,
      registration_member_manifest_sha256:
        records.contentFreeze.registration_bundle.member_manifest_sha256,
      ground_truth_sha256: records.study.active_subscription_design.artifacts.ground_truth_sha256,
    });
  });

  it.each([
    ["unconfirmed access", (records) => {
      records.executionAuthorization.subscription_access.confirmed = false;
    }],
    ["auth-status hash mismatch", (records) => {
      records.executionAuthorization.subscription_access.codex.expected_auth_status_sha256 =
        "f".repeat(64);
    }],
    ["account identity mismatch", (records) => {
      const evidence = JSON.parse(records.subscriptionAccessEvidence.codex.toString("utf8"));
      evidence.account_identity_sha256 = "f".repeat(64);
      records.subscriptionAccessEvidence.codex = Buffer.from(`${JSON.stringify(evidence)}\n`);
      records.executionAuthorization.subscription_access.codex.usage_evidence.sha256 =
        sha256(records.subscriptionAccessEvidence.codex);
    }],
    ["enabled extra usage", (records) => {
      const evidence = JSON.parse(records.subscriptionAccessEvidence.claude.toString("utf8"));
      evidence.extra_usage_status = "enabled";
      records.subscriptionAccessEvidence.claude = Buffer.from(`${JSON.stringify(evidence)}\n`);
      records.executionAuthorization.subscription_access.claude.usage_evidence.sha256 =
        sha256(records.subscriptionAccessEvidence.claude);
    }],
    ["private evidence hash drift", (records) => {
      records.executionAuthorization.subscription_access.codex.usage_evidence.sha256 =
        "f".repeat(64);
    }],
    ["different confirmer", (records) => {
      records.executionAuthorization.subscription_access.confirmed_by.name = "Someone Else";
    }],
  ])("rejects subscription-access evidence drift: %s", (_name, mutate) => {
    const records = authorizationRecords();
    mutate(records);
    expect(() => assertExecutionAuthorization(records)).toThrow(/subscription|usage|identity|author/i);
  });

  it("requires a fresh private included-usage-only confirmation for each real batch", () => {
    const root = mkdtempSync(join(tmpdir(), "batch-access-confirmation-"));
    const path = join(root, "current-batch.json");
    const { access } = subscriptionAccessFixture();
    const now = Date.parse("2026-07-28T05:00:00.000Z");
    const record = batchAccessConfirmation(access, "2026-07-28T04:55:00.000Z");
    const bytes = Buffer.from(`${JSON.stringify(record, null, 2)}\n`);
    writeFileSync(path, bytes, { mode: 0o600 });
    chmodSync(path, 0o600);

    expect(verifyCurrentBatchAccessConfirmation({ path, access, now })).toEqual({
      confirmed_at: record.confirmed_at,
      sha256: sha256(bytes),
    });
    record.claude.extra_usage_status = "enabled";
    writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
    expect(() => verifyCurrentBatchAccessConfirmation({ path, access, now }))
      .toThrow(/extra usage/i);
    record.claude.extra_usage_status = "disabled";
    record.confirmed_at = "2026-07-28T04:44:59.000Z";
    writeFileSync(path, `${JSON.stringify(record, null, 2)}\n`, { mode: 0o600 });
    expect(() => verifyCurrentBatchAccessConfirmation({ path, access, now }))
      .toThrow(/stale/i);
  });

  it("blocks review dispatch when current auth status differs from the authorized status", () => {
    const fixture = collectionExecutionFixture();
    const snapshot = executionSnapshot();
    snapshot.subscription_access.codex.expected_auth_status_sha256 = "f".repeat(64);
    let reviewCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => snapshot,
      preflight: () => verifiedProvenance(),
      runReview: () => { reviewCalls += 1; },
    })).toThrow(/auth.*status|subscription access/i);
    expect(reviewCalls).toBe(0);
  });

  it("blocks review dispatch when the live subscription account identity differs", () => {
    const fixture = collectionExecutionFixture();
    const provenance = verifiedProvenance();
    Object.defineProperty(provenance, "account_identity_sha256", {
      configurable: true,
      enumerable: false,
      value: { ...accountIdentitySha256(), codex: "f".repeat(64) },
    });
    let reviewCalls = 0;
    expect(() => collectSubscriptionSchedule({
      ...fixture,
      codexBin: "/opt/codex",
      claudeBin: "/opt/claude",
      authorize: () => executionSnapshot(),
      preflight: () => provenance,
      runReview: () => { reviewCalls += 1; },
    })).toThrow(/account identity|authorized evidence/i);
    expect(reviewCalls).toBe(0);
  });

  it("rejects any Ollama-enabled branch until a separately reviewed runner exists", () => {
    const records = authorizationRecords();
    records.contentFreeze.branch = "confirmatory-plus-ollama-exploratory";
    records.executionAuthorization.content_freeze.branch = records.contentFreeze.branch;
    expect(() => assertExecutionAuthorization(records)).toThrow("confirmatory-only");
  });

  it.each([
    ["old freeze schema", (records) => { records.contentFreeze.schema_version = 2; }, "schema"],
    ["old authorization schema", (records) => { records.executionAuthorization.schema_version = 3; }, "schema"],
    ["extra frozen queue", (records) => { records.contentFreeze.queues.push(clone(records.contentFreeze.queues[0])); }, "exactly one"],
    ["extra authorized queue", (records) => { records.executionAuthorization.authorized_queues.push(clone(records.executionAuthorization.authorized_queues[0])); }, "exactly one"],
    ["queue id drift", (records) => { records.contentFreeze.queues[0].id = "other"; }, "queue"],
    ["manifest system reordering", (records) => { records.study.active_subscription_design.review_systems.reverse(); }, "review systems"],
    ["manifest client version drift", (records) => { records.study.active_subscription_design.review_systems[0].client_version = "0.138.0"; }, "review systems"],
    ["manifest requested model drift", (records) => { records.study.active_subscription_design.review_systems[1].requested_model = "opus"; }, "review systems"],
    ["unexpected call count", (records) => { records.contentFreeze.queues[0].counts.review_boundaries += 1; }, "counts"],
    ["raw file omitted", (records) => { delete records.contentFreeze.queues[0].raw_files["collection.json"]; }, "raw file"],
    ["legacy frozen queue counts", (records) => {
      records.contentFreeze.queues[0].counts = legacyQueueCounts(
        records.contentFreeze.queues[0].counts,
      );
    }, "counts"],
    ["legacy authorized queue counts", (records) => {
      records.executionAuthorization.authorized_queues[0].counts = legacyQueueCounts(
        records.executionAuthorization.authorized_queues[0].counts,
      );
    }, "counts"],
    ["artifact drift", (records) => { records.executionAuthorization.authorized_queues[0].artifacts.calls_sha256 = "e".repeat(64); }, "artifact"],
    ["member manifest drift", (records) => { records.executionAuthorization.content_freeze.member_manifest_sha256 = "d".repeat(64); }, "member manifest"],
    ["bundle verification drift", (records) => { records.registrationBundleVerification.content_commit = "f".repeat(40); }, "bundle"],
    ["packet study member drift", (records) => { records.registrationBundleVerification.members.find(({ path }) => path === "study.json").sha256 = "f".repeat(64); }, "runtime member"],
    ["packet schema member drift", (records) => { records.registrationBundleVerification.members.find(({ path }) => path === "review-schema.json").sha256 = "f".repeat(64); }, "runtime member"],
    ["OSF evidence drift", (records) => { records.osfEvidence.registration_record.bytes = Buffer.from("{}\n"); }, "evidence"],
    ["OSF evidence traversal", (records) => { records.executionAuthorization.osf_registration.download_evidence.registration_record.file = "../export.json"; }, "evidence"],
    ["noncanonical OSF URL", (records) => { records.executionAuthorization.osf_registration.url += "?view=1"; }, "OSF registration"],
    ["invalid OSF id", (records) => { records.executionAuthorization.osf_registration.id = "OSF-test-id"; }, "OSF registration"],
    ["OSF registration type", (records) => { records.executionAuthorization.osf_registration.type = "nodes"; }, "OSF registration"],
    ["OSF registration schema", (records) => { records.executionAuthorization.osf_registration.registration_schema_id = "other-schema"; }, "OSF registration schema"],
    ["offset timestamp", (records) => { records.executionAuthorization.authorized_at = "2026-07-18T18:00:00+00:00"; }, "timestamp"],
    ["normalized invalid date", (records) => { records.executionAuthorization.authorized_at = "2026-02-30T18:00:00.000Z"; }, "timestamp"],
    ["equal phase instants", (records) => { records.executionAuthorization.author_confirmation.confirmed_at = records.executionAuthorization.osf_registration.download_evidence.verified_at; }, "timestamp order"],
    ["blank author", (records) => { records.study.authorship.authors[0].name = "  "; records.executionAuthorization.authorized_by.name = "  "; }, "author"],
    ["invalid ORCID", (records) => { records.study.authorship.authors[0].orcid = "0009-0001-4714-5748"; records.executionAuthorization.authorized_by.orcid = "0009-0001-4714-5748"; }, "ORCID"],
    ["unconfirmed author", (records) => { records.executionAuthorization.author_confirmation.confirmed = false; }, "author confirmation"],
    ["blank confirmation statement", (records) => { records.executionAuthorization.author_confirmation.statement = " "; }, "author confirmation"],
  ])("rejects %s", (_name, mutate, message) => {
    const records = authorizationRecords();
    mutate(records);
    expect(() => assertExecutionAuthorization(records)).toThrow(message);
  });

  it("accepts untouched raw registration, provider, file-list, and downloaded attachment evidence", () => {
    const records = authorizationRecords();
    expect(records.osfEvidence.registration_record.bytes.toString("utf8")).toMatch(/^\s+\{/u);
    expect(records.osfEvidence.registration_record.json.meta.provider_extra).toBe(true);
    expect(assertExecutionAuthorization(records).queue_id).toBe(CONFIRMATORY_QUEUE_ID);
  });

  it("accepts a complete, ordered, multi-page authoritative OSF file inventory", () => {
    const records = authorizationRecords();
    paginateOsfFileList(records);
    expect(assertExecutionAuthorization(records).queue_id).toBe(CONFIRMATORY_QUEUE_ID);
  });

  it("rejects an uncaptured page from the authoritative OSF file inventory", () => {
    const records = authorizationRecords();
    paginateOsfFileList(records);
    records.osfEvidence.provider_file_list_pages.pop();
    records.executionAuthorization.osf_registration.download_evidence
      .provider_file_list_pages.pop();
    expect(() => assertExecutionAuthorization(records)).toThrow(/pagination|incomplete/i);
  });

  it.each([
    ["URL", (pages) => { pages[1].url = pages[0].url; }],
    ["local file", (pages) => { pages[1].file = pages[0].file; }],
  ])("rejects duplicate OSF pagination page %s identity", (_name, mutate) => {
    const records = authorizationRecords();
    paginateOsfFileList(records);
    mutate(records.executionAuthorization.osf_registration.download_evidence
      .provider_file_list_pages);
    expect(() => assertExecutionAuthorization(records)).toThrow(/distinct|page/i);
  });

  it.each([
    ["GUID", (record) => { record.data.id = "def34"; }],
    ["type", (record) => { record.data.type = "nodes"; }],
    ["HTML URL", (record) => { record.data.links.html = "https://osf.io/def34/"; }],
    ["registration instant", (record) => { record.data.attributes.date_registered = "2026-07-18T17:45:01Z"; }],
    ["registration schema", (record) => { record.data.relationships.registration_schema.data.id = "other-schema"; }],
    ["missing data", (record) => { delete record.data; }],
    ["missing HTML URL", (record) => { delete record.data.links.html; }],
    ["missing registration instant", (record) => { delete record.data.attributes.date_registered; }],
    ["missing registration-schema relationship", (record) => { delete record.data.relationships.registration_schema.data.id; }],
  ])("rejects raw OSF JSON:API %s drift after its digest is rebound", (_name, mutate) => {
    const records = authorizationRecords();
    mutate(records.osfEvidence.registration_record.json);
    rebindOsfRawRecord(records, "registration_record");
    expect(() => assertExecutionAuthorization(records)).toThrow(/OSF raw evidence/i);
  });

  it("rejects an unbound mutation of the raw OSF response bytes", () => {
    const records = authorizationRecords();
    records.osfEvidence.registration_record.bytes = Buffer.concat([
      records.osfEvidence.registration_record.bytes,
      Buffer.from(" "),
    ]);
    expect(() => assertExecutionAuthorization(records)).toThrow(/evidence hash/i);
  });

  it.each([
    ["missing file", (data) => { data.pop(); }],
    ["extra file", (data) => { data.push(clone(data[0])); data[2].id = "extra"; data[2].attributes.name = "extra.json"; }],
    ["folder substitution", (data) => { data[0].attributes.kind = "folder"; }],
    ["duplicate file id", (data) => { data[1].id = data[0].id; }],
    ["renamed payload", (data) => { data[1].attributes.name = "renamed-payload.json"; }],
    ["provider substitution", (data) => { data[0].attributes.provider = "dropbox"; }],
    ["registration substitution", (data) => { data[0].relationships.node.data.id = "def34"; }],
    ["download URL substitution", (data) => { data[0].links.download = "https://files.osf.io/v1/resources/def34/providers/osfstorage/file"; }],
  ])("rejects authoritative OSF file-list inventory drift: %s", (_name, mutate) => {
    const records = authorizationRecords();
    mutate(records.osfEvidence.provider_file_list_pages[0].json.data);
    rebindOsfFileListPage(records, 0);
    expect(() => assertExecutionAuthorization(records)).toThrow(/OSF.*file|inventory|provider/i);
  });

  it.each([
    ["missing provider", (data) => { data.pop(); }],
    ["extra provider", (data) => { data.push(clone(data[0])); data[1].id = "abc12:dropbox"; }],
    ["provider substitution", (data) => { data[0].attributes.name = "dropbox"; }],
  ])("rejects authoritative OSF provider inventory drift: %s", (_name, mutate) => {
    const records = authorizationRecords();
    mutate(records.osfEvidence.providers_list.json.data);
    rebindOsfRawRecord(records, "providers_list");
    expect(() => assertExecutionAuthorization(records)).toThrow(/OSF.*provider/i);
  });

  it.each([
    ["missing descriptor", (records) => { records.executionAuthorization.osf_registration.download_evidence.downloaded_files.pop(); }],
    ["extra descriptor", (records) => { records.executionAuthorization.osf_registration.download_evidence.downloaded_files.push(clone(records.executionAuthorization.osf_registration.download_evidence.downloaded_files[0])); }],
    ["attachment byte mismatch", (records) => { records.osfEvidence.downloaded_files[0].bytes = Buffer.from("substitution\n"); }],
    ["attachment substitution with rebound hash", (records) => {
      records.osfEvidence.downloaded_files[0].bytes = Buffer.from("substitution\n");
      const digest = sha256(records.osfEvidence.downloaded_files[0].bytes);
      records.osfEvidence.downloaded_files[0].descriptor.sha256 = digest;
      records.executionAuthorization.osf_registration.download_evidence.downloaded_files[0].sha256 = digest;
    }],
  ])("rejects OSF downloaded attachment evidence drift: %s", (_name, mutate) => {
    const records = authorizationRecords();
    mutate(records);
    expect(() => assertExecutionAuthorization(records)).toThrow(/OSF.*download|attachment|evidence|inventory/i);
  });

  it("keeps a phase-one freeze from authorizing outcome calls", () => {
    const records = authorizationRecords();
    records.executionAuthorization.status = "unauthorized-registration-pending";
    records.executionAuthorization.outcome_calls_authorized = false;
    expect(() => assertExecutionAuthorization(records)).toThrow("not authorized");
    expect(records.study.frozen).toBe(true);
    expect(records.contentFreeze.status).toBe("frozen-pre-submission");
  });

  it("loads, verifies, and returns one exact in-memory snapshot of the frozen bytes", () => {
    const fixture = authorizedArtifactFixture();
    const snapshot = assertAuthorizedArtifacts(fixture);
    expect(snapshot.queue_id).toBe(CONFIRMATORY_QUEUE_ID);
    expect(snapshot.calls).toHaveLength(160);
    expect(snapshot.prompts).toBeInstanceOf(Map);
    expect(snapshot.prompts).toHaveLength(48);
    expect(snapshot.calls[0].schedule_index).toBe(1);
    expect(snapshot.run_binding.fingerprint).toMatch(/^[a-f0-9]{64}$/u);
  });

  it.each([
    ["permission drift", (path) => chmodSync(path, 0o644), /0600|private/i],
    ["byte drift", (path) => writeFileSync(path, "{}\n"), /evidence hash/i],
  ])("rejects private subscription evidence %s", (_name, mutate, message) => {
    const fixture = authorizedArtifactFixture();
    const path = join(
      fixture.recordsRoot,
      "private-evidence/codex-subscription-access.json",
    );
    mutate(path);
    expect(() => assertAuthorizedArtifacts(fixture)).toThrow(message);
  }, 20_000);

  it.each([
    ["registration packet", (fixture) => writeFileSync(fixture.bundlePath, "mutated bundle\n"), "packet"],
    ["freeze record bytes", (fixture) => appendText(fixture.freezePath, "\n"), "record hash"],
    ["runtime file", (fixture) => writeFileSync(join(fixture.recordsRoot, "review-schema.json"), "{}\n"), /runtime file/i],
    ["downloaded OSF evidence", (fixture) => appendText(fixture.evidencePath, "\n"), "raw evidence"],
    ["raw prompt bytes", (fixture) => appendText(join(fixture.benchmarkRoot, "prompts.jsonl"), "\n"), "raw file"],
  ])("rejects post-freeze mutation of %s", (_name, mutate, message) => {
    const fixture = authorizedArtifactFixture();
    mutate(fixture);
    expect(() => assertAuthorizedArtifacts(fixture)).toThrow(message);
  }, 20_000);

  it("binds runtime bytes and modes to the exact content commit, not detached hashes", () => {
    const fixture = authorizedArtifactFixture();
    const designPath = join(fixture.recordsRoot, "design.mjs");
    writeFileSync(designPath, "mutated design fixture\n");
    rebindRuntimeRecord(fixture, "design.mjs");
    expect(() => assertAuthorizedArtifacts(fixture)).toThrow(/Git content commit|committed runtime/i);

    const fresh = authorizedArtifactFixture();
    const runnerPath = join(fresh.recordsRoot, "subscription-runner.mjs");
    chmodSync(runnerPath, 0o755);
    rebindRuntimeRecord(fresh, "subscription-runner.mjs", "100755");
    expect(() => assertAuthorizedArtifacts(fresh)).toThrow(/Git content commit|mode/i);
  });

  it.each([
    ["review-schema.json", "schema"],
    ["design.mjs", "runtime"],
  ])("rejects a symbolic-link %s input", (name, message) => {
    const fixture = authorizedArtifactFixture();
    const target = join(fixture.recordsRoot, `outside-${name}`);
    writeFileSync(target, "{}\n");
    const path = join(fixture.recordsRoot, name);
    writeFileSync(path, "");
    // Replace only after the fixture has been committed and authorized.
    unlinkSync(path);
    symlinkSync(target, path, "file");
    expect(() => assertAuthorizedArtifacts(fixture)).toThrow(new RegExp(`${message}|symbolic|regular`, "i"));
  });

  it("accepts the preregistered nested schedule and its deliberate prompt reuse", () => {
    const fixture = authorizedArtifactFixture();
    const snapshot = assertAuthorizedArtifacts(fixture);
    expect(snapshot.counts).toEqual({
      sequence_system_trials: 80,
      review_boundaries: 160,
      review_boundaries_by_system: {
        "codex-cli/gpt-5.5": 80,
        "claude-code/sonnet": 80,
      },
      review_boundaries_by_decomposition: { atomic: 40, split: 120 },
    });
    const uses = new Map();
    for (const call of snapshot.calls) {
      uses.set(call.prompt_id, (uses.get(call.prompt_id) ?? 0) + 1);
    }
    expect(new Set(uses.values())).toEqual(new Set([2, 4]));
  });

  it("regenerates the current study design as 2,816 calls and 1,408 sequences", () => {
    const study = JSON.parse(readFileSync(join(import.meta.dirname, "study.json"), "utf8"));
    const design = study.active_subscription_design.design;
    const scenarioIds = [
      ...design.nested_evaluation.scenario_ids,
      ...Array.from(
        { length: design.scenario_pairs - design.nested_evaluation.scenario_ids.length },
        (_, index) => `other-scenario-${String(index + 1).padStart(3, "0")}`,
      ),
    ];
    const schedule = generateCallSchedule({
      scenarioIds,
      models: REVIEW_SYSTEMS,
      trialsPerCell: design.trials_per_cell,
      splitSubmissionCount: design.split_submission_count,
      contexts: design.contexts,
      nestedPlan: {
        scenarioIds: design.nested_evaluation.scenario_ids,
        trialsPerCell: design.nested_evaluation.trials_per_cell,
        contexts: design.nested_evaluation.contexts,
      },
      seed: study.active_subscription_design.artifacts.schedule_seed,
    });
    expect(summarizeSchedule(schedule.rows)).toMatchObject({ calls: 2816, sequences: 1408 });
  });

  it.each([
    ["relevant_submission_ids", (truth) => { truth.relevant_submission_ids = ["wrong"]; }],
    ["submitted_at", (truth) => { truth.submitted_at = "2026-01-01T00:00:00.000Z"; }],
    ["sequence_started_at", (truth) => { truth.sequence_started_at = "2026-01-01T00:00:00.000Z"; }],
  ])("rejects ground truth whose %s does not match the exact card", (_name, mutate) => {
    const fixture = authorizedArtifactFixture();
    const truthPath = join(fixture.collectionRoot, "ground-truth.jsonl");
    const truth = readJsonl(truthPath);
    mutate(truth[0]);
    writeFileSync(truthPath, toJsonl(truth));
    rebindMutableArtifactDigests(fixture);
    refreezeFixture(fixture);
    expect(() => assertAuthorizedArtifacts(fixture)).toThrow(/ground-truth|submission|card/i);
  });

  it("recomputes the schedule instead of accepting self-consistent copied digests", () => {
    const fixture = authorizedArtifactFixture();
    const truthPath = join(fixture.collectionRoot, "ground-truth.jsonl");
    const truth = readJsonl(truthPath);
    truth[0].workflow = truth[0].workflow === "pr" ? "trunk" : "pr";
    writeFileSync(truthPath, toJsonl(truth));
    rebindMutableArtifactDigests(fixture);
    refreezeFixture(fixture);
    expect(() => assertAuthorizedArtifacts(fixture)).toThrow("schedule");
  });

  it("rejects an unregistered model even when copied hashes and counts are updated", () => {
    const fixture = authorizedArtifactFixture();
    const callsPath = join(fixture.collectionRoot, "calls.jsonl");
    const truthPath = join(fixture.collectionRoot, "ground-truth.jsonl");
    const calls = readJsonl(callsPath);
    const truth = readJsonl(truthPath);
    calls[0].model = "ollama-cloud/qwen3.5";
    truth[0].model = calls[0].model;
    calls[0].call_id = callId(calls[0]);
    truth[0].call_id = calls[0].call_id;
    writeFileSync(callsPath, toJsonl(calls));
    writeFileSync(truthPath, toJsonl(truth));
    rebindMutableArtifactDigests(fixture);
    refreezeFixture(fixture);
    expect(() => assertAuthorizedArtifacts(fixture)).toThrow(/review system|model|schedule/);
  });

  it("rejects a prompt whose recomputed identity no longer matches its scenario card", () => {
    const fixture = authorizedArtifactFixture();
    const promptsPath = join(fixture.benchmarkRoot, "prompts.jsonl");
    const callsPath = join(fixture.collectionRoot, "calls.jsonl");
    const truthPath = join(fixture.collectionRoot, "ground-truth.jsonl");
    const prompts = readJsonl(promptsPath);
    const calls = readJsonl(callsPath);
    const truth = readJsonl(truthPath);
    const oldPromptId = prompts[0].prompt_id;
    prompts[0].scenario_id = "scenario-999";
    prompts[0].prompt_id = promptId(prompts[0]);
    for (let index = 0; index < calls.length; index += 1) {
      if (calls[index].prompt_id !== oldPromptId) continue;
      calls[index].prompt_id = prompts[0].prompt_id;
      calls[index].call_id = callId(calls[index]);
      truth[index].call_id = calls[index].call_id;
    }
    writeFileSync(promptsPath, toJsonl(prompts));
    writeFileSync(callsPath, toJsonl(calls));
    writeFileSync(truthPath, toJsonl(truth));
    rebindMutableArtifactDigests(fixture);
    refreezeFixture(fixture);
    expect(() => assertAuthorizedArtifacts(fixture)).toThrow(/prompt|scenario|card/);
  });
});

function defaultRequest() {
  return { messages: [{ role: "system", content: "Review." }, { role: "user", content: "{}" }] };
}

function codexOutput(model, response) {
  const extraEvents = model === "gpt-5.5" || model == null
    ? []
    : [{
      type: "item.completed",
      item: { type: "error", message: `model rerouted: gpt-5.5 -> ${model} (fixture)` },
    }];
  return authoritativeCodexOutput(response, extraEvents);
}

function authoritativeCodexOutput(response, extraEvents = []) {
  return toJsonl([
    { type: "thread.started", thread_id: "fixture-thread" },
    ...extraEvents,
    {
      type: "item.completed",
      item: { type: "agent_message", text: JSON.stringify(response) },
    },
    { type: "turn.completed", usage: { input_tokens: 10, output_tokens: 5 } },
  ]);
}

function verifiedProvenance(overrides = {}) {
  const provenance = {
    schema_version: 3,
    codex_executable: "/opt/codex-0.137.0",
    codex_executable_sha256: "2e0cccea4a81dd7bf2c155950dab9a6c6ed9a02569d8ff07a68b7afedc1be21d",
    codex_version: "0.137.0",
    codex_auth: "chatgpt-subscription",
    codex_auth_status_sha256: sha256(CODEX_AUTH_STATUS),
    codex_isolation: {
      ephemeral: true,
      approval_policy: "never",
      sandbox: "custom-permissions-profile",
      permissions_profile: {
        id: "study-minimal",
        config_overrides: [
          'default_permissions="study-minimal"',
          'permissions={study-minimal={filesystem={":minimal"="read"}}}',
        ],
        filesystem: { ":minimal": "read" },
        network: "restricted",
        managed_requirements: "included-in-offline-proof-with-no-warnings",
      },
      ignore_user_config: true,
      ignore_rules: true,
      empty_working_directory: true,
    },
    codex_model_identity: {
      requested_model: "gpt-5.5",
      returned_model_observable: false,
      reroute_policy: "reject",
      evidence: "official-codex-exec-json-rust-v0.137.0",
    },
    claude_executable: "/opt/claude-2.1.211",
    claude_executable_sha256: "5a728a76198b6eca7f3c7cdbff43bab44b77b48c2108f7a3107d889773382629",
    claude_version: "2.1.211",
    claude_auth: "claude.ai-max-subscription",
    claude_auth_status_sha256: sha256(CLAUDE_AUTH_STATUS),
    claude_isolation: {
      safe_mode: true,
      setting_sources: [],
      strict_mcp_config: true,
      mcp_config: {},
      slash_commands: false,
      chrome: false,
      tools: [],
      session_persistence: false,
      max_turns: 1,
      empty_working_directory: true,
    },
    claude_model_identity: {
      requested_model: "sonnet",
      returned_model_observable: true,
      envelope_path: "modelUsage singleton key",
      evidence: "pinned-claude-code-2.1.211-json-result-contract",
    },
    child_env_policy: clone(CHILD_ENV_POLICY),
    checked_at: "2026-07-18T18:00:00.000Z",
    ...overrides,
  };
  Object.defineProperty(provenance, "child_env", {
    enumerable: false,
    value: { ...SAFE_CHILD_ENV },
  });
  Object.defineProperty(provenance, "account_identity_sha256", {
    configurable: true,
    enumerable: false,
    value: accountIdentitySha256(),
  });
  return provenance;
}

function collectionExecutionFixture() {
  const root = mkdtempSync(join(tmpdir(), "subscription-execution-"));
  const benchmarkRoot = join(root, "benchmark");
  const collectionRoot = join(root, "collection");
  const outputRoot = join(root, "output");
  const ambientHome = join(root, "ambient-home-default");
  mkdirSync(benchmarkRoot, { recursive: true });
  mkdirSync(collectionRoot, { recursive: true });
  mkdirSync(ambientHome, { mode: 0o700 });
  writeFileSync(join(benchmarkRoot, "prompts.jsonl"), "");
  writeFileSync(join(collectionRoot, "calls.jsonl"), "");
  return { benchmarkRoot, collectionRoot, outputRoot, env: { HOME: ambientHome } };
}

function executionSnapshot(request = defaultRequest()) {
  const reviewSchemaBytes = Buffer.from('{"type":"object"}\n');
  const { access } = subscriptionAccessFixture();
  return {
    queue_id: CONFIRMATORY_QUEUE_ID,
    subscription_access: access,
    run_binding: makeRunBinding({ review_schema_sha256: sha256(reviewSchemaBytes) }),
    review_schema_bytes: reviewSchemaBytes,
    prompts: new Map([["prompt-1", request]]),
    calls: [{
      call_id: "call-1",
      schedule_index: 1,
      prompt_id: "prompt-1",
      model: "codex-cli/gpt-5.5",
    }],
  };
}

function subscriptionAccessFixture() {
  const identities = accountIdentitySha256();
  const providers = {
    codex: {
      expected_auth_status_sha256: sha256(CODEX_AUTH_STATUS),
      account_identity_sha256: identities.codex,
      extra_usage_status: "disabled",
    },
    claude: {
      expected_auth_status_sha256: sha256(CLAUDE_AUTH_STATUS),
      account_identity_sha256: identities.claude,
      extra_usage_status: "disabled",
    },
  };
  const subscriptionAccessEvidence = {};
  const descriptors = {};
  for (const [provider, record] of Object.entries(providers)) {
    const bytes = Buffer.from(`${JSON.stringify({
      schema_version: 1,
      provider,
      expected_auth_status_sha256: record.expected_auth_status_sha256,
      account_identity_sha256: record.account_identity_sha256,
      extra_usage_status: record.extra_usage_status,
    }, null, 2)}\n`);
    const file = `private-evidence/${provider}-subscription-access.json`;
    descriptors[provider] = {
      expected_auth_status_sha256: record.expected_auth_status_sha256,
      account_identity_sha256: record.account_identity_sha256,
      usage_evidence: { file, sha256: sha256(bytes) },
    };
    subscriptionAccessEvidence[provider] = bytes;
  }
  return {
    access: {
      schema_version: 1,
      confirmed: true,
      confirmed_at: "2026-07-18T17:50:00.000Z",
      confirmed_by: { ...AUTHOR },
      codex: descriptors.codex,
      claude: descriptors.claude,
    },
    subscriptionAccessEvidence,
  };
}

function batchAccessConfirmation(access, confirmedAt) {
  return {
    schema_version: 1,
    confirmed: true,
    confirmed_at: confirmedAt,
    confirmed_by: { ...access.confirmed_by },
    statement: "I checked both account billing settings and confirm included usage only for this batch.",
    codex: {
      account_identity_sha256: access.codex.account_identity_sha256,
      extra_usage_status: "disabled",
    },
    claude: {
      account_identity_sha256: access.claude.account_identity_sha256,
      extra_usage_status: "disabled",
    },
  };
}

function writeBatchAccessConfirmation(root, access) {
  const path = join(root, "current-batch-access.json");
  writeFileSync(
    path,
    `${JSON.stringify(batchAccessConfirmation(access, new Date().toISOString()), null, 2)}\n`,
    { mode: 0o600 },
  );
  chmodSync(path, 0o600);
  return path;
}

function authorizationRecords() {
  const artifacts = {
    cards_sha256: "1".repeat(64),
    prompts_sha256: "2".repeat(64),
    schedule_seed: 20260718,
    schedule_sha256: "3".repeat(64),
    calls_sha256: "4".repeat(64),
    ground_truth_sha256: "5".repeat(64),
    maximum_request_bytes: 128,
  };
  const rawFiles = Object.fromEntries(RAW_FILE_NAMES.map((name, index) => [
    name,
    String((index + 6) % 10).repeat(64),
  ]));
  const contentCommit = "a".repeat(40);
  const downloadedBundleBytes = Buffer.from("downloaded registration payload fixture\n");
  const downloadedFreezeBytes = Buffer.from("downloaded content-freeze fixture\n");
  const bundleSha256 = sha256(downloadedBundleBytes);
  const memberManifestSha256 = "c".repeat(64);
  const contentFreezeSha256 = sha256(downloadedFreezeBytes);
  const { reviewAttestations, reviewAttestationBytes } = reviewAttestationFixture(contentCommit);
  const counts = {
    sequence_system_trials: 80,
    review_boundaries: 160,
    review_boundaries_by_system: {
      "codex-cli/gpt-5.5": 80,
      "claude-code/sonnet": 80,
    },
    review_boundaries_by_decomposition: { atomic: 40, split: 120 },
  };
  const runtimeFileHashes = Object.fromEntries(RUNTIME_FILE_NAMES.map((name, index) => [
    name,
    "0123456789abcdef"[index].repeat(64),
  ]));
  const study = studyRecord(artifacts);
  const queue = {
    id: CONFIRMATORY_QUEUE_ID,
    review_systems: [...REVIEW_SYSTEMS],
    artifacts: artifactHashes(artifacts),
    raw_files: { ...rawFiles },
    counts: clone(counts),
  };
  const contentFreeze = {
    schema_version: 3,
    study_id: study.study_id,
    status: "frozen-pre-submission",
    frozen_at: "2026-07-18T17:00:00.000Z",
    content_commit: contentCommit,
    branch: "confirmatory-only",
    osf_schema: {
      name: "OSF Preregistration",
      version: 4,
      id: "697b72f611a8e98484c6139b",
    },
    registration_bundle: {
      file: "registration-payload.json",
      sha256: bundleSha256,
      member_manifest_sha256: memberManifestSha256,
    },
    review_attestations: reviewAttestations,
    runtime_files: Object.fromEntries(RUNTIME_FILE_NAMES.map((name) => [name, {
      git_mode: "100644",
      sha256: runtimeFileHashes[name],
    }])),
    outcome_calls_authorized: false,
    queues: [queue],
  };
  const { access: subscriptionAccess, subscriptionAccessEvidence } = subscriptionAccessFixture();
  const executionAuthorization = {
    schema_version: 5,
    study_id: study.study_id,
    status: "authorized-post-registration",
    outcome_calls_authorized: true,
    authorized_at: "2026-07-18T18:00:00.000Z",
    authorized_by: { ...AUTHOR },
    osf_registration: {
      id: "abc12",
      type: "registrations",
      url: "https://osf.io/abc12/",
      registered_at: "2026-07-18T17:45:00.000Z",
      registration_schema_id: "697b72f611a8e98484c6139b",
      download_evidence: null,
    },
    author_confirmation: {
      confirmed: true,
      confirmed_at: "2026-07-18T17:47:00.000Z",
      name: AUTHOR.name,
      orcid: AUTHOR.orcid,
      statement: "I verified the downloaded OSF registration and authorize the exact named queue.",
    },
    content_freeze: {
      record_sha256: contentFreezeSha256,
      content_commit: contentCommit,
      branch: "confirmatory-only",
      bundle_sha256: bundleSha256,
      member_manifest_sha256: memberManifestSha256,
    },
    authorized_queues: [clone(queue)],
    subscription_access: subscriptionAccess,
    rule: "Fixture authorization for the exact evidence-bound confirmatory queue.",
  };
  const osfEvidence = rawOsfEvidenceFixture({
    registrationId: "abc12",
    downloadedFreezeBytes,
    downloadedBundleBytes,
  });
  executionAuthorization.osf_registration.download_evidence = clone(osfEvidence.descriptor);
  const committedRuntimeFiles = Object.fromEntries(RUNTIME_FILE_NAMES.map((name) => [name, {
    bytes_sha256: runtimeFileHashes[name],
    git_mode: "100644",
    worktree_mode: "100644",
  }]));
  return {
    study,
    contentFreeze,
    contentFreezeSha256,
    registrationBundleVerification: {
      study_id: study.study_id,
      content_commit: contentCommit,
      payload_sha256: bundleSha256,
      member_manifest_sha256: memberManifestSha256,
      members: [
        { path: "review-schema.json", sha256: runtimeFileHashes["review-schema.json"] },
        { path: "study.json", sha256: runtimeFileHashes["study.json"] },
      ],
    },
    reviewAttestationBytes,
    runtimeFileHashes,
    committedRuntimeFiles,
    osfEvidence,
    subscriptionAccessEvidence,
    executionAuthorizationSha256: "e".repeat(64),
    executionAuthorization,
  };
}

function studyRecord(artifacts) {
  return {
    study_id: "llm-review-sequences-v0",
    frozen: true,
    frozen_at: "2026-07-18T17:00:00.000Z",
    confirmatory_outcomes_collected: false,
    authorship: {
      authors: [{ ...AUTHOR }],
      contributor_order_confirmed: true,
      sole_author: true,
    },
    preregistration_v2_draft: {
      template: "OSF Preregistration",
      template_schema_version: 4,
      template_schema_id: "697b72f611a8e98484c6139b",
    },
    active_subscription_design: {
      confirmatory_outcomes_collected: false,
      artifacts: { ...artifacts },
      review_systems: [
        { id: REVIEW_SYSTEMS[0], client_version: "0.137.0", requested_model: "gpt-5.5" },
        { id: REVIEW_SYSTEMS[1], client_version: "2.1.211", requested_model: "sonnet" },
      ],
      design: {
        scenario_pairs: 2,
        intents: ["malicious", "benign"],
        decompositions: ["atomic", "split"],
        workflows: ["pr", "trunk"],
        contexts: ["local"],
        trials_per_cell: 1,
        nested_evaluation: {
          scenario_ids: ["scenario-002"],
          contexts: ["local", "cumulative"],
          trials_per_cell: 2,
        },
        split_submission_count: 3,
        review_boundaries: 160,
        boundaries_per_review_system: 80,
      },
    },
    exploratory_ollama_cloud_replication: {
      activation_decision: "not-activated",
      outcomes_collected: false,
      automated_access_authorized: false,
      outcome_calls_authorized: false,
    },
  };
}

function reviewAttestationFixture(contentCommit) {
  const reviewAttestationBytes = {};
  const reviewAttestations = REVIEW_ROLES.map((role, index) => {
    const reportFile = `reviews/phase-one-${role}.md`;
    const disposition = role === "methods" ? "approve-with-documented-limitations" : "approve";
    const bytes = Buffer.from([
      "---",
      "phase_one_review_schema: 1",
      `role: ${role}`,
      `reviewed_commit: ${contentCommit}`,
      `disposition: ${disposition}`,
      "unresolved_blockers: []",
      "---",
      `# ${role} phase-one review`,
      "",
    ].join("\n"));
    reviewAttestationBytes[reportFile] = {
      bytes,
      canonical_path: `/fixture/${reportFile}`,
      device: 1,
      inode: index + 1,
    };
    return {
      role,
      report_file: reportFile,
      sha256: sha256(bytes),
      reviewed_commit: contentCommit,
      disposition,
      unresolved_blockers: [],
    };
  });
  return { reviewAttestations, reviewAttestationBytes };
}

function writeReviewAttestations(recordsRoot, contentCommit) {
  const { reviewAttestations, reviewAttestationBytes } = reviewAttestationFixture(contentCommit);
  for (const [reportFile, { bytes }] of Object.entries(reviewAttestationBytes)) {
    const path = join(recordsRoot, reportFile);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, bytes);
  }
  return reviewAttestations;
}

function rewritePhaseOneRecord(fixture, mutate) {
  const record = JSON.parse(readFileSync(fixture.freezePath, "utf8"));
  mutate(record);
  writeFileSync(fixture.freezePath, `${JSON.stringify(record, null, 2)}\n`);
}

function rewriteReviewReportSnapshot(records, role, mutate) {
  const descriptor = records.contentFreeze.review_attestations
    .find((candidate) => candidate.role === role);
  const report = records.reviewAttestationBytes[descriptor.report_file];
  const bytes = Buffer.from(mutate(report.bytes.toString("utf8")));
  report.bytes = bytes;
  descriptor.sha256 = sha256(bytes);
}

function rewriteStudyRecord(fixture, mutate) {
  const studyPath = join(fixture.recordsRoot, "study.json");
  const study = JSON.parse(readFileSync(studyPath, "utf8"));
  mutate(study);
  writeFileSync(studyPath, `${JSON.stringify(study, null, 2)}\n`);
}

function rewriteStudyRuntimeRecord(fixture, mutate) {
  rewriteStudyRecord(fixture, mutate);
  const freeze = JSON.parse(readFileSync(fixture.freezePath, "utf8"));
  freeze.runtime_files["study.json"].sha256 = sha256(
    readFileSync(join(fixture.recordsRoot, "study.json")),
  );
  writeFileSync(fixture.freezePath, `${JSON.stringify(freeze, null, 2)}\n`);
}

function authorizedArtifactFixture() {
  const repositoryRoot = mkdtempSync(join(tmpdir(), "subscription-authorized-"));
  git(repositoryRoot, ["init", "-q"]);
  git(repositoryRoot, ["config", "user.name", "Authorization Test"]);
  git(repositoryRoot, ["config", "user.email", "authorization@example.invalid"]);
  const recordsRoot = join(repositoryRoot, "research", "llm-review-sequences");
  const benchmarkRoot = join(repositoryRoot, "generated", "benchmark");
  const collectionRoot = join(repositoryRoot, "generated", "collection");
  mkdirSync(recordsRoot, { recursive: true });
  mkdirSync(benchmarkRoot, { recursive: true });
  mkdirSync(collectionRoot, { recursive: true });

  const generated = writeGeneratedFixture(benchmarkRoot, collectionRoot);
  const study = studyRecord(generated.artifacts);
  writeFileSync(join(recordsRoot, "study.json"), `${JSON.stringify(study, null, 2)}\n`);
  for (const [name, value] of Object.entries({
    "LICENSE.md": "# Study licences\n",
    "README.md": "# Study package\n",
    "independent-review.md": "# Review protocol\n",
    "osf-preregistration-v4-draft.md": "# OSF preregistration field draft\n",
    "paper/BUILD.md": "# Reproducible paper build\n",
    "paper/paper.tex": "\\documentclass{article}\n\\begin{document}Fixture\\end{document}\n",
    "preregistration-v2.md": "# Preregistration\n",
    "provider-permission-escalation.md": "# Permission escalation\n",
    "provider-permission-request.md": "# Permission request\n",
    "provider-ai-support-response.md": "# Provider AI support response\n",
    "reviews/2026-07-19-ai-terms-parity-precommit-worktree.md": "# Terms parity review\n",
    "reviews/resolution.md": "# Resolution\n",
    "analyse.mjs": "analysis fixture\n",
    "design.mjs": "export const designFixture = true;\n",
    "precision-audit.mjs": "precision audit fixture\n",
    "subscription-runner.mjs": "runner fixture\n",
    "subscription.mjs": "subscription fixture\n",
    "pilot.mjs": "pilot fixture\n",
    "review-schema.json": "{\"type\":\"object\"}\n",
    "registration-packet.mjs": "registration packet fixture\n",
  })) {
    const path = join(recordsRoot, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, value);
  }
  git(repositoryRoot, ["add", "."]);
  git(repositoryRoot, ["commit", "-qm", "freeze test packet"]);
  const contentCommit = git(repositoryRoot, ["rev-parse", "HEAD"]);
  const reviewAttestations = writeReviewAttestations(recordsRoot, contentCommit);
  const bundleBytes = buildRegistrationPacket({
    repositoryRoot,
    contentCommit,
    studyDirectory: "research/llm-review-sequences",
  });
  const bundlePath = join(recordsRoot, "registration-payload.json");
  writeFileSync(bundlePath, bundleBytes);
  const packet = verifyRegistrationPacket(bundleBytes, {
    expectedStudyId: study.study_id,
    expectedContentCommit: contentCommit,
  });
  const runtimeFiles = Object.fromEntries(RUNTIME_FILE_NAMES.map((name) => [name, {
    git_mode: "100644",
    sha256: sha256(readFileSync(join(recordsRoot, name))),
  }]));
  const queue = {
    id: CONFIRMATORY_QUEUE_ID,
    review_systems: [...REVIEW_SYSTEMS],
    artifacts: artifactHashes(generated.artifacts),
    raw_files: { ...generated.rawFiles },
    counts: clone(generated.counts),
  };
  const contentFreeze = {
    schema_version: 3,
    study_id: study.study_id,
    status: "frozen-pre-submission",
    frozen_at: study.frozen_at,
    content_commit: contentCommit,
    branch: "confirmatory-only",
    osf_schema: {
      name: "OSF Preregistration",
      version: 4,
      id: "697b72f611a8e98484c6139b",
    },
    registration_bundle: {
      file: "registration-payload.json",
      sha256: packet.payload_sha256,
      member_manifest_sha256: packet.member_manifest_sha256,
    },
    review_attestations: reviewAttestations,
    runtime_files: runtimeFiles,
    outcome_calls_authorized: false,
    queues: [queue],
  };
  const freezePath = join(recordsRoot, "registration-content-freeze.json");
  const freezeBytes = `${JSON.stringify(contentFreeze, null, 2)}\n`;
  writeFileSync(freezePath, freezeBytes);
  const osfEvidence = rawOsfEvidenceFixture({
    registrationId: "abc12",
    downloadedFreezeBytes: freezeBytes,
    downloadedBundleBytes: bundleBytes,
  });
  const evidencePath = join(recordsRoot, osfEvidence.descriptor.registration_record.file);
  writeFileSync(evidencePath, osfEvidence.registration_record.bytes);
  writeFileSync(
    join(recordsRoot, osfEvidence.descriptor.providers_list.file),
    osfEvidence.providers_list.bytes,
  );
  for (const [index, page] of osfEvidence.provider_file_list_pages.entries()) {
    writeFileSync(
      join(recordsRoot, osfEvidence.descriptor.provider_file_list_pages[index].file),
      page.bytes,
    );
  }
  for (const [index, downloaded] of osfEvidence.downloaded_files.entries()) {
    const path = join(recordsRoot, osfEvidence.descriptor.downloaded_files[index].file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, downloaded.bytes);
  }
  const { access: subscriptionAccess, subscriptionAccessEvidence } = subscriptionAccessFixture();
  for (const [provider, bytes] of Object.entries(subscriptionAccessEvidence)) {
    const path = join(recordsRoot, subscriptionAccess[provider].usage_evidence.file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, bytes, { mode: 0o600 });
    chmodSync(path, 0o600);
  }
  const executionAuthorization = {
    schema_version: 5,
    study_id: study.study_id,
    status: "authorized-post-registration",
    outcome_calls_authorized: true,
    authorized_at: "2026-07-18T18:00:00.000Z",
    authorized_by: { ...AUTHOR },
    osf_registration: {
      id: "abc12",
      type: "registrations",
      url: "https://osf.io/abc12/",
      registered_at: "2026-07-18T17:45:00.000Z",
      registration_schema_id: "697b72f611a8e98484c6139b",
      download_evidence: clone(osfEvidence.descriptor),
    },
    author_confirmation: {
      confirmed: true,
      confirmed_at: "2026-07-18T17:47:00.000Z",
      name: AUTHOR.name,
      orcid: AUTHOR.orcid,
      statement: "I verified the downloaded OSF registration and authorize the exact named queue.",
    },
    content_freeze: {
      record_sha256: sha256(freezeBytes),
      content_commit: contentCommit,
      branch: "confirmatory-only",
      bundle_sha256: packet.payload_sha256,
      member_manifest_sha256: packet.member_manifest_sha256,
    },
    authorized_queues: [clone(queue)],
    subscription_access: subscriptionAccess,
    rule: "Fixture authorization for the exact evidence-bound confirmatory queue.",
  };
  const authorizationPath = join(recordsRoot, "execution-authorization.json");
  writeFileSync(authorizationPath, `${JSON.stringify(executionAuthorization, null, 2)}\n`);
  return {
    repositoryRoot,
    recordsRoot,
    benchmarkRoot,
    collectionRoot,
    bundlePath,
    freezePath,
    evidencePath,
    authorizationPath,
  };
}

function writeGeneratedFixture(benchmarkRoot, collectionRoot) {
  const cases = [
    fixtureCard("scenario-001", "malicious", 1),
    fixtureCard("scenario-001", "benign", 1),
    fixtureCard("scenario-002", "malicious", 2),
    fixtureCard("scenario-002", "benign", 2),
  ];
  const cards = { schema_version: 1, cases };
  const schedule = generateCallSchedule({
    scenarioIds: ["scenario-001", "scenario-002"],
    models: REVIEW_SYSTEMS,
    trialsPerCell: 1,
    splitSubmissionCount: 3,
    contexts: ["local"],
    nestedPlan: {
      scenarioIds: ["scenario-002"],
      trialsPerCell: 2,
      contexts: ["local", "cumulative"],
    },
    seed: 20260718,
  });
  const cardsByCondition = new Map(cases.map((card) => [
    `${card.scenario_id}\u0000${card.intent}`,
    card,
  ]));
  const prompts = [];
  for (const card of cases) {
    for (const decomposition of ["atomic", "split"]) {
      const submissions = decomposition === "atomic" ? 1 : 3;
      for (const workflow of ["pr", "trunk"]) {
        const contexts = card.scenario_id === "scenario-002"
          ? ["local", "cumulative"]
          : ["local"];
        for (const context of contexts) {
          for (let submissionIndex = 1; submissionIndex <= submissions; submissionIndex += 1) {
            const promptBody = {
              case_id: card.case_id,
              scenario_id: card.scenario_id,
              decomposition,
              workflow,
              context,
              submission_index: submissionIndex,
              request: defaultRequest(),
            };
            const prompt = { prompt_id: promptId(promptBody), ...promptBody };
            prompts.push(prompt);
          }
        }
      }
    }
  }
  const promptsByKey = new Map(prompts.map((prompt) => [promptKey(prompt), prompt]));
  const calls = [];
  const groundTruth = [];
  for (const row of schedule.rows) {
    const card = cardsByCondition.get(`${row.scenario_id}\u0000${row.intent}`);
    const prompt = promptsByKey.get(promptKey({ ...row, case_id: card.case_id }));
    const call = {
      call_id: callId({
        schedule_index: row.schedule_index,
        prompt_id: prompt.prompt_id,
        model: row.model,
        trial: row.trial,
      }),
      schedule_index: row.schedule_index,
      prompt_id: prompt.prompt_id,
      case_id: card.case_id,
      model: row.model,
      trial: row.trial,
    };
    calls.push(call);
    const submissions = card[row.decomposition].submissions;
    const relevantIndexes = new Set(card.ground_truth_relevant_submissions);
    groundTruth.push({
      call_id: call.call_id,
      ...row,
      case_id: card.case_id,
      template_id: card.template_id,
      scenario_family: card.family,
      expected_severity: card.expected_severity,
      relevant_submission_ids: submissions
        .filter(({ index }) => relevantIndexes.has(index))
        .map(({ commit }) => commit),
      submitted_at: submissions[row.submission_index - 1].timestamp,
      sequence_started_at: submissions[0].timestamp,
    });
  }
  const cardsBytes = `${JSON.stringify(cards, null, 2)}\n`;
  const promptsBytes = toJsonl(prompts);
  const maximumRequestBytes = Math.max(
    ...prompts.map(({ request }) => Buffer.byteLength(JSON.stringify(request))),
  );
  const callsBytes = toJsonl(calls);
  const truthBytes = toJsonl(groundTruth);
  const summary = {
    schema_version: 1,
    ...summarizeSchedule(schedule.rows),
    schedule_seed: 20260718,
    schedule_sha256: schedule.sha256,
    prompts_sha256: sha256(promptsBytes),
    calls_sha256: sha256(callsBytes),
    ground_truth_sha256: sha256(truthBytes),
  };
  const collectionBytes = `${JSON.stringify(summary, null, 2)}\n`;
  writeFileSync(join(benchmarkRoot, "cards.json"), cardsBytes);
  writeFileSync(join(benchmarkRoot, "prompts.jsonl"), promptsBytes);
  writeFileSync(join(collectionRoot, "calls.jsonl"), callsBytes);
  writeFileSync(join(collectionRoot, "ground-truth.jsonl"), truthBytes);
  writeFileSync(join(collectionRoot, "collection.json"), collectionBytes);
  return {
    artifacts: {
      cards_sha256: sha256(JSON.stringify(cards)),
      prompts_sha256: sha256(promptsBytes),
      schedule_seed: 20260718,
      schedule_sha256: schedule.sha256,
      calls_sha256: sha256(callsBytes),
      ground_truth_sha256: sha256(truthBytes),
      maximum_request_bytes: maximumRequestBytes,
    },
    rawFiles: {
      "cards.json": sha256(cardsBytes),
      "prompts.jsonl": sha256(promptsBytes),
      "calls.jsonl": sha256(callsBytes),
      "ground-truth.jsonl": sha256(truthBytes),
      "collection.json": sha256(collectionBytes),
    },
    counts: {
      sequence_system_trials: summary.sequences,
      review_boundaries: summary.calls,
      review_boundaries_by_system: summary.calls_by_model,
      review_boundaries_by_decomposition: summary.calls_by_decomposition,
    },
  };
}

function fixtureCard(scenarioId, intent, templateIndex) {
  const id = `${scenarioId}-${intent}`;
  const submission = (decomposition, index, hour) => ({
    index,
    id: `${id}-${decomposition}-${index}`,
    timestamp: `2026-07-18T${String(hour).padStart(2, "0")}:00:00.000Z`,
  });
  return {
    case_id: `case-${id}`,
    scenario_id: scenarioId,
    intent,
    template_id: `template-${String(templateIndex).padStart(3, "0")}`,
    family: "fixture-family",
    expected_severity: intent === "malicious" ? "high" : "none",
    ground_truth_relevant_submissions: [1, 2, 3],
    atomic: { submissions: [submission("atomic", 1, 3)] },
    split: {
      submissions: [
        submission("split", 1, 1),
        submission("split", 2, 2),
        submission("split", 3, 3),
      ],
    },
  };
}

function rebindMutableArtifactDigests(fixture) {
  const studyPath = join(fixture.recordsRoot, "study.json");
  const freezePath = fixture.freezePath;
  const authorizationPath = fixture.authorizationPath;
  const study = JSON.parse(readFileSync(studyPath, "utf8"));
  const freeze = JSON.parse(readFileSync(freezePath, "utf8"));
  const authorization = JSON.parse(readFileSync(authorizationPath, "utf8"));
  const cardsBytes = readFileSync(join(fixture.benchmarkRoot, "cards.json"));
  const promptsBytes = readFileSync(join(fixture.benchmarkRoot, "prompts.jsonl"));
  const prompts = readJsonl(join(fixture.benchmarkRoot, "prompts.jsonl"));
  const callsBytes = readFileSync(join(fixture.collectionRoot, "calls.jsonl"));
  const truthBytes = readFileSync(join(fixture.collectionRoot, "ground-truth.jsonl"));
  const truth = readJsonl(join(fixture.collectionRoot, "ground-truth.jsonl"));
  const scheduleRows = truth.map(scheduleCore);
  const scheduleSha256 = sha256(toJsonl(scheduleRows));
  const collection = JSON.parse(readFileSync(join(fixture.collectionRoot, "collection.json"), "utf8"));
  collection.schedule_sha256 = scheduleSha256;
  collection.prompts_sha256 = sha256(promptsBytes);
  collection.calls_sha256 = sha256(callsBytes);
  collection.ground_truth_sha256 = sha256(truthBytes);
  const collectionBytes = `${JSON.stringify(collection, null, 2)}\n`;
  writeFileSync(join(fixture.collectionRoot, "collection.json"), collectionBytes);
  const artifacts = {
    cards_sha256: sha256(JSON.stringify(JSON.parse(cardsBytes.toString("utf8")))),
    prompts_sha256: sha256(promptsBytes),
    schedule_seed: study.active_subscription_design.artifacts.schedule_seed,
    schedule_sha256: scheduleSha256,
    calls_sha256: sha256(callsBytes),
    ground_truth_sha256: sha256(truthBytes),
    maximum_request_bytes: Math.max(
      ...prompts.map(({ request }) => Buffer.byteLength(JSON.stringify(request))),
    ),
  };
  const rawFiles = {
    "cards.json": sha256(cardsBytes),
    "prompts.jsonl": sha256(promptsBytes),
    "calls.jsonl": sha256(callsBytes),
    "ground-truth.jsonl": sha256(truthBytes),
    "collection.json": sha256(collectionBytes),
  };
  study.active_subscription_design.artifacts = artifacts;
  writeFileSync(studyPath, `${JSON.stringify(study, null, 2)}\n`);
  freeze.runtime_files["study.json"].sha256 = sha256(readFileSync(studyPath));
  freeze.queues[0].artifacts = artifactHashes(artifacts);
  freeze.queues[0].raw_files = clone(rawFiles);
  const freezeBytes = `${JSON.stringify(freeze, null, 2)}\n`;
  writeFileSync(freezePath, freezeBytes);
  authorization.content_freeze.record_sha256 = sha256(freezeBytes);
  authorization.authorized_queues[0].artifacts = artifactHashes(artifacts);
  authorization.authorized_queues[0].raw_files = clone(rawFiles);
  writeFileSync(authorizationPath, `${JSON.stringify(authorization, null, 2)}\n`);
}

function refreezeFixture(fixture) {
  git(fixture.repositoryRoot, [
    "add",
    "research/llm-review-sequences/study.json",
    "generated",
  ]);
  git(fixture.repositoryRoot, ["commit", "-qm", "freeze adversarial artifact mutation"]);
  const contentCommit = git(fixture.repositoryRoot, ["rev-parse", "HEAD"]);
  const bundleBytes = buildRegistrationPacket({
    repositoryRoot: fixture.repositoryRoot,
    contentCommit,
    studyDirectory: "research/llm-review-sequences",
  });
  writeFileSync(fixture.bundlePath, bundleBytes);
  const study = JSON.parse(readFileSync(join(fixture.recordsRoot, "study.json"), "utf8"));
  const packet = verifyRegistrationPacket(bundleBytes, {
    expectedStudyId: study.study_id,
    expectedContentCommit: contentCommit,
  });
  const freeze = JSON.parse(readFileSync(fixture.freezePath, "utf8"));
  freeze.content_commit = contentCommit;
  freeze.registration_bundle.sha256 = packet.payload_sha256;
  freeze.registration_bundle.member_manifest_sha256 = packet.member_manifest_sha256;
  freeze.review_attestations = writeReviewAttestations(fixture.recordsRoot, contentCommit);
  const freezeBytes = `${JSON.stringify(freeze, null, 2)}\n`;
  writeFileSync(fixture.freezePath, freezeBytes);

  const authorization = JSON.parse(readFileSync(fixture.authorizationPath, "utf8"));
  authorization.content_freeze.record_sha256 = sha256(freezeBytes);
  authorization.content_freeze.content_commit = contentCommit;
  authorization.content_freeze.bundle_sha256 = packet.payload_sha256;
  authorization.content_freeze.member_manifest_sha256 = packet.member_manifest_sha256;
  refreshDownloadedOsfArtifact(
    fixture,
    authorization,
    "registration-content-freeze.json",
    freezeBytes,
  );
  refreshDownloadedOsfArtifact(
    fixture,
    authorization,
    "registration-payload.json",
    bundleBytes,
  );
  writeFileSync(fixture.authorizationPath, `${JSON.stringify(authorization, null, 2)}\n`);
}

function rebindRuntimeRecord(fixture, name, gitMode = "100644") {
  const freeze = JSON.parse(readFileSync(fixture.freezePath, "utf8"));
  freeze.runtime_files[name] = {
    git_mode: gitMode,
    sha256: sha256(readFileSync(join(fixture.recordsRoot, name))),
  };
  const freezeBytes = Buffer.from(`${JSON.stringify(freeze, null, 2)}\n`);
  writeFileSync(fixture.freezePath, freezeBytes);
  const authorization = JSON.parse(readFileSync(fixture.authorizationPath, "utf8"));
  authorization.content_freeze.record_sha256 = sha256(freezeBytes);
  refreshDownloadedOsfArtifact(
    fixture,
    authorization,
    "registration-content-freeze.json",
    freezeBytes,
  );
  writeFileSync(fixture.authorizationPath, `${JSON.stringify(authorization, null, 2)}\n`);
}

function refreshDownloadedOsfArtifact(fixture, authorization, name, bytes) {
  const descriptor = authorization.osf_registration.download_evidence.downloaded_files
    .find((file) => file.name === name);
  descriptor.sha256 = sha256(bytes);
  writeFileSync(join(fixture.recordsRoot, descriptor.file), bytes);
}

function resultRows(outputRoot) {
  const path = join(outputRoot, "results.jsonl");
  return existsSync(path)
    ? readJsonl(path).filter(({ record_type }) => record_type !== "run_binding")
    : [];
}

function makeRunBinding(overrides = {}) {
  const fields = {
    schema_version: 1,
    study_id: "fixture-study",
    queue_id: CONFIRMATORY_QUEUE_ID,
    content_commit: "a".repeat(40),
    registration_payload_sha256: "b".repeat(64),
    registration_member_manifest_sha256: "c".repeat(64),
    content_freeze_record_sha256: "d".repeat(64),
    execution_authorization_record_sha256: "e".repeat(64),
    authorized_queue_sha256: "f".repeat(64),
    calls_sha256: "1".repeat(64),
    prompts_sha256: "2".repeat(64),
    ground_truth_sha256: "4".repeat(64),
    review_schema_sha256: "3".repeat(64),
    ...overrides,
  };
  return { ...fields, fingerprint: sha256(JSON.stringify(canonicalValue(fields))) };
}

function rawOsfRegistrationRecord() {
  return {
    meta: { provider_extra: true },
    data: {
      type: "registrations",
      id: "abc12",
      attributes: {
        provider_extra: "preserved",
        date_registered: "2026-07-18T17:45:00Z",
      },
      relationships: {
        registration_schema: {
          data: {
            type: "registration-schemas",
            id: "697b72f611a8e98484c6139b",
          },
        },
      },
      links: {
        self: "https://api.osf.io/v2/registrations/abc12/",
        html: "https://osf.io/abc12/",
      },
      provider_extra: { retained: true },
    },
    jsonapi: { version: "1.0" },
  };
}

function rawOsfEvidenceFixture({ registrationId, downloadedFreezeBytes, downloadedBundleBytes }) {
  const apiRoot = `https://api.osf.io/v2/registrations/${registrationId}`;
  const registrationRecord = rawOsfRegistrationRecord();
  const providersList = {
    data: [{
      type: "files",
      id: `${registrationId}:osfstorage`,
      attributes: { name: "osfstorage" },
      links: { files: `${apiRoot}/files/osfstorage/` },
    }],
    links: { self: `${apiRoot}/files/`, next: null },
  };
  const files = [
    {
      name: "registration-content-freeze.json",
      id: "osf-file-freeze",
      download_url: `https://files.osf.io/v1/resources/${registrationId}/providers/osfstorage/osf-file-freeze`,
      local_file: "osf-downloads/registration-content-freeze.json",
      bytes: Buffer.from(downloadedFreezeBytes),
    },
    {
      name: "registration-payload.json",
      id: "osf-file-payload",
      download_url: `https://files.osf.io/v1/resources/${registrationId}/providers/osfstorage/osf-file-payload`,
      local_file: "osf-downloads/registration-payload.json",
      bytes: Buffer.from(downloadedBundleBytes),
    },
  ];
  const providerFileList = {
    data: files.map((file) => ({
      type: "files",
      id: file.id,
      attributes: {
        name: file.name,
        kind: "file",
        provider: "osfstorage",
      },
      relationships: {
        node: { data: { type: "registrations", id: registrationId } },
      },
      links: { download: file.download_url },
    })),
    links: { self: `${apiRoot}/files/osfstorage/`, next: null },
  };
  const registrationBytes = rawOsfEvidenceBytes(registrationRecord);
  const providersBytes = rawOsfEvidenceBytes(providersList);
  const fileListBytes = rawOsfEvidenceBytes(providerFileList);
  return {
    descriptor: {
      registration_record: {
        file: "osf-registration-export.json",
        url: `${apiRoot}/`,
        sha256: sha256(registrationBytes),
      },
      providers_list: {
        file: "osf-registration-providers.json",
        url: `${apiRoot}/files/`,
        sha256: sha256(providersBytes),
      },
      provider_file_list_pages: [{
        file: "osf-registration-osfstorage-files-page-1.json",
        url: `${apiRoot}/files/osfstorage/`,
        sha256: sha256(fileListBytes),
      }],
      downloaded_files: files.map((file) => ({
        name: file.name,
        file_id: file.id,
        download_url: file.download_url,
        file: file.local_file,
        sha256: sha256(file.bytes),
      })),
      verified_at: "2026-07-18T17:46:00.000Z",
      verified_by: { ...AUTHOR },
    },
    registration_record: { json: registrationRecord, bytes: registrationBytes },
    providers_list: { json: providersList, bytes: providersBytes },
    provider_file_list_pages: [{ json: providerFileList, bytes: fileListBytes }],
    downloaded_files: files.map((file) => ({
      descriptor: {
        name: file.name,
        file_id: file.id,
        download_url: file.download_url,
        file: file.local_file,
        sha256: sha256(file.bytes),
      },
      bytes: file.bytes,
    })),
  };
}

function rawOsfEvidenceBytes(value) {
  return Buffer.from(` \n${JSON.stringify(value, null, 4)} \n`);
}

function rebindOsfRawRecord(records, name) {
  const evidence = records.osfEvidence[name];
  evidence.bytes = rawOsfEvidenceBytes(evidence.json);
  records.executionAuthorization.osf_registration.download_evidence[name].sha256 =
    sha256(evidence.bytes);
}

function rebindOsfFileListPage(records, index) {
  const evidence = records.osfEvidence.provider_file_list_pages[index];
  evidence.bytes = rawOsfEvidenceBytes(evidence.json);
  records.executionAuthorization.osf_registration.download_evidence
    .provider_file_list_pages[index].sha256 = sha256(evidence.bytes);
}

function paginateOsfFileList(records) {
  const pages = records.osfEvidence.provider_file_list_pages;
  const firstPage = pages[0];
  const [firstResource, secondResource] = firstPage.json.data;
  const secondUrl = `${firstPage.json.links.self}?page=2`;
  firstPage.json.data = [firstResource];
  firstPage.json.links.next = secondUrl;
  rebindOsfFileListPage(records, 0);
  const secondPage = {
    data: [secondResource],
    links: { self: secondUrl, next: null },
  };
  const secondBytes = rawOsfEvidenceBytes(secondPage);
  pages.push({ json: secondPage, bytes: secondBytes });
  records.executionAuthorization.osf_registration.download_evidence
    .provider_file_list_pages.push({
      file: "osf-registration-osfstorage-files-page-2.json",
      url: secondUrl,
      sha256: sha256(secondBytes),
    });
}

function canonicalValue(value) {
  if (Array.isArray(value)) return value.map(canonicalValue);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalValue(value[key])]));
}

function scheduleCore(row) {
  return {
    sequence_id: row.sequence_id,
    scenario_id: row.scenario_id,
    intent: row.intent,
    decomposition: row.decomposition,
    workflow: row.workflow,
    context: row.context,
    model: row.model,
    trial: row.trial,
    submission_index: row.submission_index,
    activation_index: row.activation_index,
    schedule_index: row.schedule_index,
  };
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

function appendText(path, text) {
  writeFileSync(path, `${readFileSync(path, "utf8")}${text}`);
}

function codexSandboxProbeFixture() {
  const root = mkdtempSync(join(tmpdir(), "codex-study-minimal-probe-"));
  const home = join(root, "isolated-home");
  const codexHome = join(home, ".codex");
  const cwd = join(root, "empty-cwd");
  mkdirSync(codexHome, { recursive: true, mode: 0o700 });
  writePrivateFixtureFile(
    join(codexHome, "auth.json"),
    JSON.stringify({ tokens: { account_id: CODEX_ACCOUNT_ID } }),
  );
  mkdirSync(cwd, { mode: 0o700 });
  const credentialDirectoryProbe = join(codexHome, "model-shell-deny-probe");
  const ambientSentinel = join(root, "ambient-sentinel");
  writePrivateFixtureFile(credentialDirectoryProbe, "credential directory must be denied\n");
  writePrivateFixtureFile(ambientSentinel, "ambient path must be denied\n");
  return {
    home,
    probe: {
      cwd,
      denied_paths: [credentialDirectoryProbe, ambientSentinel],
    },
  };
}

function accountIdentitySha256() {
  const claude = JSON.parse(CLAUDE_AUTH_STATUS);
  return {
    codex: sha256(JSON.stringify(canonicalValue({
      provider: "codex",
      account_id: CODEX_ACCOUNT_ID,
    }))),
    claude: sha256(JSON.stringify(canonicalValue({
      provider: "claude",
      email: claude.email,
      org_id: claude.orgId,
    }))),
  };
}

function writePrivateFixtureFile(path, bytes) {
  writeFileSync(path, bytes, { mode: 0o600 });
  chmodSync(path, 0o600);
}

function readJsonl(path) {
  return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
}

function toJsonl(rows) {
  return `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
}

function git(repositoryRoot, args) {
  const result = spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_DATE: "2026-07-19T00:00:00Z",
      GIT_COMMITTER_DATE: "2026-07-19T00:00:00Z",
    },
  });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  return result.stdout.trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalSha256(value) {
  return sha256(JSON.stringify(canonicalValue(value)));
}

function artifactHashes(artifacts) {
  return Object.fromEntries([
    "cards_sha256",
    "prompts_sha256",
    "schedule_sha256",
    "calls_sha256",
    "ground_truth_sha256",
  ].map((name) => [name, artifacts[name]]));
}

function legacyQueueCounts(counts) {
  return {
    sequences: counts.sequence_system_trials,
    review_boundaries: counts.review_boundaries,
    calls_by_model: clone(counts.review_boundaries_by_system),
    calls_by_decomposition: clone(counts.review_boundaries_by_decomposition),
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
