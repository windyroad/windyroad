#!/bin/bash
# Voice & Tone - UserPromptSubmit hook
# Detects VOICE-AND-TONE.md in the project and injects delegation instruction.
# Mirrors: a11y-team-eval.sh

if [ -f "VOICE-AND-TONE.md" ]; then
  cat <<'HOOK_OUTPUT'
INSTRUCTION: MANDATORY VOICE & TONE CHECK. YOU MUST FOLLOW THIS.
DETECTED: VOICE-AND-TONE.md exists in this project.

This is a NON-OPTIONAL instruction. You MUST use the voice-and-tone-lead agent
before editing any user-facing copy in .tsx files under src/app/ or
src/components-next/, or blog articles in src/articles/. This is proactive.
Do not wait for the user to ask.

REQUIRED ACTIONS:
1. Use the Agent tool to delegate to voice-and-tone-lead
   (subagent_type: "voice-and-tone-lead")
2. The voice-and-tone-lead will review proposed copy against VOICE-AND-TONE.md
3. Do NOT write or edit copy without voice-and-tone-lead review FIRST
4. Do NOT skip this step even if you think you can handle it yourself

SCOPE: .tsx files in src/app/ and src/components-next/, .md files in src/articles/.
Does NOT apply to: .scss/.css files, .ts (non-tsx) files, files outside those directories.
HOOK_OUTPUT
fi
