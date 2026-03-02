# Risk Register

## Scope

Static website (windyroad.com.au) built with Gatsby v2, hosted on Netlify behind Cloudflare DNS.

Delivery policy baseline:

- Trunk-based development on `master`.
- Quality gates: pre-commit linting, CI build + tests.
- CI target: GitHub Actions (to be set up; legacy CircleCI config exists but is not in use).

## Scales

- Likelihood (`L`): 1 Rare, 2 Unlikely, 3 Possible, 4 Likely, 5 Almost certain
- Impact (`I`): 1 Minor, 2 Moderate, 3 Major, 4 Severe, 5 Critical
- Score: `L x I`
- Level bands: Low (1–4), Medium (5–9), High (10–16), Extreme (17–25)

## Register

| Risk ID | Category | Risk event | Cause | Consequence | L | I | Score | Level |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| WR-R1 | Technology | Dependency staleness blocks maintenance or creates security exposure | Gatsby v2, Node 10, and WDIO v4 are all end-of-life with no active security patches | Unable to upgrade incrementally; forced into big-bang migration; potential CVEs in production dependencies | 5 | 4 | 20 | Extreme |
| WR-R2 | Security | Secret leakage exposes deployment credentials or API tokens | GITHUB_TOKEN and Netlify/Cloudflare tokens handled in CI environment; legacy deploy scripts reference SSH keys and CF_AUTH_KEY | Unauthorised access to hosting, GitHub repo, or Cloudflare DNS/CDN; site defacement or data exfiltration | 3 | 5 | 15 | High |
| WR-R3 | Delivery | CI pipeline absent or decayed, leaving no automated quality assurance | Legacy CircleCI config is outdated and not in use; GitHub Actions pipeline not yet set up | No automated build/test/deploy on push; regressions go undetected; manual deployment burden | 4 | 4 | 16 | High |
| WR-R4 | Operational | Content and link rot degrades site quality for visitors | Static site content ages; external links break; blog posts reference outdated information | Poor visitor experience, reduced SEO, damaged professional credibility | 4 | 3 | 12 | High |
| WR-R5 | Technology | Test infrastructure decay makes BDD tests unreliable or unmaintainable | WDIO v4 is end-of-life; SauceLabs browser/OS matrix evolves; Cucumber step definitions are tightly coupled to WDIO v4 API | Tests become flaky or fail permanently; loss of regression safety net; manual testing burden | 4 | 4 | 16 | High |

## Early Warning Indicators

| Risk ID | Indicator | Trigger |
| --- | --- | --- |
| WR-R1 | `npm audit` findings; Gatsby/Node version falls further behind LTS | Any critical CVE in a production dependency |
| WR-R2 | Secrets referenced in plain text in scripts or CI config | Any credential committed to git history |
| WR-R3 | No CI pipeline running on push to `master` | GitHub Actions workflow missing or failing |
| WR-R4 | Broken links reported by visitors or detected by crawl | >5 broken external links on the live site |
| WR-R5 | SauceLabs test failures unrelated to code changes | Any WDIO v4 breaking change in SauceLabs platform updates |

## Existing Controls and Gaps

| Risk ID | Current controls | Gap |
| --- | --- | --- |
| WR-R1 | Manual `npm-check` script exists (`npm run npm-check`). | No CI gate, no scheduled dependency audit, no age policy. |
| WR-R2 | `.gitignore` excludes common secret paths. Netlify manages deploy tokens. | No secret scanning in pre-commit or CI. Legacy deploy scripts reference SSH keys and CF_AUTH_KEY inline. No rotation policy. |
| WR-R3 | Netlify auto-deploys from the repo (if configured). Legacy CircleCI config exists but is not active. | No GitHub Actions pipeline. No automated build/test gate on push. |
| WR-R4 | None. | No broken-link checker. No content freshness tracking. |
| WR-R5 | BDD tests run in CI via SauceLabs across Chrome, Firefox, and Safari. | WDIO v4 API is frozen. No upgrade path documented. SauceLabs config may require browser matrix updates. |
