# Pixel Pass — architecture

A playful 4‑digit OTP verification screen. Entering the code plays out as a tiny
pixel platformer: the hero bumps each digit block to reveal whether it's right.
Built for the web with React, Vite and TypeScript.

The table below is the original video's flow; the shipped app differs where marked.
Reference frames from the source video live in `docs/reference/` locally (git-ignored: they show third-party characters).

## Screen flow (from the video, frame by frame)

| # | Phase | What's on screen |
|---|-------|------------------|
| 1 | `input` | Title **Let's verify your number**, subtitle, 4 empty key-cap slots, hero idle on brick ground (left), `Didn't get it? Resend in 0:29`, `Demo code 1997`. Active slot shows a blinking `_`. |
| 2 | `checking` | 4th digit auto-submits. Footer → `Checking ···`. Slots flip to gold **?‑blocks** (digit still visible). Hero runs under each block left→right and jumps; block bumps, a coin pops, block turns **green** (right) or **red** (wrong). |
| 3 | `failed` | Title → **So close!** / *Greens are right and stay locked. Retype the red ones.* Hero speech bubble: **Three are off!** *Fix ② ③ and ④*. Red slots fade to empty, cursor jumps to first red slot, resend timer returns. |
| 4 | `checking` (retry) | Only the retyped slots are re-checked; locked greens are skipped. |
| 5 | `merging` | All green → slots slide together into one gold `?` block, hero jumps and bumps it, it turns green. |
| — | `gameover` | *(added)* After `MAX_LIVES` (3) failed checks: *Game over*, slots cleared, **Continue** resets with a fresh code. |
| 6 | `verified` | Block morphs into a big green ✓ with a pulse ring and a coin burst. Title **Verified** / *You're in.* Castle slides in, princess walks out, heart pops, toast types out a message by attempt count: **Perfect run!** / **Level clear!** / **Persistence pays!** (the video's own toast text is not reused). |

## Layers

```
src/
  theme/tokens.css        Design tokens (colors, radii, shadows, fonts)
  theme/global.css        Reset, dotted paper background, responsive sizes
  machine/otpMachine.ts   PURE reducer: state + events. No timing, no DOM.
  machine/useOtpFlow.ts   Director: runs the choreography timeline (hero moves, reveals, merge, finale)
  lib/verify.ts           Mock verification service (demo code 1997, latency). Swap for real API.
  lib/sound.ts            WebAudio chiptune SFX (type, jump, bump, coin, wrong, fanfare). Mute toggle.
  sprites/                Original pixel-art sprites as string grids + palette → rendered to SVG
  components/             Presentational pieces: OtpSlots, Hero, Princess, Castle, Ground, Coin,
                          SpeechBubble, Toast, CheckBlock, IconButton, Footer
  App.tsx                 Screen composition
```

### State (single source of truth)

```ts
phase: 'input' | 'checking' | 'failed' | 'merging' | 'verified' | 'gameover'
slots: { digit: string; status: 'empty'|'filled'|'pending'|'correct'|'wrong' }[4]
attempts: number
lives: number             // MAX_LIVES = 3; 0 → gameover
resendIn: number          // seconds
bubble: boolean           // "Wrong code" bubble after a failed check
```

Rules (shipped): the code is checked as a whole. A wrong code clears every slot and costs a life;
at 0 lives the phase is `gameover`. Typing fills the next empty
slot; backspace clears the last editable filled slot; paste fills editable slots in order.
When every editable slot is filled in `input`/`failed`, the director starts a check.

### Choreography timeline (ms, tuned to the video)

- per block: run to slot (≈260) → jump (≈170 up / 200 down) → bump + coin → reveal
- after last reveal: 450 → bubble + clear wrong slots
- merge: 350 slide‑together → 250 hero run → jump → green → 300 morph to ✓
- finale: castle 500 → princess walk 900 → heart 250 → toast + typewriter


## Production note

The video showed per-digit right/wrong feedback, which leaks information. The shipped app
checks the whole code only (like a real OTP API) and limits attempts with 3 lives; keep
server-side rate limits and short code lifetimes as well.
