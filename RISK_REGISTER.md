# Risk Register

## Scope

Static website (windyroad.com.au) built with Next.js 15 (static export), hosted on Netlify behind Cloudflare DNS.

Delivery policy baseline:

- Trunk-based development on `master`.
- Quality gates: ESLint, CI build (GitHub Actions).
- Deployment: Netlify auto-deploys from `master`.

## Scales

- Likelihood (`L`): 1 Rare, 2 Unlikely, 3 Possible, 4 Likely, 5 Almost certain
- Impact (`I`): 1 Minor, 2 Moderate, 3 Major, 4 Severe, 5 Critical
- Score: `L x I`
- Level bands: Low (1–4), Medium (5–9), High (10–16), Extreme (17–25)

## Register

| Risk ID | Category | Risk event | Cause | Consequence | L | I | Score | Level |
| --- | --- | --- | --- | --- | ---: | ---: | ---: | --- |
| WR-R1 | Technology | Dependency staleness blocks maintenance or creates security exposure | Dependencies age without updates; new CVEs discovered | Potential CVEs in production dependencies; unable to adopt fixes | 3 | 4 | 12 | High |
| WR-R2 | Security | Secret leakage exposes deployment credentials or API tokens | GITHUB_TOKEN and Netlify/Cloudflare tokens handled in CI environment | Unauthorised access to hosting, GitHub repo, or Cloudflare DNS/CDN; site defacement or data exfiltration | 3 | 5 | 15 | High |
| WR-R3 | Delivery | CI pipeline decays, leaving no automated quality assurance | GitHub Actions workflow breaks or is bypassed | No automated build/lint gate on push; regressions go undetected | 2 | 4 | 8 | Medium |
| WR-R4 | Operational | Content and link rot degrades site quality for visitors | Static site content ages; external links break; blog posts reference outdated information | Poor visitor experience, reduced SEO, damaged professional credibility | 4 | 3 | 12 | High |
| WR-R5 | Technology | No automated test coverage for regressions | No test framework configured in the Next.js project | Regressions go undetected until manual review | 3 | 3 | 9 | Medium |

## Early Warning Indicators

| Risk ID | Indicator | Trigger |
| --- | --- | --- |
| WR-R1 | `npx dry-aged-deps` reports mature safe updates available | Any critical CVE in a production dependency; safe updates ignored for >30 days |
| WR-R2 | Secrets referenced in plain text in code or CI config | Any credential committed to git history |
| WR-R3 | CI pipeline failing or not running on push to `master` | GitHub Actions workflow missing or failing |
| WR-R4 | Broken links reported by visitors or detected by crawl | >5 broken external links on the live site |
| WR-R5 | No test files exist in the repo | Code changes merged without any automated test validation |

## Existing Controls and Gaps

| Risk ID | Current controls | Gap |
| --- | --- | --- |
| WR-R1 | Claude Code hook nudges `npx dry-aged-deps` on dependency changes. | No CI gate or scheduled dependency audit. |
| WR-R2 | `.gitignore` excludes common secret paths. Netlify manages deploy tokens. Claude Code hook blocks writing secret patterns to files. | No secret scanning in CI. No rotation policy. |
| WR-R3 | GitHub Actions CI runs lint + build on push to `master` and on PRs. Netlify auto-deploys from `master`. | No automated tests in CI yet. |
| WR-R4 | None. | No broken-link checker. No content freshness tracking. |
| WR-R5 | ESLint catches common code issues. | No test framework (Jest/Vitest/Playwright) configured. |
