# C4 Architecture Model

All four C4 levels are generated from source code and project configuration.

## C1: System Context (Generated)

Shows the system, its users, and external dependencies detected from package.json and project configuration.

<!-- c1:generated:start -->

![C1 System Context Diagram](generated/c1-context.png)

<details>
<summary>Mermaid source</summary>

```mermaid
C4Context
    title System Context Diagram

    Person(user, "User", "End user of the system")
    System(system, "windy-road", "Windy Road - windyroad.com.au")

    System_Ext(netlify, "Netlify", "Hosting & CDN")
    System_Ext(github_actions, "GitHub Actions", "CI/CD pipeline")
    System_Ext(claude_code, "Claude Code", "AI coding assistant")

    Rel(user, system, "Uses")
    Rel(system, netlify, "Deployed to")
    Rel(system, github_actions, "Built by")
    Rel(claude_code, system, "Assists development of")
```

</details>

<!-- c1:generated:end -->

## C2: Container View (Generated)

Shows the major containers (applications, data stores, content) detected from the project structure.

<!-- c2:generated:start -->

![C2 Container Diagram](generated/c2-container.png)

<details>
<summary>Mermaid source</summary>

```mermaid
C4Container
    title Container Diagram

    Person(user, "User", "End user of the system")

    Container(webapp, "Web App", "React/Next.js", "User interface")
    Container(content, "Content", "Markdown/MDX", "Articles & pages")
    Container(static_output, "Static Output", "HTML/CSS/JS", "Built files")

    System_Ext(netlify, "Netlify", "Hosting & CDN")
    System_Ext(github_actions, "GitHub Actions", "CI/CD pipeline")
    System_Ext(claude_code, "Claude Code", "AI coding assistant")

    Rel(user, webapp, "Visits")
    Rel(webapp, content, "Reads")
    Rel(webapp, static_output, "Builds into")
    Rel(static_output, netlify, "Deployed to")
    Rel(webapp, github_actions, "Built by")
    Rel(claude_code, webapp, "Assists development of")
```

</details>

<!-- c2:generated:end -->

## C3: Component View (Generated)

<!-- c3:generated:start -->

![C3 Component Diagram](generated/c3-components.png)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart LR
  app["app-entry"]
  components-next["components-next"]
  lib["lib"]
  content["Content"]:::c2
  static_output["Static Output"]:::c2
  app --> components-next
  app --> lib
  app -.-> content
  app -.-> static_output
  classDef c2 fill:#f0f0f0,stroke:#999,stroke-dasharray:5 5
```

</details>

<!-- c3:generated:end -->

## C4: Code View (Generated)

File-level dependency diagrams per component. Dashed arrows indicate cross-component imports. Grey nodes are external files.

<!-- c4:generated:start -->

### app-entry

![C4 app-entry Code View](generated/c4-app-entry.png)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart LR
  app__not_found_page_tsx["_not-found/page"]
  app_ai_teams_page_tsx["ai-teams/page"]
  app_blog__slug__page_tsx["[slug]/page"]
  app_blog_page_tsx["blog/page"]
  app_blog_tag__tag__page_tsx["[tag]/page"]
  app_layout_tsx["app/layout"]
  app_not_found_tsx["not-found"]
  app_page_tsx["app/page"]
  app_vibe_code_audit_page_tsx["vibe-code-audit/page"]
  app_layout_tsx -. "wraps" .-> app__not_found_page_tsx
  app_layout_tsx -. "wraps" .-> app_ai_teams_page_tsx
  app_layout_tsx -. "wraps" .-> app_blog__slug__page_tsx
  app_layout_tsx -. "wraps" .-> app_blog_page_tsx
  app_layout_tsx -. "wraps" .-> app_blog_tag__tag__page_tsx
  app_layout_tsx -. "wraps" .-> app_page_tsx
  app_layout_tsx -. "wraps" .-> app_vibe_code_audit_page_tsx
  components_next_Button_index_tsx["components-next/Button/index"]:::ext
  app_ai_teams_page_tsx -.-> components_next_Button_index_tsx
  lib_markdown_ts["lib/markdown"]:::ext
  app_blog__slug__page_tsx -.-> lib_markdown_ts
  app_blog__slug__page_tsx -.-> components_next_Button_index_tsx
  app_blog_page_tsx -.-> lib_markdown_ts
  app_blog_tag__tag__page_tsx -.-> lib_markdown_ts
  components_next_Header_index_tsx["components-next/Header/index"]:::ext
  app_layout_tsx -.-> components_next_Header_index_tsx
  components_next_Footer_index_tsx["components-next/Footer/index"]:::ext
  app_layout_tsx -.-> components_next_Footer_index_tsx
  components_next_Clarity_index_tsx["components-next/Clarity/index"]:::ext
  app_layout_tsx -.-> components_next_Clarity_index_tsx
  _components_next_cluster_["components-next (9 files)"]:::ext
  app_page_tsx -.-> _components_next_cluster_
  app_vibe_code_audit_page_tsx -.-> components_next_Button_index_tsx
  components_next_NotifyForm_index_tsx["components-next/NotifyForm/index"]:::ext
  app_vibe_code_audit_page_tsx -.-> components_next_NotifyForm_index_tsx
  _styles_["styles"]:::ext
  app_ai_teams_page_tsx -.-> _styles_
  app_blog__slug__page_tsx -.-> _styles_
  app_blog_page_tsx -.-> _styles_
  app_blog_tag__tag__page_tsx -.-> _styles_
  app_not_found_tsx -.-> _styles_
  app_vibe_code_audit_page_tsx -.-> _styles_
  classDef ext fill:#f0f0f0,stroke:#999,stroke-dasharray:5 5
```

</details>

### components-next

![C4 components-next Code View](generated/c4-components-next.png)

<details>
<summary>Mermaid source</summary>

```mermaid
flowchart LR
  components_next_ApproachSection_index_tsx["ApproachSection/index"]
  components_next_Button_index_tsx["Button/index"]
  components_next_CTASection_index_tsx["CTASection/index"]
  components_next_Clarity_index_tsx["Clarity/index"]
  components_next_CountUp_RangeCountUp_tsx["RangeCountUp"]
  components_next_CountUp_index_tsx["CountUp/index"]
  components_next_FAQSection_index_tsx["FAQSection/index"]
  components_next_FitCheckSection_index_tsx["FitCheckSection/index"]
  components_next_Footer_index_tsx["Footer/index"]
  components_next_Header_index_tsx["Header/index"]
  components_next_Hero_index_tsx["Hero/index"]
  components_next_NotifyForm_index_tsx["NotifyForm/index"]
  components_next_ObjectionBlock_index_tsx["ObjectionBlock/index"]
  components_next_OperatorSection_index_tsx["OperatorSection/index"]
  components_next_PricingSection_index_tsx["PricingSection/index"]
  components_next_Section_index_tsx["Section/index"]
  components_next_TestimonialsSection_index_tsx["TestimonialsSection/index"]
  components_next_ApproachSection_index_tsx --> components_next_Section_index_tsx
  components_next_CTASection_index_tsx --> components_next_Button_index_tsx
  components_next_FAQSection_index_tsx --> components_next_Section_index_tsx
  components_next_FitCheckSection_index_tsx --> components_next_Section_index_tsx
  components_next_Hero_index_tsx --> components_next_Button_index_tsx
  components_next_ObjectionBlock_index_tsx --> components_next_Section_index_tsx
  components_next_OperatorSection_index_tsx --> components_next_Section_index_tsx
  components_next_OperatorSection_index_tsx --> components_next_CountUp_index_tsx
  components_next_OperatorSection_index_tsx --> components_next_CountUp_RangeCountUp_tsx
  components_next_PricingSection_index_tsx --> components_next_Section_index_tsx
  components_next_TestimonialsSection_index_tsx --> components_next_Section_index_tsx
  _styles_["styles"]:::ext
  components_next_ApproachSection_index_tsx -.-> _styles_
  components_next_Button_index_tsx -.-> _styles_
  components_next_CTASection_index_tsx -.-> _styles_
  components_next_FAQSection_index_tsx -.-> _styles_
  components_next_FitCheckSection_index_tsx -.-> _styles_
  components_next_Footer_index_tsx -.-> _styles_
  components_next_Header_index_tsx -.-> _styles_
  components_next_Hero_index_tsx -.-> _styles_
  components_next_NotifyForm_index_tsx -.-> _styles_
  components_next_ObjectionBlock_index_tsx -.-> _styles_
  components_next_OperatorSection_index_tsx -.-> _styles_
  components_next_PricingSection_index_tsx -.-> _styles_
  components_next_Section_index_tsx -.-> _styles_
  components_next_TestimonialsSection_index_tsx -.-> _styles_
  classDef ext fill:#f0f0f0,stroke:#999,stroke-dasharray:5 5
```

</details>

### lib

_Single file, see C3 view._

<!-- c4:generated:end -->

Regenerate: `/c4`
Check freshness: `/c4-check`
