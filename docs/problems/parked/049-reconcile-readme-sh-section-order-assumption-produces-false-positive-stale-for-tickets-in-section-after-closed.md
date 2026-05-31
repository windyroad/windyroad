# Problem 049: reconcile-readme.sh section-order assumption produces false-positive STALE for tickets in section-after-Closed

**Status**: Parked
**Reported**: 2026-05-02
**Origin**: internal
**Priority**: 12 (High). Impact: Significant (4) x Likelihood: Possible (3)
**Effort**: S
**WSJF**: 0 (parked, excluded from ranking)

## Description

The `packages/itil/scripts/reconcile-readme.sh` script in the wr-itil plugin computes section-end boundaries via a fallback chain that assumes a specific section ordering in `docs/problems/README.md`. Line 89 contains:

```bash
VQ_END=${CLOSED_START:-${PARKED_START:-$END_LINE}}
```

This picks the Closed section start as the Verification Queue's end, regardless of whether the Parked section appears BEFORE the Closed section in the actual README. When the README's section order is `## Verification Queue` → `## Parked` → `## Closed`, VQ_END skips over Parked and treats Parked rows as part of the Verification Queue, producing false-positive STALE diagnostics.

The correct fix is to compute VQ_END as the **min** of all subsequent section starts, not the first one in the fallback chain.

## Symptoms

Live evidence, 2026-05-02 iter 2:

- README state at start of iter 2: Verification Queue (lines 30..46), Parked (lines 47..54), Closed (line 55).
- reconcile-readme.sh:89 set VQ_END to CLOSED_START=55, treating lines 47..54 (Parked rows) as Verification Queue rows.
- Script reported false-positive `STALE P031 verification-queue: actual=parked` because P031's row at line 50 was inside the script's mistaken VQ range, but P031's on-disk file is `.parked.md`.
- Iter 2 worked around it by **reordering the README sections**: Closed before Parked. With CLOSED at line 47 and PARKED at line 55, VQ_END=47 (Closed start) correctly excludes both Parked and Closed from the Verification Queue.
- The workaround is a section-ordering convention now baked into this project's README; future README authors who don't know about the workaround will hit the bug again.

## Workaround

Reorder README sections so that Closed appears before Parked. Functional but fragile (one mistaken edit re-triggers the false positive).

## Impact Assessment

- **Who is affected**: Every consumer of reconcile-readme.sh whose README has a Parked section. Currently triggers on every manage-problem Step 0 / work-problems Step 0 invocation in this project.
- **Frequency**: Every preflight check until the section-ordering workaround is in place. After the workaround: re-triggers on any README edit that reverses section order.
- **Severity**: Significant. False-positive STALE diagnostics either (a) mask real drift if users learn to ignore them, or (b) trigger spurious reconcile commits if users action them.
- **Analytics**: N/A.

## Root Cause Analysis

### Pattern

The fallback chain `${CLOSED_START:-${PARKED_START:-$END_LINE}}` evaluates the FIRST non-empty value, which is unconditionally CLOSED_START when the Closed section exists. The script implicitly assumes Closed always comes after Parked (or after Verification Queue in absence of Parked). The README convention in this project does not enforce that ordering, so the assumption breaks silently.

### Fix Strategy

Replace line 89 with a min-of-subsequent-section-starts computation. Concrete bash:

```bash
# Compute VQ_END as the min line number among all subsequent section starts.
VQ_END=$END_LINE
for candidate in "$PARKED_START" "$CLOSED_START" "$NOTES_START"; do
  if [ -n "$candidate" ] && [ "$candidate" -lt "$VQ_END" ]; then
    VQ_END=$candidate
  fi
done
```

Single-file fix; no behavioral change for README orderings that currently work; correct behavior for any section ordering. The same pattern likely applies to other section-end computations elsewhere in the script. review the full script for sibling fallback chains.

### Verification check (per P045 discipline)

1. **Domain fit**: reconcile-readme.sh is part of the wr-itil plugin's reconciliation tooling. Yes, fit.
2. **Placement authority**: this project is the wr-itil plugin's consumer, not maintainer. Recommendation only; the maintainers decide.

### Investigation Tasks

- [ ] Verify the bug shape on the actual script (read reconcile-readme.sh:89 and surrounding context). verify-before-asserting per P032.
- [ ] Grep the full script for sibling fallback-chain patterns that share the same section-order assumption.
- [ ] Confirm fix preserves current behavior for the existing section ordering (Closed before Parked).
- [ ] Once upstream fix ships: re-test against this project's README in both section orderings (Closed-before-Parked and Parked-before-Closed); both should produce clean exit 0 when the on-disk inventory matches.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P031, P045

## Related

- P031 (manage-problem Step 0 reconcile-readme.sh hits exit 127 on marketplace consumers): same script, different surface (path resolution vs section-order assumption).
- P045 (assistant accepts ticket Fix Strategy upstream-placement framing without questioning): discipline applied to classify the fix surface.
- `~/.claude/plugins/cache/windyroad/wr-itil/0.23.1/scripts/reconcile-readme.sh:89` (the fix site).
- Live example: iter 2 (2026-05-02) reported false-positive STALE for P031; workaround was section-ordering reorder in commit 8352016.
- **Reported upstream**: https://github.com/windyroad/agent-plugins/issues/184 (2026-05-31)

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/184
- **Reported**: 2026-05-31
- **Template used**: structured default (problem-shaped per ADR-033)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes

## Parked

- **Reason**: upstream-blocked. The fix site `packages/itil/scripts/reconcile-readme.sh` does NOT exist in this project's working tree; the script lives in the upstream `wr-itil` plugin at `~/.claude/plugins/cache/windyroad/wr-itil/<version>/scripts/reconcile-readme.sh`, inside the `windyroad/agent-plugins` repo. This project is a downstream marketplace consumer of `@windyroad/wr-itil`. A consumer cannot edit the cached script without losing the change on next plugin update, so the only durable fix is upstream. The README-ordering workaround (Closed section before Parked section) is operator discipline rather than codified policy and cannot be enforced locally; one mistaken section reorder re-triggers the false-positive STALE.
- **Verified persistence**: latest cached plugin version `0.38.0` still ships the fallback-chain anti-pattern across THREE section-end computations. `scripts/reconcile-readme.sh` lines 130-132: `WSJF_END=${VQ_START:-${INBOUND_START:-${CLOSED_START:-${PARKED_START:-$END_LINE}}}}`, `VQ_END=${INBOUND_START:-${CLOSED_START:-${PARKED_START:-$END_LINE}}}`, and `CLOSED_END=${PARKED_START:-$END_LINE}`. All three use "first non-empty" rather than "min subsequent section start". The CLOSED_END computation on line 132 is particularly fragile: if PARKED appears before CLOSED, CLOSED_END = PARKED_START < CLOSED_START, producing a negative-span sed slice. The original P049 evidence (VQ_END picking CLOSED_START when Parked sat between VQ and Closed) extends to all three computations. Verified 2026-05-30 by reading the cached file.
- **Upstream issue status**: no issue filed yet. `gh issue list -R windyroad/agent-plugins --search "reconcile-readme"` on 2026-05-30 returned four results (`#126`, `#85`, `#76`, `#180`); none cover the section-order assumption in lines 130-132. Ticket body's standing "Upstream report pending" note remains the current truth. AFK iter-9 discipline matches iters 3-8: park-only, defer the `/wr-itil:report-upstream` invocation to a batched filing pass at a session boundary rather than firing it in-loop.
- **Un-park trigger**: a new `wr-itil` plugin release lands in `~/.claude/plugins/cache/windyroad/wr-itil/` whose `scripts/reconcile-readme.sh` replaces the fallback-chain pattern on lines 130-132 with either (a) an explicit min-of-subsequent-section-starts loop (the concrete bash sketched in this ticket's Fix Strategy section), or (b) explicit section-position validation that fails loudly when the assumed section ordering does not match the actual README layout. Verify by re-reading the cached script in the new version, then re-running `/wr-itil:work-problems` Step 0 reconcile against this project's README in both section orderings (Closed-before-Parked and Parked-before-Closed); both should produce clean exit 0 when the on-disk inventory matches. Close P049 once a Step 0 reconcile pass surfaces no false-positive STALE under either ordering.
- **Local impact while parked**: the Closed-before-Parked README ordering convention remains the operating contract. `docs/problems/README.md` is currently ordered WSJF → Verification Queue → Inbound Upstream Reports → Closed → Parked → Notes; the fallback chain `${INBOUND_START:-${CLOSED_START:-${PARKED_START:-$END_LINE}}}` accidentally evaluates correctly for this layout because INBOUND_START=71 IS the correct next-section-start after Verification Queue. Any future README reorder that places `## Parked` before `## Closed` re-triggers the original P049 false-positive STALE bug. Reconcile authors who maintain `docs/problems/README.md` must preserve the convention.
- **Composes with**: P021 (parked 2026-05-30, upstream `windyroad/agent-plugins` `wr-architect` plugin hook, upstream-blocked); P022 (parked 2026-05-30, upstream `wr-architect` plugin hook); P027 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md); P031 (parked 2026-05-02, upstream `wr-itil` plugin SKILL.md, same script different surface); P033 (parked 2026-05-30, upstream `wr-itil` plugin SKILL.md); P042 (parked 2026-05-30, upstream `wr-jtbd` plugin hook); P047 (parked 2026-05-30, upstream `wr-risk-scorer` plugin SKILL.md). All seven share the marketplace-consumer-cannot-edit-cached-plugin pattern; P049 extends the surface within `wr-itil` from SKILL.md prose (P027, P031) to script logic (`reconcile-readme.sh`).
- **Date parked**: 2026-05-30
