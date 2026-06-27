#!/usr/bin/env node
// Render a weekly newsletter cover from the canonical template + dynamic
// inputs. Pairs with the .claude/skills/wr-newsletter-cover/ skill (P044):
// the template bakes in the brand mark, monogram, accent stripe, font stack,
// and layout; the script substitutes only the per-edition text fields and
// produces both the SVG and the PNG via the existing render-svg.mjs helper.
//
// Usage:
//   node scripts/render-cover.mjs \
//     --template .claude/skills/wr-newsletter-cover/assets/cover-template.svg \
//     --out-svg  src/newsletters/drafts/leader/2026-05-08.cover.svg \
//     --out-png  src/newsletters/drafts/leader/2026-05-08.cover.png \
//     --wordmark "The Shift" \
//     --subtitle "AI ENGINEERING, WEEKLY  ·  ISSUE 04" \
//     --hook-1 "Headline part one." \
//     --hook-2 "Headline part two." \
//     --week-ending 2026-05-08 \
//     --title "The Shift Issue 04, week ending 2026-05-08" \
//     --desc "Cover for The Shift Issue 04. ..."

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLACEHOLDERS = {
  titleText: 'TITLE_TEXT',
  descText: 'DESC_TEXT',
  wordmark: 'WORDMARK',
  subtitle: 'SUBTITLE',
  hookLine1: 'HOOK_LINE_1',
  hookLine2: 'HOOK_LINE_2',
  weekEnding: 'WEEK_ENDING',
};

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

// P100: hook char-count budgets, a proportional-font proxy for the safe-area
// width. The cover safe area is the 1040px span between the x=80 and x=1120
// rules in cover-template.svg; hook-1 renders at 80px, hook-2 at 60px. Limits
// are conservative (hook-1 observed clip at 30 chars, hook-2 at 44). The check
// warns, never fails: char count cannot model proportional-font width exactly,
// so the render-and-verify Read stays the backstop. The warning makes the
// previously silent clip visible to the author.
const HOOK_CHAR_BUDGET = [
  { key: 'hookLine1', label: 'hook-1', budget: 28 },
  { key: 'hookLine2', label: 'hook-2', budget: 40 },
];

export function checkHookWidth(params) {
  const warnings = [];
  for (const { key, label, budget } of HOOK_CHAR_BUDGET) {
    const len = String(params[key] ?? '').length;
    if (len > budget) {
      warnings.push(
        `render-cover: ${label} is ${len} chars, over the ~${budget}-char safe-area budget; ` +
          'it may clip in the rendered cover. Shorten to a complete phrase that reads whole, ' +
          'then confirm against the render-and-verify Read.',
      );
    }
  }
  return warnings;
}

export function substituteCoverTemplate(template, params) {
  for (const key of Object.keys(PLACEHOLDERS)) {
    if (params[key] === undefined || params[key] === null || params[key] === '') {
      throw new Error(`render-cover: missing required parameter "${key}"`);
    }
  }
  let out = template;
  for (const [key, token] of Object.entries(PLACEHOLDERS)) {
    out = out.replaceAll(`{{${token}}}`, escapeXml(params[key]));
  }
  return out;
}

function parseArgs(argv) {
  const out = {};
  const aliases = {
    'hook-1': 'hookLine1',
    'hook-2': 'hookLine2',
    'week-ending': 'weekEnding',
    title: 'titleText',
    desc: 'descText',
    template: 'template',
    'out-svg': 'outSvg',
    'out-png': 'outPng',
    wordmark: 'wordmark',
    subtitle: 'subtitle',
    size: 'size',
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const name = arg.slice(2);
    const target = aliases[name];
    if (!target) {
      throw new Error(`render-cover: unknown flag --${name}`);
    }
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`render-cover: --${name} requires a value`);
    }
    out[target] = value;
    i += 1;
  }
  return out;
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    console.error(
      [
        'Usage: node scripts/render-cover.mjs --template <svg> --out-svg <svg>',
        '         --out-png <png> --wordmark <str> --subtitle <str>',
        '         --hook-1 <str> --hook-2 <str> --week-ending <YYYY-MM-DD>',
        '         --title <str> --desc <str> [--size <px>]',
        '',
        'Substitutes the per-edition text fields into the canonical cover',
        'template, writes the rendered SVG, then renders a PNG via',
        'scripts/render-svg.mjs (sips).',
      ].join('\n'),
    );
    process.exit(argv.length === 0 ? 2 : 0);
  }

  const args = parseArgs(argv);
  const required = ['template', 'outSvg', 'outPng', ...Object.keys(PLACEHOLDERS)];
  for (const key of required) {
    if (!args[key]) {
      console.error(`render-cover: missing required --${key}`);
      process.exit(2);
    }
  }

  for (const warning of checkHookWidth(args)) {
    console.error(warning);
  }

  const templatePath = resolve(args.template);
  if (!existsSync(templatePath)) {
    console.error(`render-cover: template not found: ${templatePath}`);
    process.exit(1);
  }
  const template = readFileSync(templatePath, 'utf8');

  let svg;
  try {
    svg = substituteCoverTemplate(template, args);
  } catch (err) {
    console.error(`render-cover: ${err.message}`);
    process.exit(2);
  }

  const outSvg = resolve(args.outSvg);
  writeFileSync(outSvg, svg, 'utf8');
  console.log(`render-cover: wrote ${outSvg}`);

  const here = dirname(fileURLToPath(import.meta.url));
  const renderSvg = resolve(here, 'render-svg.mjs');
  const renderArgs = [renderSvg, outSvg, resolve(args.outPng)];
  if (args.size) {
    renderArgs.push('--size', args.size);
  }
  try {
    execFileSync('node', renderArgs, { stdio: 'inherit' });
  } catch (err) {
    console.error(`render-cover: render-svg.mjs failed (${err.message ?? err})`);
    process.exit(1);
  }

  console.log(`render-cover: now Read ${args.outPng} to verify before shipping.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
