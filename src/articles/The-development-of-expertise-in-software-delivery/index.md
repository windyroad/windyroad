---
date: '2019-04-02'
title: 'The Development of Expertise in Software Delivery'
author: 'Tom Howard'
tags: ['agile', 'nimble', 'lean', 'devops', 'software', 'software delivery']
image: 'second-way1-400x211.png'
---

Fast and accurate feedback has become an critical factor for fast and efficient software delivery, but it's benefits got far beyond those typically described by the Agile, Lean and DevOps communities.

Since inception Agile development has encouraged feedback[^1] and sought to create feedback loops, such as from regular retrospectives, test driven development, and from user feedback from working software. This feedback is critical to keeping the team focused on delivering the intended outcomes and high quality results[^2].

Within DevOps, feedback features even more prominently and is regarded as one of it's three underpinning principles[^3].

> The Second Way is about creating the right to left feedback loops. The goal of almost any process improvement initiative is to shorten and amplify feedback loops so necessary corrections can be continually made.
>
> The outcomes of the Second Way include understanding and responding to all customers, internal and external, shortening and amplifying all feedback loops, and embedding knowledge where we need it.
>
> &mdash; <cite>Gene Kim, "The Three Ways: The Principles Underpinning DevOps", itrevolution.com, 2012, https://itrevolution.com/the-three-ways-principles-underpinning-devops/</cite>

It's clear from experience that feedback helps us, by helping stay on track and by helping us fix problems early, when they are easier and less expensive to fix. However there are significantly greater benefits to be had.

Nobel laureate Daniel Kahneman's work on the psychology of judgment and decision-making tells us that immediate and accurate feedback is a key ingredient for for the development of expert intuition.

Specifically, in order to develop expertise in an area, you need:

> - A Regular World
>
> - Many Opportunities to Learn
>
> - Immediate Feedback
>
>   &mdash; <cite>Daniel Kahneman, "Thinking, Fast and Slow", 2012, Farrar, Straus and Giroux, ISBN 978-0374275631</cite>

<iframe width="560" height="315" src="https://www.youtube.com/embed/ksopQLMQsq8" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Many aspects of software delivery are what Kahneman would consider regular worlds (i.e. they are predictable domains) and the implications on software delivery of Kahneman's work is profound.

Basically, if your delivery process prevents or delays feedback, or opportunities to learn, then your delivery process prevents expertise from forming.

Recognition of this allows us to compare and contrast Waterfall and Agile approaches in completely new light.

| Behaviors and Practices that _Encourage_ the Development of Expertise | Behaviors and Practices _Inhibit_ the Development of Expertise | Reasons the Behaviors and Practices Inhibit the Development of Expertise                                                                                                          |
| --------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Automated Testing                                                     | Manual Testing                                                 | - Takes longer, so the test result feedback is delayed.<br/>- Is done less frequently, reducing the opportunities to learn.                                                       |
| Frequent Releases                                                     | Infrequent Releases                                            | Reduces the opportunities to learn                                                                                                                                                |
| Single Development and Operations Team                                | Separate Development and Operations Teams                      | Greatly reduces and delays the feedback from Operations to Development                                                                                                            |
| Frequent Retrospectives                                               | Single Post Implementation Review (PIR) at End of Project      | - Greatly reduces opportunities to learn<br/> - Large delay between most decisions the feedback from the PIR<br/> - Makes it unclear if feedback is related to specific decisions |
| Small Frequent Merge Requests                                         | Large Infrequent Merge Requests                                | - Reduces opportunities to learn<br/>- Large delay between code written at beginning and feedback on that code                                                                    |
| Trunk-based Development                                               | Long Lived Branches                                            | - Large delay between code being written and feedback on how that code works with other changes                                                                                   |
| Proactive Monitoring and Notifications                                | Customers are First to Know Something is Wrong                 | - Delay between outage and outage detection<br/>- No feedback for unreported issues                                                                                               |
| Visual Task Management                                                | Non-visual Task Management                                     | - Delay between bottlenecks forming and detection of those bottlenecks                                                                                                            |
| Architects Associated for the Entire Duration                         | Allocation of Architects tapers off towards the end            | - Reduces or removes feedback to Architects on how their designs behave in production                                                                                             |
| Measuring the Effectiveness of Each Change (Including A/B Testing)    | Not Measuring the Effectiveness of Each Change                 | - No feedback.<br/>- No opportunity to learn                                                                                                                                      |
| Minimizing Release Batches                                            | Large Batch Releases                                           | - Reduces opportunities to learn.<br/>- Delays feedback for most of the changes in the batch.<br/> - Makes it unclear if feedback is related to specific changes                  |
| Early and Regular Performance Testing                                 | Infrequent, Late in Cycle Performance Testing                  | - Reduces opportunities to learn.<br/>- Reduces feedback (The cause of some performance issues will not make it back to the developer or architect that the created them)         |
| Fixing Defective Stories Before Marking Them off as Done              | Defect Backlogs                                                | - Reduces feedback (The cause of some defects will not make it back to the developer or architect that the created them)                                                          |

This is not, and cannot be, an exhaustive list, as the way we deliver software changes over time. However the principle will persist: Avoid behaviors and practices that delay, inhibit or reduce feedback as they will inhibit the development of expertise. Encourage behaviors and practices that accelerate, encourage, and increase feedback as they will encourage the development of expertise.

[^1]: Kent Beck, et al., "Twelve Principles of Agile Software", AgileManifesto.org, 2001, http://agilemanifesto.org/principles.html.
[^2]: Danielle Goodman, "Agile Process: Why You Need Feedback Loops Both During and After Sprints", https://www.mendix.com, 2018, https://www.mendix.com/blog/agile-process-why-you-need-feedback-loops-both-during-and-after-sprints/
[^3]: Gene Kim, "The Three Ways: The Principles Underpinning DevOps", itrevolution.com, 2012, https://itrevolution.com/the-three-ways-principles-underpinning-devops/
[^+]: Kahneman calls this "A Regular World"
