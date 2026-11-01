import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Phase } from '../machine/otpMachine';
import { DEMO_CODE, MASKED_PHONE } from '../lib/verify';
import { PixelSprite } from '../sprites/PixelSprite';
import { royal, royalPalette } from '../sprites/data';

export function Header({ muted, onClose, onToggleSound }: { muted: boolean; onClose: () => void; onToggleSound: () => void }) {
  return (
    <header className="topbar">
      <button className="icon-btn" onClick={onClose} aria-label="Close">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <button className="icon-btn" onClick={onToggleSound} aria-label={muted ? 'Unmute' : 'Mute'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 9h3.5L12 5v14l-4.5-4H4z" />
          {muted ? (
            <path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          ) : (
            <path d="M15.5 8.5a5 5 0 010 7M18.3 6a8.5 8.5 0 010 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          )}
        </svg>
      </button>
    </header>
  );
}

export const GITHUB_URL = 'https://github.com/ImliStack/Pixel-Pass';
export const IMLISTACK_URL = 'https://imlistack.com';

/** Quiet credit line pinned to the bottom of the page. */
export function Credit() {
  return (
    <footer className="credit">
      <span className="credit-name">Pixel Pass</span>
      <a href={IMLISTACK_URL} target="_blank" rel="noopener">
        by <b>Imli</b>Stack
      </a>
      <a className="credit-gh" href={GITHUB_URL} target="_blank" rel="noopener" aria-label="Star Pixel Pass on GitHub">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
        </svg>
        Star on GitHub
      </a>
    </footer>
  );
}

export function Heading({ phase, attempts }: { phase: Phase; attempts: number }) {
  const variant = phase === 'verified' ? 'ok' : phase === 'failed' || attempts > 1 ? 'close' : 'start';
  const copy = {
    start: { title: 'Let’s verify your number', sub: [`We sent a 4-digit code to ${MASKED_PHONE}.`, 'It verifies on its own once entered.'] },
    close: { title: 'So close!', sub: ['Greens are right and stay locked.', 'Retype the red ones.'] },
    ok: { title: 'Verified', sub: ['You’re in.'] },
  }[variant];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={variant}
        className="heading"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22 }}
      >
        <h1>{copy.title}</h1>
        <p>
          {copy.sub.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </p>
      </motion.div>
    </AnimatePresence>
  );
}

export function Footer({ phase, resendIn, onResend }: { phase: Phase; resendIn: number; onResend: () => void }) {
  if (phase === 'verified') return null;
  const busy = phase === 'checking' || phase === 'merging';
  const mm = `0:${String(resendIn).padStart(2, '0')}`;
  return (
    <div className="footer">
      <div className="footer-line">
        {busy ? (
          <span className="checking">
            Checking <Dots />
          </span>
        ) : resendIn > 0 ? (
          <>
            Didn’t get it? Resend in <span className="chip chip-mono">{mm}</span>
          </>
        ) : (
          <>
            Didn’t get it?{' '}
            <button className="link" onClick={onResend}>
              Resend code
            </button>
          </>
        )}
      </div>
      <div className="demo">
        Demo code <span className="chip chip-gold">{DEMO_CODE}</span>
      </div>
    </div>
  );
}

function Dots() {
  return (
    <span className="dots" aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

// Success toast copy, by number of attempts
const TOAST_COPY: [string, string][] = [
  ['Perfect run!', 'First try, every block right.'],
  ['Level clear!', 'One retry, and you’re in.'],
  ['Persistence pays!', 'A few tries, but you made it.'],
];

export function Toast({ attempts }: { attempts: number }) {
  const [title, sub] = TOAST_COPY[Math.min(Math.max(attempts, 1), TOAST_COPY.length) - 1];
  const t = useTypewriter(title, 0);
  const s = useTypewriter(sub, title.length * 35 + 150);
  return (
    <motion.div
      className="toast"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      role="status"
    >
      <div className="toast-avatar">
        <PixelSprite grid={royal} palette={royalPalette} px={3} rows={11} />
      </div>
      <div>
        <strong>{t}</strong>
        <span>{s}</span>
      </div>
    </motion.div>
  );
}

function useTypewriter(text: string, delay: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    let iv: ReturnType<typeof setInterval>;
    const to = setTimeout(() => {
      iv = setInterval(() => setN((k) => (k >= text.length ? (clearInterval(iv), k) : k + 1)), 35);
    }, delay);
    return () => {
      clearTimeout(to);
      clearInterval(iv);
    };
  }, [text, delay]);
  return text.slice(0, n);
}
