---
status: "proposed"
date: 2026-08-23
human-oversight: confirmed
oversight-date: 2026-08-23
decision-makers: [Tom Howard]
consulted: [wr-architect:agent, wr-jtbd:agent]
informed: []
reassessment-date: 2026-11-23
related: [021-auto-resolve-stale-deps-in-push-watch, 028-ci-status-check-in-push-and-release-watch, 034-push-watch-fail-fast-plus-separate-deps-fix-flow-supersedes-cron-pr, 050-quality-gates-are-release-ancestors-not-reports, 051-production-deploys-only-bytes-that-provably-came-from-the-release-commit]
---

# GitHub Actions are pinned by owner, and permissions are declared per workflow

## Context and Problem Statement

Nothing in this project has ever recorded how a GitHub Action should be pinned. What is on disk is three pin forms that arrived one at a time: one commit SHA (`changesets/action`, pinned in `4b149a7` after a runtime-deprecation annotation revealed it had sat fifteen months out of date), one moving branch (`trufflesecurity/trufflehog@main`), and first-party `actions/*` on major tags. That reads as accretion, and a reader cannot tell which form is the rule.

The moving branch is the part that matters. `trufflesecurity/trufflehog@main` runs in `gate-secrets`, the first job of `main-pipeline.yml`, immediately after a `fetch-depth: 0` checkout of the entire repository including its full history. The highest-trust position in the pipeline sits on the weakest available pin. Because the ref moves, the code executed there can change between two runs with no diff in this repository and no notification to anyone.

Permissions have the same shape. `main-pipeline.yml` declares none at workflow level, so every job except `release-pr` runs on whatever the repository default happens to be. `publish-pipeline.yml` and `release-pr-preview.yml` each declare a job-level block. Again: governed in places, by accretion, with no stated rule.

Both are recorded in P141 (GitHub Actions versions are an uninstrumented dependency surface).

A new record rather than an amendment to ADR-021 or ADR-034, per Tom's direction of 2026-08-16: *"We should never amend an ADR, we should create new ADRs that supersede the old ones."*

## Decision Drivers

- A third-party action executes arbitrary code in a runner that has just checked out the whole repository. What runs there should change only when this project chooses to change it.
- A rule nothing checks is a rule that decays. The fifteen-month-stale `changesets/action` pin was surfaced by GitHub complaining, not by anything here.
- Least privilege on the default token limits what a compromised or simply buggy action can reach.
- A rule has to fit the workflows that already exist. `publish-pipeline.yml` needs `contents: write` and, load-bearingly for ADR-051, `actions: read` for its cross-run artifact download. A rule that fixes one scope set would break the release path.
- First-party `actions/*` and third-party actions do not carry the same risk. Requiring a SHA for `actions/checkout` would buy little and cost a bump every patch release.

## Considered Options

1. **Pin form by owner, plus a CI lint, and leave staleness detection undecided (chosen).** Third-party pins a commit SHA, first-party pins a major tag, a script enforces it on every push.
2. **One rule for everything: commit SHA for every action, first-party included.** Simpler to state and strictly safer. Rejected: it converts every `actions/*` patch release into a manual bump, and this project has no tooling to do those bumps, so the pins would rot and the rule would be honoured in the breach. The asymmetry in option 1 is the honest reflection of an asymmetry in risk.
3. **Write the rule down without enforcing it.** Cheapest. Rejected on the evidence of the driver above: this project already has an unenforced pinning convention, and P141 exists because it decayed silently.
4. **Adopt Dependabot's `github-actions` ecosystem in the same decision, so the rule and its detector land together.** Rejected here, and deliberately deferred rather than dropped. See the third rung below.

## Decision Outcome

Chosen option: **pin form by owner, plus a CI lint**, with the staleness question explicitly left open.

### Rule 1: pin form by owner

A third-party action or reusable workflow (any owner other than `actions`) is pinned to an immutable 40-character commit SHA, with the human-readable version in a **trailing** comment on the same line. A first-party `actions/*` action is pinned to a major version tag. A `docker://` step pins an image digest. A `./` local reference is exempt, because the code already lives in this repository and moves with it. That exemption stops at the local action's boundary: a third-party `uses:` inside a local composite action is ungoverned by this rule and unseen by the lint. There are no local composite actions today, and the lint's file list must be extended before one is added.

The trailing position for the version comment is not cosmetic. It is the form Dependabot's action updater maintains, so a version comment written there stays true if the third rung below is ever answered with Dependabot. A version asserted in a block comment above the line would be left behind by an automated bump and become a false claim in the place a reader trusts most. The one pin already on disk in the correct form otherwise, `changesets/action`, asserts `v1.9.0` in a block comment above the line. It is brought into the trailing form in the same change that lands this record, so the rule has no standing violation at the moment it takes effect.

**Stated carve-out.** Pinning the trufflehog action ref freezes the workflow code, not the scanner. That action's `version` input defaults to `latest`, which resolves `ghcr.io/trufflesecurity/trufflehog:latest` at run time. This is accepted rather than overlooked: freezing the image would trade detector freshness for provenance on a secret scanner, and a scanner that stops learning new credential formats fails quietly in the direction that costs most. Rule 1 governs the action ref. It does not claim to freeze what a containerised action pulls, and confirmation criterion (c) below must not be read as covering it.

### Rule 2: a top-level permissions block, and never write-all

Every workflow declares a `permissions` block at **top level**, and no workflow grants `write-all`. Jobs may narrow it; a job-level block replaces the top-level one rather than merging with it. Scopes are named per workflow rather than fixed corpus-wide, because the workflows need different ones and always will: `main-pipeline.yml` needs `contents: read` at top level, `publish-pipeline.yml`'s job needs `contents: write` and `actions: read`, `release-pr-preview.yml`'s job needs `pull-requests: write` and `statuses: write`.

Top level is the load-bearing word, and the weaker form was tried and rejected while drafting this record. A rule reading "declared at workflow or job level" would pass `main-pipeline.yml` **as it stands today**, because `release-pr` already carries a job block, while the four jobs this record exists to cover run on repository defaults. That is precisely the defect in the Context above. Requiring the block at top level leaves no job on defaults and makes a regression detectable.

Least privilege is the driver behind this rule, not the rule itself. Whether a declared scope is the minimum a job needs is a judgement a reviewer makes, and stating it as a rule would let an unenforceable adjective do the load-bearing work. What the lint confirms is that scopes are declared where they cover every job, and that the blanket grant is refused.

### Not decided: what detects a pin that is merely stale

Rule 1 catches a pin of the wrong **form**. Nothing here catches a correctly-formed pin that is fifteen months old, which is the failure P141 opens with. Three options are on the table and the choice belongs to the maintainer:

- **A. Dependabot's `github-actions` ecosystem.** Free, native, and does the edit as well as the detection. Two costs. It reinstates a bot authoring path onto master, and the acceptance for that path died when ADR-034 superseded ADR-022 whole; ADR-022 was where this project recorded and accepted `github-actions[bot]` as a commit-author site and the bypass of the local commit gate that came with it. And this repository has no `pull_request` trigger, so the bump PR is validated by nothing until it reaches master.
- **B. Dependabot plus a narrow `pull_request` trigger over the secret-free jobs.** Restores validation before review, which is ADR-034's central driver. Must be narrow: Dependabot PRs run with a read-only token and cannot read repository secrets, so `deploy-test` would fail on the missing `NETLIFY_AUTH_TOKEN` every time. `gate-secrets` and `build` qualify.
- **C. A report-only scheduled detector.** Opens no PR and introduces no authoring path. Costs bespoke tooling for a surface that changes a handful of times a year.

A and B both route a judgement to the maintainer that the internal-maintainer persona file explicitly excludes: *"Any change that routes code-quality decisions to him is going the wrong way, however well it serves his convenience."* Deciding whether an action SHA corresponds to the release it claims, and whether the new version still detects what the old one did, is code-quality judgement, and JTBD-401 (Decide From the Phone in My Hand) is not a surface on which it can be made. That is the strongest argument against A, and the reason this record does not simply pick it.

Until this rung is answered, the staleness surface stays uninstrumented and P141 carries it as an open residual.

### Mechanism

`scripts/check-action-pins.sh` implements rules 1 and 2 over `.github/workflows/`. It runs in `main-pipeline.yml`'s `gate-secrets` job, immediately after `actions/checkout` and **before** the secret scan. The normative invocation is `bash ./scripts/check-action-pins.sh`, matching every other shell script this project runs and making the step independent of the file mode recorded in the index. Invoking it as a bare path would couple a root-of-graph gate to an executable bit that no test exercises, and a permission-losing checkout or a careless re-add would then fail `gate-secrets` with exit 126. The order is load-bearing: if the lint ran after the scan, then the exact scenario rule 1 exists to prevent, a third-party action reverted to a branch ref, would execute on a full-history checkout and be reported afterwards. Detection after execution is not what the pin buys.

Rule 2's top-level requirement adds an inert `permissions` block to `publish-pipeline.yml` and `release-pr-preview.yml`. Each has exactly one job, and each of those jobs declares its own block which fully replaces the top-level one, so neither deploy changes behaviour. The blocks are there so a second job added to either file inherits a read-only default rather than the repository's.

Placing it in `gate-secrets` rather than `build` is deliberate. `scripts/fix-deps.sh` mirrors the `build` job's steps by hand so a dependency refresh cannot commit green locally and red on CI (P123, RFC-003), and although a workflow-pin lint has no npm surface to mirror, putting it in `build` would invite the next reader to think it did. It also belongs with the secret scan by family. The lint reads the whole `.github/workflows` directory, so it covers `publish-pipeline.yml` and `release-pr-preview.yml` even though it runs only from `main-pipeline.yml`, and since changes to those files reach their branches through master, nothing gets in behind it.

## Consequences

### Good

- What runs in the highest-trust job of the pipeline changes only when this project changes it.
- The pinning rule is enforced by a script rather than by whoever reviews the next workflow edit.
- The default token in `main-pipeline.yml` is read-only for the four jobs that do not declare otherwise.
- The lint is cheap to extend when the staleness rung is answered.

### Bad

- `gate-secrets` is the root of the ADR-050 `needs` graph, so a pin-form violation blocks the entire release path, and ADR-050 deliberately ships no override valve. This is accepted: a third-party action pinned to a branch in the first job should stop the release. The operator's only exit is a commit that fixes the pin, which is the intended exit.
- The run summary will name the wrong cause. When `gate-secrets` fails, `release-pr` reports `deploy-test concluded 'skipped'` and the operator has to read up the graph to find the pin. That is pre-existing for any `gate-secrets` failure and this change does not worsen it.
- Version comments are hand-maintained. Nothing checks that the trailing `# vN.N.N` still matches the SHA beside it.
- One known non-conformance with the least-privilege driver is left standing. `publish-pipeline.yml`'s `deploy-production` declares `contents: write`, and reading the job (checkout, `git rev-parse HEAD^2`, `gh run list`, cross-run `download-artifact`, `netlify deploy`, curl smoke tests) nothing visibly consumes it. It satisfies rule 2 as written. Narrowing it is out of scope here because getting it wrong breaks the production deploy, and it is recorded in P141 rather than fixed blind. It carries its own closing trigger, below, because a residual that is recorded and never re-put is exactly the fifteen-month failure this record opens with.

### Neutral

- ADR-022's retired confirmation criterion names `peter-evans/create-pull-request` pinned to a major version, which rule 1 would now forbid. No conflict, since ADR-022 is superseded and historical, but it should not be read as precedent if the staleness rung is reopened.

## Confirmation

1. `scripts/check-action-pins.sh` exits 0 against `.github/workflows/`, and exits 1 with a line naming the file, the line and the offending ref when any third-party ref is reverted to a branch. Both demonstrated in the landing session.
2. The lint runs in CI on every push to master, positioned before the secret scan.
3. No `uses:` in `.github/workflows/` resolves to a branch ref. Read this as covering the action ref only, per the stated carve-out in rule 1.
4. Every workflow declares a top-level `permissions` block, and none grants `write-all`. The lint enforces this, so a later deletion of `main-pipeline.yml`'s block reddens CI rather than passing quietly.

## Reassessment

Reassess by 2026-11-23, or earlier on either of these triggers.

**ADR-034 reopens a bot-authored PR path.** ADR-034 carries `reassessment-date: 2026-08-30` and its own Confirmation section records 2 failures in 2 dep issues against a 30% threshold, so its reassessment is effectively due. Its Reassessment section explicitly contemplates a "hybrid back to cron PR for specific failure classes". If that happens, the acceptance that died with ADR-022's supersession is alive again, option A above stops carrying its main objection, and the third rung must be re-put.

**The next production release.** At that point `publish-pipeline.yml`'s `contents: write` can be observed rather than reasoned about, which is the cheapest moment to narrow it or to record what consumes it. This is the closing trigger for the non-conformance in Consequences.

**The maintainer answers the staleness question.** Picking A, B or C supersedes or extends this record. Until then the third rung has no other closing trigger, and P141 stays open holding the residual.

## Related

- P141 (GitHub Actions versions are an uninstrumented dependency surface) is the driving ticket and holds the open residual.
- ADR-034 (push:watch fail-fast plus separate deps-fix flow supersedes cron PR) scopes dependency policy to root npm manifests only, which is why Actions refs needed their own record rather than an extension of that one. Its supersession of ADR-022 is what makes option A above costly.
- ADR-050 (quality gates are release ancestors, not reports) is what actually protects production from a bad Actions bump: its `needs` graph is not bypassable and has no valve. ADR-028's `scripts/ci-status-check.sh` is a second and weaker layer, since it is a local wrapper invoked from `push-watch.sh` and `release-watch.sh`, is bypassed by merging through the GitHub UI, and ships a single-shot `red-ci-acknowledged` override.
- ADR-051 (production deploys only bytes that provably came from the release commit) depends on `publish-pipeline.yml`'s `actions: read`, which is why rule 2 names scopes per workflow instead of fixing one set.
- ADR-021 (auto-resolve stale deps in push:watch) is the npm-side sibling of the staleness question this record leaves open.
- Serves JTBD-400 (Trust What the Loop Did While I Was Away): a secret scan whose detector can change underneath it makes a missing measurement read the same as a clean one.
