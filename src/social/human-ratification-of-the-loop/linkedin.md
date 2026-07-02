---
platform: linkedin
---

I don't write the code any more. I don't write the tests or the docs either. An LLM does all of that.

I still own the quality. I just own it in a different place.

The common model is human in the loop: the agent stops, a person reads the output, the agent continues. It works, but it's slow, and it leaves the human playing whack-a-mole with bugs a test should have caught.

It's the red flag law of AI engineering. Britain once made a man walk ahead of every self-propelled vehicle, waving a red flag to hold it to walking pace. Human in the loop is that man.

I run a different model. Human on the loop (HOTL).

I don't review the code. I review and approve the guardrails the code has to pass:

- Architecture decisions (ADRs): what we build and why, so the agent can't quietly re-decide it mid-task
- Specs: jobs to be done, personas, user story maps, and stories, so every change traces back to a real user need
- Risk policy and a standing risk register: what we tolerate and what we treat, scored on every commit and push

The flag man became unnecessary once the car had reliable brakes, licensed drivers, and road rules. My guardrails are those controls. They let the agent run without a human walking in front of it.

The LLM drafts each guardrail. I either approve it or tell it what it got wrong, it revises, and we go again until it's right. Nothing gets waved through. Once a guardrail is set, the loop runs at full speed.

A commit stops dead the moment an AWS key lands in a diff. An edit stays blocked until it's been checked against the architecture we agreed on. A tired reviewer at 5pm on a Friday waves both through. A gate never does.

The gates are open source, still a work in progress, so expect rough edges: https://github.com/windyroad/agent-plugins
