#!/usr/bin/env bash
# falsify.sh, R1 from the 2026-08-10 risk review.
#
# The neutral-prompt discipline in promptfooconfig.yaml was prose, and
# ADR-052's own Confirmation section is the argument against leaving a rule at
# this surface in prose: P099 shipped one here and its Effort line records that
# it did not hold. This script is the deterministic counterpart.
#
# It swaps in the SKILL.md from immediately BEFORE ADR-052 was implemented,
# runs the same fixtures, and asserts that ALL of them fail. A fixture that
# leaks the structure under test, or a rubric too loose to discriminate, will
# pass against that skill and fail this script.
#
# The green run alone proves nothing: it is satisfied by a hollow harness.
# Both directions together are the evidence.
#
# Usage, from the repo root:
#   npm run eval:newsletter:falsify
set -euo pipefail

BASELINE_REF="${BASELINE_REF:-e37c782^}"
SKILL_PATH=".claude/skills/wr-newsletter/SKILL.md"
CONFIG=".claude/skills/wr-newsletter/eval/promptfooconfig.yaml"

cd "$(git rev-parse --show-toplevel)"

if ! git diff --quiet -- "$SKILL_PATH"; then
  echo "falsify.sh: $SKILL_PATH has uncommitted changes; commit or stash first" >&2
  echo "  (the script swaps the file and restores it from git, so local edits would be lost)" >&2
  exit 2
fi

restore() { git checkout -- "$SKILL_PATH"; }
trap restore EXIT

echo "falsify.sh: swapping in $SKILL_PATH from $BASELINE_REF (pre-ADR-052)"
git show "${BASELINE_REF}:${SKILL_PATH}" > "$SKILL_PATH"

set +e
out="$(npx --yes promptfoo@0.120.19 eval -c "$CONFIG" --no-cache 2>&1)"
set -e
printf '%s\n' "$out" | tail -20

# promptfoo prints e.g. "Results: 0 passed, 18 failed, 0 errors (0%)".
# NOTE: with `repeat: 3` in the config those counts are test INSTANCES, not
# fixtures, so a run reporting "6 passed" means two fixtures times three
# repeats. Zero is zero either way, which is all the assertion below needs,
# but divide by the repeat count before reading a non-zero number as a
# fixture count.
passed="$(printf '%s' "$out" | grep -oE '[0-9]+ passed' | tail -1 | grep -oE '[0-9]+' || echo "")"

if [[ -z "$passed" ]]; then
  echo "falsify.sh: could not parse a pass count from promptfoo output" >&2
  exit 2
fi

if [[ "$passed" -ne 0 ]]; then
  echo >&2
  echo "falsify.sh: FAIL. $passed test instance(s) still passed against the pre-ADR-052 skill." >&2
  echo "  (divide by the config repeat count to get fixtures)" >&2
  echo "Those fixtures do not discriminate: they pass whether or not the skill" >&2
  echo "implements the two-class sort, so they guard nothing. The usual cause is a" >&2
  echo "prompt that names the classification scheme, or a rubric that does not" >&2
  echo "require publication to be conditional on the author's stated reason." >&2
  exit 1
fi

echo
echo "falsify.sh: OK. 0 test instances passed against the pre-ADR-052 skill, which is the"
echo "expected result. Run 'npm run eval:newsletter' for the other direction."
