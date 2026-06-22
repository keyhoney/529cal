import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_PATH = path.resolve(__dirname, '../public/og-default.png');
const W = 1200;
const H = 630;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#121214"/>
      <stop offset="50%" stop-color="#0a0a0c"/>
      <stop offset="100%" stop-color="#08080a"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="0%" r="70%">
      <stop offset="0%" stop-color="#d4af37" stop-opacity="0.14"/>
      <stop offset="55%" stop-color="#d4af37" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#d4af37" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c9a030"/>
      <stop offset="45%" stop-color="#f0d88a"/>
      <stop offset="100%" stop-color="#fff4d0"/>
    </linearGradient>
    <linearGradient id="gold-stroke" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0d88a" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#d4af37" stop-opacity="0.2"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#d4af37" stroke-opacity="0.04" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  <rect x="48" y="48" width="${W - 96}" height="${H - 96}" rx="28" fill="none" stroke="url(#gold-stroke)" stroke-width="2"/>

  <!-- logo mark -->
  <rect x="548" y="168" width="104" height="104" rx="22" fill="#121214" stroke="#d4af37" stroke-opacity="0.45" stroke-width="2"/>
  <svg x="562" y="182" width="76" height="76" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 19h16M6 16l3-8 4 6 3-4 2 6" stroke="#d4af37" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>

  <!-- title -->
  <text x="600" y="340" text-anchor="middle" font-family="Segoe UI, Malgun Gothic, Apple SD Gothic Neo, sans-serif" font-size="88" font-weight="700" letter-spacing="6" fill="url(#gold)">529Cal</text>

  <!-- subtitle -->
  <text x="600" y="410" text-anchor="middle" font-family="Segoe UI, Malgun Gothic, Apple SD Gothic Neo, sans-serif" font-size="40" font-weight="500" fill="#d4d0c8">내신 환산 · 입결 조회</text>

  <!-- tagline -->
  <text x="600" y="468" text-anchor="middle" font-family="Segoe UI, Malgun Gothic, Apple SD Gothic Neo, sans-serif" font-size="24" font-weight="500" fill="#94908a" letter-spacing="2">5등급제 · 9등급제 환산 계산기</text>

  <!-- bottom accent -->
  <rect x="420" y="520" width="360" height="3" rx="1.5" fill="url(#gold)" opacity="0.55"/>
</svg>`;

async function main() {
  const sharp = (await import('sharp')).default;
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT_PATH);
  const kb = (fs.statSync(OUT_PATH).size / 1024).toFixed(1);
  console.log(`Wrote ${OUT_PATH} (${kb} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
