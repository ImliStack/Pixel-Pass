# Pixel Pass — architecture

A playful 4‑digit OTP verification screen. Entering the code plays out as a tiny
pixel platformer: the hero bumps each digit block to reveal whether it's right.
Built for web first (React + Vite + TS); structured so the logic ports 1:1 to Flutter.

Reference frames from the source video live in `docs/reference/` locally (git-ignored: they show third-party characters).

## Screen flow (from the video, frame by frame)

| # | Phase | What's on screen |
|---|-------|------------------|
| 1 | `input` | Title **Let's verify your number**, subtitle, 4 empty key-cap slots, hero idle on brick ground (left), `Didn't get it? Resend in 0:29`, `Demo code 1985`. Active slot shows a blinking `_`. |
| 2 | `checking` | 4th digit auto-submits. Footer → `Checking ···`. Slots flip to gold **?‑blocks** (digit still visible). Hero runs under each block left→right and jumps; block bumps, a coin pops, block turns **green** (right) or **red** (wrong). |
| 3 | `failed` | Title → **So close!** / *Greens are right and stay locked. Retype the red ones.* Hero speech bubble: **Three are off!** *Fix ② ③ and ④*. Red slots fade to empty, cursor jumps to first red slot, resend timer returns. |
| 4 | `checking` (retry) | Only the retyped slots are re-checked; locked greens are skipped. |
| 5 | `merging` | All green → slots slide together into one gold `?` block, hero jumps and bumps it, it turns green. |
| 6 | `verified` | Block morphs into a big green ✓ with a pulse ring and a coin burst. Title **Verified** / *You're in.* Castle slides in, princess walks out, heart pops, toast types out: **Took a few castles…** / *…but your code checks out!* (first-try variant: **Flawless run!**). |

## Layers

```
src/
  theme/tokens.css        Design tokens (colors, radii, shadows, fonts) — maps to Flutter ThemeData
  theme/global.css        Reset, dotted paper background, responsive sizes
  machine/otpMachine.ts   PURE reducer: state + events. No timing, no DOM. (→ Flutter: Bloc/Cubit)
  machine/useOtpFlow.ts   Director: runs the choreography timeline (hero moves, reveals, merge, finale)
  lib/verify.ts           Mock verification service (demo code 1985, latency). Swap for real API.
  lib/sound.ts            WebAudio chiptune SFX (type, jump, bump, coin, wrong, fanfare). Mute toggle.
  sprites/                Original pixel-art sprites as string grids + palette → rendered to SVG
  components/             Presentational pieces: OtpSlots, Hero, Princess, Castle, Ground, Coin,
                          SpeechBubble, Toast, CheckBlock, IconButton, Footer
  App.tsx                 Screen composition
```

### State (single source of truth)

```ts
phase: 'input' | 'checking' | 'failed' | 'merging' | 'verified'
slots: { digit: string; status: 'empty'|'filled'|'pending'|'correct'|'wrong' }[4]
attempts: number
resendIn: number          // seconds
bubble: number[] | null   // 1-based indexes to fix
```

Rules: a `correct` slot is locked (input skips it). Typing fills the next editable empty
slot; backspace clears the last editable filled slot; paste fills editable slots in order.
When every editable slot is filled in `input`/`failed`, the director starts a check.

### Choreography timeline (ms, tuned to the video)

- per block: run to slot (≈260) → jump (≈170 up / 200 down) → bump + coin → reveal
- after last reveal: 450 → bubble + clear wrong slots
- merge: 350 slide‑together → 250 hero run → jump → green → 300 morph to ✓
- finale: castle 500 → princess walk 900 → heart 250 → toast + typewriter

## Flutter port notes

- `otpMachine.ts` → a `Cubit<OtpState>` with the same events; keep it pure.
- Timeline → `AnimationController` sequence / `Future` chain mirroring `useOtpFlow`.
- Sprites → `CustomPainter` reading the same string grids (copy `sprites/*.ts` data).
- Tokens → `ThemeData` + `ThemeExtension` with the same names.

## Production caveat

Per-digit right/wrong feedback is what the design shows, but it leaks information
(an attacker can brute-force 4 digits in ≤40 guesses instead of 10,000). For a real
backend, rate-limit hard and/or only reveal per-digit hints in demo mode.
