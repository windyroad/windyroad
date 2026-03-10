#!/bin/bash
# Architecture - UserPromptSubmit hook
# Detects .claude/agents/architect.md and injects delegation instruction.
# Mirrors: voice-tone-eval.sh

if [ -f ".claude/agents/architect.md" ]; then
  cat <<'HOOK_OUTPUT'
INSTRUCTION: MANDATORY ARCHITECTURE CHECK. YOU MUST FOLLOW THIS.
DETECTED: .claude/agents/architect.md exists in this project.

This is a NON-OPTIONAL instruction. You MUST use the architect agent
before editing any architecture-bearing file: package.json, config files
(*.config.*, tsconfig*), CI workflows (.github/workflows/*), hook scripts
(.claude/hooks/*), build/deploy scripts (scripts/*), or decision files
(docs/decisions/*). This is proactive. Do not wait for the user to ask.

REQUIRED ACTIONS:
1. Use the Agent tool to delegate to architect
   (subagent_type: "architect")
2. The architect will review proposed changes against existing decisions
   in docs/decisions/ and flag when new decisions should be documented
3. Do NOT edit architecture-bearing files without architect review FIRST
4. Do NOT skip this step even if you think you can handle it yourself

SCOPE: package.json, *.config.*, tsconfig*, .github/workflows/*.yml,
.claude/hooks/*.sh, .claude/settings.json, scripts/*, docs/decisions/*.
Does NOT apply to: source code in src/, test files, documentation (unless
it's a decision file), CSS/SCSS files, image assets.
HOOK_OUTPUT
fi
