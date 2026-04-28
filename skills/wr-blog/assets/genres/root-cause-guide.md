# Genre: root-cause / prevention guide

A blog article that uses a public incident or industry observation as the entry point, then teaches the structural lesson behind it and shows a replicable mechanism the reader can adopt.

## Genre exemplars

- Patrick McKenzie's "the actual lesson here is..." analyses (Bits about Money).
- Bryan Cantrill's anti-pattern essays (e.g. "anti-DRY" talks).
- Charity Majors' "observability vs monitoring" pieces.
- Cloudflare and GitLab post-mortems crossed with Werner Vogels architecture posts.

## Engagement engine

For this genre the engagement engine is **insight density**. Narrative tension is secondary. Every paragraph should either:

- Sharpen the diagnosis (you thought it was X, here's why it's actually Y).
- Eliminate a wrong answer.
- Name a pattern the reader has seen but couldn't articulate.
- Hand the reader a tool they can use Monday.

Done well, the article reads like a lesson from a senior engineer who has seen this fail forty times.

## Structural shape

The article has four phases. Each phase has a specific job. Skipping one weakens the others.

### Phase 1: Hook and reframe

**Job:** get the reader in, establish the popular interpretation of the event, plant the question that the rest of the article answers.

**Length:** four to six paragraphs.

**Sections:**

1. **Opening situation (3 to 4 paragraphs).** Walk the incident scene by scene. Don't summarise; don't assume the reader has read the source thread. The reader should be able to explain what happened to a colleague after reading just the opener. Lead with the action, then the blast radius, then the absurd detail (the thing that makes the reader say "wait, what?"), then the confession or vendor response. Cite the canonical sources inline (primary sources where possible, secondary reporting as corroboration).
2. **Pull quote.** One line via `<span data-pull>` that crystallises the reframe. The reader who only reads the opener and the pull quote should still get the article's central insight. Test: does the line stand alone on a social-media card?
3. **Reframe paragraph.** State that the popular interpretation is wrong, in one or two sentences. Don't argue yet. Just plant the flag.
4. **Diagnosis as causal chain (one paragraph).** Three or four sentences naming the structural elements that combined to produce the failure. Ends on the line that says "anyone in this position produces the same outcome", because the article's whole argument is that the agent is the variable and the access path is the constant.

### Phase 2: Generalise

**Job:** show that the pattern predates the news event and travels beyond it. Name the principle. Reject the obvious wrong answers before the reader can raise them.

**Sections:**

1. **(Optional) `## This is not the first time`.** Two to four cited precedent incidents. Pre-AI parallels are stronger than AI-only cases because they prove the pattern is structural, not technology-specific. Each incident is one bullet with the named operational detail (Pixar's 90 percent + Galyn Susman's home copy; GitLab's silently failing pg_dump and rejected alert emails). Closer paragraph names the shared variable: "Different operators, different tools, different decades. The shared variable is X, not Y."
2. **`## Rules are not controls`** (or the article's named principle). The thesis section. Define the principle, define its contrast, apply it to the human stack with one or two analogies the reader already accepts (password managers, read-only deploy accounts), name why the AI moment makes this principle urgent again. Section ends with a one-line summary.
3. **Hero diagram (after the principle is named).** A two-column or layered visual contrasting the failure pattern with the controlled pattern. Diagram lives at `public/img/social/<slug>.svg`. Embedded with rich alt text on the markdown img tag.
4. **`## What won't fix this`.** Walk five to seven rejected easy answers. The list typically includes: better model, better system prompt, scoped tokens (necessary not sufficient), denylist of dangerous commands, gate on every destructive API, human in the loop, monitoring and alerting. Each rejection is two to four sentences naming the *structural reason* it fails (probability distribution maths, advisory-text-with-no-enforcement, unmaintainable enumeration, fatigue/bypass, post-action detection). Each rejection teaches the shape of the problem rather than just dismissing the answer.
5. **`## What does fix this`.** Lead with the foundational answer (in this session's article: "the agent has no production access"). Then introduce the path that remains (the pipeline) and the class of control that fits. Three properties as a portable test (fires before the action, decides from policy not judgement, has a structured bypass with audit trail). Then point at the implementation as one example of the class.

### Phase 3: Mechanism

**Job:** show the implementation honestly, with code, in enough detail that a competent developer could replicate it.

**Sections:**

1. **Three or four `### subsection` headings under "What does fix this" or as separate H2s.** In this session's article: `## The hook`, `## The gate`, `## The score`. Each section shows real bash/code samples (lifted from the actual implementation, lightly trimmed for clarity). Acknowledge what was stripped from the production version. Show one rough edge per section if there is one.
2. **One technical mechanism diagram per major section.** Optional but increases insight density. Each diagram passes the render-and-verify check (use `wr-blog:render-diagrams`).

### Phase 4: Limits, take-home, adoption, wrap-up

**Job:** acknowledge what the mechanism does not catch, hand the reader a Monday-morning action, give the curious reader a way to adopt the mechanism, and synthesise.

**Sections:**

1. **`## What the gate doesn't catch`** (or "What this doesn't solve"). Layered defence-in-depth model. Explicit about which layer this article is contributing and which layers are someone else's responsibility (the provider, the platform, the team's infrastructure choices). One or two specific failure modes the layered model still doesn't cover.
2. **`## A test you can run today`.** The take-home. Two or three concrete questions the reader applies to their own systems. Result: the reader either confirms they don't have the gap or surfaces it. Do not gate on adopting the article's recommended tool.
3. **`## Adapting this to your project`.** Prerequisites named first (some readers will not have them). Cheapest first step for the readers who don't. Then the artefacts they need, then design choices with non-obvious tradeoffs, then bypass design. One inline contextual CTA: "This is the kind of thing we set up for clients running AI agents against production." Not repeated.
4. **`## What to take away`** (wrap-up). McKenzie/Cantrill style.
   - Synthesis paragraph: one or two sentences naming the journey from incident to principle. Identifies the structural failure as upstream of the agent.
   - Five portable lessons as a bulleted list. Each lesson is a sentence the reader could lift onto a slide.
   - "Even with all four layers" or "what stays unsolved" paragraph. Three concrete failure modes the layered model doesn't catch. Honest, not triumphant.
   - Forward pointer to two or three related articles plus the source-code repo.

## Voice rules specific to this genre

In addition to the project's voice guide:

- **The reader is a peer**, not a target. Don't sell. Don't write in fear-of-missing-out register.
- **Centre the system, not the author.** First person is fine for personal observations; avoid "I built" framing in intros.
- **Concrete over abstract.** When the diagnosis tempts you toward an abstract noun phrase, find the named example instead.
- **Plain English in opener and closing.** Mechanism sections may run denser. The "Reading level and jargon load" rule in the voice guide applies (Grade 9 to 10 in opener and closing).
- **Pre-empt then prescribe.** Do not introduce the mechanism before the rejection of easy answers has primed the reader to want it.
- **The named principle is the article.** Everything else supports it. If you can't name the principle in five words, the article isn't ready.

## Anti-patterns specific to this genre

- **Thesis-statement section titles.** "Risk culture is what sits between intent and action" is a thesis, not a section title. Use noun/action titles ("The hook", "The gate", "What won't fix this").
- **Diagnosis as parallel checklist.** Three independent failures listed in parallel doesn't teach the chain. Make the failure feel inevitable.
- **Single-sourced claims on a load-bearing fact.** If the article hangs on a vendor failure or a research finding, find a corroborating source.
- **CTA wobble.** "This is what we set up for clients. It is also reproducible from the description above in a few hundred lines of shell." The second sentence undercuts the first. Pick one.
- **Burying the principle.** If the named principle appears for the first time in the wrap-up, the article is structured upside down.
- **News-bulletin opener.** "Last week an AI deleted a database. Here's what happened." This summarises rather than narrates. Walk the incident scene by scene instead.
- **Promotional closer.** Don't pivot to a sales pitch in the final paragraph. The article ends when the content ends.

## Quality bar (gate-level expectations)

A finished root-cause guide should pass:

- **Voice gate** (`wr-voice-tone:agent`): clean against `docs/VOICE-AND-TONE.md` including em-dash, avoided-word, ambiguous-link, and reading-level rules.
- **Content-risk gate** (`wr-content-risk-scorer:agent`): no confidential business metrics, no reader-team disparagement, no unfalsifiable claims, no unsourced industry generalisations, no dismissal of a tool the reader uses and likes.
- **SW critic loop** (`wr-sw-critic` against `article-critic-rubric.md`): all 10 checks MET within 3 rounds.
- **Cog-a11y gate** (`cognitive-accessibility`): no unglossed jargon stacks in opener and closing; gloss on first use for in-group terms and three-letter abbreviations; concrete over abstract.
- **Render-and-verify** (`wr-blog:render-diagrams`): every diagram renders without overflow, arrow-target collision, or label-behind-box clipping.

## Worked example

The article shipped this session, "An AI agent deleted production. The model wasn't the problem.", is a complete worked example of this genre. Phases, sections, and rules above were derived from the iterations that took it through eight critic rounds and four cog-a11y rounds.
