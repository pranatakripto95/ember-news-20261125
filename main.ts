// Ember News 25 November 2026 — a one-page newspaper front page.
// Draws every pixel itself: a hand-built 5x7 bitmap font, simple vector
// icons, and a PNG encoder on top of Node's zlib. No network, no images
// read from disk. Run: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";

const W = 1024;
const H = 1024;
const PAPER: [number, number, number] = [247, 242, 231];
const INK: [number, number, number] = [17, 17, 17];
const RED: [number, number, number] = [164, 31, 31];
const BLUE: [number, number, number] = [29, 78, 122];
const GREY: [number, number, number] = [90, 86, 78];
const WHITE: [number, number, number] = [255, 255, 255];
const GOLD: [number, number, number] = [176, 124, 32];

type RGB = [number, number, number];
const px = new Uint8Array(W * H * 3);
for (let i = 0; i < W * H; i++) {
  px[i * 3] = PAPER[0];
  px[i * 3 + 1] = PAPER[1];
  px[i * 3 + 2] = PAPER[2];
}
function setPixel(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}
function rect(x: number, y: number, w: number, h: number, c: RGB): void {
  for (let yy = y; yy < y + h; yy++)
    for (let xx = x; xx < x + w; xx++) setPixel(xx, yy, c);
}
function hline(x: number, y: number, w: number, c: RGB, t = 1): void {
  rect(x, y, w, t, c);
}
function vline(x: number, y: number, h: number, c: RGB, t = 1): void {
  rect(x, y, t, h, c);
}
function disc(cx: number, cy: number, r: number, c: RGB): void {
  for (let y = cy - r; y <= cy + r; y++)
    for (let x = cx - r; x <= cx + r; x++)
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r)
        setPixel(x, y, c);
}
function ring(cx: number, cy: number, r: number, t: number, c: RGB): void {
  for (let y = cy - r - t; y <= cy + r + t; y++)
    for (let x = cx - r - t; x <= cx + r + t; x++) {
      const d = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
      if (d >= r - t / 2 && d <= r + t / 2) setPixel(x, y, c);
    }
}
function line(x0: number, y0: number, x1: number, y1: number, c: RGB, t = 1): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let s = 0; s <= steps; s++) {
    const x = Math.round(x0 + (dx * s) / steps);
    const y = Math.round(y0 + (dy * s) / steps);
    rect(x - Math.floor(t / 2), y - Math.floor(t / 2), t, t, c);
  }
}

// 5x7 bitmap font, all caps. Each glyph is 7 rows of 5 "0"/"1" chars.
const FONT: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
  ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
  "?": ["01110", "10001", "00001", "00110", "00100", "00000", "00100"],
  "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
  "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
  '"': ["01010", "01010", "01010", "00000", "00000", "00000", "00000"],
};
const BLANK = ["00000", "00000", "00000", "00000", "00000", "00000", "00000"];
function drawChar(ch: string, x: number, y: number, s: number, c: RGB): void {
  const g = FONT[ch] ?? BLANK;
  for (let r = 0; r < 7; r++)
    for (let col = 0; col < 5; col++)
      if (g[r][col] === "1") rect(x + col * s, y + r * s, s, s, c);
}
function textWidth(t: string, s: number): number {
  return t.length * 6 * s - s;
}
function drawText(t: string, x: number, y: number, s: number, c: RGB): void {
  const up = t.toUpperCase();
  for (let i = 0; i < up.length; i++)
    drawChar(up[i], x + i * 6 * s, y, s, c);
}
function drawCentred(t: string, cx: number, y: number, s: number, c: RGB): void {
  drawText(t, cx - Math.floor(textWidth(t, s) / 2), y, s, c);
}
function wrap(t: string, maxChars: number): string[] {
  const words = t.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (next.length <= maxChars) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}
function para(
  t: string,
  x: number,
  y: number,
  maxChars: number,
  s: number,
  c: RGB,
  lh: number,
): number {
  const lines = wrap(t, maxChars);
  lines.forEach((ln, i) => drawText(ln, x, y + i * lh, s, c));
  return y + lines.length * lh;
}

// ---- icons (drawn with rects, discs and lines) ----
function iconShield(x: number, y: number, s: number, c: RGB): void {
  // a shield with a keyhole: the cyber lead
  const u = s / 10;
  rect(x + 3 * u, y, 4 * u, 2 * u, c);
  rect(x + 2 * u, y + 2 * u, 6 * u, 4 * u, c);
  rect(x + 3 * u, y + 6 * u, 4 * u, 2 * u, c);
  rect(x + 4 * u, y + 8 * u, 2 * u, 2 * u, c);
  disc(x + 5 * u, y + 4 * u, 2 * u, PAPER);
  rect(x + 4 * u, y + 4 * u, 2 * u, 3 * u, c);
}
function iconBars(x: number, y: number, s: number, c: RGB): void {
  // three rising bars with a tariff % tag: trade
  const u = s / 10;
  rect(x, y + 6 * u, 2 * u, 4 * u, c);
  rect(x + 3 * u, y + 4 * u, 2 * u, 6 * u, c);
  rect(x + 6 * u, y + 2 * u, 2 * u, 8 * u, c);
  rect(x + 8 * u, y, 2 * u, 2 * u, RED);
}
function iconRocket(x: number, y: number, s: number, c: RGB): void {
  const u = s / 10;
  rect(x + 4 * u, y, 2 * u, 2 * u, c);
  rect(x + 3 * u, y + 2 * u, 4 * u, 5 * u, c);
  rect(x + 2 * u, y + 4 * u, 1 * u, 3 * u, c);
  rect(x + 7 * u, y + 4 * u, 1 * u, 3 * u, c);
  disc(x + 5 * u, y + 4 * u, 1 * u, PAPER);
  rect(x + 4 * u, y + 7 * u, 2 * u, 2 * u, GOLD);
  rect(x + 3 * u, y + 9 * u, 4 * u, 1 * u, RED);
}
function iconIsland(x: number, y: number, s: number, c: RGB): void {
  const u = s / 10;
  disc(x + 5 * u, y + 2 * u, 2 * u, GOLD);
  rect(x + 1 * u, y + 6 * u, 8 * u, 2 * u, c);
  hline(x, y + 8 * u, 10 * u, BLUE, 1 * u);
}
function iconShop(x: number, y: number, s: number, c: RGB): void {
  const u = s / 10;
  rect(x, y, 10 * u, 2 * u, RED);
  rect(x + 1 * u, y + 2 * u, 2 * u, 2 * u, c);
  rect(x + 4 * u, y + 2 * u, 2 * u, 2 * u, c);
  rect(x + 7 * u, y + 2 * u, 2 * u, 2 * u, c);
  rect(x + 1 * u, y + 4 * u, 8 * u, 6 * u, c);
  rect(x + 4 * u, y + 6 * u, 2 * u, 4 * u, PAPER);
}
function iconChart(x: number, y: number, s: number, c: RGB): void {
  const u = s / 10;
  line(x, y + 2 * u, x + 3 * u, y + 4 * u, c, 1 * u);
  line(x + 3 * u, y + 4 * u, x + 6 * u, y + 3 * u, c, 1 * u);
  line(x + 6 * u, y + 3 * u, x + 9 * u, y + 8 * u, RED, 1 * u);
  line(x + 9 * u, y + 8 * u, x + 7 * u, y + 8 * u, RED, 1 * u);
  line(x + 9 * u, y + 8 * u, x + 9 * u, y + 6 * u, RED, 1 * u);
}

// ---- PNG encoder (signature, IHDR, IDAT via zlib, IEND) ----
function crc32(buf: Buffer): number {
  let table = (crc32 as unknown as { t?: Int32Array }).t;
  if (!table) {
    table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    (crc32 as unknown as { t: Int32Array }).t = table;
  }
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePNG(): Buffer {
  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---- layout: one newspaper front page ----
const MX = 36;
const CW = W - MX * 2;

// masthead
hline(MX, 26, CW, INK, 4);
drawCentred("EMBER NEWS", 512, 38, 8, INK);
drawCentred("THE WORLD IN ONE PAGE", 512, 102, 2, GREY);

// date bar
rect(MX, 128, CW, 44, INK);
drawText("WEDNESDAY 25 NOVEMBER 2026", MX + 16, 141, 2, WHITE);
drawText("ONE DAY - SIX STORIES", MX + CW - 16 - textWidth("ONE DAY - SIX STORIES", 2), 141, 2, WHITE);

// lead story: CIA breach
rect(MX, 188, CW, 200, INK);
rect(MX + 3, 191, CW - 6, 194, PAPER);
drawText("LEAD - CYBER - AP / CNN", MX + 20, 206, 2, RED);
iconShield(MX + 24, 236, 130, BLUE);
para("CIA SYSTEM BREACHED IN CYBERATTACK", MX + 180, 232, 33, 4, INK, 36);
para(
  "AN UNCLASSIFIED CIA SYSTEM WAS BREACHED, AN AP SOURCE SAYS. OTHER US INTELLIGENCE SYSTEMS WERE ALSO HIT, REPORTS SAY.",
  MX + 180,
  316,
  62,
  2,
  INK,
  20,
);

// grid cells
type Cell = {
  x: number;
  y: number;
  w: number;
  h: number;
  kicker: string;
  head: string;
  deck: string;
  icon: (x: number, y: number, s: number, c: RGB) => void;
  accent: RGB;
};
function cell(c: Cell): void {
  rect(c.x, c.y, c.w, c.h, INK);
  rect(c.x + 2, c.y + 2, c.w - 4, c.h - 4, PAPER);
  drawText(c.kicker, c.x + 16, c.y + 12, 2, c.accent);
  c.icon(c.x + 16, c.y + 38, 60, c.accent);
  para(c.head, c.x + 88, c.y + 36, 20, 3, INK, 27);
  para(c.deck, c.x + 16, c.y + 104, 36, 2, INK, 19);
}
const COLW = Math.floor((CW - 20) / 2);
cell({
  x: MX, y: 404, w: COLW, h: 168,
  kicker: "TRADE - AP", head: "US TO RAISE TARIFFS ON CHINA AND THE EU",
  deck: "NEW DUTIES PLANNED AFTER A PROBE INTO SUBSIDISED PRODUCTION.",
  icon: iconBars, accent: RED,
});
cell({
  x: MX + COLW + 20, y: 404, w: COLW, h: 168,
  kicker: "SPACE - REUTERS", head: "SHENZHOU-24 LIFTS OFF TO TIANGONG",
  deck: "ZEESHAN ALI, 40, IS THE FIRST PAKISTANI IN ORBIT.",
  icon: iconRocket, accent: BLUE,
});
cell({
  x: MX, y: 584, w: COLW, h: 168,
  kicker: "PACIFIC - AP", head: "AUSTRALIA IS SOLOMONS TOP PARTNER",
  deck: "SIGNED IN CANBERRA. HONIARA: NO FOREIGN BASE ON OUR SOIL.",
  icon: iconIsland, accent: BLUE,
});
cell({
  x: MX + COLW + 20, y: 584, w: COLW, h: 168,
  kicker: "COLOMBIA - REUTERS", head: "30 HELD IN CARTAGENA SUPERMARKET SIEGE",
  deck: "GUNMEN SEIZE AN EXITO STORE. 10 FREED, ABOUT 20 STILL HELD.",
  icon: iconShop, accent: RED,
});

// markets strip, full width
rect(MX, 764, CW, 120, INK);
rect(MX + 3, 767, CW - 6, 114, PAPER);
drawText("MARKETS - AP / REUTERS", MX + 20, 780, 2, RED);
iconChart(MX + 20, 806, 60, BLUE);
drawText("ASIAN SHARES SLIDE AS NVIDIA RALLY FADES", MX + 100, 808, 3, INK);
para("TECH FALLS IN ASIA AFTER A WALL STREET RETREAT. NVIDIA SLID 6% ON TUESDAY.", MX + 100, 844, 70, 2, INK, 18);

// footer
hline(MX, 906, CW, INK, 3);
drawCentred("SOURCES: AP - CNN - REUTERS - XINHUA - SKY NEWS - PM.GOV.AU", 512, 922, 2, GREY);
drawCentred("ALL STORIES WERE REPORTED ON WEDNESDAY 25 NOVEMBER 2026", 512, 950, 2, GREY);
hline(MX, 984, CW, INK, 4);

// ---- write it out ----
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
mkdirSync(outDir, { recursive: true });
const png = encodePNG();
writeFileSync(`${outDir}/entry.png`, png);
console.log(`wrote ${outDir}/entry.png ${png.length} bytes ${W}x${H}`);
