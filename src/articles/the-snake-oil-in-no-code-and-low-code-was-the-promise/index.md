---
date: '2026-07-15'
title: 'The snake oil in no-code and low-code was the promise'
author: 'Tom Howard'
tags: ['no-code', 'low-code', 'AI coding', 'software delivery', 'market analysis']
draft: true
---

*AI has made code cheaper to produce. It has also made the limits of the low-code pitch easier to see.*

No-code and low-code tools work. They can speed up forms, workflows, internal apps and routine automation.

The problem was the larger promise around them: that writing code was the main constraint on software delivery.

Remove the code, the story went, and the backlog would clear.

Vendors made that promise openly. [Microsoft presents Power Apps](https://www.microsoft.com/en-us/power-platform/products/power-apps/topics/low-code-no-code/low-code-platform) as a way for people without coding experience to build apps and offload work from IT. [Appian says its low-code platform](https://appian.com/products/platform/low-code) and [OutSystems says its platform](https://www.outsystems.com/low-code-platform/accelerated-development) can make app development up to ten times faster.

Those claims may be true for building parts of an application. They do not describe the whole delivery system.

## AI gave us a better test

If writing code were the main constraint, making code much cheaper should improve delivery at a similar rate. The gains have not passed through that cleanly.

[GitHub ran a controlled experiment with 95 professional developers](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-on-developer-productivity-and-happiness/). The group using Copilot completed one JavaScript server task 55% faster than the group without it. The task completion rate also rose from 70% to 78%.

That is strong evidence that AI can speed up a coding task. It is not evidence that an organisation can deliver useful software 55% faster.

[DORA, Google's DevOps Research and Assessment program, found the same gap in its 2024 research](https://cloud.google.com/blog/products/devops-sre/announcing-the-2024-dora-report). A 25% rise in AI adoption was linked to 7.5% better documentation, 3.4% better code quality and 3.1% faster reviews.

It was also linked to 1.5% lower delivery throughput, meaning less software shipped, and 7.2% lower delivery stability, meaning changes caused more failures.

The studies use different methods and measures: GitHub tested one controlled task, while DORA reported associations across organisations. Their percentages are not directly comparable.

![Chart summarising the GitHub Copilot task result and DORA 2024 delivery findings described above.](/img/social/ai-coding-vs-delivery.svg)

[DORA's 2025 research](https://dora.dev/research/2025/dora-report/) reached the same broader conclusion: AI amplifies the system already in place.

In plain English, AI strengthens whatever delivery practices an organisation already has, good or bad.

The apparent contradiction is the point. Faster coding helps, but whether it becomes faster delivery still depends on choosing the right problem, fitting the change into existing systems and running it safely.

A feature nobody needs is not valuable software. Neither is one that cannot survive contact with production.

## Investors are no longer paying as much for the label

To test whether low-code specialists shared in the wider AI boom, I tracked seven listed specialists and adjacent self-service platforms: Appian, Pegasystems, UiPath, monday.com, Wix, Asana and Domo.

I also tracked [Smartsheet, which was taken private in 2025](https://www.smartsheet.com/content-center/news/blackstone-and-vista-equity-partners-complete-acquisition-smartsheet), and [Alteryx, which was taken private in 2024](https://www.alteryx.com/about-us/newsroom/press-release/clearlake-capital-group-and-insight-partners-complete-acquisition-of-alteryx).

For market value, I compared 31 December 2022 with the latest completed US close, 14 July 2026, using data collected on 15 July. The current price-to-sales figures are reported for July 2026.

- **The seven public companies:** Combined market value fell from $25.4 billion to between $20.8 billion and $21.7 billion, a decline of about 15% to 18%.
- **The nine-company view:** Counting Smartsheet and Alteryx at their last listed values, combined market value fell from $34.1 billion to between $32.2 billion and $33.1 billion, a decline of about 3% to 6%.
- **Value for each $1 of annual sales:** Using the median across the seven public companies, the figure fell from $5.05 to $2.54, a decline of about 50%.
- **For comparison, the [iShares software fund (IGV)](https://companiesmarketcap.com/ishares-expanded-tech-software-sector-etf/stock-price-history/):** Its share price rose about 88% over the same period.
- **For comparison, the broader [Invesco Nasdaq-100 fund (QQQ)](https://companiesmarketcap.com/invesco-qqq-trust/stock-price-history/):** Its share price rose about 182% over the same period.

![Chart visualising the market-performance figures listed above.](/img/social/low-code-market-performance.svg)

This comparison does not prove that AI caused the gap. Interest rates, growth, profits and company execution all matter.

But the contrast is still useful. The specialist group did not share in the wider software and AI boom. At the end of 2022, investors were paying a median of $5.05 in market value for each $1 of annual sales. In July 2026, they were paying $2.54, about half as much.

![Bar chart visualising the median market-value-per-sales decline listed above.](/img/social/low-code-sales-valuation.svg)

## The market is growing, but the category is changing

This is not a death notice for low-code.

[Gartner forecasts that the low-code development technology market will reach $58.2 billion by 2029](https://www.gartner.com/en/documents/7146430), growing at 14.1% a year. Agentic AI, systems that can plan and carry out multi-step tasks, is one of the forces driving that growth.

[Gartner also said in May 2026 that low-code vendors face growing pressure from AI coding agents](https://www.gartner.com/en/documents/7799853). Both findings can be true.

Businesses can buy more low-code capability while becoming less willing to pay extra for a company built around the label.

My reading is that low-code is being absorbed into larger platforms, coding agents, workflow products and AI agent builders. When a prompt can create an app or workflow, low-code is no longer a distinct advantage. It is becoming an interface to software development.

## The bottleneck was never just code

The honest version of the low-code story is less dramatic:

- Low-code can make parts of implementation faster.
- AI can make more of implementation faster.
- Neither tells you what should exist or makes it fit safely into a real organisation.

The tools were not the snake oil.

The snake oil was the promise that removing code would remove the hard parts of software delivery.

Code was a bottleneck. It was never the whole system.

AI has made code easier to produce. It has made the rest of software delivery harder to ignore.

## Method and sources

I treated this group as an illustrative comparison, not an investable market index. The comparison excludes diversified platform companies such as Microsoft, Salesforce and ServiceNow because low-code represents only one part of their businesses.

Market values are in US dollars. The starting point is each company's value at the end of 2022. The ending point uses the latest completed US close on 14 July 2026, from data collected on 15 July.

Current share counts differ between exchange-reported data and CompaniesMarketCap, so the ending market values are reported as a range using both sources. Smartsheet and Alteryx are counted at their final listed market values. Benchmark changes compound the annual share-price performance shown in the linked histories.

The price-to-sales comparison uses each source's end-2022 table and July 2026 trailing-12-month value. The median is the middle value among the seven companies in each period.

**Market-value history:** [Appian market value](https://companiesmarketcap.com/appian/marketcap/), [Pegasystems market value](https://companiesmarketcap.com/pegasystems/marketcap/), [UiPath market value](https://companiesmarketcap.com/uipath/marketcap/), [monday.com market value](https://companiesmarketcap.com/monday-dot-com/marketcap/), [Wix market value](https://companiesmarketcap.com/wix/marketcap/), [Asana market value](https://companiesmarketcap.com/asana/marketcap/), [Domo market value](https://companiesmarketcap.com/domo/marketcap/), [Smartsheet market value](https://companiesmarketcap.com/smartsheet/marketcap/) and [Alteryx market value](https://companiesmarketcap.com/alteryx/marketcap/).

**Value relative to annual sales:** [Appian price-to-sales history](https://companiesmarketcap.com/appian/ps-ratio/), [Pegasystems price-to-sales history](https://companiesmarketcap.com/pegasystems/ps-ratio/), [UiPath price-to-sales history](https://companiesmarketcap.com/uipath/ps-ratio/), [monday.com price-to-sales history](https://companiesmarketcap.com/monday-dot-com/ps-ratio/), [Wix price-to-sales history](https://companiesmarketcap.com/wix/ps-ratio/), [Asana price-to-sales history](https://companiesmarketcap.com/asana/ps-ratio/) and [Domo price-to-sales history](https://companiesmarketcap.com/domo/ps-ratio/).
