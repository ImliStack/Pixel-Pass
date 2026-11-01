import { AnimatePresence, motion, type MotionValue } from 'framer-motion';
import { PixelSprite } from '../sprites/PixelSprite';
import { castle, castlePalette, heart, heartPalette, hero, heroPalette, royal, royalPalette } from '../sprites/data';
import type { CoinFx, Pose } from '../machine/useOtpFlow';
import { HERO_H, HERO_W, SKY_H } from '../machine/useOtpFlow';
import { bubbleTitle } from '../machine/otpMachine';

type Props = {
  heroX: MotionValue<number>;
  heroY: MotionValue<number>;
  pose: Pose;
  facing: 1 | -1;
  coins: CoinFx[];
  bubble: number[] | null;
  bubbleX: number;
  finale: { castle: boolean; royal: boolean; heart: boolean };
  stageWidth: number;
};

/** The sky between the slots and the ground, plus the ground itself. */
export function Scene({ heroX, heroY, pose, facing, coins, bubble, bubbleX, finale, stageWidth }: Props) {
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
              style={{ left: bubbleX }}
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
          <PixelSprite grid={hero[pose]} palette={heroPalette} px={3} flip={facing < 0} />
        </motion.div>

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
