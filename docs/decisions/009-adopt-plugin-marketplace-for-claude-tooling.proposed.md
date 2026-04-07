---
status: "proposed"
first-released:
date: 2026-04-07
decision-makers: [Tom Howard, Claude]
consulted: []
informed: []
---

# Adopt plugin marketplace for shared Claude Code tooling

## Context and Problem Statement

Claude Code agents, hooks, and skills are duplicated across four projects (windyroad, bbstats, addressr, very-fetching). Each project maintains its own copy of 20+ agents, 35+ hook scripts, and 6+ skills. Changes made in one project must be manually synced to the others, leading to drift. bbstats and addressr are in sync but ahead of windyroad; very-fetching has a subset.

## Decision Drivers

- Single source of truth for shared tooling
- Independent versioning and evolution of each tool domain
- Projects can cherry-pick which plugins to install
- Accessibility agents (from a separate project) remain unaffected
- Existing ADRs (006, 007, 008) document hook behaviors that must be preserved

## Considered Options

1. **Plugin marketplace** - Single repo with multiple plugins, installable individually via Claude Code's plugin system
2. **Git submodule** - Shared repo checked out as a submodule in each project
3. **npm package** - Publish config as an npm package with postinstall copy
4. **Global ~/.claude/ directory** - Move shared config to user-level global directory

## Decision Outcome

Chosen option: **Plugin marketplace**, because it uses Claude Code's native plugin system, supports independent plugin versioning, allows per-project cherry-picking, and requires no build tooling or package management.

### Implementation

The marketplace lives at `github.com/windyroad/windyroad-claude-plugin` and contains 10 plugins:

| Plugin | Contents | Dependencies |
|--------|----------|-------------|
| architect | ADR enforcement agent + 6 hooks | none |
| risk-scorer | 5 risk-scorer agents + 13 hooks + risk-policy skill | none |
| voice-tone | voice-and-tone-lead agent + 4 hooks | none |
| style-guide | style-guide-lead agent + 4 hooks | none |
| jtbd | jtbd-lead agent + 4 hooks | none |
| problem | problem management skill | risk-scorer |
| retrospective | 2 hooks + retrospective skill | problem, risk-scorer |
| tdd | 4 TDD state machine hooks | none |
| c4 | C4 diagram generation + validation skills | none |
| wardley | Wardley Map generation skill | none |

Plugins with dependencies include a SessionStart hook that warns when required sibling plugins are missing.

### What stays project-specific

- CLAUDE.md and AGENTS.md (project instructions)
- settings.local.json (project-specific tool permissions)
- Accessibility agents and hooks (from the accessibility-agents project)
- Project-specific hooks (e.g., windyroad's no-em-dash.sh)
- docs/decisions/ (project-specific ADRs)

### Delivery mechanism note

This decision changes how hooks documented in ADRs 006, 007, and 008 are delivered. The functional behavior is unchanged; only the file locations change (from `.claude/hooks/` to plugin directories). Those ADRs have been updated with notes referencing this decision.

### Consequences

- Developers must install plugins when setting up the project
- Hook scripts are no longer visible in the repo's .claude/hooks/ directory
- Plugin updates are pulled from the marketplace (no lockfile mechanism yet)

## Confirmation

- All applicable plugins install without errors via the marketplace
- Hook scripts in plugins fire correctly (architect gate, risk scoring, TDD state machine)
- No duplicate hooks fire (project hooks removed for plugin-provided functionality)
- Project-specific hooks (a11y, no-em-dash) continue to work alongside plugin hooks
