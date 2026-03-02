# AGENTS.md

## Operating Alignment

All agent work in this repo must align with:

- `PRINCIPLES.md` (especially locality/simplicity, flow/feedback speed, customer focus, and deterministic vs LLM split)
- `RISK_REGISTER.md`

When uncertain, prefer the option that improves feedback speed and keeps changes small and recoverable.
Apply Gall's law in delivery decisions: start from a working simple slice, then earn complexity incrementally through validated trunk feedback.

## Trunk-Based Delivery

- Use trunk-based development on `master`.
- Keep changes small: prefer multiple small commits over one large change.
- If trunk (`master`) is broken, treat recovery as highest priority. Push only fix commits until the pipeline is green again.

## Existing Quality Gates

This project enforces quality through existing deterministic gates. Do not bypass them.

**Pre-commit (via Husky + lint-staged):**

- `*.{js,jsx}` — ESLint with `--fix` + `git add`
- `*.{json,css,md}` — Prettier with `--write` + `git add`
- `*.{png,jpeg,jpg,gif,svg}` — imagemin-lint-staged + `git add`

**CI Pipeline (GitHub Actions — to be set up):**

- Build: `npm run build` (Gatsby)
- Deploy: Netlify (current production host for windyroad.com.au, behind Cloudflare DNS)

**Note**: The repo contains a legacy `.circleci/config.yml` and `scripts/deploy.sh` targeting GridServer shared hosting. These are outdated — the live site is already on Netlify.

**Claude Code hooks (`.claude/hooks/`):**

- `secret-leak-gate.sh` — `PreToolUse` on Edit/Write. Blocks writing files that contain secret patterns (API keys, tokens, private keys). Mitigates WR-R2.
- `project-health-check.sh` — `UserPromptSubmit`. Injects reminders when GitHub Actions workflows are missing (WR-R3) and when dependency install/update commands are detected, recommending `npx dry-aged-deps` for age+security checks (WR-R1).

Hooks are registered in `.claude/settings.json` and run automatically. Do not bypass them.

**Local development:**

- `npm run develop` — Gatsby dev server (port 8000)
- `npm run test:headless:start` — local headless browser tests
- `npm run lint:js` — manual ESLint run

## Completion Protocol

Unless explicitly told otherwise, when a task is complete:

1. Commit all intended changes.
2. Push to `master`.
3. Monitor the resulting GitHub Actions pipeline to completion.
4. If the pipeline fails, treat recovery as highest priority. Push only fix commits until the pipeline is green again.

## Project Context

- **Stack**: Gatsby v2 static site, React, Node 10, SCSS
- **Deployment**: Netlify (behind Cloudflare DNS). Legacy CircleCI/GridServer config exists but is not in use.
- **Testing**: WebdriverIO v4 + Cucumber BDD (SauceLabs for CI, local Chrome/Firefox for dev)
- **Content**: Blog posts as Markdown in `src/articles/`, landing page components in `src/components/`
- **Known tech debt**: Gatsby v2, Node 10, and WDIO v4 are all end-of-life. See `RISK_REGISTER.md` (WR-R1).
