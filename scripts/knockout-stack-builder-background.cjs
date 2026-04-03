/* eslint-disable no-console */
/**
 * Makes a PNG’s outer black/near-black background transparent via edge flood-fill
 * (same idea as auto-match-product-backgrounds).
 * Run: node scripts/knockout-stack-builder-background.cjs
 * Run: node scripts/knockout-stack-builder-background.cjs public/hero-home-stack.png
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const INPUT = process.argv[2]
  ? path.join(process.cwd(), process.argv[2])
  : path.join(process.cwd(), "public", "stack-builder-vials.png");

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function floodBackgroundMask(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  function pixelIdx(x, y) {
    return y * width + x;
  }

  function isBackgroundCandidate(x, y) {
    const i = (y * width + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 200) return true;
    const l = luminance(r, g, b);
    return l < 44;
  }

  const borderStep = Math.max(8, Math.floor(Math.min(width, height) / 30));
  for (let x = 0; x < width; x += borderStep) {
    queue.push([x, 0], [x, height - 1]);
  }
  for (let y = 0; y < height; y += borderStep) {
    queue.push([0, y], [width - 1, y]);
  }
  queue.push([0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]);

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const p = pixelIdx(x, y);
    if (visited[p]) continue;
    visited[p] = 1;
    if (!isBackgroundCandidate(x, y)) continue;
    queue.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return visited;
}

async function run() {
  if (!fs.existsSync(INPUT)) {
    console.error("Missing", INPUT);
    process.exit(1);
  }

  const { data, info } = await sharp(INPUT).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const bgMask = floodBackgroundMask(data, width, height);

  let cleared = 0;
  for (let p = 0; p < width * height; p += 1) {
    if (!bgMask[p]) continue;
    const i = p * 4;
    data[i + 3] = 0;
    cleared += 1;
  }

  const tmp = `${INPUT}.tmp.png`;
  await sharp(Buffer.from(data), { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(tmp);
  fs.renameSync(tmp, INPUT);

  console.log(`${path.basename(INPUT)}: set ${cleared} pixels transparent (${((cleared / (width * height)) * 100).toFixed(1)}% of image).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
