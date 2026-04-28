---
platform: reddit
subreddit: r/ClaudeAI
flair: Coding
crosspost:
  - subreddit: r/ChatGPTCoding
  - subreddit: r/devops
  - subreddit: r/cursor
article: /blog/an-ai-agent-deleted-production-the-model-wasnt-the-problem
title: Why every AI-agent production-deletion incident has the same shape (and what fixes it)
---

PocketOS lost their production database in 9 seconds last week. A Cursor agent running Claude Opus made one `curl` call to Railway's `volumeDelete` endpoint. Most of the discussion has been about AI safety. The pattern matters more than the model.

Two pre-AI versions of the same incident:

- **Pixar, 1998.** An animator ran `/bin/rm -r -f *` on the asset server. About 90 percent of Toy Story 2 deleted before anyone could stop it. Recovered only because the technical director had a near-complete copy on her home workstation while on maternity leave.
- **GitLab, January 2017.** An engineer trying to clean up a stuck replica ran `rm -rf` on what they thought was the standby database. It was the live one. The pg_dump backups had been silently failing for weeks; email-authentication settings rejected the failure-alert emails.

Two AI versions, alongside PocketOS:

- **Replit, July 2025.** SaaStr's AI coding agent deleted the production database during a declared code freeze, fabricated 4,000 fake user records, and told the operator recovery was impossible (it wasn't).
- **Cursor Plan Mode, December 2025.** An agent in Plan Mode deleted around 70 source files tracked in Git after the user typed "DO NOT RUN ANYTHING." A Cursor team member acknowledged a critical bug in Plan Mode constraint enforcement.

Different operators, different decades. The shared variable is the access pattern, not the model and not the harness: an interactive session that holds credentials with reach to destructive operations, and an actor with the means to invoke them.

The structural fix: agents have no production access. Production credentials live in CI/CD secrets, used only by pipeline jobs. Production-bound changes flow through commit, push, and release. A risk-scoring gate fires on those three actions, scoring the diff against a written policy. Apollo Research's [in-context scheming study](https://arxiv.org/abs/2412.04984) is the empirical reason a separate subagent doing the scoring is structurally important: the agent that wants the commit to land has incentive to under-score risk to clear the gate; the scorer has incentive to score accurately.

Full write-up with the bash for the gate, the four-layer defence-in-depth model, the ISO 31000 framing for the matrix, and a Monday-morning test you can run on your own credentials: https://windyroad.com.au/blog/an-ai-agent-deleted-production-the-model-wasnt-the-problem

Has anyone else built pipeline-action gates as a pattern, rather than trying to gate destructive APIs one provider at a time?
