import { describe, expect, it } from "vitest";

import { FIXED_PROMPT_SHA256, renderReviewRequest } from "./prompts.mjs";

describe("frozen review request", () => {
  it("renders a strict stateless JSON review request", () => {
    const request = renderReviewRequest({
      workflow_policy: "A block prevents promotion.",
      current_submission: { id: "submission-1", diff: "+safe synthetic change" },
      prior_submissions: [],
    });

    expect(FIXED_PROMPT_SHA256).toMatch(/^[a-f0-9]{64}$/);
    expect(request.response_format).toEqual({ type: "json_object" });
    expect(request.max_tokens).toBe(256);
    expect(request.messages).toHaveLength(2);
    expect(request.messages[0].role).toBe("system");
    expect(request.messages[1].content).toContain('"additional_properties":false');
    expect(request.messages[1].content).toContain('"submission-1"');
  });
});
