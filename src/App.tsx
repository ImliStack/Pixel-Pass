import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Credit, Footer, Header, Heading, Toast } from './components/Chrome';
import { OtpSlots } from './components/OtpSlots';
import { Scene } from './components/Stage';
import { setMuted } from './lib/sound';
import { CODE_LENGTH, canType } from './machine/otpMachine';
import { useOtpFlow } from './machine/useOtpFlow';

export default function App() {
  const { state, input, reset, refs, scene } = useOtpFlow();
  const inputRef = useRef<HTMLInputElement>(null);
  const [muted, setMutedState] = useState(false);
  const [stageWidth, setStageWidth] = useState(390);
  // Remember the slots flagged on the last failure so empty retry slots keep a red hint
  const [retry, setRetry] = useState<number[] | null>(null);

  useEffect(() => {
    if (state.bubble) setRetry(state.bubble);
    if (state.phase === 'input') setRetry(null);
  }, [state.bubble, state.phase]);

  useEffect(() => {
    const el = refs.stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setStageWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [refs.stageRef]);

  const focus = () => inputRef.current?.focus({ preventScroll: true });
  useEffect(() => {
    if (canType(state.phase)) focus();
  }, [state.phase]);

  const verified = state.phase === 'verified';

  return (
    <div className="device" onClick={focus}>
      <Header
        muted={muted}
        onClose={reset}
        onToggleSound={() => {
          setMuted(!muted);
          setMutedState(!muted);
        }}
      />

      {/* Hidden native input captures keyboard, paste and SMS autofill */}
      <input
        ref={inputRef}
        className="sr-input"
        inputMode="numeric"
        autoComplete="one-time-code"
        aria-label={`Enter ${CODE_LENGTH}-digit code`}
        value=""
        onChange={(e) => {
          const v = e.target.value;
          if (v.length > 1) input.paste(v);
          else if (v) input.type(v);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Backspace') input.backspace();
        }}
        onPaste={(e) => {
          e.preventDefault();
          input.paste(e.clipboardData.getData('text'));
        }}
      />

      <motion.main
        className="content"
        animate={{ paddingTop: verified ? 150 : 0 }}
        transition={{ duration: 0.55, ease: [0.3, 0.8, 0.3, 1] }}
      >
        <Heading phase={state.phase} attempts={state.attempts} />

        <div className="stage" ref={refs.stageRef}>
          <OtpSlots
            slots={state.slots}
            phase={state.phase}
            retry={retry}
            bumps={scene.bumps}
            mergeStep={scene.mergeStep}
            mergeBump={scene.mergeBump}
            slotRefs={refs.slotRefs}
            onFocus={focus}
          />
          <Scene
            heroX={scene.heroX}
            heroY={scene.heroY}
            pose={scene.pose}
            facing={scene.facing}
            coins={scene.coins}
            bubble={state.bubble}
            bubbleX={scene.bubbleX}
            finale={scene.finale}
            stageWidth={stageWidth}
          />
        </div>

        <Footer phase={state.phase} resendIn={state.resendIn} onResend={input.resend} />

        <AnimatePresence>{scene.finale.toast && <Toast attempts={state.attempts} />}</AnimatePresence>
      </motion.main>

      <Credit />
    </div>
  );
}
