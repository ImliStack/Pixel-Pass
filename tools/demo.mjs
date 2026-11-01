// Record the README demo: desktop + mobile runs of the full flow (wrong code → retry → verified),
// with Playwright recordVideo against a local Vite server, then encode MP4 / GIF and screenshots via ffmpeg.
// Usage: npm run demo   (needs Google Chrome and ffmpeg)
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const port = 5219;
const base = `http://127.0.0.1:${port}`;
const out = 'outputs/demo';
const shots = 'docs/screenshots';
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(shots, { recursive: true });

const runs = [
  { name: 'desktop', viewport: { width: 1280, height: 800 }, scale: 1.25 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, scale: 2, isMobile: true },
];

const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('vite did not start')), 30000);
  vite.stdout.on('data', (d) => { if (String(d).includes('Local')) { clearTimeout(t); resolve(); } });
});

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const ffmpeg = (...args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);
const results = [];

try {
  for (const run of runs) {
    const size = run.viewport;
    const context = await browser.newContext({ viewport: size, deviceScaleFactor: run.scale, isMobile: run.isMobile, hasTouch: run.isMobile });
    const page = await context.newPage();

    // Chrome's own screencast (CDP) instead of Playwright recordVideo: no extra ffmpeg download, and full-DPR frames.
    const frameDir = path.join(out, `${run.name}-frames`);
    fs.rmSync(frameDir, { recursive: true, force: true });
    fs.mkdirSync(frameDir, { recursive: true });
    const frames = [];
    const cdp = await context.newCDPSession(page);
    cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
      const file = path.resolve(frameDir, `${String(frames.length).padStart(5, '0')}.jpg`);
      fs.writeFileSync(file, Buffer.from(data, 'base64'));
      frames.push({ file, t: metadata.timestamp });
      cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
    });
    const shot = (label) => page.screenshot({ path: path.join(shots, `${run.name}-${label}.jpg`), type: 'jpeg', quality: 88 });
    const type = async (text) => { for (const ch of text) { await page.keyboard.type(ch); await page.waitForTimeout(260); } };

    await page.goto(base);
    await page.waitForSelector('.slot');
    await page.evaluate(() => document.fonts.ready);
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: size.width * run.scale, maxHeight: size.height * run.scale });
    await page.waitForTimeout(1200);
    await shot('idle');

    await page.click('.slots-row');
    await type('1234');
    await page.waitForTimeout(1500);
    await shot('checking');
    await page.waitForSelector('.bubble', { timeout: 8000 });
    await page.waitForTimeout(700);
    await shot('retry');

    await page.waitForTimeout(600);
    await type('985');
    await page.waitForSelector('.check-block', { timeout: 10000 });
    await page.waitForTimeout(300);
    await shot('merge');
    await page.waitForSelector('.toast', { timeout: 8000 });
    await page.waitForTimeout(2200);
    await shot('verified');
    await page.waitForTimeout(800);

    await cdp.send('Page.stopScreencast');
    await context.close();

    // Frames arrive only when the page repaints, so each one is held until the next (ffmpeg concat durations).
    const list = path.join(out, `${run.name}-frames.txt`);
    fs.writeFileSync(list, frames.map((f, i) => `file '${f.file}'\nduration ${((frames[i + 1]?.t ?? f.t + 0.5) - f.t).toFixed(4)}\n`).join('') + `file '${frames.at(-1).file}'\n`);
    const mp4 = path.join(out, `${run.name}.mp4`);
    ffmpeg('-f', 'concat', '-safe', '0', '-i', list, '-vf', 'fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', '-preset', 'slow', '-movflags', '+faststart', mp4);
    fs.rmSync(frameDir, { recursive: true });
    fs.rmSync(list);
    results.push({ run: run.name, mp4, frames: frames.length });
  }

  // Screenshot-only pass: spend all three lives (Skip fast-forwards each check) to capture Game over
  const context = await browser.newContext({ viewport: runs[1].viewport, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto(base);
  await page.waitForSelector('.slot');
  await page.click('.slots-row');
  for (const [i, code] of ['1234', '222', '333'].entries()) {
    await page.keyboard.type(code);
    await page.click('.skip');
    await page.waitForFunction((n) => document.querySelectorAll('.life--lost').length === n, i + 1, { timeout: 8000 });
    await page.waitForTimeout(300);
  }
  await page.waitForSelector('.pixel-btn');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(shots, 'mobile-gameover.jpg'), type: 'jpeg', quality: 88 });
  await context.close();
} finally {
  await browser.close();
  vite.kill();
}

// README assets: full desktop MP4, mobile MP4 and a mobile GIF (the original reference was a phone recording).
fs.copyFileSync(path.join(out, 'desktop.mp4'), 'docs/demo.mp4');
fs.copyFileSync(path.join(out, 'mobile.mp4'), 'docs/demo-mobile.mp4');
ffmpeg('-i', path.join(out, 'mobile.mp4'), '-vf', 'fps=12,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle', 'docs/demo.gif');
ffmpeg('-i', path.join(out, 'desktop.mp4'), '-vf', 'fps=12,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle', 'docs/demo-desktop.gif');
// Social preview: desktop verified shot cropped to 1200×630
ffmpeg('-i', path.join(shots, 'desktop-verified.jpg'), '-vf', 'scale=1200:-1,crop=1200:630:0:(ih-630)/2-40', '-q:v', '3', 'public/og.jpg');

const duration = (f) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f], { encoding: 'utf8' })).toFixed(1);
console.log(JSON.stringify(results.map((r) => ({ ...r, seconds: duration(r.mp4) })), null, 2));
