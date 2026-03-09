# Voice and Tone

This guide defines how Windy Road Technology sounds across the website, landing pages, blog articles, and marketing copy. It exists so that anyone writing for the site produces copy that sounds like the same person wrote it.

The site is a solo consulting practice. The voice is first-person. The audience is technical founders and engineering leaders who are under pressure and evaluating whether to hire.

---

## Voice

Voice is the constant. It doesn't change between pages or audiences. Windy Road always sounds like this:

### Direct

Say the thing. Short sentences. No preamble, no hedging, no throat-clearing. If a sentence works without its first clause, cut the first clause.

> "Tell me what's breaking."

Not: "If you're experiencing issues with your application, I'd love to chat about how I might be able to help."

### Confident, not defensive

State what you do. Don't define yourself by what you're not, what competitors get wrong, or what the reader might be doubting. Authority comes from stating facts plainly, not from pre-empting objections.

"Not" constructions are fine when describing the visitor ("You want X, not Y") or making a technical distinction ("semantic, not syntactic"). The pattern to avoid is self-positioning: "I'm X, not Y."

> "One senior engineer reads your entire codebase."

Not: "I'm one senior person who actually reads your code. Not an account manager who hands you off to juniors."

The word "actually" is almost always a sign of defensive writing. If you need "actually" to make a sentence feel true, the sentence isn't confident enough without it.

### Specific

Use numbers, names, timeframes, and deliverables. Specificity is more persuasive than adjectives. "400% throughput increase at Greater Bank" beats "dramatically improved performance."

> "$5,000. One week. Full codebase audit with a prioritised fix list."

Not: "Affordable, fast, comprehensive code review services."

### Empathetic, not flattering

The visitor has a problem. Name the problem in their language. Don't tell them how smart they are, don't compliment their product, and don't soften the message. Empathy means showing you understand what they're experiencing, not making them feel good about it.

> "Your vibe-coded app is in production. Something keeps breaking. You're scared to touch it."

Not: "You've built something amazing! But every great product needs a little polish."

---

## Tone

Tone shifts by context while the voice stays constant. Here's how to adjust.

### Hero copy

**Tone: Calm urgency.** The visitor just arrived. They have a problem and they're scanning for signals that you understand it. Lead with their felt experience, not your credentials. Short lines. No jargon. The goal is recognition: "this person gets it."

- Lead with the visitor's problem, not your solution
- Use second person ("your app," "you're scared") not third person ("founders often find")
- Keep the subheadline to one line. It should land like a full stop, not an elevator pitch.

### Problem lists

**Tone: Blunt recognition.** Each item should make the reader nod. These are things they've experienced or are worried about. Not things you want to teach them.

- Describe felt experiences, not technical concepts
- No competitor comparisons (those aren't problems the visitor is living)
- Each item stands alone. No item should require context from another.

### Credentials and proof

**Tone: Matter-of-fact.** Let the numbers do the work. Don't editorialize about what the numbers mean. "400% throughput increase per developer at Greater Bank" is stronger than "I dramatically transformed their development process."

- Use the colon-and-list pattern for credentials: "I've shipped three products from scratch: built them, found the customers, closed the sales."
- Don't explain why a credential matters. If it needs explaining, it's the wrong credential for this audience.
- Testimonials should be verbatim. Don't paraphrase or excerpt selectively.

### Process descriptions

**Tone: Practical clarity.** The reader wants to know what happens if they hire you. Describe actions and outcomes, not philosophy.

- Lead each step with what the visitor gets, not what you do
- "You get working guardrails: quality gates in your pipeline..." not "I will implement robust quality assurance mechanisms"
- No racing metaphors, no journey metaphors, no sports metaphors

### Pricing

**Tone: Straightforward.** State the price, state what's included, state the timeframe. The price should feel like information, not a pitch.

- Don't anchor against competitors ("agencies charge $50k"). Let your price stand on its own merit.
- "No retainers, no long-term commitments" is fine because it describes your terms, not someone else's.
- Outcome lines should be concrete: "Immediate improvements + prioritised roadmap" not "Peace of mind and a clear path forward"

### Objection handling (FAQ, objection blocks)

**Tone: Respectful and substantive.** The reader asked a real question. Answer it with real information, not a dismissal.

> "You can. An AI audit will catch syntax and pattern issues. It won't catch the architectural gaps, the business logic that doesn't match your edge cases, or the dependencies that don't exist. That takes a human who's shipped production code."

Not: "You can. But Claude wrote the bugs in the first place."

- Acknowledge what the alternative does well before explaining what it misses
- Explain the gap with specifics, not snark
- Never dismiss a tool or approach the visitor is using and likes

### Fit check (This Road / Wrong Road)

**Tone: Honest filter.** The fit check describes the visitor, not the service. "This Road" items are felt states the right visitor will recognise in themselves. "Wrong Road" items are honest about who this isn't for.

> "You know something is wrong but you're not sure what to fix first"

Not: "You need someone who can implement the guardrails, not just recommend them in a PDF"

- "This Road" = describe the visitor's situation
- "Wrong Road" = describe the visitor's expectations
- Neither column should contain feature claims or competitive positioning

### CTAs

**Tone: Low-pressure, action-oriented.** Tell them what to do and make it easy. Don't manufacture urgency.

> "Tell me what's breaking."

Not: "Don't wait until it's too late! Schedule your consultation today!"

- One verb, one action. "Book a Call" not "Schedule Your Free Strategy Session"
- Closing CTAs can acknowledge the problem one more time, but shouldn't escalate the fear

### Blog articles

**Tone: Practitioner sharing working knowledge.** Blog posts are first-person accounts of real work. The reader is a peer: another engineer, tech lead, or technical founder. They found the article through a search or a link, not through the sales funnel. They want to learn something concrete.

Articles live in `src/articles/` as markdown files. They range from short opinion pieces to detailed technical walkthroughs with code samples. The same voice principles apply, but the tone is more collegial than the landing pages. You're not selling. You're showing your work.

**Lead with the problem or the situation, not the takeaway.**

> "The pipeline only works if you watch it. If you `git push` and then context-switch to something else, the pipeline becomes theatre."

Not: "In this article, I'll show you how to enforce pipeline discipline using Claude Code hooks."

**Show, don't summarise.** Include real code, real config, real terminal output. When you describe a solution, show the implementation. Readers trust what they can read and verify over what you claim works.

**No "In this post I will" framing.** Don't narrate the structure of the article. Just write the article. The reader can see the headings.

**Be specific about tradeoffs and limitations.** If a solution has rough edges, say so. "The filter uses ISO 8601 string comparison. It works, but it only works if you pipe through standalone `jq`" is more useful than pretending everything is clean.

**Technical depth is fine.** Blog readers opted in. Don't dumb down code explanations or over-explain standard tooling. If you're writing about Git hooks, assume the reader knows what Git is.

**No promotional closers.** The article should end when the content ends. Don't pivot to a sales pitch in the final paragraph. If an article is tagged with a relevant service tag (e.g., `ai coding`), the blog template handles the CTA automatically. Don't duplicate it in the article body.

**Inline CTAs in articles.** If an article covers a topic directly related to the consulting service, a single contextual mention is fine: "This is the kind of thing I set up for clients." Keep it to one sentence, placed where it's relevant, not bolted on at the end. Don't repeat it.

Guidelines:
- First person ("I use," "I found," "the hook I wrote")
- Present tense for describing how things work, past tense for how they were built
- Code blocks should be complete enough to understand without the surrounding prose
- Use descriptive alt text on diagrams and screenshots (enforced by accessibility hooks)
- Link to previous articles with relative paths (`/blog/slug`) not absolute URLs
- Headings should describe the content, not tease it: "The hook" not "The secret sauce"
- No em-dashes (enforced by the repository's pre-commit hook)

**Pull quotes.** Pull quotes repeat a key line from the article as a visual accent. They break up long sections and signal the core insight to readers who are scanning. Use them sparingly: one or two per article at most.

A good pull quote is a complete thought that stands alone without the surrounding paragraph. It should be the line a reader would highlight or quote when sharing the article. If it needs context to make sense, it's not a pull quote.

In markdown, wrap the source text in a `<span data-pull>` tag inline in the body:

```markdown
This matters because <span data-pull>work-in-progress is risk.</span> In Lean terms...
```

The build generates an `<aside>` from the marked text automatically. The text is written once; the pull quote and the body always match.

By default the pull quote appears before the paragraph containing the marked text. To shift it earlier, add a `data-pull-offset` attribute with the number of blocks to move up:

```markdown
<span data-pull data-pull-offset="2">Work-in-progress is risk.</span>
```

Pull quotes float right and body text wraps around them, magazine-style. On narrow screens they stack full-width.

**Visual design principles:**
- Visual separation is the foundation. The quote needs to feel distinct from body text without feeling disconnected from the page. Use a combination of size, weight, colour, and whitespace, but not all four at once.
- Typography does the heavy lifting. 1.5-2.5x body text size is typical. Loose letter-spacing and relaxed line-height help at larger sizes. The text should feel expansive, not cramped.
- The border or rule should be purposeful. A left border (3-5px, brand colour) is a classic. Full top-and-bottom rules feel more editorial. Avoid boxing the quote on four sides: that reads as a callout box, not a pull quote. Some designs skip the rule entirely and let size + colour contrast do the work.
- Oversized opening quotation marks add character, but only if the rest of the design has enough restraint to let them breathe. If everything is competing, drop them.
- Colour contrast without shouting. A slightly muted version of a brand colour works better than full saturation. The goal is "this matters" not "look at me."
- Whitespace is the most underused tool. Give pull quotes generous margin: more than feels comfortable. Tight pull quotes look like mistakes; spacious ones look deliberate.
- Floating a pull quote within a column (with text wrapping) works for long-form editorial. Full-width pull quotes work better for landing pages or shorter content.
- Gut-check: if you removed the pull quote, would the page feel emptier? If yes, it's doing its job. If it just feels cluttered without it, it was too heavy-handed.

**Content guidelines:**
- Mark the text inline where it appears in the body. Don't duplicate it in a separate `<aside>`.
- Keep the pull quote close to where the marked text appears. Use `data-pull-offset` sparingly.
- One per major section at most. Two in a short article is too many.
- The line should work as a standalone statement. Test: does it make sense on a social media card?

### LinkedIn posts

**Tone: Practitioner sharing a compressed version of the work.** LinkedIn posts promote blog articles to a peer audience: engineers, tech leads, and technical founders scrolling a feed. The same voice principles apply. The difference is compression: readers are scanning, not reading.

**The fold matters.** The first two to three lines appear before the "see more" link. They carry the entire post. Lead with the problem or the key insight, the same way a blog article leads with the situation. If the fold doesn't earn the click, the rest doesn't exist.

> "An AI agent has no visibility into accumulating work-in-progress. It works on the current prompt."

Not: "Excited to share a new blog post about how I built a Claude Code hook for WIP visibility!"

**Summarising is appropriate here.** Blog articles show the work in full. LinkedIn posts summarise it. State the problem, describe the approach, list the key details. The article has the code and the depth. The post's job is to make someone want to read it.

**End with the link.** The article link at the end is the point of the post, not a promotional closer. No "Check it out!" or "Link in comments." Just the URL on its own line.

**No hashtag spam.** Zero to two hashtags maximum, and only if they're genuinely useful for discovery (e.g., `#cicd`). A wall of hashtags signals marketing, not craft.

**No promotional framing.** Don't narrate your excitement about the post. Don't ask for engagement. Don't open with "I'm thrilled to announce" or close with "What do you think? Drop a comment below!" Write for peers who respect substance.

Guidelines:
- First person, same as blog articles
- Short paragraphs: one to three sentences each
- Numbered or bulleted lists work well for specifics that would otherwise blur together in a feed
- No em-dashes (same constraint as all other copy)
- No avoided words from the word list

---

## Banned patterns

These patterns have been identified and removed from the site. Don't reintroduce them.

| Pattern | Why it fails | Example |
|---------|-------------|---------|
| "actually" as emphasis | Signals you expect to be doubted | "I actually read your code" |
| "I'm X, not Y" self-positioning | Defines you by what you're not | "Working guardrails, not a slide deck" |
| Competitor bashing | Positions you as the cheap alternative rather than the right one | "Agencies charge $50k and take 8 weeks" |
| Dismissing the reader's tools | Insults something they chose and use | "Claude wrote the bugs in the first place" |
| Feature claims in fit checks | Sells the service instead of describing the visitor | "You need someone who can implement guardrails" |

---

## Word list

### Prefer

| Use | Instead of |
|-----|-----------|
| works | actually works |
| guardrails | quality assurance mechanisms |
| pipeline | CI/CD infrastructure |
| ship | deliver, deploy (when talking about products) |
| broke, breaking, broken | experiencing issues |
| fix | remediate, resolve |
| codebase | code assets |

### Avoid

| Word/phrase | Why |
|-------------|-----|
| actually | Almost always defensive filler |
| passionate | Empty. Show it, don't say it. |
| leverage | Corporate jargon |
| solution/solutions | Vague. Name the thing. |
| best-in-class | Unverifiable superlative |
| cutting-edge | Same |
| game-changer | Same |
| synergy | No |
| deep dive | Overused. Say "audit" or "review" |
| reach out | Say "call," "email," or "book" |

---

## Technical constraints

**No em-dashes.** The repository has a pre-commit hook that blocks em-dashes (the long dash character and its HTML entity). Use a colon, a full stop, or restructure the sentence instead. This is enforced automatically; commits containing em-dashes will be rejected.

---

## Two audiences, one voice

The site serves two audiences on separate pages:

**Vibe-coded founders** (homepage, /vibe-code-audit): Non-technical or semi-technical founders who used AI tools to build something that's now in production and breaking. They're stressed, possibly embarrassed, and evaluating whether you understand their situation.

**Engineering leaders** (/ai-teams): Technical managers whose teams adopted AI coding tools and are seeing quality problems. They're credential-sensitive and making a decision that affects their team and their reputation.

The voice is the same for both. The tone shifts:

- Founders get more empathy, shorter sentences, simpler language, and problem-first framing
- Engineering leaders get more specifics, more process detail, and more proof (testimonials, stats, named companies)

The fit check, FAQ, and pricing sections do the heaviest lifting in separating the two audiences. The voice principles apply equally to both.
