import { describe, expect, it } from "vitest";

import { metrics, sequenceOutcomes } from "./analyse.mjs";

describe("sequence-level metrics", () => {
  it("counts detection once per sequence and only before activation", () => {
    const rows = [
      row("attack-split", "malicious", "split", 1, 2, "allow", false),
      row("attack-split", "malicious", "split", 2, 2, "block", true),
      row("benign-split", "benign", "split", 1, 2, "allow", false),
      row("benign-split", "benign", "split", 2, 2, "allow", false),
      row("attack-atomic", "malicious", "atomic", 1, 1, "allow", false),
    ];

    expect(metrics(sequenceOutcomes(rows))).toEqual({
      malicious_sequences: 2,
      benign_sequences: 1,
      recall: 0.5,
      false_positive_rate: 0,
      precision: 1,
      mean_submissions_to_detection: 2,
      localization_rate: 1,
    });
  });
});

function row(
  sequence_id,
  intent,
  decomposition,
  submission_index,
  activation_index,
  verdict,
  localized,
) {
  return {
    sequence_id,
    intent,
    decomposition,
    workflow: "pr",
    context: "local",
    model: "example-model",
    trial: 1,
    submission_index,
    activation_index,
    verdict,
    localized,
  };
}
