import { AnimatePresence, animate, motion, useMotionValue } from 'framer-motion';
import { useEffect, useReducer, useRef, useState } from 'react';
import { Credit, Header, Lives } from '../components/Chrome';
import { setMuted } from '../lib/sound';
import { sfx } from '../lib/sound';
import { DEMO_EMAIL, DEMO_PASSWORD, verifyLogin } from '../lib/verify';
import { PixelSprite } from '../sprites/PixelSprite';
import { hero, heroPalette } from '../sprites/data';
import { Dialogue, LoginScene, sceneLayout, type GuardFace, type HeroPose } from './LoginScene';
import { LOGIN_LIVES, canEdit, canSubmit, initialLogin, loginReducer, triesText } from './loginMachine';
import './login.css';

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const wait = (ms: number) => new Promise((r) => setTimeout(r, reducedMotion() ? 0 : ms));

type Focus = 'none' | 'email' | 'password';

export function LoginScreen({ onSignedIn }: { onSignedIn: () => void }) {
  const [state, dispatch] = useReducer(loginReducer, initialLogin);
  const [focus, setFocus] = useState<Focus>('none');
  const [caret, setCaret] = useState(0); // email caret position, for the guard's eyes
  const [showPw, setShowPw] = useState(false);
  const [muted, setMutedState] = useState(false);
  const [aside, setAside] = useState(''); // one-off guard line (e.g. for the demo-only links)
  const [heroPose, setHeroPose] = useState<HeroPose>('stand');
  const [heroInside, setHeroInside] = useState(false);
  const [worldCard, setWorldCard] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const runId = useRef(0);

  // Scene size: phone = 1×, wide left column = scaled up
  const [width, setWidth] = useState(390);
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const zoom = width >= 560 ? Math.min(2.3, width / 320) : 1;
  const L = sceneLayout(width, zoom);

  const heroX = useMotionValue(L.heroStart);
  useEffect(() => {
    if (state.phase === 'idle' || state.phase === 'wrong' || state.phase === 'locked') heroX.set(L.heroStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, zoom]);

  // Lockout countdown
  useEffect(() => {
    if (state.phase !== 'locked') return;
    const iv = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(iv);
  }, [state.phase]);

  const walkTo = async (x: number) => {
    const id = runId.current;
    const from = heroX.get();
    if (reducedMotion() || Math.abs(x - from) < 2) return heroX.set(x);
    let flip = false;
    const iv = setInterval(() => setHeroPose((flip = !flip) ? 'runA' : 'runB'), 90);
    try {
      await animate(heroX, x, { duration: Math.min(0.9, Math.abs(x - from) / 420), ease: 'easeInOut' });
    } finally {
      clearInterval(iv);
      if (id === runId.current) setHeroPose('stand');
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit(state)) {
      (state.email.trim() ? passwordRef : emailRef).current?.focus();
      return;
    }
    const id = ++runId.current;
    setAside('');
    sfx.coin();
    dispatch({ type: 'SUBMIT' });
    const walk = walkTo(L.heroAtGuard);
    const [ok] = await Promise.all([verifyLogin(state.email, state.password), walk]);
    if (id !== runId.current) return;

    if (!ok) {
      if (state.lives - 1 <= 0) sfx.gameOver();
      else {
        sfx.wrong();
        sfx.fail();
      }
      dispatch({ type: 'FAIL' });
      await wait(450);
      if (id !== runId.current) return;
      walkTo(L.heroStart);
      passwordRef.current?.focus();
      return;
    }

    sfx.success();
    dispatch({ type: 'SUCCEED' });
    await wait(700); // gate rises
    if (id !== runId.current) return;
    await walkTo(L.heroAtDoor);
    setHeroInside(true);
    await wait(500);
    setWorldCard(true);
    await wait(1300);
    if (id === runId.current) onSignedIn();
  };

  const reset = () => {
    runId.current++;
    heroX.set(L.heroStart);
    setHeroPose('stand');
    setHeroInside(false);
    setWorldCard(false);
    setShowPw(false);
    setAside('');
    dispatch({ type: 'RESET' });
    emailRef.current?.focus();
  };

  // ---------- what the guard does and says ----------
  const { phase } = state;
  const emailRatio = state.email.length ? Math.min(1, caret / 22) : 0.5;
  const face: GuardFace =
    phase === 'success' ? 'happy'
    : phase === 'locked' || phase === 'checking' || focus === 'password' ? 'visor'
    : focus === 'email' ? (emailRatio < 0.34 ? 'left' : emailRatio > 0.66 ? 'right' : 'center')
    : 'center';
  const spearDown = phase === 'wrong' || phase === 'locked';

  const line =
    aside ? aside
    : phase === 'checking' ? 'Hmm… let me check the list…'
    : phase === 'success' ? `Welcome back, ${state.email.split('@')[0].toUpperCase()}! The gate is open. Onward to World 1-2 ▸`
    : phase === 'locked' ? 'Too many tries! The gate stays shut for a bit. “Forgot password?” is the side door.'
    : phase === 'wrong' ? 'HALT! That’s not on my list. Check it and try again.'
    : focus === 'password' ? '*clank* Visor down, I won’t peek. Now your password.'
    : 'Halt, traveller! Who goes there? Your email, please.';

  const errorId = 'login-error';
  const editable = canEdit(phase);

  return (
    <div className="device login">
      <Header
        muted={muted}
        lives={<Lives lives={state.lives} max={LOGIN_LIVES} label />}
        onClose={reset}
        onToggleSound={() => {
          setMuted(!muted);
          setMutedState(!muted);
        }}
      />

      <main className="login-main">
        <section className="login-stage">
          <div className="login-title login-title--stage">
            <h1>{phase === 'success' ? 'Welcome back!' : 'Sign in'}</h1>
            <span className="world-tag">WORLD 1-1</span>
          </div>
          <div ref={sceneRef} className="login-scene-wrap">
            <LoginScene width={width} zoom={zoom} face={face} spearDown={spearDown} gateOpen={phase === 'success'} heroX={heroX} heroPose={heroPose} heroInside={heroInside} />
          </div>
          <Dialogue face={face} text={line} />
        </section>

        <section className="login-panel">
          <div className="login-title login-title--panel">
            <h1>{phase === 'success' ? 'Welcome back!' : 'Sign in'}</h1>
            <p>Continue your game.</p>
          </div>

          <form className="login-form" onSubmit={submit} noValidate>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              ref={emailRef}
              className="login-input"
              type="email"
              name="username"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="you@example.com"
              value={state.email}
              disabled={!editable}
              onChange={(e) => {
                dispatch({ type: 'SET_EMAIL', value: e.target.value });
                setCaret(e.target.selectionStart ?? e.target.value.length);
              }}
              onSelect={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
              onFocus={() => setFocus('email')}
              onBlur={() => setFocus('none')}
            />

            <label htmlFor="login-password">Password</label>
            <div className={`login-input login-pw${phase === 'wrong' ? ' login-input--error' : ''}`}>
              <input
                id="login-password"
                ref={passwordRef}
                type={showPw ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={state.password}
                disabled={!editable}
                aria-invalid={phase === 'wrong'}
                aria-describedby={phase === 'wrong' ? errorId : undefined}
                onChange={(e) => dispatch({ type: 'SET_PASSWORD', value: e.target.value })}
                onFocus={() => setFocus('password')}
                onBlur={() => setFocus('none')}
              />
              <button type="button" className="login-show" aria-pressed={showPw} disabled={!editable} onClick={() => setShowPw((v) => !v)}>
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>

            {phase === 'wrong' && (
              <p id={errorId} className="login-error" role="alert">
                Email or password is wrong. {triesText(state.lives)}.
              </p>
            )}

            <button type="submit" className={`login-go${phase === 'locked' ? ' login-go--wait' : ''}`} disabled={!editable}>
              {phase === 'locked' ? (
                <span role="timer" aria-live="polite">Try again in 0:{String(state.lockoutIn).padStart(2, '0')}</span>
              ) : phase === 'checking' ? (
                'Checking…'
              ) : (
                <>
                  Sign in <kbd>↵</kbd>
                </>
              )}
            </button>

            <div className="login-links">
              <span>
                New here?{' '}
                <button type="button" className="login-link" onClick={() => setAside('The recruitment office is being built. For now, try the demo account below!')}>
                  Create account
                </button>
              </span>
              <button
                type="button"
                className={`login-link${phase === 'locked' ? ' login-link--hot' : ''}`}
                onClick={() => setAside('The side door isn’t built yet. In this demo, use the demo account below.')}
              >
                Forgot password?
              </button>
            </div>
          </form>

          <div className="login-demo">
            Just looking?{' '}
            <button
              type="button"
              disabled={!editable}
              onClick={() => {
                setAside('');
                dispatch({ type: 'FILL', email: DEMO_EMAIL, password: DEMO_PASSWORD });
              }}
            >
              ▸ Use demo account
            </button>
          </div>
        </section>
      </main>

      <Credit />

      <AnimatePresence>
        {worldCard && (
          <motion.div className="world-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="status">
            <PixelSprite grid={hero.runA} palette={heroPalette} px={5} />
            <div className="world-card__title">WORLD 1-2</div>
            <div className="world-card__sub">VERIFY YOUR EMAIL ▸</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
