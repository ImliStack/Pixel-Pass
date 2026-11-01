import { motion } from 'framer-motion';

const BURST = [
  { x: -150, y: -10 }, { x: -120, y: 60 }, { x: -70, y: -40 }, { x: -40, y: 70 },
  { x: 60, y: -36 }, { x: 110, y: 50 }, { x: 140, y: -6 }, { x: 160, y: 30 },
];

export function CheckBlock() {
  return (
    <div className="check-wrap">
      {[0, 1].map((k) => (
        <motion.span
          key={k}
          className="check-ring"
          initial={{ scale: 0.9, opacity: 0.9 }}
          animate={{ scale: 1.55, opacity: 0 }}
          transition={{ duration: 1.1, delay: 0.1 + k * 0.25, ease: 'easeOut' }}
        />
      ))}
      <motion.div
        className="check-block"
        initial={{ scale: 0.7, rotate: -8 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 14 }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" aria-label="Verified">
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            fill="none"
            stroke="#fff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.12 }}
          />
        </svg>
      </motion.div>
      {BURST.map((p, i) => (
        <motion.span
          key={i}
          className="coin"
          style={{ left: '50%', top: '50%' }}
          initial={{ x: -6, y: -10, opacity: 1, scaleX: 1 }}
          animate={{ x: [-6, p.x * 0.6, p.x], y: [-10, p.y - 60, p.y + 40], opacity: [1, 1, 0], scaleX: [1, 0.3, 1, 0.3, 1] }}
          transition={{ duration: 1.3, delay: i * 0.03, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
