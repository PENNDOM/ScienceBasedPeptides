/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const PRODUCTS_DIR = path.join(process.cwd(), "public", "products");
const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".webp"]);

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

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

  let count = 0;
  for (let i = 0; i < visited.length; i += 1) {
    if (visited[i]) count += 1;
  }
  return { visited, count };
}

function sampleTone(data, width, height, bgMask) {
  const x0 = Math.floor(width * 0.25);
  const x1 = Math.floor(width * 0.75);
  const y0 = Math.floor(height * 0.22);
  const y1 = Math.floor(height * 0.78);
  let rs = 0;
  let gs = 0;
  let bs = 0;
  let c = 0;

  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const p = y * width + x;
      if (bgMask[p]) continue;
      const i = p * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 180) continue;
      const l = luminance(r, g, b);
      if (l < 40 || l > 225) continue;
      rs += r;
      gs += g;
      bs += b;
      c += 1;
    }
  }

  if (c === 0) return [158, 124, 99];
  return [Math.round(rs / c), Math.round(gs / c), Math.round(bs / c)];
}

function gradientPixel(x, y, width, height, base) {
  const tx = width <= 1 ? 0 : x / (width - 1);
  const ty = height <= 1 ? 0 : y / (height - 1);

  const topBoost = 1.12 - ty * 0.28;
  const sideLift = 0.05 * (1 - Math.abs(tx - 0.5) * 2);

  const r = clamp(Math.round(base[0] * (topBoost + sideLift)), 0, 255);
  const g = clamp(Math.round(base[1] * (topBoost + sideLift)), 0, 255);
  const b = clamp(Math.round(base[2] * (topBoost + sideLift)), 0, 255);
  return [r, g, b];
}

async function processFile(filePath) {
  const input = sharp(filePath);
  const { data, info } = await input.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;

  const { visited: bgMask, count: bgCount } = floodBackgroundMask(data, width, height);
  const bgRatio = bgCount / (width * height);
  if (bgRatio < 0.08) return false;

  const tone = sampleTone(data, width, height, bgMask);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      if (!bgMask[p]) continue;
      const i = p * 4;
      const [r, g, b] = gradientPixel(x, y, width, height, tone);
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }

  const tmp = `${filePath}.tmp`;
  await sharp(data, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(tmp);
  fs.renameSync(tmp, filePath);
  return true;
}

async function run() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    console.log("No public/products directory found. Skipping.");
    return;
  }

  const files = fs
    .readdirSync(PRODUCTS_DIR)
    .filter((name) => IMAGE_EXT.has(path.extname(name).toLowerCase()))
    .map((name) => path.join(PRODUCTS_DIR, name));

  let changed = 0;
  for (const file of files) {
    try {
      const didChange = await processFile(file);
      if (didChange) changed += 1;
    } catch (error) {
      console.warn(`Skipped ${path.basename(file)}: ${String(error)}`);
    }
  }
  console.log(`Auto-matched product backgrounds (shop only): ${changed}/${files.length} updated.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
