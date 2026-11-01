// Put the phone screenshots inside an iPhone-style frame (drawn here, no Apple assets).
// Usage: npm run frame   (after npm run demo; needs Google Chrome and ffmpeg)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const SCREEN = { w: 780, h: 1688 }; // 390×844 at 2×, as recorded by tools/demo.mjs
const BEZEL = 34;
const PAD = 70; // paper margin around the phone
const W = SCREEN.w + BEZEL * 2;
const H = SCREEN.h + BEZEL * 2;
const out = 'outputs/frame';
fs.mkdirSync(out, { recursive: true });
const framePng = path.resolve(out, 'iphone-frame.png');

// 1. Render the frame as a transparent PNG: black bezel with rounded corners, side buttons, Dynamic Island
const html = `<html><body style="margin:0;background:transparent">
<div style="position:relative;width:${W + 12}px;height:${H}px">
  <i style="position:absolute;left:0;top:300px;width:6px;height:90px;border-radius:3px;background:#2a2a2e"></i>
  <i style="position:absolute;left:0;top:420px;width:6px;height:150px;border-radius:3px;background:#2a2a2e"></i>
  <i style="position:absolute;right:0;top:470px;width:6px;height:210px;border-radius:3px;background:#2a2a2e"></i>
  <div style="position:absolute;left:6px;top:0;width:${W}px;height:${H}px;box-sizing:border-box;border:${BEZEL}px solid #111114;border-radius:150px;box-shadow:inset 0 0 0 2px #3a3a40, 0 0 0 3px #4a4a52"></div>
  <div style="position:absolute;left:${6 + W / 2 - 134}px;top:${H - BEZEL - 30}px;width:268px;height:10px;border-radius:5px;background:#1b1a1f;opacity:.75"></div>
  <div style="position:absolute;left:${6 + W / 2 - 118}px;top:${BEZEL + 26}px;width:236px;height:68px;border-radius:34px;background:#000"></div>
</div></body></html>`;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage({ viewport: { width: W + 12, height: H } });
await page.setContent(html);
await page.screenshot({ path: framePng, omitBackground: true });
await browser.close();

const ffmpeg = (...args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);
const canvas = `color=c=0xece6da:s=${W + 12 + PAD * 2}x${H + PAD * 2}`;
// screen sits inside the bezel; the frame PNG is laid on top so the rounded corners hide the video edges
const layout = `[1:v]scale=${SCREEN.w}:${SCREEN.h}[s];[0:v][s]overlay=${PAD + 6 + BEZEL}:${PAD + BEZEL}[a];[a][2:v]overlay=${PAD}:${PAD}`;

// 2. Framed phone screenshots
fs.mkdirSync('docs/screenshots/iphone', { recursive: true });
for (const f of fs.readdirSync('docs/screenshots').filter((n) => n.startsWith('mobile-') && n.endsWith('.jpg'))) {
  const name = f.replace('mobile-', '').replace('.jpg', '.png');
  ffmpeg('-f', 'lavfi', '-i', canvas, '-i', path.join('docs/screenshots', f), '-i', framePng, '-filter_complex', `${layout},scale=iw/2:-1`, '-frames:v', '1', path.join('docs/screenshots/iphone', name));
}
console.log('framed:', fs.readdirSync('docs/screenshots/iphone').join(', '));
