# Problem 109: External-review round-trips waste cycles when the reviewer sees a stale copy of a repo artifact

**Status**: Open
**Reported**: 2026-07-03
**Priority**: 3 (Medium) -- Impact: 3 x Likelihood: 1 (deferred -- re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred -- re-rate at next /wr-itil:review-problems)

## Description

During the Issue 11 newsletter session (2026-06-29 to 07-03), an external reviewer was fed the brief for editorial review across several rounds. Multiple rounds the reviewer reported the file as "unchanged" or flagged weaknesses that had already been fixed (e.g. asked for an Item 3 concrete action and a checklist-prioritization line that were already in the committed file). Each stale-copy round cost a full diagnosis-and-explanation round-trip.

Two root causes compounded:

1. **Local commits were never pushed.** The whole edition (prep + finalise + revisions) was committed locally on `master`; `origin/master` had none of the 2026-06-29 files. A reviewer reading from the remote saw nothing / the old state.
2. **Stale IDE / copy source.** The version relayed to the reviewer came from a source one commit behind (a stale editor buffer that did not reload after the assistant's on-disk edits, or a re-sent earlier copy). The reviewer therefore reviewed pre-fix text and flagged already-fixed issues.

The durable lesson is assistant-side: when the user will relay a repo artifact to an external reviewer, proactively hand them the current committed content (send the file via SendUserFile with its checksum, or offer to push so there is one canonical source) and flag stale-buffer / unpushed-commit risk, rather than assuming the user's buffer or the remote is current. Later in the session, sending the file + md5 and diagnosing the stale-copy cause is what broke the loop.

## Symptoms

- Reviewer reports "unchanged" or re-flags already-fixed weaknesses across consecutive rounds.
- `git log origin/master..master` shows the edition committed locally but `git ls-tree origin/master` shows the files absent from the remote.
- The phrase the assistant just added is present on disk (grep confirms) but the reviewer's copy lacks it.

## Workaround

Send the user the freshly-committed file (SendUserFile) with its md5, and confirm which distinctive post-fix phrase is present so the current-vs-stale copy can be identified. Offer to push `master` so the reviewer can pull one source of truth.

## Impact Assessment

- **Who is affected**: any session where the user relays a repo artifact (newsletter brief, doc, code) to an external reviewer while the assistant is still editing/committing.
- **Frequency**: recurred 3+ times in one session.
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Decide the assistant-side discipline: on detecting an external-review relay loop, proactively SendUserFile the current committed artifact + checksum and name the stale-buffer / unpushed-commit risk before the user re-sends. Likely a memory-layer lever (sibling to P050 / P061 / P107 assistant-interaction discipline notes).
- [ ] Consider whether a light "push before external review, or send the committed file" prompt belongs in the newsletter step-17 close-out.
- [ ] Create a reproduction / recognition test for the loop signal.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P107 (assistant-user content-handoff friction, same family: copyable URL blocks; P109 is the stale-copy-provenance sibling)

## Related

- Fix strategy: memory-layer assistant-interaction discipline (Kind: improve, Shape: memory), sibling to the P050 / P061 / P107 pattern.
- Captured during the 2026-06-29 Issue 11 retrospective; expand at next investigation.
