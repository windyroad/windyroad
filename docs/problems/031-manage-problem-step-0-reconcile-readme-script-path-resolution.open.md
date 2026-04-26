# Problem 031: manage-problem Step 0 reconcile-readme.sh hits exit 127 on marketplace consumers; script only on disk for vendored installs

**Status**: Open
**Reported**: 2026-04-27
**Priority**: 12 (Significant). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: S (single path-resolution edit in upstream `manage-problem` SKILL.md Step 0)
**WSJF**: (12 x 1.0) / 1 = 12.0

## Description

The upstream `wr-itil:manage-problem` SKILL.md Step 0 invokes the README reconciler with a hardcoded vendored path:

```
bash packages/itil/scripts/reconcile-readme.sh docs/problems
```

The script is only on disk in **vendored** installs of the wr-itil plugin (i.e. the source repository itself, where `packages/itil/` is the source tree). For **marketplace consumers** (the standard install path) the script lives at:

```
~/.claude/plugins/cache/windyroad/wr-itil/<version>/scripts/reconcile-readme.sh
```

so `bash packages/itil/scripts/reconcile-readme.sh ...` resolves to nothing and the call fails with exit 127 (`No such file or directory`). The Step 0 preflight is supposed to short-circuit gracefully on this failure, but the failure mode masks any real reconciliation drift the script would have caught. windyroad is a marketplace consumer of the plugin and hits this on every Step 0 invocation. Verified live during this 2026-04-27 P031 creation pass: `bash packages/itil/scripts/reconcile-readme.sh docs/problems` returned exit 127, while the same script invoked via the marketplace cache path returned exit 0 (clean tree).

## Symptoms

- Loop iter 2 + iter 3 of the AFK `work-problems` session on 2026-04-27 hit exit 127 on Step 0; subprocess worked around by skipping the reconciler. Documented in iter 2 + iter 3 retros.
- `bash packages/itil/scripts/reconcile-readme.sh docs/problems` returns "No such file or directory" because the vendored path does not exist in marketplace consumers.
- Step 0 reconciliation drift detection is effectively disabled for marketplace consumers; any drift between docs/problems/README.md and the on-disk inventory goes unnoticed until a manual `/wr-itil:reconcile-readme` run.

## Workaround

Skip the reconciler call on Step 0 when the vendored path doesn\'t resolve. The orchestrator already does this informally; it surfaces the failure as a non-blocking warning and continues. Drift detection is forfeited for the iteration but later steps still write the README correctly via the manage-problem skill\'s own README cache.

## Impact Assessment

- **Who is affected**: every marketplace consumer of `wr-itil:manage-problem`. Vendored consumers (the source repo itself) are not affected.
- **Frequency**: every `manage-problem` invocation that reaches Step 0, which is most invocations.
- **Severity**: Significant. The Step 0 preflight is the safety net for README drift and it is silently failing for the majority of consumers.

## Root Cause Analysis

### Root Cause

Step 0 hardcodes `packages/itil/scripts/reconcile-readme.sh` as the vendored-source path. Plugins set `${CLAUDE_PLUGIN_ROOT}` consistently to point at the install root, which works for both vendored and marketplace consumers. The fix is to resolve the script via that env var instead of the relative repo path.

### Fix Strategy

Patch the upstream `wr-itil:manage-problem` SKILL.md Step 0 to call:

```
bash "${CLAUDE_PLUGIN_ROOT}/scripts/reconcile-readme.sh" docs/problems
```

Marketplace consumers will resolve to `~/.claude/plugins/cache/windyroad/wr-itil/<version>/scripts/reconcile-readme.sh`. Vendored consumers will resolve to whatever `${CLAUDE_PLUGIN_ROOT}` is set to in their install (the plugin loader sets it for both surfaces).

Optional fallback: if `${CLAUDE_PLUGIN_ROOT}` is unset (e.g. the skill is invoked outside the plugin loader), fall back to the existing `packages/itil/scripts/reconcile-readme.sh` so the source repo continues to work for hand-run testing. Cost: one extra `if [ -n "${CLAUDE_PLUGIN_ROOT:-}" ]` guard.

### Investigation Tasks

- [ ] Confirm `${CLAUDE_PLUGIN_ROOT}` is set by the plugin loader for both vendored and marketplace surfaces (test by echoing it in a hand-run skill).
- [ ] Patch upstream `wr-itil:manage-problem` SKILL.md Step 0 with the env-var-resolved path.
- [ ] Apply the same fix to any sibling skill that invokes the reconciler (search upstream skills tree for `reconcile-readme.sh`).
- [ ] Add a Step 0 unit test or smoke-test fixture that invokes the script through the plugin loader on a marketplace install.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P027 (work-problems Step 5 exit-code rule, same plugin upstream surface; both touch SKILL.md)

## Related

- `~/.claude/plugins/cache/windyroad/wr-itil/0.20.0/skills/manage-problem/SKILL.md` Step 0 (the call site with the hardcoded vendored path)
- `~/.claude/plugins/cache/windyroad/wr-itil/0.20.0/scripts/reconcile-readme.sh` (the script in its marketplace-cache install location)
- P027 (work-problems Step 5 exit-code rule; same plugin upstream)
- **Upstream report pending** — external dependency identified; invoke /wr-itil:report-upstream when ready
