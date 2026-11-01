# Next screens: a 90s-game auth kit

Pixel Pass grows from one OTP screen into a small kit of everyday screens, each borrowing a
**genre or mechanic** from 90s games (never a specific game's characters, levels or assets).
All screens reuse what the OTP screen already has:

- `sprites/` string-grid pixel art + `PixelSprite`
- `lib/sound.ts` WebAudio SFX
- a pure state machine per screen + a director hook for timing (ports to Flutter Cubits)
- `theme/tokens.css`, the paper background, the credit line

Routing: one Vite app, a tiny router, one route per screen (`/otp`, `/login`, `/signup`, …)
and a home page listing them like a cartridge shelf.

## Screens, in build order

| # | Screen | Mechanic | Key states |
|---|---|---|---|
| 1 | **Login** — arcade cabinet | "INSERT COIN" start, score-style fields | idle → typing → checking (coin drop) → **wrong**: `CONTINUE? 9…8…` countdown → retry · **ok**: `PLAYER 1 READY` |
| 2 | **Signup** — character select | pick a pixel avatar, enter name like high-score initials, password power bar | choose avatar → name → password (bar fills as rules pass, each rule a star) → `NEW CHALLENGER JOINED` |
| 3 | **Password strength** — falling blocks | each character drops a block into a well; meeting a rule clears a line | weak → fair → strong → `LINE CLEAR!` |
| 4 | **Forgot password** — continue code | 90s console "password grid" look; pigeon flies off when the link is sent | email → sending (pigeon) → `CHECK YOUR INBOX` |
| 5 | **Onboarding** — overworld map | steps are levels 1-1, 1-2…; hero walks node to node | per step: locked → current → cleared |
| 6 | **Logout** — save game | "Save your progress?" memory-card dialog | confirm → saving bar → `GAME SAVED` |
| 7 | **Payment success** — level tally | amount counts up like a score, flag waves | tallying → `COURSE CLEAR` |
| 8 | **404 / empty** — snake | a pixel snake eats dots; `GAME OVER · press any key` | playing → game over → home |
| 9 | **Session timeout** — hurry up | music speeds up, "+30s" power-up | warning → hurry → extended / timed out |
| 10 | **Human check** — 5-second rally | one paddle rally or one brick hit instead of a captcha | serve → hit → `HUMAN CONFIRMED` |

## Rules for every screen

- Real inputs underneath (native fields, autofill, keyboard, screen readers) — the game is the feedback, never a barrier.
- `prefers-reduced-motion` skips to the end state; sound is off until the first interaction and always mutable.
- Phone and desktop layouts, full page, ImliStack credit line.
- `npm run demo` records each screen for the README.
