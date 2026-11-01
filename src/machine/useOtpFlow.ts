import { animate, useMotionValue } from 'framer-motion';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { verifyDigits } from '../lib/verify';
import { sfx } from '../lib/sound';
import { canType, indexesToCheck, initialState, isComplete, otpReducer } from './otpMachine';

export type Pose = 'stand' | 'runA' | 'runB' | 'jump';
export type MergeStep = 'none' | 'stack' | 'block' | 'green';
export type CoinFx = { id: number; x: number; y: number };

// Scene metrics (px) — keep in sync with tokens.css / Stage layout
export const HERO_W = 36;
export const HERO_H = 48;
export const SKY_H = 104; // gap between slot bottom and ground top
const JUMP_H = SKY_H - HERO_H - 2;
const RUN_SPEED = 0.9; // px per ms
const START_X = 18;

class Cancelled extends Error {}

export function useOtpFlow() {
  const [state, dispatch] = useReducer(otpReducer, initialState);

  const stageRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const heroX = useMotionValue(START_X);
  const heroY = useMotionValue(0);
  const [pose, setPose] = useState<Pose>('stand');
  const [facing, setFacing] = useState<1 | -1>(1);
  const [bumps, setBumps] = useState<number[]>([0, 0, 0, 0]);
  const [coins, setCoins] = useState<CoinFx[]>([]);
  const [mergeStep, setMergeStep] = useState<MergeStep>('none');
  const [mergeBump, setMergeBump] = useState(0);
  const [bubbleX, setBubbleX] = useState(0);
  const [finale, setFinale] = useState({ castle: false, royal: false, heart: false, toast: false });

  const token = useRef(0);
  const busy = useRef(false);

  // ---------- helpers ----------
  const guard = (t: number) => {
    if (t !== token.current) throw new Cancelled();
  };
  const wait = (ms: number, t: number) =>
    new Promise<void>((res, rej) => setTimeout(() => (t === token.current ? res() : rej(new Cancelled())), ms));

  const stageWidth = () => stageRef.current?.clientWidth ?? 390;

  // Idle spot: left edge on phones, a short run-up before the first slot on wide screens
  const startX = () => {
    const first = slotRefs.current[0];
    if (!first) return START_X;
    return Math.max(START_X, first.offsetLeft - 140);
  };

  const slotCenterX = (i: number) => {
    const stage = stageRef.current?.getBoundingClientRect();
    const slot = slotRefs.current[i]?.getBoundingClientRect();
    if (!stage || !slot) return START_X;
    return slot.left - stage.left + slot.width / 2 - HERO_W / 2;
  };

  const runTo = async (x: number, t: number) => {
    const from = heroX.get();
    const dist = Math.abs(x - from);
    if (dist < 2) return;
    setFacing(x > from ? 1 : -1);
    let flip = false;
    const iv = setInterval(() => {
      flip = !flip;
      setPose(flip ? 'runA' : 'runB');
    }, 90);
    setPose('runA');
    try {
      await animate(heroX, x, { duration: Math.min(0.55, Math.max(0.18, dist / RUN_SPEED / 1000)), ease: 'easeInOut' });
    } finally {
      clearInterval(iv);
    }
    guard(t);
    setPose('stand');
  };

  const jump = async (t: number, onTop: () => void) => {
    setPose('jump');
    sfx.jump();
    await animate(heroY, -JUMP_H, { duration: 0.17, ease: 'easeOut' });
    guard(t);
    onTop();
    await animate(heroY, 0, { duration: 0.2, ease: 'easeIn' });
    guard(t);
    setPose('stand');
  };

  const popCoin = (x: number, y: number) => {
    const id = Math.random();
    setCoins((c) => [...c, { id, x, y }]);
    setTimeout(() => setCoins((c) => c.filter((k) => k.id !== id)), 700);
  };

  // ---------- choreography ----------
  const runCheck = useCallback(async () => {
    const t = ++token.current;
    busy.current = true;
    try {
      dispatch({ type: 'START_CHECK' });
      const idxs = indexesToCheck(state.slots);
      const results = await verifyDigits(state.slots.map((s) => s.digit));
      guard(t);
      await wait(120, t);
      dispatch({ type: 'MARK_PENDING' });
      await wait(220, t);

      for (const i of idxs) {
        await runTo(slotCenterX(i), t);
        await jump(t, () => {
          sfx.bump();
          setBumps((b) => b.map((n, k) => (k === i ? n + 1 : n)));
          popCoin(slotCenterX(i) + HERO_W / 2, 0);
          if (results[i]) sfx.coin();
          else sfx.wrong();
          dispatch({ type: 'REVEAL', index: i, ok: results[i] });
        });
        await wait(70, t);
      }

      if (results.every(Boolean)) {
        await runMerge(t);
      } else {
        await wait(420, t);
        const w = stageWidth();
        const bw = 190;
        setBubbleX(Math.max(10, Math.min(w - bw - 10, heroX.get() + HERO_W - bw + 14)));
        sfx.fail();
        dispatch({ type: 'CHECK_FAILED' });
      }
    } catch (e) {
      if (!(e instanceof Cancelled)) throw e;
    } finally {
      if (t === token.current) busy.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.slots]);

  const runMerge = async (t: number) => {
    await wait(300, t);
    dispatch({ type: 'BEGIN_MERGE' });
    setMergeStep('stack');
    sfx.merge();
    await wait(380, t);
    setMergeStep('block');
    const center = stageWidth() / 2 - HERO_W / 2;
    await runTo(center, t);
    await jump(t, () => {
      sfx.bump();
      setMergeBump((n) => n + 1);
      setMergeStep('green');
      sfx.coin();
    });
    await wait(260, t);
    dispatch({ type: 'VERIFIED' });
    sfx.success();
    await wait(650, t);

    // finale: castle, royal walks out, heart, toast
    setFinale((f) => ({ ...f, castle: true }));
    await runTo(center - 26, t);
    setFacing(1);
    await wait(380, t);
    setFinale((f) => ({ ...f, royal: true }));
    await wait(950, t);
    setFinale((f) => ({ ...f, heart: true }));
    sfx.heart();
    await wait(450, t);
    setFinale((f) => ({ ...f, toast: true }));
    dispatch({ type: 'FINALE' });
  };

  // Auto-submit when all editable slots are filled
  useEffect(() => {
    if (canType(state.phase) && isComplete(state.slots) && !busy.current) void runCheck();
  }, [state.phase, state.slots, runCheck]);

  // Keep the idle hero next to the slots when the window resizes
  const idle = state.phase === 'input' && state.attempts === 0;
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !idle) return;
    const place = () => heroX.set(startX());
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idle]);

  // Resend countdown
  useEffect(() => {
    if (!canType(state.phase)) return;
    const iv = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    return () => clearInterval(iv);
  }, [state.phase]);

  const reset = () => {
    token.current++;
    busy.current = false;
    heroX.set(startX());
    heroY.set(0);
    setPose('stand');
    setFacing(1);
    setBumps([0, 0, 0, 0]);
    setCoins([]);
    setMergeStep('none');
    setFinale({ castle: false, royal: false, heart: false, toast: false });
    dispatch({ type: 'RESET' });
  };

  const input = {
    type: (d: string) => {
      if (!canType(state.phase)) return;
      sfx.type();
      dispatch({ type: 'TYPE', digit: d });
    },
    paste: (text: string) => dispatch({ type: 'PASTE', text }),
    backspace: () => {
      if (!canType(state.phase)) return;
      sfx.erase();
      dispatch({ type: 'BACKSPACE' });
    },
    resend: () => dispatch({ type: 'RESEND' }),
  };

  return {
    state,
    input,
    reset,
    refs: { stageRef, slotRefs },
    scene: { heroX, heroY, pose, facing, bumps, coins, mergeStep, mergeBump, bubbleX, finale },
  };
}
