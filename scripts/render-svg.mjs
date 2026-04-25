#!/usr/bin/env node
// Wraps `sips` so SVG-to-PNG conversion is consistent across visual-artifact
// workflows (newsletter covers, logos, ad-hoc diagrams). Pairs with the
// render-and-verify discipline in P011 / BRIEFING.md: write SVG, render PNG
// via this script, then `Read` the PNG to inspect before declaring an
// iteration done.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);

if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
  console.error(
    [
      'Usage: node scripts/render-svg.mjs <input.svg> <output.png> [--size <px>]',
      '',
      'Converts an SVG to a PNG using the macOS built-in `sips` tool.',
      'Default --size is 1200 (longest edge).',
      '',
      'After rendering, use the Read tool on the output PNG so the harness',
      'displays it visually. Verify the rendered image matches intent before',
      'shipping the SVG to the user (P011 render-and-verify discipline).',
    ].join('\n'),
  );
  process.exit(args.length < 2 ? 2 : 0);
}

const sizeFlagIndex = args.indexOf('--size');
let size = 1200;
const positional = [];
for (let i = 0; i < args.length; i += 1) {
  if (i === sizeFlagIndex) {
    const raw = args[i + 1];
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      console.error(`render-svg: --size must be a positive integer (got ${raw})`);
      process.exit(2);
    }
    size = parsed;
    i += 1;
    continue;
  }
  positional.push(args[i]);
}

const [inputArg, outputArg] = positional;
if (!inputArg || !outputArg) {
  console.error('render-svg: both <input.svg> and <output.png> are required');
  process.exit(2);
}

const input = resolve(inputArg);
const output = resolve(outputArg);

if (!existsSync(input)) {
  console.error(`render-svg: input not found: ${input}`);
  process.exit(1);
}

if (!input.toLowerCase().endsWith('.svg')) {
  console.error(`render-svg: input must be a .svg file (got ${input})`);
  process.exit(2);
}

if (!output.toLowerCase().endsWith('.png')) {
  console.error(`render-svg: output must be a .png file (got ${output})`);
  process.exit(2);
}

try {
  execFileSync(
    'sips',
    ['-s', 'format', 'png', '-Z', String(size), input, '--out', output],
    { stdio: 'inherit' },
  );
} catch (err) {
  console.error(`render-svg: sips failed (${err.message ?? err})`);
  process.exit(1);
}

console.log(`render-svg: wrote ${output} (longest edge ${size}px).`);
console.log(`render-svg: now Read ${output} to verify before shipping.`);
