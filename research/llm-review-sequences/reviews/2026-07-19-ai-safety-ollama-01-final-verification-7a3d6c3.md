# Final Ollama Schema Verification

- **Exact commit:** `7a3d6c39552cb128914eeb6edb7c61426e0942ad`
- **Parent:** `657ef18eb36661b4ab4a71b3f422760d07358440`
- **New blocker:** None.

Checks passed:

- Status is consistently fail-closed and pending this verification; no access, activation, purchase, or outcome call is authorized.
- Archive wording now accurately distinguishes verbatim substantive report bodies from excluded platform metadata.
- Baseline provenance is restored: historical lock hash `d18c…2553` matches the 2026-07-17 baseline, while current lock hash `40c4…c4f6` is separately dated and matches the exact commit bytes.
- Current-design, operational-control, and legacy field lists are separate, contain no missing or duplicate entries, and the README mirrors the schema.
- The complete `exploratory_ollama_cloud_replication` object is unchanged from the parent commit, confirming no permission, spending, identity, reasoning-trace, retention, or release gate was weakened.
- JSON parsing and `git diff --check` passed; no runtime code changed.

After this report is archived, a follow-up may advance the conservative “pending verification” status. All previously documented activation limitations remain mandatory.

## Final verdict

**APPROVE WITH DOCUMENTED LIMITATIONS**
