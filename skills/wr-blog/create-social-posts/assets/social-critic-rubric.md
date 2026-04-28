# Social-post critic rubric

Applies to long-form social posts (LinkedIn, Reddit). The critic scores the draft against these checks and returns the structured block defined by `.claude/agents/wr-sw-critic.md`.

Short-form posts (Twitter, Bluesky, Hacker News, Lobsters) are not scored against this rubric; their surface area is too small for analytical critique. dev.to reuses the article's already-cleared SW-critic verdict because the body is the article verbatim.

## Audience

Engineering leaders, software developers, and technical founders. The same audience as the article. The post is a different artefact from the article, so the critic does not compare line-for-line; the post must work standalone for someone scrolling who has not yet clicked through.

## Voice and tone reference

`docs/VOICE-AND-TONE.md`. The critic does not score voice (the voice gate covered that); but if a banned pattern, em-dash, or avoided word slipped through, the critic flags it under check_5.

## Checks

### check_1: Hook earns the click

The first sentence (LinkedIn opener, Reddit title plus first sentence, dev.to opener) makes a concrete promise. UNMET if the opener leads with abstraction, vendor-name dropping, or a generic "everyone is talking about X" framing. UNMET if the opener over-promises and the body cannot deliver.

### check_2: Structural argument lands without the article

The post can be read on its own. A scroller who never clicks through still gets the principle. UNMET if the post is teaser-only ("read the article to find out") with no substance. UNMET if the structural claim depends on a paragraph that exists only in the article.

### check_3: Concrete examples present

At least one named incident, vendor, or measurable claim appears in the body. The post is not pure abstraction. UNMET if the body is all principles with no specifics.

### check_4: CTA is clean

The link to the canonical article URL appears once, on its own line or paragraph, and the link text is descriptive (not "here", "read more", "click here"). UNMET if the CTA is buried, ambiguous, or repeated.

### check_5: Voice and banned-pattern check

No em-dashes (U+2014). No avoided words. No ambiguous link text. No visible "(opens in new tab)" text. Voice is "we" not "I". UNMET if any banned pattern slipped through; PARTIAL if the post is borderline (e.g. a stylistic choice that could be read as borrowed jargon).

### check_6: Length and shape match the platform

The post fits the platform's expected length and shape:

- LinkedIn: 700 to 1300 characters of body, 3 to 4 paragraphs.
- Reddit: 3 to 5 paragraphs, ends with a question.
- dev.to: full article body with pull-quotes converted to blockquotes, `published: false` set.

UNMET if the post is too short for the platform (LinkedIn under 500 chars reads as a tweet) or too long (Twitter / Bluesky over the character limit, Reddit under 3 paragraphs).

### check_7: Reddit-specific (when applicable)

The post ends with a question that invites discussion. The title matches the subreddit's tone (read recent posts to calibrate). UNMET if the question is rhetorical, the post is announcement-shaped, or the title reads as cross-subreddit boilerplate.

### check_8: Reader-respect check

The post does not frame the reader's team or industry as behind the curve. No "you are doing this wrong" tone. UNMET if any sentence positions the reader as the problem.

### check_9: No bait-and-switch

The post does not over-state, over-claim, or imply windyroad has solved a problem the article only diagnoses. UNMET if the post promises a fix the article does not actually deliver.

## Output contract

The critic returns the standard `wr-sw-critic` block:

```
STRENGTHS:
- ...

WEAKNESSES:
- check_N (UNMET / PARTIAL): <reason, with passage reference>

VERDICT: PASS / FAIL
```

PASS if all 9 (or 8 for posts where check_7 does not apply, e.g. LinkedIn) checks are MET or the unmet ones are PARTIAL with low-impact reasons. FAIL otherwise.

## Round cap

Up to 2 rounds per long-form post. After 2 rounds, the orchestrator either accepts the current state and saves, or asks the user to weigh in on the residual weaknesses.
