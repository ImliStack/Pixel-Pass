import { AnimatePresence, motion, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useState } from 'react';
import { PixelSprite } from '../sprites/PixelSprite';
import { castle, castlePalette, heart, heartPalette, hero, heroPalette, royal, royalPalette } from '../sprites/data';
import type { CoinFx, DustFx, Pose } from '../machine/useOtpFlow';
import { HERO_H, HERO_W, SKY_H } from '../machine/useOtpFlow';
import { bubbleTitle } from '../machine/otpMachine';

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
  bubble: number[] | null;
  finale: { castle: boolean; royal: boolean; heart: boolean };
  stageWidth: number;
};

/** The sky between the slots and the ground, plus the ground itself. */
export function Scene({ heroX, heroY, pose, facing, coins, dust, bubble, finale, stageWidth }: Props) {
  // The speech bubble rides above the hero, clamped inside the stage
  const bubbleX = useTransform(heroX, (x) => Math.max(10, Math.min(stageWidth - BUBBLE_W - 10, x + HERO_W - BUBBLE_W + 14)));
  const blinking = useBlink(pose === 'stand');
  const center = stageWidth / 2;
  // Castle sits at the right edge on phones, but stays near the action on wide screens
  const castleX = center + Math.min(stageWidth / 2 - 62, 190);
  return (
    <>
      <div className="sky" style={{ height: SKY_H }}>
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
          {bubble && bubble.length > 0 && (
            <motion.div
              className="bubble"
              style={{ left: bubbleX, width: BUBBLE_W }}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            >
              <strong>{bubbleTitle(bubble.length)}</strong>
              <span className="bubble-fix">
                Fix{' '}
                {bubble.map((n, i) => (
                  <span key={n}>
                    <b className="chip-red">{n}</b>
                    {i < bubble.length - 2 ? ', ' : i === bubble.length - 2 ? ' and ' : ''}
                  </span>
                ))}
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
