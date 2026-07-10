// Shared source of truth for user-facing homepage copy that appears in
// more than one place (React page, OG share image). Keeping this in one
// module prevents the drift between hero headline and OG image that was
// captured as problem P006.

export const HERO_HEADLINE_LINE1 = "The AI frontier moves every week.";
export const HERO_HEADLINE_LINE2 = "Keeping up shouldn\u2019t be your job.";
export const HERO_HEADLINE = `${HERO_HEADLINE_LINE1} ${HERO_HEADLINE_LINE2}`;

export const HERO_SUBTITLE_LINE1 = "The Shift is our weekly read on what changed";
export const HERO_SUBTITLE_LINE2 = "at the AI frontier, and what it means for you.";
