# Briefing

What a fresh session needs to know about this project beyond what CLAUDE.md, ADRs, JTBD, and the voice guide already cover.

## What You Need to Know

- **The Shift is Windy Road's weekly AI newsletter.** Pipeline: `/wr-newsletter` skill. Substrate: `docs/ai-engineering-brief/ai-landscape.owm` (Wardley map, internal only, never named in the reader body). Draft output: `src/newsletters/drafts/YYYY-MM-DD.md`. Logo: `src/newsletters/assets/the-shift-logo.{svg,png,-300.png}` (done, reused every week).
- **Review gate order is critic -> voice -> content-risk** (ADR 016). Critic runs first because analytical quality is expensive to fix; voice and content-risk are cheaper polish. Each critic round is a separate subagent call (fresh context) to avoid confirmation bias. Max three rounds.
- **Per-item voice capture is how the opener is built.** SKILL step 4.5 uses `AskUserQuestion` per candidate (Agree / Adjust / Drop). Tom's Adjust text feeds the drafter; the "From Tom" opener is assembled from the strongest POV across the week's adjusts, not from a model guess.
- **Logo is reused.** The SVG is done. Do not rebuild the logo each week; only the draft body changes.
- **Every weekly issue gets a unique title.** "The Shift" is the series; individual editions each get a POV-carrying H1 (example: `Container wars again: agent runtimes just became default infrastructure`). Date goes in the subtitle line.
- **Link sources inline on claim text, not in a Source block.** LinkedIn renders inline Markdown links; a trailing URL block reads as a wall of raw text.
- **The first part of a new session is stale-marker territory.** Session-start hooks block edits until architect/JTBD/style/voice/a11y subagents run. Any new `.claude/agents/*.md` file is not discoverable until Claude Code session restart; fall back to `general-purpose` with the subagent's behaviour inlined until the next session.
- **Problem tickets live in `docs/problems/NNN-slug.status.md`.** Statuses: `open`, `closed`, `known-error`. Highest existing is 006; start at 007 for new tickets.

## What Will Surprise You

- **Tom's editorial reviews repeatedly catch weaknesses the critic subagent does not.** Redundant preamble, author-voice authenticity, subtle reader-respect patterns, LinkedIn-format issues, claim-evidence looseness. The structural rubric is tight on correctness and loose on presentation and persuasion. See problem 008.
- **The critic subagent defined at `.claude/agents/wr-sw-critic.md` will not be discoverable in the session it was created in.** Work around with `general-purpose` plus the critic process inlined. See problem 007.
- **Content-risk review is still inline self-scoring by the drafter** (ADR 012/015), which is the confirmation-bias failure mode ADR 016 was written to prevent for the critic. Needs subagent-ising. See problem 009.
- **OpenAI's news page returns 403 to `WebFetch`** (bot protection). Workaround: Google News RSS scoped `site:openai.com`. Reddit is blocked at the Claude Code tool layer entirely (any `reddit.com` URL refused); need a Playwright helper out-of-band for r/LocalLLaMA and r/MachineLearning coverage. See problem 010.
- **Visual artifacts (SVG logos) need render-and-verify discipline**. `sips -s format png -Z <size> in.svg --out out.png` + `Read` on the PNG. Tom had to direct this explicitly after multiple iterations shipped unverified. See problem 011.
- **The Wardley map is internal-only substrate**. Never named, never referenced in body copy. The reader sees the analysis that results from the map, not the map vocabulary (no "map", "landscape", "position", "evolution axis", "commodity", "genesis" in reader-facing prose).
- **Map anchor is a preference, not a hard filter.** Three-lens-strong items without a clean map mapping still qualify. The original "every item must anchor" rule was softened.
- **Tier-1 source rule is a heuristic, not a hard block.** If one tier-1 source fails but tier-2 coverage is rich, judgement says proceed with the map update and note the partial coverage. Blind rule-following produced a bad call earlier in the session.
