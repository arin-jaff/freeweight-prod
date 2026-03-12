const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const BG_COLOR = '#1a1a2e';
const TEXT_COLOR = '#ffffff';
const TEXT = 'ST';

const targets = [
  { file: 'icon.png', width: 1024, height: 1024 },
  { file: 'splash.png', width: 1284, height: 2778 },
  { file: 'adaptive-icon.png', width: 1024, height: 1024 },
  { file: 'favicon.png', width: 196, height: 196 },
];

function makeLabelSvg(width, height) {
  const fontSize = Math.floor(Math.min(width, height) * 0.32);
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="none"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700" fill="${TEXT_COLOR}">
        ${TEXT}
      </text>
    </svg>`
  );
}

async function generateAsset(target) {
  const outPath = path.join(ASSETS_DIR, target.file);
  const labelSvg = makeLabelSvg(target.width, target.height);

  await sharp({
    create: {
      width: target.width,
      height: target.height,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: labelSvg }])
    .png()
    .toFile(outPath);

  console.log(`Generated ${path.relative(ROOT_DIR, outPath)} (${target.width}x${target.height})`);
}

async function main() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  await Promise.all(targets.map(generateAsset));
  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
