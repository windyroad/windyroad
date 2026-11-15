---
date: '2026-11-03'
title: 'Batch Overhead Amplification'
subtitle: 'How smaller batches uncover performance bottlenecks'
author: 'Tom Howard'
tags: ['performance', 'lean', 'batch size', 'software delivery']
draft: false
---

To find out where a banking app spent its time rebuilding a balance, we deliberately made the rebuild slower. We split the same 469 events across 30 pages, making the server repeat work that was easy to miss when the history fitted on one page.

The banking app reconstructs the balance from the account’s event history. After a warm-up run, we timed a fresh rebuild on the server. That included fetching the events, looking up keys, decrypting payloads and replaying the events to produce the balance.

With a limit of 1,024 events per page, the rebuild took 1.055 seconds, or about 445 events per second. At 16 events per page it took 9.040 seconds, or about 52 events per second. Key lookups rose from one to 28, while applying the events still took about 10 milliseconds.

![Rebuild time rose from 1.055 to 9.040 seconds for the same 469 events when the page limit fell from 1,024 to 16.](/img/social/batch-overhead-amplification-results.svg)

We call this diagnostic **Batch Overhead Amplification**. It draws on Taiichi Ohno’s analogy of lowering the water to expose the rocks. In Ohno’s example, reducing inventory exposes problems on the production line. In this experiment, smaller pages expose the work the server repeats for each page. [Lean Enterprise Institute on Ohno’s analogy](https://www.lean.org/the-lean-post/articles/once-again-heres-why-jit-matters/).

The same diagnostic can be used with database reads, API requests, file imports or message processing: hold the workload fixed and shrink the batches to expose costs paid once per batch. The banking example uses pages of events as its batches.

## What the slowdown told us

The useful question was where the extra eight seconds came from. The event history and required balance calculation were unchanged. What did the smaller pages make the server do more often?

The diagnostic ran in the deployed server environment: one priming rebuild, then one fresh rebuild at each page size. These were individual instrumented readings.

| Measurement | Page size: 1,024 events | Page size: 16 events |
| --- | ---: | ---: |
| Reconstruction time | 1.055 seconds | 9.040 seconds |
| Events per second across the full rebuild | About 445 | About 52 |
| Account-page loading | 139 milliseconds | 1,511 milliseconds |
| Key-metadata lookups | 1 | 28 |
| Applying events to calculate account state | About 10 milliseconds | About 10 milliseconds |

Applying the events accounted for about 10 milliseconds at both settings. Even eliminating that work would barely affect the one-second rebuild. Decryption also stayed around 350 to 400 milliseconds. Neither measurement tracked the large increase in elapsed time, so neither was the first place to look for its cause.

Key retrieval did track the change: one lookup became 28. That made the work around fetching keys a concrete target for investigation. The smaller pages had made its repetition visible.

A separate local query investigation exposed another target. Mongo performed access-control work before applying the page limit. The first query examined 469 candidates to return 16 events. Subsequent pages repeated that work over shrinking portions of the history, producing 7,110 candidate visits across 30 pages. Small result pages were still triggering substantial database work.

Together, the timings and counts directed attention to key retrieval and the database query. They did not establish how much of the extra eight seconds each contributed: the timed operations overlap, and the query counts came from a separate local investigation. They gave us specific mechanisms to test.

## Make page overhead visible

For this example, the diagnostic rests on a simple model:

<p tabindex="0"><math display="block">
  <mtext>Total work</mtext><mo>≈</mo><mtext>event count</mtext><mo>×</mo>
  <mrow>
    <mo>(</mo><mtext>work per event</mtext><mo>+</mo>
    <mfrac><mtext>overhead per page</mtext><mtext>page size</mtext></mfrac><mo>)</mo>
  </mrow>
</math></p>

Hold the event count fixed and reduce the page size. The work required for each event remains, while overhead paid at every page boundary takes a larger share of the total. Opening a query, looking up a key or preparing a processor can become prominent enough to investigate.

This gives the experiment a prediction to check. If query setup is the suspected cost, count query starts. If key retrieval is the suspect, count lookups. A longer elapsed time alone cannot identify the cause; changing page size can also change caching, concurrency and memory behaviour.

Jason Yip gives this idea a useful expression in [*Agile as doctrine*, slide 32](https://www.slideshare.net/slideshow/frugagile-2021-agile-as-doctrine-and-thats-a-good-thing/250446669): batch size is the water level and transaction costs are the rocks. Goldratt describes small production batches exposing expensive setups in [*Standing on the shoulders of giants*](https://doi.org/10.1590/S0104-530X2009000300002). Batch Overhead Amplification names our application of that established idea to a performance investigation.

The diagnostic page size serves a different purpose from the operating page size. Reinertsen’s [*Iteration vs. Batch Size*](https://www.leanproductflow.com/iteration-vs-batch-size/) describes the trade-off between transaction costs and holding costs. Here, we temporarily accepted more transaction overhead to learn where it came from. Choosing the operating size came afterwards.

## A promising repair that failed the larger test

In a later experiment, eight-event pages exposed a new Mongo query and cursor being opened for every application page. That suggested a repair: keep one bounded cursor open and read successive results from it, avoiding repeated query setup.

There were two independently adjustable sizes. The **application page** was the group of events handed to the application. The **database transport batch** was the group fetched from Mongo. We could keep the application’s eight-event pages while fetching larger transport batches through one cursor.

![The existing reader opens a separate query for each application page. In the prototype, one query opens a cursor that fetches database batches and feeds multiple eight-event application pages.](/img/social/batch-overhead-amplification-mechanism.svg)

The first results supported further testing. Measured page-fetch time fell by about 80%, and a complete 745-event rebuild fell from 2.24 seconds to 1.39 seconds.

The larger histories reversed that decision. At 25,000 events, the prototype was about 13% slower. At 50,000 events, it timed out in all three measured trials. We kept the existing reader at that point.

The smaller pages had correctly exposed repeated query setup. Removing it was still insufficient to make this implementation a good replacement. The page-fetch measurement helped explain the small case; complete rebuilds at larger sizes determined whether to keep the change. The timeouts were part of that answer.

## The work that page size did not change

A later investigation used a synthetic workload of 50,000 events: two account histories of 25,000 events each, rebuilt into an account list. We compared application page sizes of 4 and 256, keeping the database transport batch size fixed.

This comparison also helped identify work that was insensitive to page size. Both settings produced 50,000 address parses and 200,001 metadata objects inspected and frozen. Those counts stayed the same despite the different numbers of page boundaries.

Equal counts alone did not explain whether the work was necessary. Reading the code supplied the missing link. Each event carried an address identifying its position in the stream. The input constructor had already created an immutable context containing that address. When the account-list projection published its metadata, it parsed the address and constructed another context around it.

Existing caches were working. This path was creating fresh objects, and every event paid the construction cost. Increasing the page size could not remove it.

### Reuse the context already constructed

We changed the handoff between input construction and metadata publication. After successfully constructing an immutable input, the constructor checked that its final context matched the form the publication parser would produce. It recorded that exact context object in a private `WeakSet`.

When publishing metadata, membership in that set allowed the projection to share the existing context. Unknown, copied or restored contexts still went through the parser and copying path. Each new metadata root still received its normal immutability checks.

The reason reuse was safe was specific: the application owned the context, it was immutable, and its representation matched the parser’s output. Tests checked that earlier outputs stayed unchanged after later events, and that restored checkpoints continued to produce the same state and progress.

### Check the complete rebuild at both sizes

We then ran 12 baseline/candidate pairs at each page size, alternating their order. Each timed rebuild processed the full 50,000-event workload. These were local server-side measurements using synthetic, unencrypted events, with the process primed before each fresh reconstruction; they excluded browser and HTTP time.

![Median local cold-rebuild time fell from 11.99 to 10.90 seconds at 4 events per page and from 9.09 to 8.23 seconds at 256 events per page.](/img/social/batch-overhead-amplification-follow-up.svg)

| Events per page | Before reuse (seconds) | After reuse (seconds) |
| ---: | ---: | ---: |
| 4 | 11.99 | 10.90 |
| 256 | 9.09 | 8.23 |

The table shows median elapsed times. The candidate was faster in 11 of 12 pairs at page size 4 and all 12 pairs at page size 256. All 48 rebuilds passed the complete-output and progress checks. We retained the change.

The two page sizes answered different parts of the investigation. Small pages exposed boundary costs. Comparing counters across page sizes also showed which costs persisted regardless of those boundaries. Source inspection identified avoidable construction within that second group, and the complete-rebuild comparison demonstrated a benefit at both the diagnostic size and the 256-event setting used at that stage.

## Tune the page size after reducing overhead

Context reuse was one of several reductions in transaction costs. We also simplified identity-hashing work, favouring simpler code when timings were comparable. Copies that protected data isolation stayed in place.

Only then did we tune the application page size. In the later local, synthetic 50,000-event server benchmark, 64-event pages took a median **4.92 seconds**, about **10,160 events per second**, compared with 5.07 seconds at 256. The difference was small enough to be uncertain. We selected 64 with a one-line configuration change.

That sequence matters. Increasing the page size earlier could have hidden repeated setup work. Once we had reduced the overhead, we could choose a page size for the implementation we intended to run.

### Browser pages introduce a responsiveness trade-off

REST pages were another boundary to tune. For these, we measured the full 50,000-event synthetic replay through browser projection and the dashboard. Completion time alone would miss the effect of longer main-thread pauses on responsiveness.

| REST page size (events) | Median rebuild time (seconds) | Median longest main-thread pause (milliseconds) |
| ---: | ---: | ---: |
| 256 | 6.42 | 51 |
| 512 | 6.28 | 87 |
| 1,024 | 6.24 | 158 |
| 2,048 | 6.07 | 276 |

Moving from 1,024 to 2,048 saved about 0.17 seconds, while the median longest pause rose from 158 to 276 milliseconds. The smaller sizes offered a useful alternative: 512 nearly matched the completion time at 1,024 with shorter pauses, and 256 shortened pauses further for about 0.18 seconds more than 1,024-event pages.

We kept REST pages at 1,024 in that iteration. The comparison made the trade-off explicit: the fastest complete rebuild could also interrupt the browser for longer. The operating choice depends on how much those interruptions matter to the experience.

We also observed substantially faster account loading in production after the optimisation work. The improvement was visible in everyday use.

## Use batch size to choose the next experiment

The method is useful when a workload is already batched and you need to decide where to investigate performance. The critical control is doing the same useful work in both runs.

1. **Fix the workload and change one batch size.** Keep the items, order and required outputs the same. Identify the layer you are changing; an application batch and a database transport batch can be different controls.
2. **Measure what changes and what stays stable.** Record complete-operation time alongside counts for suspected costs. Rising query or lookup counts point towards work repeated per batch. Stable counts direct attention elsewhere.
3. **Trace the measured work to an implementation decision.** Establish why a query is reopened, a key is retrieved or an object is reconstructed. The counter tells you where to look; the code tells you what could change.
4. **Test one repair against the complete operation.** Keep the small diagnostic batches, then repeat at the normal size and with larger workloads. Compare required outputs as well as timings. Keep regressions and timeouts in the result.
5. **Choose the operating size after reducing overhead.** Compare throughput and responsiveness at the layer you are tuning. Separate layers can need different batch sizes.

Use a controlled environment for the deliberately inefficient setting, since extra queries and lookups consume capacity. Reduce the batch size far enough to distinguish the costs you are investigating; reaching the smallest possible size is unnecessary.

Changing batch size helps identify what to optimise and whether a proposed repair is worth keeping. That is the purpose of Batch Overhead Amplification: make a cost easier to investigate, then let the complete workload decide whether the change helped.
