/**
 * Generates Polywave's PWA icons from a generated SVG.
 * Run with: node scripts/generate-icons.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const iconsDir = resolve(root, "public", "icons");

const SIZE = 512;
const CENTER = SIZE / 2;
const RING_RADIUS = 158;

/** Build the circle-of-fifths dots around the ring. */
function dots() {
  let out = "";
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30 * Math.PI) / 180;
    const x = CENTER + RING_RADIUS * Math.sin(angle);
    const y = CENTER - RING_RADIUS * Math.cos(angle);
    const tonic = i === 0;
    const r = tonic ? 20 : 12;
    const fill = tonic ? "#ffffff" : "rgba(255,255,255,0.7)";
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" />`;
  }
  return out;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <radialGradient id="bg" cx="35%" cy="30%" r="85%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="55%" stop-color="#7c3aed" />
      <stop offset="100%" stop-color="#4c1d95" />
    </radialGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)" />
  <circle cx="${CENTER}" cy="${CENTER}" r="${RING_RADIUS}" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="6" />
  ${dots()}
  <path d="M 168 ${CENTER} q 22 -54 44 0 t 44 0 t 44 0"
        fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />
</svg>`;

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-512.png", size: 512 },
];

await mkdir(iconsDir, { recursive: true });
await writeFile(resolve(iconsDir, "icon.svg"), svg, "utf8");
await writeFile(resolve(root, "public", "favicon.svg"), svg, "utf8");

for (const { name, size } of targets) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(resolve(iconsDir, name));
  console.log(`wrote public/icons/${name} (${size}×${size})`);
}
