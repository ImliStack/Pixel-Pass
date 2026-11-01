// Pure OTP state machine. No timers, no DOM — ports 1:1 to a Flutter Cubit.

export const CODE_LENGTH = 4;
export const RESEND_SECONDS = 30;
/** Wrong attempts allowed before a new code is forced. Doubles as the rate limit for per-digit feedback. */
export const MAX_LIVES = 3;

export type SlotStatus = 'empty' | 'filled' | 'pending' | 'correct' | 'wrong';
export type Slot = { digit: string; status: SlotStatus };
export type Phase = 'input' | 'checking' | 'failed' | 'merging' | 'verified' | 'gameover';

export type OtpState = {
  phase: Phase;
  slots: Slot[];
  attempts: number;
  lives: number;
  resendIn: number;
  bubble: number[] | null; // 1-based slot numbers to fix
  showFinale: boolean;
};

export type OtpEvent =
  | { type: 'TYPE'; digit: string }
  | { type: 'BACKSPACE' }
  | { type: 'PASTE'; text: string }
  | { type: 'START_CHECK' }
  | { type: 'MARK_PENDING' }
  | { type: 'REVEAL'; index: number; ok: boolean }
  | { type: 'CHECK_FAILED' }
  | { type: 'BEGIN_MERGE' }
  | { type: 'VERIFIED' }
  | { type: 'FINALE' }
  | { type: 'TICK' }
  | { type: 'RESEND' }
  | { type: 'CONTINUE' } // after game over: fresh code, full lives
  | { type: 'RESET' };

const emptySlots = (): Slot[] => Array.from({ length: CODE_LENGTH }, () => ({ digit: '', status: 'empty' }));

export const initialState: OtpState = {
  phase: 'input',
  slots: emptySlots(),
  attempts: 0,
  lives: MAX_LIVES,
  resendIn: RESEND_SECONDS,
  bubble: null,
  showFinale: false,
};

export const isLocked = (s: Slot) => s.status === 'correct';
export const canType = (phase: Phase) => phase === 'input' || phase === 'failed';

/** Index of the slot the next digit goes into, or -1 when complete. */
export const activeIndex = (slots: Slot[]) => slots.findIndex((s) => s.status === 'empty');

/** Slots that will be (re)checked: everything not already locked. */
export const indexesToCheck = (slots: Slot[]) =>
  slots.map((s, i) => (isLocked(s) ? -1 : i)).filter((i) => i >= 0);

export const isComplete = (slots: Slot[]) => slots.every((s) => s.status !== 'empty');

function fill(slots: Slot[], digits: string[]): Slot[] {
  const next = slots.map((s) => ({ ...s }));
  for (const d of digits) {
    const i = activeIndex(next);
    if (i < 0) break;
    next[i] = { digit: d, status: 'filled' };
  }
  return next;
}

export function otpReducer(state: OtpState, ev: OtpEvent): OtpState {
  switch (ev.type) {
    case 'TYPE':
      if (!canType(state.phase) || !/^\d$/.test(ev.digit)) return state;
      return { ...state, slots: fill(state.slots, [ev.digit]) };

    case 'PASTE': {
      if (!canType(state.phase)) return state;
      const digits = ev.text.replace(/\D/g, '').split('');
      return { ...state, slots: fill(state.slots, digits) };
    }

    case 'BACKSPACE': {
      if (!canType(state.phase)) return state;
      const slots = state.slots.map((s) => ({ ...s }));
      for (let i = slots.length - 1; i >= 0; i--) {
        if (slots[i].status === 'filled') {
          slots[i] = { digit: '', status: 'empty' };
          break;
        }
      }
      return { ...state, slots };
    }

    case 'START_CHECK':
      return { ...state, phase: 'checking', bubble: null, attempts: state.attempts + 1 };

    case 'MARK_PENDING':
      return {
        ...state,
        slots: state.slots.map((s) => (isLocked(s) ? s : { ...s, status: 'pending' })),
      };

    case 'REVEAL':
      return {
        ...state,
        slots: state.slots.map((s, i) => (i === ev.index ? { ...s, status: ev.ok ? 'correct' : 'wrong' } : s)),
      };

    case 'CHECK_FAILED': {
      const wrong = state.slots.map((s, i) => (s.status === 'wrong' ? i + 1 : -1)).filter((i) => i > 0);
      const lives = state.lives - 1;
      // Out of lives: the old code is void, so even the greens are cleared
      if (lives <= 0) return { ...state, phase: 'gameover', lives: 0, bubble: null, slots: emptySlots() };
      return {
        ...state,
        phase: 'failed',
        lives,
        bubble: wrong,
        slots: state.slots.map((s) => (s.status === 'wrong' ? { digit: '', status: 'empty' } : s)),
      };
    }

    case 'BEGIN_MERGE':
      return { ...state, phase: 'merging', bubble: null };

    case 'VERIFIED':
      return { ...state, phase: 'verified' };

    case 'FINALE':
      return { ...state, showFinale: true };

    case 'TICK':
      return state.resendIn > 0 ? { ...state, resendIn: state.resendIn - 1 } : state;

    case 'RESEND':
      return { ...state, resendIn: RESEND_SECONDS };

    case 'CONTINUE':
      return { ...initialState, slots: emptySlots(), resendIn: RESEND_SECONDS };

    case 'RESET':
      return { ...initialState, slots: emptySlots() };
  }
}

const WORDS = ['Zero', 'One', 'Two', 'Three', 'All four'];
export const bubbleTitle = (n: number) => `${WORDS[n] ?? n} ${n === 1 ? 'is' : 'are'} off!`;
