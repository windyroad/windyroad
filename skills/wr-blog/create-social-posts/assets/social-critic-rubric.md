# Social-post critic rubric

Brief editorial prompt for `wr-blog-social-critic`. Applies to long-form social posts (LinkedIn, Reddit). Per ADR 035 this is an editorial prompt naming the analytical-quality axes, NOT a numbered-check scoring table.

Short-form posts (Twitter, Bluesky, Hacker News, Lobsters) are not scored against this rubric; their surface area is too small for analytical critique. dev.to reuses the article's already-cleared critic verdict because the body is the article verbatim.

## Audience

Engineering leaders, software developers, and technical founders. The same audience as the article. The post is a different artefact from the article, so the critic does not compare line-for-line; the post must work standalone for someone scrolling who has not yet clicked through.

## What to read for

Read the post and return STRENGTHS, WEAKNESSES, and optional RELEVANT CONTEXT, each with specific passage citations. Weigh the post against these analytical-quality axes:

- **Hook earns the click.** The first sentence (LinkedIn opener, Reddit title plus first sentence) makes a concrete promise. Weak when the opener leads with abstraction, vendor-name dropping, or "everyone is talking about X", or over-promises what the body delivers.
- **Argument lands without the article.** A scroller who never clicks through still gets the principle. Weak when the post is teaser-only ("read the article to find out") or its structural claim depends on a paragraph that exists only in the article.
- **Concrete example present.** At least one named incident, vendor, or measurable claim appears in the body. Weak when the post is all principle and no specifics.
- **CTA is clean.** The link to the canonical article URL appears once, on its own line or paragraph, with descriptive link text. Weak when the CTA is buried, ambiguous, or repeated.
- **Length and shape fit the platform.** LinkedIn: roughly 700 to 1300 characters, 3 to 4 paragraphs. Reddit: 3 to 5 paragraphs ending with a question. Weak when the post is too short to read as more than a tweet, or overruns the platform's expected shape.
- **Reddit discussion question (when applicable).** A Reddit post ends with a genuine question that invites discussion, and the title matches the subreddit's tone. Weak when the question is rhetorical, the post is announcement-shaped, or the title reads as cross-subreddit boilerplate.

Voice, em-dash, avoided-word, ambiguous-link, and reader-respect checks are NOT in this rubric: the voice gate and content-risk gate own those. In particular, whether the post frames the reader's team as behind the curve (reader-respect) is the content-risk gate's axis per ADR 015, and whether the post over-claims a fix the article only diagnoses is also content-risk's job. Do not duplicate them here.

## Output

The critic returns the standard STRENGTHS + WEAKNESSES (+ optional RELEVANT CONTEXT) block defined by `.claude/agents/wr-blog-social-critic.md`, with a computed VERDICT (PASS / WEAKNESSES_FOUND / PASS_WITH_AUTHOR_OVERRIDES / REJECTED per ADR 025). Each weakness quotes a passage and gives a concrete fix direction.

## Round cap

Up to 2 rounds per long-form post (ADR 033 / ADR 035). After 2 rounds, the orchestrator either accepts the current state and saves, or asks the user to weigh in on the residual weaknesses.
