import { motion, type MotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PixelSprite } from '../sprites/PixelSprite';
import { castle, castlePalette, cloud, guard, guardPalette, hero, heroPalette, hill, sceneryPalette } from '../sprites/data';

export type GuardFace = keyof typeof guard;
export type HeroPose = 'stand' | 'runA' | 'runB';

/** Scene geometry for a given width and zoom; shared with the director so walks line up. */
export function sceneLayout(width: number, zoom: number) {
  const castlePx = 7 * zoom;
  const castleW = 16 * castlePx;
  const castleX = width - castleW - Math.max(18, width * 0.05);
  const guardX = castleX - 64 * zoom;
  const heroW = 36 * zoom;
  return {
    castlePx,
    castleX,
    guardX,
    heroStart: Math.max(16, width * 0.06),
    heroAtGuard: guardX - heroW - 14 * zoom,
    heroAtDoor: castleX + 8 * castlePx - heroW / 2,
    height: 176 * zoom,
  };
}

type Props = {
  width: number;
  zoom: number;
  face: GuardFace;
  spearDown: boolean; // spear crossed in front of the gate
  gateOpen: boolean;
  heroX: MotionValue<number>;
  heroPose: HeroPose;
  heroInside: boolean;
};

export function LoginScene({ width, zoom, face, spearDown, gateOpen, heroX, heroPose, heroInside }: Props) {
  const L = sceneLayout(width, zoom);
  const doorW = 4 * L.castlePx;
  const doorH = 5 * L.castlePx;
  return (
    <div className="login-scene" style={{ height: L.height }} aria-hidden="true">
      <span className="ls-abs ls-cloud" style={{ top: 8 * zoom, left: -10 }}>
        <PixelSprite grid={cloud} palette={sceneryPalette} px={4 * zoom} />
      </span>
      <span className="ls-abs ls-cloud ls-cloud--b" style={{ top: 24 * zoom, left: width * 0.45 }}>
        <PixelSprite grid={cloud} palette={sceneryPalette} px={3 * zoom} />
      </span>
      <span className="ls-abs" style={{ bottom: 16, left: -30 }}>
        <PixelSprite grid={hill} palette={sceneryPalette} px={5 * zoom} />
      </span>

      <span className="ls-abs" style={{ bottom: 16, left: L.castleX }}>
        <PixelSprite grid={castle} palette={castlePalette} px={L.castlePx} />
      </span>
      {/* portcullis: bars slide up into the wall when the gate opens */}
      <div className="ls-door" style={{ left: L.castleX + 6 * L.castlePx, width: doorW, height: doorH }}>
        <motion.div className="ls-bars" initial={false} animate={{ y: gateOpen ? '-92%' : '0%' }} transition={{ duration: 0.7, ease: 'easeInOut' }} />
      </div>
      <span className="ls-torch" style={{ left: L.castleX + 3 * L.castlePx, bottom: 16 + 5 * L.castlePx }} />
      <span className="ls-torch" style={{ left: L.castleX + 12 * L.castlePx, bottom: 16 + 5 * L.castlePx }} />

      <motion.span
        className="ls-spear"
        style={{ left: L.guardX + 48 * zoom, bottom: 28 * zoom, height: 96 * zoom }}
        initial={false}
        animate={{ rotate: spearDown ? -32 : 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 16 }}
      />
      <motion.span
        className="ls-abs"
        style={{ bottom: 16, left: L.guardX }}
        animate={spearDown ? { x: [0, -4, 4, -3, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <PixelSprite grid={guard[face]} palette={guardPalette} px={4 * zoom} />
      </motion.span>

      <motion.span
        className="ls-abs ls-hero"
        style={{ bottom: 16, x: heroX }}
        animate={{ opacity: heroInside ? 0 : 1 }}
        transition={{ duration: 0.35 }}
      >
        <PixelSprite grid={hero[heroPose]} palette={heroPalette} px={3 * zoom} />
      </motion.span>

      <div className="ground" />
    </div>
  );
}

/** 90s RPG dialogue box: portrait, name, typed-out line and a blinking ▼. */
export function Dialogue({ face, text }: { face: GuardFace; text: string }) {
  const typed = useTypewriter(text);
  return (
    <div className="ls-dialogue">
      <div className="ls-face">
        <PixelSprite grid={guard[face]} palette={guardPalette} px={4} rows={8} />
      </div>
      <div>
        <div className="ls-who">GATE GUARD</div>
        <p className="ls-say">
          <span className="ls-typed" aria-hidden="true">{typed}</span>
          {/* full line for screen readers and to reserve height */}
          <span className="ls-ghost">{text}</span>
        </p>
      </div>
      <span className="ls-next" aria-hidden="true">▼</span>
    </div>
  );
}

function useTypewriter(text: string) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return setN(text.length);
    setN(0);
    const iv = setInterval(() => setN((k) => (k >= text.length ? (clearInterval(iv), k) : k + 1)), 18);
    return () => clearInterval(iv);
  }, [text]);
  return text.slice(0, n);
}
