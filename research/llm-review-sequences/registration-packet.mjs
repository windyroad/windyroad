import { Buffer } from "node:buffer";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { isAbsolute, posix, resolve, win32 } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { TextDecoder } from "node:util";

export const REGISTRATION_PACKET_SCHEMA_VERSION = 1;

const DEFAULT_STUDY_DIRECTORY = "research/llm-review-sequences";
const FULL_GIT_COMMIT = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
const SHA256 = /^[0-9a-f]{64}$/;
const CANONICAL_UTC_MILLISECOND = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const UNRESOLVED_PLACEHOLDER = /\[\[[^\]\r\n]{1,200}\]\]/u;
const PACKET_KEYS = ["schema_version", "study_id", "content_commit", "members"];
const MEMBER_KEYS = ["path", "media_type", "size_bytes", "sha256", "content_base64"];
const DETACHED_RECORDS = new Set([
  "execution-authorization.json",
  "registration-content-freeze.json",
]);
const HIGH_CONFIDENCE_CREDENTIAL_PATTERNS = [
  /-----BEGIN (?:EC |OPENSSH |PGP |RSA )?PRIVATE KEY-----/u,
  /\bAKIA[0-9A-Z]{16}\b/u,
  /\bgh[pousr]_[A-Za-z0-9]{30,}\b/u,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/u,
];

export const REGISTRATION_PACKET_MEMBERS = Object.freeze([
  Object.freeze({ path: "LICENSE.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "README.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "independent-review.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "osf-preregistration-v4-draft.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "paper/BUILD.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "paper/paper.tex", media_type: "text/x-tex; charset=utf-8" }),
  Object.freeze({ path: "preregistration-v2.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "provider-ai-support-response.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "provider-permission-escalation.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "provider-permission-request.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "review-schema.json", media_type: "application/json" }),
  Object.freeze({ path: "reviews/2026-07-19-ai-terms-parity-precommit-worktree.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "reviews/resolution.md", media_type: "text/markdown; charset=utf-8" }),
  Object.freeze({ path: "study.json", media_type: "application/json" }),
]);

const EXPECTED_MEMBER_BY_PATH = new Map(REGISTRATION_PACKET_MEMBERS.map((member) => [
  member.path,
  member,
]));
const UTF8_DECODER = new TextDecoder("utf-8", { fatal: true });

/**
 * Build the release-safe OSF attachment from regular, non-executable blobs in
 * one exact Git commit. The current worktree is deliberately never read.
 */
export function buildRegistrationPacket({
  repositoryRoot,
  contentCommit,
  studyDirectory = DEFAULT_STUDY_DIRECTORY,
}) {
  if (typeof repositoryRoot !== "string" || !isAbsolute(repositoryRoot)) {
    throw new Error("An absolute repositoryRoot is required");
  }
  assertFullGitCommit(contentCommit);
  assertSafeRelativePath(studyDirectory);
  const canonicalRepositoryRoot = resolve(repositoryRoot);
  const resolvedCommit = gitText(canonicalRepositoryRoot, [
    "rev-parse", "--verify", `${contentCommit}^{commit}`,
  ]);
  if (resolvedCommit !== contentCommit) {
    throw new Error("contentCommit must identify the exact full Git commit");
  }

  const members = REGISTRATION_PACKET_MEMBERS.map(({ path, media_type }) => {
    const gitPath = posix.join(studyDirectory, path);
    const treeEntry = gitText(canonicalRepositoryRoot, ["ls-tree", contentCommit, "--", gitPath], {
      allowEmpty: true,
    });
    if (!treeEntry) {
      throw new Error(`Required registration member is absent from content commit: ${path}`);
    }
    const match = treeEntry.match(/^([0-9]{6}) blob ([0-9a-f]+)\t(.+)$/u);
    if (!match || match[3] !== gitPath || match[1] !== "100644") {
      throw new Error(`Registration member must be a regular non-executable Git blob: ${path}`);
    }

    const content = gitBytes(canonicalRepositoryRoot, ["show", `${contentCommit}:${gitPath}`]);
    assertReleaseSafeContent(path, content);
    return registrationMember(path, media_type, content);
  });
  const studyMember = members.find(({ path }) => path === "study.json");
  const study = parseJsonMember(studyMember, "study.json");
  assertStudyId(study.study_id);
  assertFrozenStudy(study);

  return canonicalPacketBytes({
    schema_version: REGISTRATION_PACKET_SCHEMA_VERSION,
    study_id: study.study_id,
    content_commit: contentCommit,
    members,
  });
}

/**
 * Verify a packet without extracting it. Only the fixed metadata inventory is
 * returned, so callers do not accidentally persist embedded source content.
 */
export function verifyRegistrationPacket(payloadBytes, {
  expectedStudyId,
  expectedContentCommit,
  repositoryRoot,
  studyDirectory = DEFAULT_STUDY_DIRECTORY,
} = {}) {
  const bytes = asPayloadBuffer(payloadBytes);
  assertStudyId(expectedStudyId, "expected study identity");
  assertFullGitCommit(expectedContentCommit, "expected content commit");

  let packet;
  try {
    packet = JSON.parse(UTF8_DECODER.decode(bytes));
  } catch (error) {
    throw new Error(`Registration packet is not valid UTF-8 JSON: ${error.message}`);
  }
  assertPlainObject(packet, "Registration packet");
  assertExactKeys(packet, PACKET_KEYS, "Registration packet");
  if (packet.schema_version !== REGISTRATION_PACKET_SCHEMA_VERSION) {
    throw new Error("Unsupported registration packet schema version");
  }
  if (packet.study_id !== expectedStudyId) {
    throw new Error("Registration packet study identity does not match the expected study");
  }
  if (packet.content_commit !== expectedContentCommit) {
    throw new Error("Registration packet content commit does not match the expected commit");
  }
  if (!Array.isArray(packet.members)) {
    throw new Error("Registration packet members must be an array");
  }

  const paths = [];
  const seen = new Set();
  for (const candidate of packet.members) {
    assertPlainObject(candidate, "Registration packet member");
    if (typeof candidate.path !== "string") {
      throw new Error("Registration packet member path must be a string");
    }
    assertSafeRelativePath(candidate.path);
    assertNotForbiddenPacketPath(candidate.path);
    if (seen.has(candidate.path)) {
      throw new Error(`Duplicate registration packet member: ${candidate.path}`);
    }
    seen.add(candidate.path);
    paths.push(candidate.path);
  }

  const missing = REGISTRATION_PACKET_MEMBERS
    .map(({ path }) => path)
    .filter((path) => !seen.has(path));
  if (missing.length > 0) {
    throw new Error(`Registration packet is missing required members: ${missing.join(", ")}`);
  }
  const unexpected = paths.filter((path) => !EXPECTED_MEMBER_BY_PATH.has(path));
  if (unexpected.length > 0) {
    throw new Error(`Registration packet has unexpected members: ${unexpected.join(", ")}`);
  }
  const canonicalPaths = REGISTRATION_PACKET_MEMBERS.map(({ path }) => path);
  if (!paths.every((path, index) => path === canonicalPaths[index])) {
    throw new Error("Registration packet members are not in canonical order");
  }

  for (const candidate of packet.members) {
    assertExactKeys(candidate, MEMBER_KEYS, `Registration packet member ${candidate.path}`);
    const expected = EXPECTED_MEMBER_BY_PATH.get(candidate.path);
    if (candidate.media_type !== expected.media_type) {
      throw new Error(`Registration packet member media type drift: ${candidate.path}`);
    }
    if (!Number.isSafeInteger(candidate.size_bytes) || candidate.size_bytes < 0) {
      throw new Error(`Registration packet member size is invalid: ${candidate.path}`);
    }
    if (typeof candidate.sha256 !== "string" || !SHA256.test(candidate.sha256)) {
      throw new Error(`Registration packet member SHA-256 is invalid: ${candidate.path}`);
    }
    if (typeof candidate.content_base64 !== "string") {
      throw new Error(`Registration packet member base64 content is invalid: ${candidate.path}`);
    }
    const content = Buffer.from(candidate.content_base64, "base64");
    if (content.toString("base64") !== candidate.content_base64) {
      throw new Error(`Registration packet member does not use canonical base64: ${candidate.path}`);
    }
    if (content.length !== candidate.size_bytes) {
      throw new Error(`Registration packet member size does not match content: ${candidate.path}`);
    }
    if (sha256(content) !== candidate.sha256) {
      throw new Error(`Registration packet member SHA-256 does not match content: ${candidate.path}`);
    }
    assertReleaseSafeContent(candidate.path, content);
  }

  const embeddedStudy = parseJsonMember(
    packet.members.find(({ path }) => path === "study.json"),
    "study.json",
  );
  if (embeddedStudy.study_id !== packet.study_id) {
    throw new Error("Embedded study.json study identity does not match the packet");
  }
  assertFrozenStudy(embeddedStudy);
  if (repositoryRoot !== undefined) {
    assertPacketMatchesGit(packet, {
      repositoryRoot,
      contentCommit: expectedContentCommit,
      studyDirectory,
    });
  }
  if (!bytes.equals(canonicalPacketBytes(packet))) {
    throw new Error("Registration packet does not use the canonical JSON encoding");
  }

  const members = packet.members.map(({ path, media_type, size_bytes, sha256: memberSha256 }) => ({
    path,
    media_type,
    size_bytes,
    sha256: memberSha256,
  }));
  return {
    study_id: packet.study_id,
    content_commit: packet.content_commit,
    payload_sha256: sha256(bytes),
    member_manifest_sha256: sha256(Buffer.from(`${JSON.stringify(members)}\n`)),
    members,
  };
}

function registrationMember(path, mediaType, content) {
  return {
    path,
    media_type: mediaType,
    size_bytes: content.length,
    sha256: sha256(content),
    content_base64: content.toString("base64"),
  };
}

function canonicalPacketBytes(packet) {
  return Buffer.from(`${JSON.stringify(packet, null, 2)}\n`);
}

function asPayloadBuffer(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof Uint8Array) return Buffer.from(value);
  if (typeof value === "string") return Buffer.from(value);
  throw new Error("Registration packet must be supplied as bytes or a UTF-8 string");
}

function assertFullGitCommit(value, label = "contentCommit") {
  if (typeof value !== "string" || !FULL_GIT_COMMIT.test(value)) {
    throw new Error(`${label} must identify an exact full Git commit`);
  }
}

function assertStudyId(value, label = "study_id") {
  if (typeof value !== "string" || !/^[a-z0-9][a-z0-9._-]{1,127}$/u.test(value)) {
    throw new Error(`${label} is missing or invalid`);
  }
}

function assertFrozenStudy(study) {
  if (study?.frozen !== true) {
    throw new Error("Embedded study must be frozen before building a registration packet");
  }
  const frozenAt = study.frozen_at;
  if (typeof frozenAt !== "string" || !CANONICAL_UTC_MILLISECOND.test(frozenAt)
    || Number.isNaN(Date.parse(frozenAt)) || new Date(frozenAt).toISOString() !== frozenAt) {
    throw new Error("Embedded study frozen_at must be a canonical UTC millisecond timestamp");
  }
}

function assertSafeRelativePath(path) {
  if (typeof path !== "string" || path.length === 0
    || posix.isAbsolute(path) || win32.isAbsolute(path) || path.includes("\\")
    || path.includes("\0") || path !== posix.normalize(path)
    || path.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error(`Unsafe member path in registration packet: ${String(path)}`);
  }
}

function assertNotForbiddenPacketPath(path) {
  const lower = path.toLowerCase();
  const basename = posix.basename(lower);
  const forbidden = DETACHED_RECORDS.has(lower)
    || /\.(?:cjs|js|jsx|mjs|py|rb|sh|ts|tsx)$/u.test(lower)
    || /(?:^|\/)(?:benchmark|cases?|generated|prompts?|calls?|ground-truth)(?:[./-]|$)/u.test(lower)
    || /(?:^|\/)(?:attempts?|results?|responses?|raw-provider-output|reasoning-traces?)(?:[./-]|$)/u.test(lower)
    || /(?:^|\/)(?:account-state|account-status|auth-state|session-state)(?:[./-]|$)/u.test(lower)
    || basename === ".env"
    || /(?:^|[._-])(?:credential|credentials|secret|secrets|token|tokens)(?:[._-]|$)/u.test(basename);
  if (forbidden) {
    throw new Error(`Forbidden release-unsafe registration packet member: ${path}`);
  }
}

function assertReleaseSafeContent(path, content) {
  let text;
  try {
    text = UTF8_DECODER.decode(content);
  } catch (error) {
    throw new Error(`Registration packet member is not valid UTF-8 text: ${path}: ${error.message}`);
  }
  if (text.includes("\0")) {
    throw new Error(`Registration packet member contains binary control data: ${path}`);
  }
  if (HIGH_CONFIDENCE_CREDENTIAL_PATTERNS.some((pattern) => pattern.test(text))) {
    throw new Error(`Registration packet member contains high-confidence credential material: ${path}`);
  }
  if (UNRESOLVED_PLACEHOLDER.test(text)) {
    throw new Error(`Registration packet member contains an unresolved placeholder: ${path}`);
  }
}

function parseJsonMember(member, label) {
  try {
    return JSON.parse(Buffer.from(member.content_base64, "base64").toString("utf8"));
  } catch (error) {
    throw new Error(`Registration packet ${label} is invalid JSON: ${error.message}`);
  }
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)
    || Object.getPrototypeOf(value) !== Object.prototype) {
    throw new Error(`${label} must be a plain object`);
  }
}

function assertExactKeys(value, expectedKeys, label) {
  const keys = Object.keys(value);
  const missing = expectedKeys.filter((key) => !Object.hasOwn(value, key));
  const extra = keys.filter((key) => !expectedKeys.includes(key));
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(`${label} keys do not match the schema; missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}`);
  }
  if (!keys.every((key, index) => key === expectedKeys[index])) {
    throw new Error(`${label} keys are not in canonical key order`);
  }
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function gitText(repositoryRoot, args, { allowEmpty = false } = {}) {
  const bytes = gitBytes(repositoryRoot, args);
  const value = bytes.toString("utf8").trimEnd();
  if (!allowEmpty && !value) {
    throw new Error(`Git command returned no data: git ${args[0]}`);
  }
  return value;
}

function gitBytes(repositoryRoot, args) {
  const result = spawnSync("git", ["--no-replace-objects", ...args], {
    cwd: repositoryRoot,
    encoding: null,
    env: sanitizedGitEnvironment(),
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) {
    throw new Error(`Git command failed: ${result.error.message}`);
  }
  if (result.status !== 0) {
    const detail = Buffer.from(result.stderr ?? []).toString("utf8").trim();
    throw new Error(`Git command failed: git ${args[0]}${detail ? `: ${detail}` : ""}`);
  }
  return Buffer.from(result.stdout ?? []);
}

function assertPacketMatchesGit(packet, { repositoryRoot, contentCommit, studyDirectory }) {
  if (typeof repositoryRoot !== "string" || !isAbsolute(repositoryRoot)) {
    throw new Error("An absolute repositoryRoot is required for Git-bound packet verification");
  }
  assertSafeRelativePath(studyDirectory);
  const canonicalRepositoryRoot = resolve(repositoryRoot);
  const resolvedCommit = gitText(canonicalRepositoryRoot, [
    "rev-parse", "--verify", `${contentCommit}^{commit}`,
  ]);
  if (resolvedCommit !== contentCommit) {
    throw new Error("Expected content commit is not the exact full Git commit");
  }
  for (const candidate of packet.members) {
    const gitPath = posix.join(studyDirectory, candidate.path);
    const treeEntry = gitText(canonicalRepositoryRoot, [
      "ls-tree", contentCommit, "--", gitPath,
    ], { allowEmpty: true });
    const match = treeEntry.match(/^([0-9]{6}) blob ([0-9a-f]+)\t(.+)$/u);
    if (!match || match[3] !== gitPath || match[1] !== "100644") {
      throw new Error(`Registration packet Git source is missing or not a regular non-executable blob: ${candidate.path}`);
    }
    const committed = gitBytes(canonicalRepositoryRoot, ["show", `${contentCommit}:${gitPath}`]);
    const embedded = Buffer.from(candidate.content_base64, "base64");
    if (!embedded.equals(committed)) {
      throw new Error(`Registration packet member does not match the Git content commit: ${candidate.path}`);
    }
  }
}

function sanitizedGitEnvironment() {
  const env = { ...process.env };
  const exactRedirects = new Set([
    "GIT_ALTERNATE_OBJECT_DIRECTORIES",
    "GIT_CEILING_DIRECTORIES",
    "GIT_COMMON_DIR",
    "GIT_CONFIG",
    "GIT_CONFIG_COUNT",
    "GIT_CONFIG_GLOBAL",
    "GIT_CONFIG_NOSYSTEM",
    "GIT_CONFIG_PARAMETERS",
    "GIT_CONFIG_SYSTEM",
    "GIT_DIR",
    "GIT_DISCOVERY_ACROSS_FILESYSTEM",
    "GIT_EXEC_PATH",
    "GIT_GRAFT_FILE",
    "GIT_INDEX_FILE",
    "GIT_NAMESPACE",
    "GIT_OBJECT_DIRECTORY",
    "GIT_REPLACE_REF_BASE",
    "GIT_SHALLOW_FILE",
    "GIT_WORK_TREE",
  ]);
  for (const key of Object.keys(env)) {
    if (exactRedirects.has(key) || /^GIT_CONFIG_(?:KEY|VALUE)_\d+$/u.test(key)) delete env[key];
  }
  env.GIT_CONFIG_GLOBAL = process.platform === "win32" ? "NUL" : "/dev/null";
  env.GIT_CONFIG_NOSYSTEM = "1";
  env.GIT_NO_REPLACE_OBJECTS = "1";
  return env;
}

function cliHelp() {
  return [
    "Usage:",
    "  registration-packet.mjs build REPOSITORY_ROOT CONTENT_COMMIT OUTPUT_FILE",
    "  registration-packet.mjs verify REPOSITORY_ROOT PAYLOAD_FILE EXPECTED_STUDY_ID EXPECTED_CONTENT_COMMIT",
    "  registration-packet.mjs --help",
    "",
    "Fixed release-safe member allowlist:",
    ...REGISTRATION_PACKET_MEMBERS.map(({ path, media_type }) => `  ${path} (${media_type})`),
    "",
  ].join("\n");
}

function runCli(args) {
  if (args.length === 1 && ["--help", "-h", "help"].includes(args[0])) {
    process.stdout.write(cliHelp());
    return;
  }
  if (args[0] === "build" && args.length === 4) {
    const [, repositoryRoot, contentCommit, outputFile] = args;
    if (existsSync(outputFile)) {
      throw new Error(`Refusing to overwrite existing registration packet: ${outputFile}`);
    }
    const bytes = buildRegistrationPacket({ repositoryRoot, contentCommit });
    const packet = JSON.parse(bytes.toString("utf8"));
    const verification = verifyRegistrationPacket(bytes, {
      expectedStudyId: packet.study_id,
      expectedContentCommit: contentCommit,
      repositoryRoot,
    });
    writeFileSync(outputFile, bytes, { flag: "wx", mode: 0o644 });
    process.stdout.write(`${JSON.stringify(verification, null, 2)}\n`);
    return;
  }
  if (args[0] === "verify" && args.length === 5) {
    const [, repositoryRoot, payloadFile, expectedStudyId, expectedContentCommit] = args;
    const verification = verifyRegistrationPacket(readFileSync(payloadFile), {
      expectedStudyId,
      expectedContentCommit,
      repositoryRoot,
    });
    process.stdout.write(`${JSON.stringify(verification, null, 2)}\n`);
    return;
  }
  throw new Error("Invalid command. Run registration-packet.mjs --help for usage.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    runCli(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
