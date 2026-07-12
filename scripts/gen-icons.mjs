// Generates PropTok PWA icons as self-authored PNGs (no third-party assets).
// A dark square with a centered red record ring — the app's mark.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, { maskable }) {
  const bg = [10, 10, 13]; // PropTok near-black (#0A0A0D)
  const red = [245, 56, 95]; // PropTok magenta-red record dot (#F5385F)
  const white = [244, 244, 246];
  const cx = size / 2;
  const cy = size / 2;
  // Maskable icons must keep the mark inside the safe zone (~80%).
  const outer = (maskable ? 0.28 : 0.36) * size;
  const inner = outer * 0.6;

  const raw = Buffer.alloc(size * (size * 3 + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter type: none
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - cx, y - cy);
      let col = bg;
      if (d <= outer && d >= outer - Math.max(2, size * 0.045)) col = white;
      else if (d <= inner) col = red;
      raw[p++] = col[0];
      raw[p++] = col[1];
      raw[p++] = col[2];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/pwa-192.png", png(192, { maskable: false }));
writeFileSync("public/icons/pwa-512.png", png(512, { maskable: false }));
writeFileSync("public/icons/pwa-maskable-512.png", png(512, { maskable: true }));
writeFileSync("public/icons/apple-touch-icon.png", png(180, { maskable: false }));
console.log("icons generated");
