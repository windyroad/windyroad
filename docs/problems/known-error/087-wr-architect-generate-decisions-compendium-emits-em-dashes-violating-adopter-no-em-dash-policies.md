# Problem 087: wr-architect-generate-decisions-compendium emits em-dashes that violate adopter no-em-dash policies

**Status**: Known Error
**Reported**: 2026-06-03
**Priority**: 10 (Medium), Impact: Minor (2) x Likelihood: Almost Certain (5) (re-rated 2026-08-08: five firings on 2026-08-07 alone, twice within a single ADR's create-then-ratify lifecycle, and the hand-repair does not survive the next edit to the same ADR, so it is a per-edit tax. Fires on every compendium touch via both the regen script and the ADR-078 per-edit hook.)
**Origin**: internal
**Effort**: M (upstream fix on two generator surfaces + report)
**WSJF**: 10.0 = (10 x 2.0) / 2 (re-rated 2026-08-08)
**Type**: technical

## Description

The `wr-architect-generate-decisions-compendium` script (resolves on `$PATH` to `packages/architect/scripts/generate-decisions-compendium.sh` per ADR-049 shim convention) regenerates `docs/decisions/README.md` per ADR-077. The generator emits em-dash characters (U+2014) throughout the output, in places like `### ADR-NNN <U+2014> <title>` headers and `**Chosen:** <option> <U+2014> because <rationale>` body lines.

The em-dash in these positions triggers project-local `no-em-dash` hooks (`.claude/hooks/no-em-dash-bash.sh` PostToolUse + `no-em-dash.sh` PreToolUse). When the generator runs via Bash, the hook fires with directive:

> BLOCKED: Em-dashes (U+2014) detected in files modified by Bash. Files: docs/decisions/README.md. Rewrite the affected sentences to avoid em-dashes entirely. Use commas, periods, colons, or parentheses instead.

Forcing the agent to manually replace every em-dash before the commit can proceed (this session: 43 em-dashes scrubbed via a single Edit replace_all from a regenerated README).

## Symptoms

- After invoking `wr-architect-generate-decisions-compendium` (e.g. during `/wr-architect:review-decisions` Step 4.5 or `/wr-architect:create-adr` Step 5), the immediate `git add docs/decisions/README.md` (or subsequent Bash command) trips the no-em-dash hook.
- The compendium cannot be regenerated without a manual U+2014 to ASCII-separator replacement pass.
- The 2026-06-02 AFK iter 6 retro noted: "Compendium is currently stale (architect-verdict-recommended regen could not land because of em-dash incompatibility)." Compendium-staleness ticket P083 cites this exact friction as the reason regen was deferred during AFK iters.
- 2026-07-15 session (ADR-041 release + ADR-042 skeptic-gate build): the friction recurred roughly five times. The ADR-078 per-edit compendium hook re-emitted a U+2014 as the `### ADR-NNN` header separator plus mid-sentence dashes in the auto-generated `Decides:` line on every ADR-042 entry touch, each requiring a manual Edit pass. Separately, running the deprecated `wr-architect-generate-decisions-compendium` backstop (per review-decisions Step 4.5) rewrote the WHOLE `docs/decisions/README.md` with a U+2014 separator on every ADR header, forcing a `git checkout` revert plus a manual per-entry fix. Both the deprecated full-regen script AND the ADR-078 per-edit hook emit the character, so the fix must strip U+2014 at generation time on both surfaces.
- 2026-08-07 recurrences (P120/P121/P122 session): five firings in one day, the highest observed rate to date. Three during the ADR-044 build and the ADR-020/043 amendments. Two more within a single ADR's lifecycle: creating ADR-045 emitted two U+2014 characters into a file with zero at HEAD, and then **ratifying** the same ADR regenerated its entry wholesale, discarding the hand-repair from the create commit and re-emitting em-dashes. Those three shipped in `09c895f` before the next Bash call caught them; repaired in `943aedd`. The second-order finding is that the hand-repair workaround **does not survive the next edit to the same ADR**, so it is a per-edit tax rather than a one-time fix, and an ordinary frontmatter change (oversight stamp) is enough to trigger it.
- 2026-08-05 recurrence (P123 AFK iter, amending ADR-034's Confirmation section): identical to the 2026-07-15 pattern on both surfaces, so the frequency claim above holds at roughly one recurrence per ADR-touching session. The ADR-078 per-edit hook authored a correct entry and staged it, carrying 3 U+2014 characters (the `### ADR-NNN` header separator plus two in the generated `Decides:` and `Confirmation:` prose). Running the deprecated backstop on top of that, on the architect's own recommendation to regenerate, rewrote 127 lines and re-introduced 47 U+2014 characters, requiring `git checkout -- docs/decisions/README.md` to recover the hook's staged entry, then a 3-hit manual ASCII pass before the commit could land. Note the compounding cost: the backstop is not merely non-compliant now, it is destructive, because it overwrites content the ADR-078 hook has already authored. Recorded in `docs/BRIEFING.md` as a do-not-run directive for the backstop.

## Workaround

Edit-tool `replace_all` U+2014 character to ASCII " - " on the generated file before staging. Manual; needs to run on every regen.

## Impact Assessment

- **Who is affected**: any adopter project that runs the wr-architect plugin AND enforces a no-em-dash policy. This windyroad project enforces it via `.claude/hooks/no-em-dash-bash.sh` (PostToolUse on Bash) and `no-em-dash.sh` (PreToolUse on Edit/Write).
- **Frequency**: every compendium regeneration. Per ADR-077 Step 4.5, this runs after every confirmed, amended, or rejected ADR in a `/wr-architect:review-decisions` drain batch. Multiple times per session in active drain sessions.
- **Severity**: Medium. The manual scrub is fast but adds friction to every compendium regen; over time, sessions defer the regen rather than pay the cost (P083 compendium-staleness ticket evidence). When the regen is deferred, the architect agent's routine load surface stays stale, weakening ADR-077's contract.
- **Analytics**: deferred to investigation.

## Root Cause Analysis

### Hypothesis

The generator script (`packages/architect/scripts/generate-decisions-compendium.sh` in agent-plugins repo) uses em-dash characters as visual separators per upstream typographic preference. The script does not honour adopter-level no-em-dash policies because it has no awareness of them.

Fix options:

1. **Upstream: emit ASCII separators by default**. Replace em-dash characters with " - " or ": " or " | " in the generator output. Removes the friction for ALL adopters (most projects don't enforce no-em-dash, but ASCII separators are universally compatible).
2. **Upstream: respect adopter no-em-dash policy via env-var or config**. Detect `.claude/hooks/no-em-dash*.sh` presence (or read a config flag) and emit ASCII separators conditionally.
3. **Local: post-process generator output**. Wrap the shim in a project-local script that runs the generator then sed-replaces em-dash characters. Acceptable workaround; doesn't fix the root cause.

Option 1 is the cleanest: ASCII separators have zero downside, even em-dash-tolerant adopters won't notice.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Verify the generator script source (upstream) and identify all em-dash insertion sites
- [ ] Determine if upstream fix is straightforward (a global sed in the generator) or needs config plumbing
- [ ] Decide between Option 1 (ASCII default) and Option 2 (adopter-policy-aware) per upstream maintainers
- [ ] Composes with P083 (compendium staleness): if Option 1 lands upstream, the compendium-regen-deferral pattern from P083 may resolve naturally

## Dependencies

- **Blocks**: P083 (ADR compendium staleness; deferred regen is partly downstream of this friction)
- **Blocked by**: (none)
- **Composes with**: P083 (sibling: P083 is staleness consequence; this ticket is the upstream regen friction cause)

## Related

- P083 (`docs/problems/open/083-adr-compendium-decisions-readme-is-stale-lists-eight-entries-while-decisions-on-disk.md`). The compendium-staleness consequence; this ticket targets the upstream cause of the deferral pattern.
- ADR-077 (`docs/decisions/077-decisions-compendium-as-routine-architect-load-surface.proposed.md`). The contract this ticket protects: compendium-as-routine-load-surface only works if regen is cheap.
- 2026-06-02 outstanding question #16 (deferred from prior AFK session); this ticket codifies that observation.
- Upstream surface: `packages/architect/scripts/generate-decisions-compendium.sh` in agent-plugins repo.
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/219 (2026-06-03)

(captured via /wr-itil:capture-problem on 2026-06-03 after live observation in /wr-architect:review-decisions Step 4.5: regenerated compendium blocked by no-em-dash hook; 43 em-dash characters manually scrubbed before commit. Bundled with P085 + P086 in one batch commit per ADR-014 related-cluster carve-out.)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/219
- **Reported**: 2026-06-03
- **Template used**: structured default body (problem-shaped per ADR-033)
- **Disclosure path**: public issue (used BYPASS_RISK_GATE=1 because P074 hook failure prevented marker write despite both wr-risk-scorer:external-comms AND wr-voice-tone:external-comms returning PASS verdicts on review)
- **Cross-reference confirmed**: yes (upstream body cites this ticket's GitHub path verbatim)
