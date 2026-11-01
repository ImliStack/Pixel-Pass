# UI research: what else Pixel Pass could do

Research date: 2026-11-01. Sources: animated OTP components on GitHub, 21st.dev and pub.dev,
playful-login examples (Rive, Framer, freefrontend), Vercel's Geist Pixel launch, and web-haptics write-ups.
No public source for the original Mario-style OTP video was found.

## What others do (and what we already beat)

| Pattern seen | Where | Pixel Pass today |
|---|---|---|
| Digits pop / spring in, glow focus ring, shake on error | 21st.dev OTP inputs, `alqamarzz/otp-code-input` | ✅ pop-in; ❌ no shake on wrong blocks |
| Boxes become the loader (orbit into a spinner → check) | `arslanagayev/otp-verify-animation`, Flutter `otp_animated_fields` | ✅ our merge-into-check is the same idea, more playful |
| Mascot that chomps each digit and walks the row | Flutter `premium_otp_input` "Blob Mascot Arcade" | ✅ the hero does this; ✅ ours gives per-digit feedback, theirs doesn't |
| Single "ribbon" instead of separate boxes | 21st.dev Ribbon OTP | — different style, not needed |
| Character covers its eyes on password focus | Rive / Framer login demos | idea for the **login** screen |
| Pixel display type for "game" text, readable sans for body | Geist Pixel (Vercel, Feb 2026), Departure Mono (OFL) | ⚠️ we use Press Start 2P only for the `?`; it's hard to read |
| Haptics on the web | `web-haptics` (iOS 17.4+ switch trick, Android `navigator.vibrate`) | ❌ none |

## Fonts

1. **Add one pixel font for game text only**: timer chip, demo-code chip, speech bubble title, toast title,
   the `?` block and coin counters. Candidates: **Departure Mono** (SIL OFL, monospaced, very readable)
   or **Geist Pixel** (Vercel, 5 variants: Square/Grid/Circle/Triangle/Line, metrics matched to Geist).
   Keep Archivo Expanded for headings and Inter for body; the video's look depends on that wide heading.
2. **Self-host the fonts** (`@fontsource/*` or files in `public/fonts`) instead of Google Fonts: no
   third-party request, no flash of fallback text in the demo, works offline.
3. **Tabular, slashed-free digits** in the slots (`font-variant-numeric: tabular-nums`) so 1 and 7 don't
   shift width while the blocks bump.

## UI ideas, ranked (impact ÷ effort)

| # | Idea | Why | Effort |
|---|---|---|---|
| 1 | **Lives = rate limit.** 3 pixel hearts top-left; each wrong attempt loses one; at 0: *GAME OVER — new code sent* (forces a resend) | Turns the security caveat (per-digit feedback is guessable) into a game rule users instantly understand | S |
| 2 | **Random toast pool** per tier (first try / one retry / more), never the same twice in a row | Variety for repeat visits; small copy job | XS |
| 3 | **Shake + red flash** on wrong blocks, small dust puff when the hero lands | Matches what every polished OTP input does; makes errors readable at a glance | XS |
| 4 | **Haptics**: light tap on bump, double tap on wrong, success pattern on verify (iOS switch trick + Android vibrate) | Phone feels "physical", big for the Flutter version too | S |
| 5 | **Shareable run card** (Wordle-style): `Pixel Pass 🟩🟥🟥🟥 → 🟩🟩🟩🟩 · 6.4 s` + copy button | Viral loop; reveals nothing about the code | S |
| 6 | **Hero anticipation**: walks under the slot you're typing in, blinks/taps foot when idle, looks up at new digits | Makes the scene feel alive before the check starts | S |
| 7 | **Resend as a power-up**: when the timer hits 0 a `↻` block appears; the hero bumps it to resend | Replaces a plain link with something people want to press | S |
| 8 | **Night level (dark mode)** via `prefers-color-scheme`: stars, moonlit bricks, glowing coins | Expected in 2026; gorgeous with pixel art | M |
| 9 | **Parallax scenery**: slow clouds and hills behind the ground on wide screens | Fills empty desktop space; paused for reduced motion | S |
| 10 | **Coin score** that counts up (+10 per correct digit, bonus for first try) shown in the toast | Gives the finale a number to brag about; feeds the share card | XS |
| 11 | **Accessibility pass**: `aria-live` lines ("Digit 2 is wrong"), skip-animation button, visible focus ring | Required before real use; screen readers currently get nothing during the check | S |
| 12 | **Character skins** (pick hero colours) | Bridges to the character-select signup screen | M |

## Status

Shipped (first batch): fonts 1–3 (Geist Pixel for game text, self-hosted fonts, tabular digits) and ideas
1 (lives / game over), 2 (random toast pool), 3 (shake, red flash, landing dust), 6 (hero follows the
active slot, hops, blinks) and 11 (live-region narration, Skip button, focus ring).

## Recommended first batch

Fonts 1–3 plus ideas **1, 2, 3, 6, 11**. That makes it nicer (fonts, shake, a livelier hero), more
honest (lives as the rate limit) and accessible, without changing the flow you liked.

## Sources

- https://github.com/arslanagayev/otp-verify-animation
- https://github.com/alqamarzz/otp-code-input
- https://21st.dev/@dev.yadhakim/components/otp-input
- https://21st.dev/@ham7a311/components/ribbon-otp.md
- https://pub.dev/documentation/premium_otp_input/0.5.1/
- https://pub.dev/packages/otp_animated_fields
- https://vercel.com/blog/introducing-geist-pixel
- https://social.omgmog.net/2024/-departure-mono-is-a-monospaced-pixel
- https://contra.com/p/ks3NMZRZ-interactive-login-page-with-reactive-animation
- https://azukiazusa.dev/en/blog/ios-safari-web-haptics
- https://www.mintlify.com/lochie/web-haptics/advanced/browser-support
