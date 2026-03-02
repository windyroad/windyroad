# AGENTS.md

## Operating Alignment

All agent work in this repo must align with:

- `PRINCIPLES.md` (especially locality/simplicity, flow/feedback speed, customer focus, and deterministic vs LLM split)
- `RISK_REGISTER.md`

When uncertain, prefer the option that improves feedback speed and keeps changes small and recoverable.
Apply Gall's law in delivery decisions: start from a working simple slice, then earn complexity incrementally through validated trunk feedback.

## Project Structure

This project has been migrated from Gatsby v2 to Next.js 15 (static export).

- **App code**: `src/app/` (Next.js App Router), `src/components-next/`, `src/lib/`
- **Config**: `next.config.mjs`, `eslint.config.mjs`, `tsconfig.json`
- **Content**: `src/articles/` (markdown blog posts), `src/img/`, `public/img/`
- **Legacy CSS (still imported)**: `src/layouts/css/main.css`, `src/components/*/index.css` — these contain the site's visual styles and are imported by Next.js components
- **CI**: `.github/workflows/ci.yml` (GitHub Actions)

## Trunk-Based Delivery

- Use trunk-based development on `master`.
- Keep changes small: prefer multiple small commits over one large change.
- If trunk (`master`) is broken, treat recovery as highest priority. Push only fix commits until the pipeline is green again.

## Existing Quality Gates

This project enforces quality through existing deterministic gates. Do not bypass them.

**Build:**

- `npm run build` — Next.js static export (produces `out/` directory)
- `npm run dev` — Next.js dev server (port 3000)

**CI Pipeline (GitHub Actions):**

- Lint: `npx eslint src/app/ src/components-next/ src/lib/`
- Build: `npm run build` (Next.js static export → `out/`)
- Deploy: Netlify (current production host for windyroad.com.au, behind Cloudflare DNS)

**Claude Code hooks (`.claude/hooks/`):**

- `secret-leak-gate.sh` — `PreToolUse` on Edit/Write. Blocks writing files that contain secret patterns (API keys, tokens, private keys). Mitigates WR-R2.
- `project-health-check.sh` — `UserPromptSubmit`. Injects reminders when GitHub Actions workflows are missing (WR-R3) and when dependency install/update commands are detected, recommending `npx dry-aged-deps` for age+security checks (WR-R1).

Hooks are registered in `.claude/settings.json` and run automatically. Do not bypass them.


## Completion Protocol

Unless explicitly told otherwise, when a task is complete:

1. Commit all intended changes.
2. Push to `master`.
3. Monitor the resulting GitHub Actions pipeline to completion (once set up).
4. If the pipeline fails, treat recovery as highest priority. Push only fix commits until the pipeline is green again.

## Project Context

- **Stack**: Next.js 15 (static export), React 19, TypeScript, Sass, Node 20
- **Deployment**: Netlify (behind Cloudflare DNS)
- **Content**: Blog posts as Markdown in `src/articles/`, landing page in `src/app/page.tsx`
- **Blog**: `src/app/blog/` (listing + `[slug]`), processed by `src/lib/markdown.ts`
