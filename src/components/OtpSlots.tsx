import { AnimatePresence, motion } from 'framer-motion';
import type { MutableRefObject } from 'react';
import type { Phase, Slot } from '../machine/otpMachine';
import { activeIndex, canType } from '../machine/otpMachine';
import type { MergeStep } from '../machine/useOtpFlow';
import { CheckBlock } from './CheckBlock';

type Props = {
  slots: Slot[];
  phase: Phase;
  bumps: number[];
  mergeStep: MergeStep;
  mergeBump: number;
  slotRefs: MutableRefObject<(HTMLDivElement | null)[]>;
  focused: boolean; // hidden input has focus → show a ring on the active slot
  onFocus: () => void;
};

export function OtpSlots({ slots, phase, bumps, mergeStep, mergeBump, slotRefs, focused, onFocus }: Props) {
  const active = canType(phase) ? activeIndex(slots) : -1;

  if (phase === 'verified') {
    return (
      <div className="slots-row">
        <CheckBlock />
      </div>
    );
  }

  if (mergeStep === 'block' || mergeStep === 'green') {
    return (
      <div className="slots-row">
        <motion.div
          key={`merge-${mergeBump}`}
          className={`slot ${mergeStep === 'green' ? 'slot--correct' : 'slot--pending'} slot--q`}
          initial={{ scale: mergeBump ? 1 : 0.9, y: 0 }}
          animate={mergeBump ? { y: [0, -14, 0], scale: 1 } : { scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          <span className="q">?</span>
        </motion.div>
      </div>
    );
  }

  const center = (slots.length - 1) / 2;
  // Distance between neighbouring slots, measured so it follows the responsive --slot size
  const [a, b] = slotRefs.current;
  const step = a && b ? b.offsetLeft - a.offsetLeft : 72;

  return (
    // Visual only: screen readers get the hidden input plus the live announcements
    <div className={`slots-row${focused ? ' slots-row--focused' : ''}`} onClick={onFocus} aria-hidden="true">
      {slots.map((s, i) => {
        const cls = [
          'slot',
          `slot--${s.status}`,
          i === active ? 'slot--active' : '',
        ].join(' ');
        return (
          <motion.div
            key={i}
            ref={(el) => (slotRefs.current[i] = el)}
            className="slot-wrap"
            animate={
              mergeStep === 'stack'
                ? { x: (center - i) * step, opacity: i === 0 ? 1 : 0.6 }
                : { x: 0, opacity: 1 }
            }
            transition={{ duration: 0.34, ease: 'easeInOut' }}
          >
            {/* wrong digits shake once and flash red (CSS), separate from the bump transform */}
            <div className={s.status === 'wrong' ? 'shaker shaker--on' : 'shaker'}>
            <motion.div
              key={bumps[i]}
              className={cls}
              initial={{ y: 0 }}
              animate={{ y: bumps[i] ? [0, -14, 0] : 0 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {s.digit ? (
                  <motion.span
                    key={s.digit + s.status}
                    className="digit"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                  >
                    {s.digit}
                  </motion.span>
                ) : i === active ? (
                  <span key="cursor" className="cursor" />
                ) : null}
              </AnimatePresence>
              {s.status === 'pending' && <Rivets />}
            </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function Rivets() {
  return (
    <>
      <i className="rivet" style={{ top: 6, left: 6 }} />
      <i className="rivet" style={{ top: 6, right: 6 }} />
      <i className="rivet" style={{ bottom: 8, left: 6 }} />
      <i className="rivet" style={{ bottom: 8, right: 6 }} />
    </>
  );
}
