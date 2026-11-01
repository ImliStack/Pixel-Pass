<div align="center">

<img src="docs/logo.svg" width="84" height="84" alt="Pixel Pass logo: a gold pixel question block" />

# Pixel Pass

**A 4-digit OTP verification screen that plays like a tiny 8-bit platformer.**

Type the code and a pixel hero runs under each digit and bumps it like a block. If the code is right,
every block turns green, they merge into a big check, the hero slides down a flagpole, fireworks pop over
the castle and the toast cheers you on. If it's wrong, the blocks shatter into bricks and you type the whole
code again, like any real OTP. Three wrong codes and it's game over: a fresh code is sent.

### [▶ Try the live demo](https://pixel-pass.imlistack.workers.dev) &nbsp;·&nbsp; demo code `1997`

[![React 18](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-0055ff?style=flat-square&logo=framer&logoColor=white)](https://motion.dev)
[![Vite 5](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Zero assets](https://img.shields.io/badge/assets-0_image_files-f2b33d?style=flat-square)](#-how-it-works)
[![Sound: WebAudio](https://img.shields.io/badge/sound-WebAudio_synth-1fa25c?style=flat-square)](#-how-it-works)
[![Live demo](https://img.shields.io/badge/live-workers.dev-f38020?style=flat-square&logo=cloudflare&logoColor=white)](https://pixel-pass.imlistack.workers.dev)

[Demo](#-demo) · [The flow](#-the-flow) · [Features](#-features) · [Quick start](#-quick-start) · [How it works](#-how-it-works) · [Project structure](#-project-structure) · [Roadmap](#-roadmap)

<br />

<img src="docs/screenshots/desktop-verified.jpg" alt="Pixel Pass verified screen: green check block, the hero and the princess with a heart, a castle and the 'Level clear!' toast" width="100%" />

</div>

<br />

## ✦ Demo

<div align="center">
<table>
  <tr>
    <td width="38%" align="center"><img src="docs/demo-iphone-real.gif" alt="Real iPhone screen recording of Pixel Pass: two wrong codes, bricks shatter, full retype of 1997, flag slide, castle, fireworks and toast" width="100%" /></td>
    <td width="62%" align="center"><img src="docs/demo-desktop.gif" alt="Pixel Pass full-page on desktop: the same flow from wrong code to verified" width="100%" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>Real iPhone</b> · 31 s · <a href="docs/demo-iphone-real.mp4">MP4</a></sub></td>
    <td align="center"><sub><b>Desktop</b> · 19 s · <a href="docs/demo.mp4">MP4</a></sub></td>
  </tr>
</table>
<sub>Left: recorded on an iPhone at <a href="https://pixel-pass.imlistack.workers.dev">pixel-pass.imlistack.workers.dev</a>. Right: <code>npm run demo</code> on desktop: wrong code <code>1234</code> → bricks shatter → retype <code>1997</code> → verified</sub>
</div>

## ✦ On iPhone

<div align="center">
<img src="docs/demo-iphone-real.gif" alt="Real iPhone screen recording: wrong codes, bricks shatter, game flow to verified with fireworks" width="320" />
<br /><sub>Screen-recorded on a real iPhone, live site, keyboard and all · <a href="docs/demo-iphone-real.mp4">MP4</a></sub>
<br /><br />
<img src="docs/screenshots/iphone/idle.png" width="24%" alt="Enter your code" />
<img src="docs/screenshots/iphone/retry.png" width="24%" alt="Not quite: wrong code" />
<img src="docs/screenshots/iphone/gameover.png" width="24%" alt="Game over" />
<img src="docs/screenshots/iphone/verified.png" width="24%" alt="Verified with flag and castle" />
</div>

> **Flow update:** the code is checked as a whole, like a real OTP. A wrong code shatters all four blocks and you retype everything; 3 wrong codes = game over and a fresh code. New: scenery, brick debris, a finish flag and a coin counter.

## ✦ The flow

<table>
  <tr>
    <td width="20%"><img src="docs/screenshots/mobile-idle.jpg" alt="Enter your code: four empty slots, the hero standing on brick ground with hills behind" /></td>
    <td width="20%"><img src="docs/screenshots/mobile-checking.jpg" alt="Checking: the hero jumps under each block; the first turns green, the next ones red" /></td>
    <td width="20%"><img src="docs/screenshots/mobile-retry.jpg" alt="Not quite: all slots cleared, speech bubble Wrong code! Type all 4 again, 2 of 3 lives" /></td>
    <td width="20%"><img src="docs/screenshots/mobile-verified.jpg" alt="Verified: green check, hero and princess, castle and toast" /></td>
    <td width="20%"><img src="docs/screenshots/mobile-gameover.jpg" alt="Game over: three empty hearts, cleared slots and a Continue button" /></td>
  </tr>
  <tr>
    <td align="center"><sub><b>1 · Enter</b><br />4 key-cap slots, resend timer, demo code</sub></td>
    <td align="center"><sub><b>2 · Check</b><br />hero bumps each block: all green or all red</sub></td>
    <td align="center"><sub><b>3 · Not quite</b><br />bricks shatter, retype all 4 digits</sub></td>
    <td align="center"><sub><b>4 · Verified</b><br />merge, ✓, flag, castle, fireworks, toast</sub></td>
    <td align="center"><sub><b>Game over</b><br />3 wrong tries → fresh code</sub></td>
  </tr>
</table>

| Phase | What happens |
|---|---|
| `input` | *Enter your code*. Hearts and a coin counter sit in the header. Slots fill as you type and the active one blinks `_`; the hero stays still so nothing distracts you. Paste and SMS autofill (`autocomplete="one-time-code"`) work. A resend countdown runs below. |
| `checking` | The 4th digit submits on its own. Footer shows *Checking ···* and a **Skip ▸▸** button that fast-forwards the animation. Slots turn into gold blocks; the hero runs under each one and jumps; the block bumps, a coin pops and it turns **green** or **red**; red blocks shake and flash. A puff of dust marks every landing. |
| `failed` | Title becomes *Not quite*. Every block shatters into falling bricks, all four slots clear and the cursor returns to the first. A bubble says *Wrong code! Type all 4 again · ♥ 2/3* and one heart is lost. |
| `gameover` | After 3 wrong codes: *Game over*. The code expires and **Continue ▸** starts again with a fresh code and full hearts. |
| `merging` | All green: the four slots slide into one gold `?` block, the hero bumps it and it turns green. |
| `verified` | *Verified · You're in.* A big ✓ with a pulse ring and a coin burst. A castle slides in, the princess walks out, a heart pops, and a toast types out a random line for how many tries it took, never the same twice in a row: e.g. **Perfect run!** / **Speedrun!** (first try), **Level clear!** / **Extra life used!** (one retry), **Persistence pays!** / **Never game over!** (more). |

## ✦ Features

- **Game-feel OTP input**: run, jump, bump, coin, reveal — each digit is its own tiny level.
- **Real-world rules**: the code is right or wrong as a whole (no per-digit hints). A wrong code means retyping all four digits.
- **Lives as the rate limit**: 3 hearts; running out expires the code and sends a new one.
- **A full little level**: drifting clouds, hills and bushes, a coin counter that ticks with every bump, bricks that shatter on a wrong code, a finish flag, a castle, a heart and fireworks.
- **A hero with anticipation**: walks under the slot you're typing in, hops when a digit lands, blinks while idle; wrong blocks shake and flash red.
- **Full-page and responsive**: phone, tablet and desktop. The brick ground runs edge to edge; the hero and castle stay near the action on wide screens.
- **Chiptune sound effects** synthesised live with WebAudio (type, jump, bump, coin, wrong, fanfare, heart). No audio files. Mute toggle top-right.
- **Original pixel art**, drawn from string grids into crisp SVG. No image files at all, so it stays sharp at any size.
- **Real input handling**: one hidden native input catches typing, backspace, paste and iOS/Android SMS autofill.
- **Resend countdown**, demo code chip, close button to restart.
- **Accessible**: screen readers hear each result ("Wrong code. Type all 4 digits again. 2 lives left."), a Skip button fast-forwards any check, `prefers-reduced-motion` makes it near-instant, and the active slot shows a focus ring.
- **Type**: Archivo Expanded for headings, Inter for body, and **Geist Pixel** only for game text (chips, bubble, toast, `?` block). All fonts are self-hosted: no third-party requests.

## ✦ Quick start

> **Requires** Node.js 18+ (22+ for deploying with Wrangler). Google Chrome and FFmpeg only for recording the demo.

```bash
git clone https://github.com/ImliStack/Pixel-Pass.git "Pixel Pass"
cd "Pixel Pass"
npm ci
npm run dev                 # → http://localhost:5178
```

Enter **1997** to verify, or anything else to see the retry flow.

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server on port 5178 |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run demo` | Record desktop + phone runs → `docs/demo*.mp4`, `docs/demo*.gif`, `docs/screenshots/`, `public/og.jpg` |
| `npm run deploy` | Build and deploy `dist/` to Cloudflare Workers static assets (`wrangler.toml`) |

To use your own verification API, replace `verifyDigits()` in [`src/lib/verify.ts`](src/lib/verify.ts). It takes the four digits and returns which ones are right.

## ✦ How it works

1. **State machine.** [`otpMachine.ts`](src/machine/otpMachine.ts) is a pure reducer — phases `input → checking → failed | merging → verified` and events like `TYPE`, `REVEAL`, `CHECK_FAILED`. No timers or DOM, so it ports straight to a Flutter Cubit.
2. **Director.** [`useOtpFlow.ts`](src/machine/useOtpFlow.ts) runs the timeline: it measures each slot's position, runs the hero there, jumps, and dispatches `REVEAL` at the top of the jump. Every step awaits a cancellable token, so the close button stops any animation mid-flight.
3. **Sprites.** [`sprites/data.ts`](src/sprites/data.ts) holds the hero, princess, castle and heart as string grids plus palettes. [`PixelSprite`](src/sprites/PixelSprite.tsx) merges runs of one colour into SVG rects with `crispEdges`.
4. **Motion.** Framer Motion springs for slot bumps, the merge, the check block and the toast; CSS for the cursor, dots and brick ground.
5. **Sound.** [`sound.ts`](src/lib/sound.ts) plays square- and triangle-wave notes through WebAudio.

The frame-by-frame breakdown of the reference video, timings and Flutter port notes are in [ARCHITECTURE.md](ARCHITECTURE.md).

> **Security note.** The check is whole-code only, so it leaks nothing about individual digits. Pair it with server-side rate limits and short code lifetimes; the 3 hearts mirror that on the client.

## ✦ Project structure

```
src/theme/            tokens.css (colours, type, radii) · global.css (paper background, responsive sizes)
src/machine/          otpMachine.ts (pure state machine) · useOtpFlow.ts (choreography + hero motion)
src/components/       OtpSlots, CheckBlock, Stage (hero, coins, bubble, castle, princess, ground), Chrome (header, heading, footer, toast, credit)
src/sprites/          pixel grids + PixelSprite renderer
src/lib/              verify.ts (mock API, demo code) · sound.ts (WebAudio SFX)
tools/demo.mjs        Playwright + Chrome screencast → MP4, GIF, screenshots
docs/                 logo, demo media, screenshots
```

## ✦ Roadmap

- [x] Web version matching the reference video, frame by frame
- [x] Full-page responsive layout, sound, paste and SMS autofill
- [x] Demo recorder, README media, Cloudflare deploy config
- [x] Lives, game over, random toasts, shake and dust, idle hero, skip, screen-reader narration, pixel game font
- [ ] Haptics, shareable run card, resend power-up, night level (see [docs/UI-RESEARCH.md](docs/UI-RESEARCH.md))
- [ ] More 90s-game-style auth screens: arcade login, character-select signup, password-strength blocks, "save your game?" logout
- [ ] Flutter port using the same state machine and sprite grids
- [ ] Haptics on mobile, optional background chiptune

## ✦ Credits

- Built by [ImliStack](https://imlistack.com). Source: [github.com/ImliStack/Pixel-Pass](https://github.com/ImliStack/Pixel-Pass). A ⭐ helps.
- UI inspired by [Breeje Anadkat (@BreejeAnadkat)](https://x.com/BreejeAnadkat)'s game-style OTP concept. All pixel art, sounds and code here are original; no sprites or audio from any game were used.
- Fonts: Archivo, Inter and JetBrains Mono via Fontsource; Geist Pixel by Vercel × basement.studio. All SIL Open Font License 1.1.
- Built with React, Framer Motion, Vite and Playwright.
