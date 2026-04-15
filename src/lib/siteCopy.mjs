// Shared source of truth for user-facing homepage copy that appears in
// more than one place (React page, OG share image). Keeping this in one
// module prevents the drift between hero headline and OG image that was
// captured as problem P006.

export const HERO_HEADLINE_LINE1 = "You\u2019re taking too long to";
export const HERO_HEADLINE_LINE2 = "patch your software.";
export const HERO_HEADLINE = `${HERO_HEADLINE_LINE1} ${HERO_HEADLINE_LINE2}`;

export const HERO_SUBTITLE_LINE1 = "Get patch fit before AI-powered vulnerability";
export const HERO_SUBTITLE_LINE2 = "discovery makes your patch cycle matter.";
