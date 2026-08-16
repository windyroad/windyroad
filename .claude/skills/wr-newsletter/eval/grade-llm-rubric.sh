#!/usr/bin/env bash
# grade-llm-rubric.sh , Tier-B grading provider under subscription auth.
# Copied from the sibling plugin repo so the two behave identically; the
# negation clause in the grader system prompt is load-bearing (a rubric
# requiring "X must not happen" is SATISFIED by an output that says X does
# not happen, and a naive grader fails that correct answer).
set -euo pipefail

GRADER_SYSTEM='You are a strict grading assistant for an automated test
harness. You will be given a rubric and a model output to grade against it.
Respond with ONLY a single minified JSON object and nothing else, no
markdown, no code fences, no commentary. The JSON schema is exactly:
{"pass": <true|false>, "score": <number 0..1>, "reason": "<one short sentence>"}.
Set "pass" true only if the output satisfies the rubric. Be literal about
negation: an output that says a thing does NOT happen SATISFIES a rubric
requiring that the thing must not happen.'

raw="$(claude -p --append-system-prompt "$GRADER_SYSTEM" "$@")"

printf '%s' "$raw" | awk '
  BEGIN { depth = 0; started = 0 }
  {
    line = $0
    for (i = 1; i <= length(line); i++) {
      c = substr(line, i, 1)
      if (c == "{") { depth++; started = 1 }
      if (started) { buf = buf c }
      if (c == "}") { depth--; if (depth == 0 && started) { print buf; exit } }
    }
    if (started) { buf = buf "\n" }
  }
  END { if (started && depth != 0) print buf }
' || printf '%s' "$raw"
