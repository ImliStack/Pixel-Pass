import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Credit, Footer, Header, Heading, Lives, Toast, pickToast } from './components/Chrome';
import { OtpSlots } from './components/OtpSlots';
import { Scene } from './components/Stage';
import { setMuted } from './lib/sound';
import { CODE_LENGTH, MAX_LIVES, canType } from './machine/otpMachine';
import { useOtpFlow } from './machine/useOtpFlow';

export default function App() {
  const { state, input, reset, continueGame, skip, announce, refs, scene } = useOtpFlow();
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  // Toast line is picked once per win, so re-renders don't reshuffle it
  const [toastCopy, setToastCopy] = useState<[string, string] | null>(null);
  useEffect(() => {
    setToastCopy(scene.finale.toast ? pickToast(state.attempts) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene.finale.toast]);
  const [muted, setMutedState] = useState(false);
  const [stageWidth, setStageWidth] = useState(390);
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
  const liveText = toastCopy ? `Verified. ${toastCopy[0]} ${toastCopy[1]}` : announce;

  return (
    <div className="device" onClick={focus}>
      <Header
        muted={muted}
        lives={!verified && <Lives lives={state.lives} max={MAX_LIVES} coins={scene.coinCount} />}
        onClose={reset}
        onToggleSound={() => {
          setMuted(!muted);
          setMutedState(!muted);
        }}
      />

      {/* Hidden native input captures keyboard, paste and one-time-code autofill */}
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
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {/* Screen-reader narration of the check, result, lives and finale */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {liveText}
      </p>

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
            bumps={scene.bumps}
            mergeStep={scene.mergeStep}
            mergeBump={scene.mergeBump}
            slotRefs={refs.slotRefs}
            focused={focused && canType(state.phase)}
            onFocus={focus}
          />
          <Scene
            heroX={scene.heroX}
            heroY={scene.heroY}
            pose={scene.pose}
            facing={scene.facing}
            coins={scene.coins}
            dust={scene.dust}
            debris={scene.debris}
            bubble={state.bubble}
            lives={state.lives}
            finale={scene.finale}
            stageWidth={stageWidth}
          />
        </div>

        <Footer phase={state.phase} resendIn={state.resendIn} onResend={input.resend} onSkip={skip} onContinue={continueGame} />

        <AnimatePresence>{toastCopy && <Toast copy={toastCopy} />}</AnimatePresence>
      </motion.main>

      <Credit />
    </div>
  );
}
