---
platform: linkedin
article: /blog/an-ai-agent-deleted-production-the-model-wasnt-the-problem
image: cover.png
image_alt: Two-column comparison. Left column titled Sign with three boxes labelled Agent has production credentials, A single API call destroys production, and System prompt says don't, ending in a red badge labelled production deleted. Right column titled Control with three boxes labelled Production credentials in CI/CD secrets only, Production changes flow through the pipeline, and Pipeline gate scores commit push and release, ending in a green badge labelled denied at the boundary.
---

An AI coding agent deleted PocketOS's production database in 9 seconds. Most of the discourse is about AI safety. The lesson sits upstream of any model: the agent had production credentials in its environment.

The same access pattern produces the same outcome regardless of who pulls the trigger. Pixar 1998 (an animator and a recursive delete). GitLab 2017 (an engineer who thought he was on the standby). Replit July 2025 (an agent that ignored a code freeze and fabricated 4,000 fake records). Cursor December 2025 (an agent that ignored "DO NOT RUN ANYTHING"). Different operators, different decades. Same shape.

The fix is structural. Agents have no production access. Production credentials live in CI/CD secrets only. The pipeline (commit, push, release) is the boundary where risk-scoring belongs. Apollo Research's work on in-context scheming explains why a separate subagent doing the scoring (not the agent driving the commit) is structurally important: the agent that wants the commit to land has incentive to under-score risk; the scorer has incentive to score accurately.

Full write-up has the four-layer model, the bash for the gate, and a Monday test you can run on your own credentials.

https://windyroad.com.au/blog/an-ai-agent-deleted-production-the-model-wasnt-the-problem
