# Login screen research: 90s game ideas for a real sign-in

Research date: 2026-11-03. Goal: a login screen as playful as the OTP screen, but still a login
people (and password managers) trust.

## 1. What exists today

| Found | Where | Takeaway |
|---|---|---|
| **Yeti login**: mascot follows your email as you type, covers its eyes on the password field | Darin Senneff, [CodeMyUI](https://codemyui.com/signup-password-field-reaction-yeti-mascot-login-form/), [GitHub](https://github.com/shift-base/yeti-login) | The best-known playful login. The "eyes covered" moment doubles as a privacy cue. |
| Teddy bear covers its eyes on password | QClay childcare app, [HTMLBurger list](https://htmlburger.com/blog/login-design-examples/) | Same pattern; people instantly understand it. |
| **Pac-Man show/hide password** | [freefrontend](https://freefrontend.com/javascript-input-text/), [CodePen hexagoncircle](https://codepen.io/hexagoncircle/pen/XEYBBp) | Game characters can *be* a control (the reveal toggle), not just decoration. |
| 8-bit login forms (pixel borders, Press Start font) | [21st.dev OrcDev](https://21st.dev/@theorcdev/components/8bit-login-form.md), [8bitcn blocks](https://www.8bitcn.com/docs/blocks/authentication), [Pixel-art-8-bit](https://github.com/Team-Parashuram/Pixel-art-8-bit) | Mostly a *skin*: pixel styling, no story or feedback. This is the gap we fill. |
| "Insert coin to continue" gate | [Hugging Face arcade demo](https://huggingface.co/spaces/Hawkwind/mbti-personality-arcade/blob/main/index.html) | Coin-slot gate works as a "press start" before the form. |
| Duolingo-style mascots in Rive | [DEV Community](https://dev.to/uianimation/how-duolingo-style-mascot-animations-in-rive-can-supercharge-your-app-or-website-39l) | Characters that react to state make forms feel alive. |

**Gap:** nobody has a login with a *story*: a character, a goal, a clear win and a clear fail.
Existing "retro logins" only change fonts and borders.

## 2. 90s game mechanics that map to login

| Game mechanic (genre, not a specific game) | Login meaning |
|---|---|
| **Password / continue codes** (NES-era save system: type a code to resume) | Logging in literally *is* "continue where you left off" |
| **Save files** (FILE 1 / FILE 2 / FILE 3 on the title screen) | Remembered accounts / recent emails |
| **"CONTINUE? 9…8…7"** countdown | A lockout timer after too many wrong attempts |
| **Credits / lives** | Attempt limit (rate limiting) |
| **High-score initials** (3 letters, arcade) | Showing who's signing in ("WELCOME BACK, SHA") |
| **Insert coin / press start** attract screen | First screen before the form |
| **Castle gate + guard** (adventure/RPG) | A gatekeeper who checks your pass |
| **Key + locked door / treasure chest** | Password as a key; success opens the door |
| **Level 1-1 → 1-2** | Login then OTP as two levels of one world |

Sources: NES password systems ([csanyk](https://csanyk.com/tag/save-code/), [Punch-Out passwords](https://tomorrowcorporation.com/posts/retro-game-internals-punch-out-passwords), [Castlevania III](https://meatfighter.com/castlevania3-password)), arcade initials ([Arcade Blogger](https://arcadeblogger.com/2021/01/31/anatomy-of-arcade-high-score-tables/), [Den of Geek](https://www.denofgeek.com/games/first-video-game-high-score-invented-history)).

## 3. Rules a real login must keep (non-negotiable)

From [web.dev passkey checklist](https://web.dev/articles/passkey-checklist), [Authgear login UX guide](https://www.authgear.com/post/login-signup-ux-guide/), [Cieden](https://cieden.com/book/pages-and-flows/login/login-page-design), [accessible authentication](https://uiux-atlas.pages.dev/lessons/accessibility/accessible-authentication):

1. **Real `<input>`s** with `autocomplete="username"` / `"current-password"` so password managers and passkey autofill work. Never block paste.
2. **Generic error**: "Email or password is wrong", never which one (prevents account discovery).
3. **Keep the email, clear the password** after a failed attempt.
4. **Show/hide password** toggle.
5. **Rate limit**: a few attempts, then a short lockout + "Forgot password?".
6. **Passkey / SSO** as equal options, not hidden.
7. Nothing animates near the fields while typing (the rule from the OTP screen), reduced motion, screen-reader narration.

## 4. Concepts

| # | Concept | Story | Score* |
|---|---|---|---|
| **A** | **Castle Gate** (recommended) | A pixel guard stands at a castle gate. He follows your email with his eyes, **lowers his visor** when you type the password (privacy cue), checks your pass, and the gate rises for the hero. Wrong → "HALT!" and the gate slams; 3 hearts; out of hearts → a **CONTINUE? 30…29…** lockout countdown. Success → hero walks in → **World 1-2: the OTP screen**. | ★★★★★ |
| B | Insert Coin arcade | Attract screen with blinking PRESS START. Fields look like a high-score row. Submit = a coin drops into the slot. Wrong → "CONTINUE? 9…8…". Success → "PLAYER 1 READY" and your initials top the high-score table. | ★★★★ |
| C | Save files | Title screen with FILE 1–3 cards (remembered accounts, last played). Pick a file → password → "LOADING SAVE…" bar → back in game. New account = empty file. | ★★★★ (great as part of A) |
| D | Key & treasure chest | Password forges a key; submit → hero opens a chest, holds the key up with a fanfare. Wrong → key snaps. | ★★★ |
| E | Coin-masked password | Each typed character shows a spinning coin instead of •; the show-password toggle is a power-up block. | ★★★ (a detail inside A) |
| F | Fighting-game "VS" screen | You vs a "password boss" with health bars. | ★★ (too aggressive for sign-in) |

\*Score = delight × continuity with the OTP screen × safety for a real login.

## 5. Recommended: "Castle Gate" (A, with C and E as details)

**Why:** it reuses the OTP world (hero, ground, castle, hearts, coins), gives login its own
character (the guard), uses the strongest proven pattern (eyes covered on password), and turns the
security rules into game rules (hearts = attempts, CONTINUE countdown = lockout). Login and OTP
become **World 1-1 → 1-2** of one game.

### Flow

| Phase | What happens |
|---|---|
| `idle` | *Welcome back*. Castle gate (portcullis down), guard beside it, hero on the left. Hearts + coins HUD. Optional save-file chips for remembered emails. |
| `email` | Guard's eyes track the caret across the email field (only the guard's eyes move; nothing near the field). |
| `password` | Guard **lowers his visor**. Typed characters show as small coins (E). Show-password = a ? block button: guard peeks while it's on. |
| `checking` | Hero walks to the gate and hands over a pass; guard reads it (dots). Skip button. |
| `wrong` | Guard raises his spear: **"HALT! Email or password is wrong."** Gate stays shut, a heart is lost, the password clears, the email stays. |
| `locked` | Out of hearts: **CONTINUE? 30…29…** countdown (the lockout), with "Forgot password?" as the way out. |
| `success` | Guard salutes, portcullis rises, hero walks in, "WORLD 1-2" card → OTP screen (or a demo toast). |

### Extras (optional)

- **Passkey** button styled as a golden key: "Use a passkey" skips the guard check with a shortcut animation.
- **Konami-style easter egg** (↑↑↓↓←→←→) unlocks a hero skin. Fun, harmless, discoverable.

### Demo credentials

`player1@pixelpass.dev` / a demo password shown on screen like the OTP demo code.

## 6. Questions before building

1. Concept A (castle gate) as recommended, or B (insert coin)?
2. Should a successful login lead straight into the existing OTP screen (World 1-2)?
3. Include remembered-account "save files" and the passkey button, or keep v1 to email + password?

## 7. v2 after a design review (2026-11-03)

Images: `docs/login-concept.png` (v1) → `docs/login-concept-v2.png` (v2, phone states + desktop).

| v1 problem | v2 fix | Why (source) |
|---|---|---|
| Guard was tiny (48 px); the eye-tracking was hard to notice | Bigger cast (guard 4×, castle 7×), torches by the gate; desktop scene 2.3× | Character logins work when the character is large and central ([Rive teddy login](https://rive.app/blog/animated-login-screen-design), [Rive site login in Eleken's list](https://www.eleken.co/blog-posts/login-page-examples)) |
| Comic speech bubbles covered the scene and repeated the error | A 90s **RPG dialogue box** (portrait, GATE GUARD, ▼) under the scene that *leads* the form: "Your email, please" → "Visor down, I won't peek" | Dialogue boxes are the most recognisable 90s game UI ([JRPG menu guide](https://ggprompts.github.io/htmlstyleguides/styles/jrpg-menu.html)) |
| Password shown as gold coins read like "0000000" | Square pixel dots + a labelled **Show** button | Clear, labelled show/hide control ([NN/g via CXL](https://cxl.com/password-ux/)) |
| Error only in a bubble, far from the field | Inline error right under the password field; the guard's line is flavour | Inline errors get fixed fastest ([Nomensa](https://nomensa.com/blog/ux-design-four-ways-display-error-messages), [Baymard](https://baymard.com/research-articles/inline-form-validation)) |
| Lockout countdown covered the scene | Countdown lives in the button ("Try again in 0:27"); "Forgot password?" turns into a highlighted button | The answer appears where the user is about to click |
| Coin counter meant nothing on login; two headings | HUD is just LIVES; one "Sign in" title + a WORLD 1-1 tag | Fewer competing elements |
| Demo credentials were chips you had to copy | "▸ Use demo account" fills the form | Faster demo, no typing |
| Desktop was a stretched phone | Split screen: big scene + dialogue left, calm form right | Common award-site login layout ([Eleken](https://www.eleken.co/blog-posts/login-page-examples), [Justinmind](https://www.justinmind.com/blog/inspiring-website-login-form-pages/)) |
