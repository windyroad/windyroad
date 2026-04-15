import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#1A1A1A"/>

  <!-- Title line 1 -->
  <text x="80" y="220" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="#FFFFFF">You&#x2019;re taking too long to</text>

  <!-- Title line 2 (accent color) -->
  <text x="80" y="290" font-family="system-ui, -apple-system, sans-serif" font-size="52" font-weight="700" fill="#E8644A">patch your software.</text>

  <!-- Subtitle -->
  <text x="80" y="370" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#AAAAAA">Get patch fit before AI-powered vulnerability</text>
  <text x="80" y="402" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="#AAAAAA">discovery makes your patch cycle matter.</text>

  <!-- Footer -->
  <text x="80" y="570" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="#FFFFFF">windyroad.com.au</text>
</svg>`;

const outputPath = new URL('../public/img/og-image.png', import.meta.url).pathname;

await sharp(Buffer.from(svg))
  .png()
  .toFile(outputPath);

console.log(`OG image generated at ${outputPath}`);
