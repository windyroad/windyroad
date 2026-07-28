# Outcome-blind analysis-integrity audit

- Date: 2026-07-19.
- Reviewer: AI-assisted methods subagent, orchestrated by the sole author.
- State reviewed: uncommitted successor worktree based on `70963a2249c7164e3afa52a7aa4dc00c1a2cc25a`.
- Scope: registered estimands, active-sample guards, missingness sensitivity, precision metadata, and result-ledger provenance.
- External activity: none. No provider, model, subscription, OSF, or account call occurred.

## Verdict

Do not approve the inspected worktree as a registration candidate. Five major and two moderate findings required correction and exact-commit review.

## Findings

1. Complete-pair point estimates and percentile intervals weighted retained templates, while the Welch interval weighted fixed families equally. Uneven exclusions could therefore report conflicting estimands.
2. The product-specific complete-pair analysis covered H1 through H3 only. It did not evaluate both contexts and trials required for H4.
3. A caller could substitute another balanced nested sample in a report labelled registered. The frozen scenario identities and strata were not all enforced.
4. Extra non-nested repeated rows could enter descriptive output. The registered guard did not require the exact 1,408 sequence-system rows and 2,816 boundaries.
5. Precision metadata still labelled the superseded percentile bootstrap as the registered support interval.
6. The recorded malicious H4 nested sample was 256 sequence-system trials. The correct two-context count is 512.
7. The analysis CLI accepted any 64-hex binding fingerprint. It neither recomputed the fingerprint nor verified the separately supplied ground-truth ledger bytes.

## Required closure

Before registration, the successor must use one equal-fixed-family estimand throughout, implement H4 complete-pair behavior, reject sample or row substitution, correct precision metadata and counts, and verify the exact binding and raw ground-truth digest. All three review roles must then inspect the same clean successor commit.
