import sharp from 'sharp';
import {
  HERO_HEADLINE_LINE1,
  HERO_HEADLINE_LINE2,
  HERO_SUBTITLE_LINE1,
  HERO_SUBTITLE_LINE2,
} from '../src/lib/siteCopy.mjs';

// Escape for XML/SVG text content so curly apostrophes and other special
// characters render correctly in the generated PNG.
const escape = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\u2019/g, '&#x2019;')
    .replace(/\u2014/g, '&#x2014;');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1A1A1A"/>

  <!-- Title line 1 -->
  <text x="80" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="#FFFFFF">${escape(HERO_HEADLINE_LINE1)}</text>

  <!-- Title line 2 (accent color) -->
  <text x="80" y="290" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="#E8644A">${escape(HERO_HEADLINE_LINE2)}</text>

  <!-- Subtitle -->
  <text x="80" y="370" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#AAAAAA">${escape(HERO_SUBTITLE_LINE1)}</text>
  <text x="80" y="402" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#AAAAAA">${escape(HERO_SUBTITLE_LINE2)}</text>

  <!-- Footer -->
  <text x="80" y="570" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#FFFFFF">windyroad.com.au</text>
</svg>`;

const outputPath = new URL('../public/img/og-image.png', import.meta.url).pathname;

await sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath);

console.log(`OG image generated at ${outputPath}`);
