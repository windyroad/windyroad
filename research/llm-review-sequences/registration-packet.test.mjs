import { spawnSync } from "node:child_process";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";

import { describe, expect, it } from "vitest";

import {
  REGISTRATION_PACKET_MEMBERS,
  buildRegistrationPacket,
  verifyRegistrationPacket,
} from "./registration-packet.mjs";

const STUDY_DIRECTORY = "research/llm-review-sequences";
const STUDY_ID = "llm-review-sequences-test";
const CLI_PATH = join(import.meta.dirname, "registration-packet.mjs");
const EXPECTED_MEMBERS = [
  ["LICENSE.md", "text/markdown; charset=utf-8"],
  ["README.md", "text/markdown; charset=utf-8"],
  ["independent-review.md", "text/markdown; charset=utf-8"],
  ["osf-preregistration-v4-draft.md", "text/markdown; charset=utf-8"],
  ["paper/BUILD.md", "text/markdown; charset=utf-8"],
  ["paper/paper.tex", "text/x-tex; charset=utf-8"],
  ["preregistration-v2.md", "text/markdown; charset=utf-8"],
  ["provider-ai-support-response.md", "text/markdown; charset=utf-8"],
  ["provider-permission-escalation.md", "text/markdown; charset=utf-8"],
  ["provider-permission-request.md", "text/markdown; charset=utf-8"],
  ["review-schema.json", "application/json"],
  ["reviews/2026-07-19-ai-terms-parity-precommit-worktree.md", "text/markdown; charset=utf-8"],
  ["reviews/resolution.md", "text/markdown; charset=utf-8"],
  ["study.json", "application/json"],
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
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
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${result.stderr}`);
  }
  return result.stdout.trim();
}

function committedFixture() {
  const repositoryRoot = mkdtempSync(join(tmpdir(), "registration-packet-"));
  git(repositoryRoot, ["init", "-q"]);
  git(repositoryRoot, ["config", "user.name", "Registration Test"]);
  git(repositoryRoot, ["config", "user.email", "registration@example.invalid"]);

  const contents = new Map([
    ["LICENSE.md", Buffer.from("# Study licences\n\nCode: MIT. Prose and data: CC BY 4.0.\n")],
    ["README.md", Buffer.from("# Reproducible study package\n")],
    ["independent-review.md", Buffer.from("# Independent review\n\nNo outcome data were reviewed.\n")],
    ["osf-preregistration-v4-draft.md", Buffer.from("# OSF Preregistration v4\n\nField-complete answer packet.\n")],
    ["paper/BUILD.md", Buffer.from("# Paper build\n\nUse the pinned container.\n")],
    ["paper/paper.tex", Buffer.from("\\documentclass{article}\n\\begin{document}\nProtocol.\n\\end{document}\n")],
    ["preregistration-v2.md", Buffer.from("# Preregistration\n\nProspective hypotheses only.\n")],
    ["provider-ai-support-response.md", Buffer.from("# Provider AI support response\n\nPrivacy-safe visible content.\n")],
    ["provider-permission-escalation.md", Buffer.from("# Provider permission escalation\n\nHuman clarification remains pending.\n")],
    ["provider-permission-request.md", Buffer.from("# Provider permission request\n\nSynthetic review only.\n")],
    ["review-schema.json", Buffer.from(`${JSON.stringify({ type: "object" }, null, 2)}\n`)],
    ["reviews/2026-07-19-ai-terms-parity-precommit-worktree.md", Buffer.from("# Terms parity review\n\nEvidence reviewed before registration.\n")],
    ["reviews/resolution.md", Buffer.from("# Review resolution\n\nAll blockers resolved before registration.\n")],
    ["study.json", Buffer.from(`${JSON.stringify({
      study_id: STUDY_ID,
      frozen: true,
      frozen_at: "2026-07-19T00:00:00.000Z",
    }, null, 2)}\n`)],
  ]);

  for (const [path, content] of contents) {
    const absolutePath = join(repositoryRoot, STUDY_DIRECTORY, path);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, content);
  }
  git(repositoryRoot, ["add", STUDY_DIRECTORY]);
  git(repositoryRoot, ["commit", "-qm", "freeze safe registration content"]);
  return {
    repositoryRoot,
    contentCommit: git(repositoryRoot, ["rev-parse", "HEAD"]),
    contents,
  };
}

function buildFixture() {
  const fixture = committedFixture();
  const bytes = buildRegistrationPacket({
    repositoryRoot: fixture.repositoryRoot,
    contentCommit: fixture.contentCommit,
    studyDirectory: STUDY_DIRECTORY,
  });
  return { ...fixture, bytes, packet: JSON.parse(bytes.toString("utf8")) };
}

function encodePacket(packet) {
  return Buffer.from(`${JSON.stringify(packet, null, 2)}\n`);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function member(path, content = Buffer.from("unexpected\n"), mediaType = "text/plain; charset=utf-8") {
  return {
    path,
    media_type: mediaType,
    size_bytes: content.length,
    sha256: sha256(content),
    content_base64: content.toString("base64"),
  };
}

function verify(bytes, fixture) {
  return verifyRegistrationPacket(bytes, {
    expectedStudyId: STUDY_ID,
    expectedContentCommit: fixture.contentCommit,
    repositoryRoot: fixture.repositoryRoot,
    studyDirectory: STUDY_DIRECTORY,
  });
}

function cli(args) {
  return spawnSync(process.execPath, [CLI_PATH, ...args], { encoding: "utf8" });
}

describe("release-safe OSF registration packet", () => {
  it("builds identical canonical bytes from an exact Git commit, not the worktree", () => {
    const fixture = committedFixture();
    writeFileSync(join(fixture.repositoryRoot, STUDY_DIRECTORY, "README.md"), "uncommitted drift\n");

    const first = buildRegistrationPacket({
      repositoryRoot: fixture.repositoryRoot,
      contentCommit: fixture.contentCommit,
      studyDirectory: STUDY_DIRECTORY,
    });
    const second = buildRegistrationPacket({
      repositoryRoot: fixture.repositoryRoot,
      contentCommit: fixture.contentCommit,
      studyDirectory: STUDY_DIRECTORY,
    });
    const packet = JSON.parse(first.toString("utf8"));

    expect(first.equals(second)).toBe(true);
    expect(first.at(-1)).toBe(0x0a);
    expect(packet).toMatchObject({
      schema_version: 1,
      study_id: STUDY_ID,
      content_commit: fixture.contentCommit,
    });
    expect(Object.keys(packet)).toEqual(["schema_version", "study_id", "content_commit", "members"]);
    expect(packet).not.toHaveProperty("generated_at");
    expect(packet.members).toHaveLength(14);
    expect(packet.members.map(({ path }) => path)).toEqual(EXPECTED_MEMBERS.map(([path]) => path));

    for (const [path, mediaType] of EXPECTED_MEMBERS) {
      const packetMember = packet.members.find((candidate) => candidate.path === path);
      const content = fixture.contents.get(path);
      expect(Object.keys(packetMember)).toEqual([
        "path", "media_type", "size_bytes", "sha256", "content_base64",
      ]);
      expect(packetMember).toMatchObject({
        path,
        media_type: mediaType,
        size_bytes: content.length,
        sha256: sha256(content),
        content_base64: content.toString("base64"),
      });
    }
    expect(Buffer.from(
      packet.members.find(({ path }) => path === "README.md").content_base64,
      "base64",
    ).toString("utf8")).toBe("# Reproducible study package\n");
  });

  it("exports the exact fixed allowlist and verifies the canonical member inventory", () => {
    const fixture = buildFixture();
    expect(REGISTRATION_PACKET_MEMBERS.map(({ path, media_type }) => [path, media_type]))
      .toEqual(EXPECTED_MEMBERS);

    const verification = verify(fixture.bytes, fixture);
    expect(verification).toMatchObject({
      study_id: STUDY_ID,
      content_commit: fixture.contentCommit,
      payload_sha256: sha256(fixture.bytes),
    });
    expect(verification.member_manifest_sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(verification.members).toEqual(fixture.packet.members.map((packetMember) => ({
      path: packetMember.path,
      media_type: packetMember.media_type,
      size_bytes: packetMember.size_bytes,
      sha256: packetMember.sha256,
    })));
  });

  it("rejects missing, extra, duplicate, and noncanonical member sets", () => {
    const fixture = buildFixture();

    const missing = clone(fixture.packet);
    missing.members.pop();
    expect(() => verify(encodePacket(missing), fixture)).toThrow(/missing/i);

    for (const requiredPath of [
      "provider-ai-support-response.md",
      "provider-permission-escalation.md",
      "reviews/2026-07-19-ai-terms-parity-precommit-worktree.md",
    ]) {
      const missingGoverningEvidence = clone(fixture.packet);
      const memberIndex = missingGoverningEvidence.members
        .findIndex(({ path }) => path === requiredPath);
      expect(memberIndex, requiredPath).toBeGreaterThanOrEqual(0);
      missingGoverningEvidence.members.splice(memberIndex, 1);
      expect(() => verify(encodePacket(missingGoverningEvidence), fixture), requiredPath)
        .toThrow(new RegExp(`missing required members: .*${requiredPath.replaceAll(".", "\\.")}`, "i"));
    }

    const extra = clone(fixture.packet);
    extra.members.push(member("notes.txt"));
    expect(() => verify(encodePacket(extra), fixture)).toThrow(/unexpected/i);

    const duplicate = clone(fixture.packet);
    duplicate.members.push(clone(duplicate.members[0]));
    expect(() => verify(encodePacket(duplicate), fixture)).toThrow(/duplicate/i);

    const reordered = clone(fixture.packet);
    reordered.members.reverse();
    expect(() => verify(encodePacket(reordered), fixture)).toThrow(/canonical order/i);
  });

  it("rejects traversal, absolute, and platform-absolute member paths", () => {
    const fixture = buildFixture();
    for (const unsafePath of ["../README.md", "/tmp/README.md", "C:\\temp\\README.md"]) {
      const packet = clone(fixture.packet);
      packet.members[0].path = unsafePath;
      expect(() => verify(encodePacket(packet), fixture)).toThrow(/unsafe member path/i);
    }
  });

  it("rejects malformed or noncanonical base64 and content metadata drift", () => {
    const fixture = buildFixture();

    const malformed = clone(fixture.packet);
    malformed.members[0].content_base64 = "***not-base64***";
    expect(() => verify(encodePacket(malformed), fixture)).toThrow(/base64/i);

    const noncanonical = clone(fixture.packet);
    noncanonical.members[0].content_base64 += "\n";
    expect(() => verify(encodePacket(noncanonical), fixture)).toThrow(/canonical base64/i);

    const hashDrift = clone(fixture.packet);
    hashDrift.members[0].sha256 = "0".repeat(64);
    expect(() => verify(encodePacket(hashDrift), fixture)).toThrow(/SHA-256/i);

    const sizeDrift = clone(fixture.packet);
    sizeDrift.members[0].size_bytes += 1;
    expect(() => verify(encodePacket(sizeDrift), fixture)).toThrow(/size/i);

    const mediaDrift = clone(fixture.packet);
    mediaDrift.members[0].media_type = "application/octet-stream";
    expect(() => verify(encodePacket(mediaDrift), fixture)).toThrow(/media type/i);
  });

  it("binds self-consistent member bytes to the named Git commit", () => {
    const fixture = buildFixture();
    const packet = clone(fixture.packet);
    const altered = Buffer.from("# Reproducible but forged study package\n");
    packet.members[0] = member(
      packet.members[0].path,
      altered,
      packet.members[0].media_type,
    );
    expect(() => verify(encodePacket(packet), fixture)).toThrow(/does not match.*Git content commit/i);
  });

  it("rejects unsafe member categories even when their metadata is self-consistent", () => {
    const fixture = buildFixture();
    const unsafePaths = [
      "execution-authorization.json",
      "registration-content-freeze.json",
      "benchmark.mjs",
      "generated/prompts.jsonl",
      "generated/calls.jsonl",
      "generated/ground-truth.jsonl",
      "attempts.jsonl",
      "results.jsonl",
      "raw-provider-output.jsonl",
      "reasoning-traces.jsonl",
      "account-state.json",
      ".env",
      "credentials.json",
    ];
    for (const unsafePath of unsafePaths) {
      const packet = clone(fixture.packet);
      packet.members.push(member(unsafePath));
      packet.members.sort((left, right) => left.path.localeCompare(right.path));
      expect(() => verify(encodePacket(packet), fixture), unsafePath).toThrow(/forbidden/i);
    }
  });

  it("rejects high-confidence credential material inside an otherwise allowed member", () => {
    const fixture = buildFixture();
    const packet = clone(fixture.packet);
    const credential = Buffer.from("-----BEGIN PRIVATE KEY-----\nnot-a-real-key\n-----END PRIVATE KEY-----\n");
    packet.members[0] = member(
      packet.members[0].path,
      credential,
      packet.members[0].media_type,
    );
    expect(() => verify(encodePacket(packet), fixture)).toThrow(/credential material/i);
  });

  it("rejects an unfrozen study, a noncanonical freeze time, or unresolved placeholders", () => {
    const fixture = buildFixture();

    const unfrozenPacket = clone(fixture.packet);
    const unfrozenStudy = Buffer.from(`${JSON.stringify({
      study_id: STUDY_ID,
      frozen: false,
      frozen_at: null,
    })}\n`);
    const studyIndex = unfrozenPacket.members.findIndex(({ path }) => path === "study.json");
    unfrozenPacket.members[studyIndex] = member(
      "study.json", unfrozenStudy, "application/json",
    );
    expect(() => verify(encodePacket(unfrozenPacket), fixture)).toThrow(/study must be frozen/i);

    const invalidTimePacket = clone(fixture.packet);
    const invalidTimeStudy = Buffer.from(`${JSON.stringify({
      study_id: STUDY_ID,
      frozen: true,
      frozen_at: "2026-02-30T00:00:00.000Z",
    })}\n`);
    invalidTimePacket.members[studyIndex] = member(
      "study.json", invalidTimeStudy, "application/json",
    );
    expect(() => verify(encodePacket(invalidTimePacket), fixture))
      .toThrow(/canonical UTC millisecond/i);

    const placeholderPacket = clone(fixture.packet);
    const readmeIndex = placeholderPacket.members.findIndex(({ path }) => path === "README.md");
    placeholderPacket.members[readmeIndex] = member(
      "README.md",
      Buffer.from("# Registration\n\nLicense: [[CHOOSE LICENSE]]\n"),
      "text/markdown; charset=utf-8",
    );
    expect(() => verify(encodePacket(placeholderPacket), fixture))
      .toThrow(/unresolved placeholder/i);

    const unfrozenCommit = committedFixture();
    const unfrozenStudyPath = join(unfrozenCommit.repositoryRoot, STUDY_DIRECTORY, "study.json");
    writeFileSync(unfrozenStudyPath, unfrozenStudy);
    git(unfrozenCommit.repositoryRoot, ["add", `${STUDY_DIRECTORY}/study.json`]);
    git(unfrozenCommit.repositoryRoot, ["commit", "-qm", "make study draft"]);
    expect(() => buildRegistrationPacket({
      repositoryRoot: unfrozenCommit.repositoryRoot,
      contentCommit: git(unfrozenCommit.repositoryRoot, ["rev-parse", "HEAD"]),
      studyDirectory: STUDY_DIRECTORY,
    })).toThrow(/study must be frozen/i);

    const placeholderCommit = committedFixture();
    writeFileSync(
      join(placeholderCommit.repositoryRoot, STUDY_DIRECTORY, "README.md"),
      "# Registration\n\nVisibility: [[CHOOSE VISIBILITY]]\n",
    );
    git(placeholderCommit.repositoryRoot, ["add", `${STUDY_DIRECTORY}/README.md`]);
    git(placeholderCommit.repositoryRoot, ["commit", "-qm", "leave unresolved placeholder"]);
    expect(() => buildRegistrationPacket({
      repositoryRoot: placeholderCommit.repositoryRoot,
      contentCommit: git(placeholderCommit.repositoryRoot, ["rev-parse", "HEAD"]),
      studyDirectory: STUDY_DIRECTORY,
    })).toThrow(/unresolved placeholder/i);
  });

  it("rejects the wrong external study identity, commit, or noncanonical JSON encoding", () => {
    const fixture = buildFixture();
    expect(() => verifyRegistrationPacket(fixture.bytes, {
      expectedStudyId: "another-study",
      expectedContentCommit: fixture.contentCommit,
    })).toThrow(/study identity/i);
    expect(() => verifyRegistrationPacket(fixture.bytes, {
      expectedStudyId: STUDY_ID,
      expectedContentCommit: "f".repeat(40),
    })).toThrow(/content commit/i);
    expect(() => verify(Buffer.from(JSON.stringify(fixture.packet)), fixture))
      .toThrow(/canonical JSON encoding/i);

    const topLevelOrder = {
      study_id: fixture.packet.study_id,
      schema_version: fixture.packet.schema_version,
      content_commit: fixture.packet.content_commit,
      members: fixture.packet.members,
    };
    expect(() => verify(encodePacket(topLevelOrder), fixture)).toThrow(/canonical key order/i);

    const memberKeyOrder = clone(fixture.packet);
    const first = memberKeyOrder.members[0];
    memberKeyOrder.members[0] = {
      media_type: first.media_type,
      path: first.path,
      size_bytes: first.size_bytes,
      sha256: first.sha256,
      content_base64: first.content_base64,
    };
    expect(() => verify(encodePacket(memberKeyOrder), fixture)).toThrow(/canonical key order/i);
  });

  it("ignores Git replacement refs and repository-selection environment redirection", () => {
    const fixture = committedFixture();
    const readmePath = join(fixture.repositoryRoot, STUDY_DIRECTORY, "README.md");
    writeFileSync(readmePath, "replacement content\n");
    git(fixture.repositoryRoot, ["add", `${STUDY_DIRECTORY}/README.md`]);
    git(fixture.repositoryRoot, ["commit", "-qm", "replacement commit"]);
    const replacementCommit = git(fixture.repositoryRoot, ["rev-parse", "HEAD"]);
    git(fixture.repositoryRoot, ["replace", fixture.contentCommit, replacementCommit]);

    const otherRepository = committedFixture();
    const originalGitDir = process.env.GIT_DIR;
    const originalGitWorkTree = process.env.GIT_WORK_TREE;
    process.env.GIT_DIR = join(otherRepository.repositoryRoot, ".git");
    process.env.GIT_WORK_TREE = otherRepository.repositoryRoot;
    try {
      const bytes = buildRegistrationPacket({
        repositoryRoot: fixture.repositoryRoot,
        contentCommit: fixture.contentCommit,
        studyDirectory: STUDY_DIRECTORY,
      });
      const packet = JSON.parse(bytes.toString("utf8"));
      const readme = packet.members.find(({ path }) => path === "README.md");
      expect(Buffer.from(readme.content_base64, "base64").toString("utf8"))
        .toBe("# Reproducible study package\n");
      expect(() => verify(bytes, fixture)).not.toThrow();
    } finally {
      if (originalGitDir === undefined) delete process.env.GIT_DIR;
      else process.env.GIT_DIR = originalGitDir;
      if (originalGitWorkTree === undefined) delete process.env.GIT_WORK_TREE;
      else process.env.GIT_WORK_TREE = originalGitWorkTree;
    }
  });

  it("rejects a missing safe file, abbreviated commit, symlink, or executable Git member", () => {
    const missing = committedFixture();
    git(missing.repositoryRoot, ["rm", "-q", `${STUDY_DIRECTORY}/independent-review.md`]);
    git(missing.repositoryRoot, ["commit", "-qm", "remove required registration member"]);
    const missingCommit = git(missing.repositoryRoot, ["rev-parse", "HEAD"]);
    expect(() => buildRegistrationPacket({
      repositoryRoot: missing.repositoryRoot,
      contentCommit: missingCommit,
      studyDirectory: STUDY_DIRECTORY,
    })).toThrow(/required registration member/i);
    expect(() => buildRegistrationPacket({
      repositoryRoot: missing.repositoryRoot,
      contentCommit: missingCommit.slice(0, 12),
      studyDirectory: STUDY_DIRECTORY,
    })).toThrow(/exact full Git commit/i);

    for (const requiredPath of [
      "provider-ai-support-response.md",
      "provider-permission-escalation.md",
      "reviews/2026-07-19-ai-terms-parity-precommit-worktree.md",
    ]) {
      const missingEvidence = committedFixture();
      git(missingEvidence.repositoryRoot, ["rm", "-q", `${STUDY_DIRECTORY}/${requiredPath}`]);
      git(missingEvidence.repositoryRoot, ["commit", "-qm", "remove governing evidence"]);
      expect(() => buildRegistrationPacket({
        repositoryRoot: missingEvidence.repositoryRoot,
        contentCommit: git(missingEvidence.repositoryRoot, ["rev-parse", "HEAD"]),
        studyDirectory: STUDY_DIRECTORY,
      }), requiredPath).toThrow(new RegExp(`required registration member.*${requiredPath.replaceAll(".", "\\.")}`, "i"));
    }

    const symlink = committedFixture();
    const symlinkPath = join(symlink.repositoryRoot, STUDY_DIRECTORY, "README.md");
    rmSync(symlinkPath);
    symlinkSync("study.json", symlinkPath);
    git(symlink.repositoryRoot, ["add", `${STUDY_DIRECTORY}/README.md`]);
    git(symlink.repositoryRoot, ["commit", "-qm", "replace safe member with symlink"]);
    expect(() => buildRegistrationPacket({
      repositoryRoot: symlink.repositoryRoot,
      contentCommit: git(symlink.repositoryRoot, ["rev-parse", "HEAD"]),
      studyDirectory: STUDY_DIRECTORY,
    })).toThrow(/regular non-executable Git blob/i);

    const executable = committedFixture();
    const executablePath = join(executable.repositoryRoot, STUDY_DIRECTORY, "README.md");
    chmodSync(executablePath, 0o755);
    git(executable.repositoryRoot, ["add", `${STUDY_DIRECTORY}/README.md`]);
    git(executable.repositoryRoot, ["commit", "-qm", "mark safe member executable"]);
    expect(() => buildRegistrationPacket({
      repositoryRoot: executable.repositoryRoot,
      contentCommit: git(executable.repositoryRoot, ["rev-parse", "HEAD"]),
      studyDirectory: STUDY_DIRECTORY,
    })).toThrow(/regular non-executable Git blob/i);
  });

  it("provides build, verify, and help commands without overwriting or partial output", () => {
    const fixture = committedFixture();
    const outputPath = join(fixture.repositoryRoot, "registration-payload.json");

    const help = cli(["--help"]);
    expect(help.status).toBe(0);
    expect(help.stderr).toBe("");
    expect(help.stdout).toContain(
      "registration-packet.mjs build REPOSITORY_ROOT CONTENT_COMMIT OUTPUT_FILE",
    );
    expect(help.stdout).toContain(
      "registration-packet.mjs verify REPOSITORY_ROOT PAYLOAD_FILE EXPECTED_STUDY_ID EXPECTED_CONTENT_COMMIT",
    );
    for (const [path, mediaType] of EXPECTED_MEMBERS) {
      expect(help.stdout).toContain(`${path} (${mediaType})`);
    }

    const build = cli(["build", fixture.repositoryRoot, fixture.contentCommit, outputPath]);
    expect(build.status).toBe(0);
    expect(build.stderr).toBe("");
    expect(existsSync(outputPath)).toBe(true);
    const builtBytes = readFileBytes(outputPath);
    expect(JSON.parse(build.stdout)).toMatchObject({
      study_id: STUDY_ID,
      content_commit: fixture.contentCommit,
      payload_sha256: sha256(builtBytes),
    });
    expect(() => verify(builtBytes, fixture)).not.toThrow();

    const verification = cli([
      "verify", fixture.repositoryRoot, outputPath, STUDY_ID, fixture.contentCommit,
    ]);
    expect(verification.status).toBe(0);
    expect(verification.stderr).toBe("");
    expect(JSON.parse(verification.stdout)).toEqual(JSON.parse(build.stdout));

    const overwrite = cli(["build", fixture.repositoryRoot, fixture.contentCommit, outputPath]);
    expect(overwrite.status).not.toBe(0);
    expect(overwrite.stderr).toMatch(/refusing to overwrite/i);
    expect(readFileBytes(outputPath).equals(builtBytes)).toBe(true);

    const failedOutputPath = join(fixture.repositoryRoot, "must-not-exist.json");
    const failed = cli([
      "build", fixture.repositoryRoot, "f".repeat(40), failedOutputPath,
    ]);
    expect(failed.status).not.toBe(0);
    expect(failed.stderr).toMatch(/Git command failed|exact full Git commit/i);
    expect(existsSync(failedOutputPath)).toBe(false);

    const wrongIdentity = cli([
      "verify", fixture.repositoryRoot, outputPath, "another-study", fixture.contentCommit,
    ]);
    expect(wrongIdentity.status).not.toBe(0);
    expect(wrongIdentity.stderr).toMatch(/study identity/i);
    expect(wrongIdentity.stdout).toBe("");
  });
});

function readFileBytes(path) {
  return Buffer.from(readFileSync(path));
}
