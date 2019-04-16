---
date: '2019-04-17'
title: 'The Development of Expertise in Software Delivery'
author: 'Tom Howard'
tags: ['agile', 'nimble', 'lean', 'devops', 'software', 'software delivery']
image: 'second-way1-400x211.png'
---

Fast and accurate feedback is critical for fast and efficient software delivery, but its benefits go far beyond those typically described by the agile, lean and DevOps communities.

Since its inception, agile development has encouraged feedback[^1] and sought to create feedback loops, such as from regular retrospectives, test-driven development, and from user feedback of working software. This feedback is critical to keeping the team focused on delivering the intended outcomes and high quality results[^2].

In DevOps, feedback is even more important and is regarded as one of its three underpinning principles[^3].

> The Second Way is about creating the right to left feedback loops. The goal of almost any process improvement initiative is to shorten and amplify feedback loops so necessary corrections can be continually made.
>
> The outcomes of the Second Way include understanding and responding to all customers, internal and external, shortening and amplifying all feedback loops, and embedding knowledge where we need it.
>
> &mdash; <cite>Gene Kim, "The Three Ways: The Principles Underpinning DevOps", itrevolution.com, 2012, https://itrevolution.com/the-three-ways-principles-underpinning-devops/</cite>

It's clear from experience that feedback helps us to stay on track and it helps us to fix problems early, when they are easier and less expensive to fix. However, there are further significant benefits.

Nobel laureate Daniel Kahneman's work on the psychology of judgment and decision-making tells us that immediate and accurate feedback is a key ingredient of expert intuition.

Specifically, to develop expertise in an area, you need:

> - A regular world
>
> - Many opportunities to learn
>
> - Immediate feedback
>
>   &mdash; <cite>Daniel Kahneman, "Thinking, Fast and Slow", 2012, Farrar, Straus and Giroux, ISBN 978-0374275631</cite>

<iframe width="304" height="171" src="https://www.youtube.com/embed/ksopQLMQsq8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Many aspects of software delivery are what Kahneman would consider regular worlds (i.e., they are predictable domains). Thus, the implications of Kahneman's work for software delivery are profound.

Basically, if your delivery process prevents or delays feedback, or opportunities to learn, then your delivery process is preventing expertise from developing.

A recognition of this allows us to compare and contrast the waterfall and agile approaches in a completely new way.

| Behaviours and practices that _encourage_ the development of expertise | Behaviours and practices that _inhibit_ the development of expertise | Reasons why the behaviours and practices inhibit the development of expertise                                                                                                                                   |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Automated testing                                                      | Manual testing                                                       | - Takes longer, so the feedback of test results is delayed. <br/>- Is done less frequently, reducing the number of opportunities to learn.                                                                      |
| Frequent releases                                                      | Infrequent releases                                                  | - Reduces the number of opportunities to learn.                                                                                                                                                                 |
| Single development and operations team                                 | Separate development and operations teams                            | - Greatly reduces and delays the feedback from operations to development.                                                                                                                                       |
| Frequent retrospectives                                                | Single post-implementation review on completion of project           | - Significantly reduces the number of opportunities to learn. <br/> - Large delay between most decisions and the feedback from the review. <br/> - Can be unclear if feedback is related to specific decisions. |
| Small and frequent merge requests                                      | Large and infrequent merge requests                                  | - Reduces number of opportunities to learn. <br/>- Large delay between writing of first code and feedback for that code.                                                                                        |
| Trunk-based development                                                | Long-lived branches                                                  | - Large delay between code being written and feedback on how that code works with other changes.                                                                                                                |
| Proactive monitoring and notifications                                 | Customers are first to know something is wrong                       | - Delay between an outage occurring and that outage being detected. <br/>- No feedback for unreported issues.                                                                                                   |
| Visual task management                                                 | Non-visual task management                                           | - Delay between bottlenecks forming and detecting those bottlenecks.                                                                                                                                            |
| Architects involved for the entire duration of a project               | Involvement of architects tapers off towards the end                 | - Reduces or removes feedback to architects on how their designs behave in production.                                                                                                                          |
| Measuring the effectiveness of each change (including A/B testing)     | Not measuring the effectiveness of each change                       | - No feedback. <br/>- No opportunities to learn.                                                                                                                                                                |
| Minimizing the size of release batches                                 | Large batch releases                                                 | - Reduces number of opportunities to learn. <br/>- Delays feedback for most of the changes in the batch. <br/> - Can be unclear if feedback is related to specific changes.                                     |
| Early and regular performance testing                                  | Infrequent, late in cycle performance testing                        | - Reduces number of opportunities to learn. <br/>- Reduces the amount of feedback (the cause of some performance issues will not make it back to the developer or architect who was responsible for them).      |
| Fixing defective stories before marking them off as done               | Defect backlogs                                                      | - Reduces the amount of feedback (the cause of some defects will not make it back to the developer or architect who was responsible for them).                                                                  |

This is not, and cannot be, an exhaustive list, as the way we deliver software changes over time. However, the following principles will always apply:

1. avoid behaviours and practices that delay, inhibit or reduce feedback, as these will stifle the development of expertise, and
2. encourage behaviours and practices that accelerate, encourage and increase feedback as these will stimulate the development of expertise.

[^1]: Kent Beck, et al., "Twelve Principles of Agile Software", AgileManifesto.org, 2001, http://agilemanifesto.org/principles.html.
[^2]: Danielle Goodman, "Agile Process: Why You Need Feedback Loops Both During and After Sprints", https://www.mendix.com, 2018, https://www.mendix.com/blog/agile-process-why-you-need-feedback-loops-both-during-and-after-sprints/
[^3]: Gene Kim, "The Three Ways: The Principles Underpinning DevOps", itrevolution.com, 2012, https://itrevolution.com/the-three-ways-principles-underpinning-devops/
[^+]: Kahneman calls this "A Regular World"
