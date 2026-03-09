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

### Twitter/X posts

**Tone: Sharpest possible version of the idea.** Twitter posts compress the work into one or two sentences. The entire post is visible. Every word earns its place or gets cut.

**One idea, stated once.** No lists, no multi-paragraph structure. One sentence that makes someone stop, optionally followed by one sentence of context.

> "An AI agent doesn't feel the weight of a growing diff. I built a hook that makes it visible."

Not: "Excited to share my latest blog post about making WIP visible to AI agents! Here are the four checks I implemented..."

**Links go in the reply.** Twitter suppresses posts with links. Put the article URL in a reply to your own tweet, not in the main post. The main post earns the click; the reply delivers it.

**Images tell the story.** A diagram or screenshot that's self-explanatory at thumbnail size drives more engagement than text alone. Include alt text in the image settings.

**Threads for depth.** If one tweet isn't enough, use a thread. The first tweet is the hook. Each subsequent tweet stands alone. Don't number them or announce "Thread."

**No hashtags.** Twitter hashtags read as noise. If the post is good, it reaches people through engagement, not tags.

Guidelines:
- First person, same as all other copy
- 80-200 characters is the sweet spot (280 max)
- No em-dashes
- No avoided words from the word list

### Reddit posts

**Tone: Practitioner sharing what they built, inviting discussion.** Reddit readers want substance in the post itself, not a teaser that links elsewhere. The audience is peers in a forum. They'll engage if they learn something from the post without clicking.

**Give the substance upfront.** A Reddit post should be a condensed version of the article: the problem, the approach, the key details. The link to the full write-up goes at the end as a "more detail here" reference, not as the point of the post. If the post is only valuable with the link, it's a promotion, not a contribution.

> Title: "I built a Claude Code hook that nudges about accumulating WIP"
>
> Body: Describes the problem, lists the four checks, explains the design choice. Link at the end.

Not: "I wrote a blog post about WIP visibility. Link: [url]"

**Title is the hook.** Reddit titles are permanent and carry the post. State what you built or what you found. Avoid clickbait, questions you already know the answer to, and superlatives.

**Conversational, not polished.** Reddit tone is more casual than LinkedIn or blog articles. Write as if explaining to a colleague over coffee. First person. Contractions. Short paragraphs.

**Invite discussion genuinely.** A closing line like "curious if anyone else is doing something similar" works if you mean it. Don't ask for engagement you don't want.

**Target the right subreddit.** Include the target subreddit and required post flair in the front matter. Different subreddits have different rules about self-promotion, link posts, and flair requirements. Posts without flair are often auto-removed.

Guidelines:
- First person, casual but still direct
- Front-load the value: problem, approach, key details
- Link to the full article at the end, not as the main content
- No em-dashes
- No avoided words from the word list

### Hacker News

**Tone: Show your work, let the community judge.** HN readers are engineers who value substance and originality. They'll click if the title signals something concrete and novel. They'll upvote if the content delivers.

**Title is everything.** HN titles are capped at 80 characters. "Show HN:" prefix signals you built something. State what it is in plain terms. No superlatives, no clickbait, no questions you already know the answer to.

> "Show HN: Claude Code hook that nudges about accumulating WIP"

Not: "I built an amazing AI coding tool that revolutionises developer workflow"

**Link posts, not text posts.** Submit the article URL directly. HN text posts ("Ask HN", "Tell HN") are for questions and discussions, not for promoting articles. The article should stand on its own.

**Timing matters.** Weekday mornings US Eastern time get the most eyeballs. Avoid weekends and holidays.

Guidelines:
- Title under 80 characters
- "Show HN:" prefix for things you built
- Submit as link post to the article URL
- No text body needed
- No em-dashes in titles
- No avoided words from the word list

### Dev.to

**Tone: Practitioner sharing a complete walkthrough.** Dev.to readers expect full articles, not teasers. Cross-post the entire article using Dev.to's canonical URL field to preserve SEO. The audience overlaps with blog readers: engineers who want to learn something concrete.

**Cross-post the full article.** Dev.to supports a `canonical_url` front matter field that tells search engines the original lives on your site. Use it. Don't write a summary that links elsewhere. Give them the whole thing.

**Dev.to front matter.** Dev.to uses its own front matter format: `title`, `published`, `tags` (up to 4, lowercase, no spaces), `canonical_url`, and `cover_image`.

**Tags drive discovery.** Dev.to tags are how readers find content. Use up to four, lowercase. Pick tags that match existing popular tags on the platform.

Guidelines:
- Cross-post the full article, not a summary
- Always set canonical_url to the original article
- Up to 4 tags, lowercase
- Cover image recommended
- No em-dashes
- No avoided words from the word list

### Lobste.rs

**Tone: Terse, technical, no fluff.** Lobsters is a small, invite-only community of experienced engineers. They value density and dislike self-promotion even more than HN. The title should be descriptive and plain.

**Title is descriptive, not catchy.** State what the article covers. No "Show" prefix (that's HN convention). No first person in the title. Lobsters titles read like paper abstracts.

> "Making work-in-progress visible to AI coding agents with Claude Code hooks"

Not: "I built a hook that nudges about WIP"

**Tags are required.** Lobsters uses a curated tag system. Pick the most relevant ones.

**Link post only.** Submit the URL. No text body.

Guidelines:
- Descriptive, third-person title
- Submit as link post
- Select relevant tags from Lobsters' curated list
- No em-dashes in titles
- No avoided words from the word list

### Bluesky

**Tone: Same compression as Twitter, slightly more room.** Bluesky posts have a 300-character limit. The audience is the growing developer community migrating from Twitter. Same principles: one idea, one or two sentences, link in a follow-up post or inline.

**Links work inline.** Unlike Twitter, Bluesky doesn't suppress posts with links. You can include the URL in the main post. Link cards with preview images display automatically.

**No hashtags.** Same as Twitter. Let the content drive engagement.

Guidelines:
- First person, same as all other copy
- 300 characters max, aim for 100-200
- Links can go inline (no algorithmic suppression)
- No em-dashes
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
