// Record the login (World 1-1) for the README: phone + desktop runs of
// type email → wrong password (HALT!) → demo account → gate opens → WORLD 1-2 → OTP screen.
// Also captures login screenshots, including the lockout. Usage: npm run demo:login (Chrome + ffmpeg)
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { chromium } from 'playwright';

const port = 5221;
const base = `http://127.0.0.1:${port}`;
const out = 'outputs/login-demo';
const shots = 'docs/screenshots/login';
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(shots, { recursive: true });

const runs = [
  { name: 'mobile', viewport: { width: 390, height: 844 }, scale: 2, isMobile: true },
  { name: 'desktop', viewport: { width: 1280, height: 800 }, scale: 1.25 },
];

const vite = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { stdio: ['ignore', 'pipe', 'inherit'] });
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error('vite did not start')), 30000);
  vite.stdout.on('data', (d) => { if (String(d).includes('Local')) { clearTimeout(t); resolve(); } });
});

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const ffmpeg = (...args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args]);
const SAFE_TOP = ':root { --demo-safe-top: 47px; }';

const typeSlow = async (page, selector, text) => {
  await page.click(selector);
  for (const ch of text) {
    await page.keyboard.type(ch);
    await page.waitForTimeout(55);
  }
};

try {
  for (const run of runs) {
    const context = await browser.newContext({ viewport: run.viewport, deviceScaleFactor: run.scale, isMobile: run.isMobile, hasTouch: run.isMobile });
    const page = await context.newPage();
    const shot = (label) => page.screenshot({ path: path.join(shots, `${run.name}-${label}.jpg`), type: 'jpeg', quality: 88 });

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

    await page.goto(base + '/');
    if (run.isMobile) await page.addStyleTag({ content: SAFE_TOP });
    await page.waitForSelector('#login-email');
    await page.evaluate(() => document.fonts.ready);
    await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: run.viewport.width * run.scale, maxHeight: run.viewport.height * run.scale });
    await page.waitForTimeout(1200);
    await shot('idle');

    await typeSlow(page, '#login-email', 'player1@pixelpass.dev');
    await page.waitForTimeout(500);
    await shot('email');
    await typeSlow(page, '#login-password', 'letmein');
    await page.waitForTimeout(700);
    await shot('password');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.login-error', { timeout: 8000 });
    await page.waitForTimeout(1300);
    await shot('wrong');

    await page.waitForTimeout(500);
    await page.click('.login-demo button');
    await page.waitForTimeout(700);
    await page.click('.login-go');
    await page.waitForFunction(() => document.querySelector('h1')?.textContent?.includes('Welcome back'), null, { timeout: 8000 });
    await page.waitForTimeout(1400);
    await shot('welcome');
    await page.waitForSelector('.world-card', { timeout: 8000 });
    await page.waitForTimeout(500);
    await shot('world');
    await page.waitForURL('**/otp', { timeout: 8000 });
    if (run.isMobile) await page.addStyleTag({ content: SAFE_TOP });
    await page.waitForTimeout(1800);
    await shot('otp');

    await cdp.send('Page.stopScreencast');

    // Screenshot-only: lockout after three wrong passwords
    await page.goto(base + '/');
    if (run.isMobile) await page.addStyleTag({ content: SAFE_TOP });
    await page.fill('#login-email', 'player1@pixelpass.dev');
    for (let i = 0; i < 3; i++) {
      await page.fill('#login-password', `nope${i}`);
      await page.click('.login-go');
      await page.waitForFunction((n) => document.querySelectorAll('.life--lost').length === n, i + 1, { timeout: 8000 });
      await page.waitForTimeout(900);
    }
    await page.waitForTimeout(1200);
    await shot('locked');
    await context.close();

    const list = path.join(out, `${run.name}-frames.txt`);
    fs.writeFileSync(list, frames.map((f, i) => `file '${f.file}'\nduration ${((frames[i + 1]?.t ?? f.t + 0.5) - f.t).toFixed(4)}\n`).join('') + `file '${frames.at(-1).file}'\n`);
    const mp4 = `docs/login-${run.name}.mp4`;
    ffmpeg('-f', 'concat', '-safe', '0', '-i', list, '-vf', 'fps=30,scale=trunc(iw/2)*2:trunc(ih/2)*2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow', '-movflags', '+faststart', mp4);
    fs.rmSync(frameDir, { recursive: true });
    fs.rmSync(list);
    const gifW = run.isMobile ? 320 : 720;
    ffmpeg('-i', mp4, '-vf', `fps=12,scale=${gifW}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=112:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`, `docs/login-${run.name}.gif`);
    const secs = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4], { encoding: 'utf8' })).toFixed(1);
    console.log(`${mp4}: ${secs}s, ${frames.length} frames`);
  }
} finally {
  await browser.close();
  vite.kill();
}
