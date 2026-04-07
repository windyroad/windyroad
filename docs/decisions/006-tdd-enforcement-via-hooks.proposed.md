---
status: "proposed"
first-released: 2026-03-20
date: 2026-03-20
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
---

# Enforce Red-Green-Refactor via Claude Code hooks

## Context and Problem Statement

The project has no tests. When asked to implement features, the agent defaults to writing implementation first and adding tests as an afterthought or not at all. We need a hard gate that enforces the Red-Green-Refactor cycle: write a failing test, make it pass, then refactor.

## Decision Drivers

- Tests must exist before implementation code is written
- The gate must be framework-agnostic (Vitest, Jest, node:test, etc.)
- Must follow the existing hook triad pattern (detect/enforce/mark)
- Must not slow down non-implementation work (config, docs, styles)
- Must fail safely (BLOCKED state) when the test runner errors

## Considered Options

1. **State machine via hooks** - File classification + state transitions enforce TDD cycle
2. **Agent-based enforcement** - Delegate to a TDD agent (like architect/a11y patterns)
3. **CI-only enforcement** - Reject PRs without test coverage
4. **Lint rules** - ESLint plugin requiring co-located test files

## Decision Outcome

Chosen option: **State machine via hooks**, because TDD enforcement is a deterministic gate (file classification, exit codes, state transitions) that does not require LLM judgment. Agent delegation would add latency and cost for a decision that can be made with simple rules.

### State Machine

```
IDLE  --[test written + tests fail]--> RED
IDLE  --[test written + tests pass]--> GREEN  (bootstrap for existing code)
RED   --[impl written + tests pass]--> GREEN
RED   --[impl written + tests fail]--> RED    (still working)
GREEN --[impl written + tests pass]--> GREEN  (refactor loop)
GREEN --[impl written + tests fail]--> RED    (broke something)
GREEN --[test written + tests fail]--> RED    (new cycle)
*     --[test runner error/timeout]--> BLOCKED
```

Gate rules:
- **Test files** (`*.test.*`, `*.spec.*`, `__tests__/*`): always writable
- **Exempt files** (config, CSS, docs, tooling): always writable
- **Implementation files** (`.ts`, `.tsx`, `.js`, `.jsx`): blocked in IDLE and BLOCKED states, allowed in RED and GREEN states

### Hook Files

| File | Event | Purpose |
|------|-------|---------|
| `.claude/hooks/lib/tdd-gate.sh` | (library) | File classification, state read/write, test runner |
| `.claude/hooks/tdd-inject.sh` | UserPromptSubmit | Inject TDD instructions + current state |
| `.claude/hooks/tdd-enforce-edit.sh` | PreToolUse (Edit\|Write) | Block impl edits unless RED or GREEN |
| `.claude/hooks/tdd-post-write.sh` | PostToolUse (Edit\|Write) | Run tests after writes, transition state |
| `.claude/hooks/tdd-reset.sh` | Stop | Clean up marker files |

### Configuration

Test command is configurable via environment variable:
- `TDD_TEST_CMD` (default: `npm test --`)
- `TDD_TEST_TIMEOUT` (default: 30 seconds)

If no `test` script is defined in package.json, the hooks block implementation edits and direct the user to run `/wr-tdd:create` to configure a test framework. This ensures TDD is enforced from the start of every project, not just after testing is set up.

## Consequences

- **Good**: Agent cannot skip writing tests first
- **Good**: Framework-agnostic, works with any test runner
- **Good**: No LLM cost or latency for gate decisions
- **Good**: Follows established hook triad pattern
- **Good**: Only runs session's touched test files, keeping feedback fast
- **Neutral**: Agent must touch a test file before refactoring existing code (intentional friction)
- **Bad**: Adds 4 hook entries to settings.json
- **Bad**: Test runner executes on every file write (mitigated by 30s timeout)

## Confirmation

- IDLE state blocks implementation file edits
- Writing a failing test transitions to RED
- Making the test pass transitions to GREEN
- Exempt files are always writable regardless of state
- Test runner timeout transitions to BLOCKED
- When no test script exists, implementation edits are blocked with direction to /wr-tdd:create

## Reassessment Criteria

- If Claude Code adds native TDD enforcement
- If test execution latency becomes a bottleneck (consider running tests in background)
- If the project adopts a monorepo structure requiring per-package test commands

## Delivery Mechanism

As of ADR 009, the TDD hook scripts are delivered via the `tdd` plugin from the windyroad-claude-plugin marketplace rather than local files in `.claude/hooks/`. The functional behavior documented above is unchanged.
