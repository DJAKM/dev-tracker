// Generates icon-192.png and icon-512.png without any external dependencies
// Run: node scripts/generate-icons.mjs

import { createWriteStream } from "fs";
import { deflateSync } from "zlib";

function createPNG(size) {
  // Draw a simple ⚡ DevTracker icon: indigo background, white lightning bolt
  const pixels = new Uint8Array(size * size * 4); // RGBA

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;

  // Background: indigo #6366f1
  const bgR = 0x63, bgG = 0x66, bgB = 0xf1;

  // Circle background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;
      const idx = (y * size + x) * 4;
      if (dx * dx + dy * dy <= r * r) {
        pixels[idx]     = bgR;
        pixels[idx + 1] = bgG;
        pixels[idx + 2] = bgB;
        pixels[idx + 3] = 255;
      } else {
        // rounded square corners (also indigo) — just make full square
        pixels[idx]     = bgR;
        pixels[idx + 1] = bgG;
        pixels[idx + 2] = bgB;
        pixels[idx + 3] = 255;
      }
    }
  }

  // Draw ⚡ lightning bolt in white (polygon fill)
  // Scale bolt relative to icon size
  const s = size / 192;
  const boltPoints = [
    [108, 20],
    [75,  95],
    [105, 95],
    [84, 172],
    [140, 82],
    [108, 82],
    [135, 20],
  ].map(([x, y]) => [x * s, y * s]);

  function inPolygon(px, py) {
    let inside = false;
    for (let i = 0, j = boltPoints.length - 1; i < boltPoints.length; j = i++) {
      const xi = boltPoints[i][0], yi = boltPoints[i][1];
      const xj = boltPoints[j][0], yj = boltPoints[j][1];
      if (((yi > py) !== (yj > py)) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }
    return inside;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inPolygon(x, y)) {
        const idx = (y * size + x) * 4;
        pixels[idx]     = 255;
        pixels[idx + 1] = 255;
        pixels[idx + 2] = 255;
        pixels[idx + 3] = 255;
      }
    }
  }

  // Build PNG binary
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeB = Buffer.from(type, "ascii");
    const crc = crc32(Buffer.concat([typeB, data]));
    const crcB = Buffer.alloc(4);
    crcB.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, typeB, data, crcB]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8]  = 8;  // bit depth
  ihdr[9]  = 2;  // color type RGB (we'll skip alpha for simplicity... actually use RGBA=6)
  ihdr[9]  = 6;  // RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  // IDAT: filter byte 0 (None) per row + raw RGBA
  const rawRows = [];
  for (let y = 0; y < size; y++) {
    rawRows.push(0); // filter type None
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      rawRows.push(pixels[idx], pixels[idx+1], pixels[idx+2], pixels[idx+3]);
    }
  }
  const compressed = deflateSync(Buffer.from(rawRows));

  const iend = Buffer.alloc(0);

  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", compressed), chunk("IEND", iend)]);
}

// CRC32 table
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

for (const size of [192, 512]) {
  const png = createPNG(size);
  const out = createWriteStream(`public/icon-${size}.png`);
  out.write(png);
  out.end();
  console.log(`✓ public/icon-${size}.png (${png.length} bytes)`);
}
