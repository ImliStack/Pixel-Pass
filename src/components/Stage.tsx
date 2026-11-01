import { AnimatePresence, motion, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PixelSprite } from '../sprites/PixelSprite';
import { bush, castle, castlePalette, cloud, flag, flagPalette, heart, heartPalette, hero, heroPalette, hill, royal, royalPalette, sceneryPalette } from '../sprites/data';
import type { CoinFx, DebrisFx, DustFx, Pose } from '../machine/useOtpFlow';
import { HERO_H, HERO_W, POLE_H, SKY_H, finaleLayout } from '../machine/useOtpFlow';
import { MAX_LIVES } from '../machine/otpMachine';

const BUBBLE_W = 190;
// Idle blink: the standing frame with the eye pixels painted over in skin colour
const heroBlink = hero.stand.map((row) => row.replace(/K/g, 'S'));

type Props = {
  heroX: MotionValue<number>;
  heroY: MotionValue<number>;
  pose: Pose;
  facing: 1 | -1;
  coins: CoinFx[];
  dust: DustFx[];
  debris: DebrisFx[];
  bubble: boolean;
  lives: number;
  finale: { castle: boolean; flag: boolean; flagDown: boolean; royal: boolean; heart: boolean };
  stageWidth: number;
};

/** The sky between the slots and the ground, plus the ground itself. */
export function Scene({ heroX, heroY, pose, facing, coins, dust, debris, bubble, lives, finale, stageWidth }: Props) {
  // The speech bubble rides above the hero, clamped inside the stage
  const bubbleX = useTransform(heroX, (x) => Math.max(10, Math.min(stageWidth - BUBBLE_W - 10, x + HERO_W - BUBBLE_W + 14)));
  const blinking = useBlink(pose === 'stand');
  const center = stageWidth / 2;
  // Castle sits at the right edge on phones, but stays near the action on wide screens
  const { castleX, flagX } = finaleLayout(stageWidth);
  return (
    <>
      <Scenery />
      <div className="sky" style={{ height: SKY_H }}>
        {debris.map((d) =>
          [-15, -5, 5, 15].map((dx, k) => (
            <motion.span
              key={`${d.id}${k}`}
              className="debris"
              style={{ left: d.x - 5 + dx * 0.6, top: -36 + (k % 2) * 12 }}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{ x: dx * 2.2, y: [0, -26 - (k % 2) * 10, 120], rotate: dx * 14, opacity: [1, 1, 0] }}
              transition={{ duration: 0.85, ease: [0.3, 0, 0.8, 1], times: [0, 0.3, 1] }}
            />
          )),
        )}
        {coins.map((c) => (
          <motion.span
            key={c.id}
            className="coin"
            style={{ left: c.x - 6, top: -8 }}
            initial={{ y: 0, opacity: 1, scaleX: 1 }}
            animate={{ y: -56, opacity: [1, 1, 0], scaleX: [1, 0.25, 1, 0.25, 1] }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        <AnimatePresence>
          {bubble && (
            <motion.div
              className="bubble"
              style={{ left: bubbleX, width: BUBBLE_W }}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            >
              <strong>Wrong code!</strong>
              <span className="bubble-fix">
                Type all 4 again · <b className="chip-red">♥ {lives}/{MAX_LIVES}</b>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="hero" style={{ x: heroX, y: heroY, width: HERO_W, height: HERO_H }}>
          <PixelSprite grid={blinking ? heroBlink : hero[pose]} palette={heroPalette} px={3} flip={facing < 0} />
        </motion.div>

        {dust.map((d) =>
          [-1, 1].map((dir) => (
            <motion.span
              key={`${d.id}${dir}`}
              className="dust"
              style={{ left: d.x - 3 }}
              initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
              animate={{ x: dir * 16, y: -6, opacity: 0, scale: 0.4 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )),
        )}

        <AnimatePresence>
          {finale.flag && (
            <motion.div
              key="flag"
              className="flagpole"
              style={{ left: flagX, height: POLE_H }}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <motion.span
                className="flag"
                initial={false}
                animate={{ y: finale.flagDown ? POLE_H - 30 : 8 }}
                transition={{ duration: 0.6, ease: 'linear' }}
              >
                <PixelSprite grid={flag} palette={flagPalette} px={3} flip />
              </motion.span>
            </motion.div>
          )}
          {finale.castle && (
            <motion.div
              key="castle"
              className="castle"
              style={{ left: castleX }}
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <PixelSprite grid={castle} palette={castlePalette} px={3} />
            </motion.div>
          )}
          {finale.royal && (
            <motion.div
              key="royal"
              className="royal"
              initial={{ x: castleX + 12, opacity: 0 }}
              animate={{ x: center + 6, opacity: 1, y: [0, -2, 0, -2, 0, -2, 0] }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <PixelSprite grid={royal} palette={royalPalette} px={3} />
            </motion.div>
          )}
          {finale.heart && <Fireworks key="fireworks" x={castleX + 24} />}
          {finale.heart && (
            <motion.div
              key="heart"
              className="heart"
              style={{ left: center - 2 }}
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: [0, 1.3, 1], y: [10, -6, 0] }}
              transition={{ duration: 0.45 }}
            >
              <PixelSprite grid={heart} palette={heartPalette} px={2} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="ground" />
    </>
  );
}

/** Blink every few seconds while the hero stands still. */
function useBlink(enabled: boolean) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (!enabled) return setBlink(false);
    let to: ReturnType<typeof setTimeout>;
    const loop = () => {
      to = setTimeout(() => {
        setBlink(true);
        to = setTimeout(() => {
          setBlink(false);
          loop();
        }, 130);
      }, 2200 + Math.random() * 2200);
    };
    loop();
    return () => clearTimeout(to);
  }, [enabled]);
  return blink;
}

/** Soft background scenery: drifting clouds, two hills and a couple of bushes. Never animates near the slots. */
function Scenery() {
  return (
    <div className="scenery" aria-hidden="true">
      <span className="cloud cloud--a"><PixelSprite grid={cloud} palette={sceneryPalette} px={4} /></span>
      <span className="cloud cloud--b"><PixelSprite grid={cloud} palette={sceneryPalette} px={3} /></span>
      <span className="hill hill--a"><PixelSprite grid={hill} palette={sceneryPalette} px={4} /></span>
      <span className="hill hill--b"><PixelSprite grid={hill} palette={sceneryPalette} px={3} /></span>
      <span className="bush bush--a"><PixelSprite grid={bush} palette={sceneryPalette} px={3} /></span>
      <span className="bush bush--b"><PixelSprite grid={bush} palette={sceneryPalette} px={2} /></span>
    </div>
  );
}

// Three small pixel bursts over the castle: square sparks fly out, drift down and fade
const BURSTS = [
  { dx: -10, dy: -150, delay: 0, color: '#fcc93a' },
  { dx: -70, dy: -120, delay: 0.35, color: '#1fa25c' },
  { dx: 30, dy: -105, delay: 0.7, color: '#e5484d' },
];
function Fireworks({ x }: { x: number }) {
  return (
    <motion.div className="fireworks" style={{ left: x }} exit={{ opacity: 0 }} aria-hidden="true">
      {BURSTS.map((b, i) =>
        Array.from({ length: 10 }, (_, k) => {
          const a = (k / 10) * Math.PI * 2;
          return (
            <motion.span
              key={`${i}-${k}`}
              className="spark"
              style={{ left: b.dx, top: b.dy, background: b.color }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
              animate={{ x: Math.cos(a) * 34, y: [0, Math.sin(a) * 34, Math.sin(a) * 34 + 18], opacity: [0, 1, 0], scale: [0.6, 1, 0.5] }}
              transition={{ duration: 1.1, delay: b.delay, ease: 'easeOut', repeat: 1, repeatDelay: 1.2 }}
            />
          );
        }),
      )}
    </motion.div>
  );
}
