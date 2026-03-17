#!/bin/bash
# Architecture - Stop hook for plan review marker
# Removes the architect plan review marker so the next session requires fresh review.

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty') || true

if [ -n "$SESSION_ID" ]; then
  rm -f "/tmp/architect-plan-reviewed-${SESSION_ID}"
fi

exit 0
