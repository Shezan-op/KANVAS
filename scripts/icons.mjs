// Generates every favicon format from src/app/icon.svg.  Run: node scripts/icons.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const svg = readFileSync("src/app/icon.svg");
const png = (size) => sharp(svg, { density: Math.max(72, (72 * size) / 64) }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

// favicon.ico: 16, 32 and 48 px PNGs packed into one ICO (Google wants a multiple of 48).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
writeFileSync("src/app/favicon.ico", Buffer.concat([header, ...images]));

writeFileSync("src/app/icon1.png", await png(192)); // raster icon for Google / browsers
writeFileSync("src/app/apple-icon.png", await png(180)); // iOS home screen
writeFileSync("public/icon-192.png", await png(192)); // web manifest
writeFileSync("public/icon-512.png", await png(512));
console.log("icons written");
