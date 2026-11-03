// Pure login state machine. No timers, no DOM.

export const LOGIN_LIVES = 3;
export const LOCKOUT_SECONDS = 30;

export type LoginPhase = 'idle' | 'checking' | 'wrong' | 'locked' | 'success';

export type LoginState = {
  phase: LoginPhase;
  email: string;
  password: string;
  lives: number;
  lockoutIn: number; // seconds left while locked
};

export type LoginEvent =
  | { type: 'SET_EMAIL'; value: string }
  | { type: 'SET_PASSWORD'; value: string }
  | { type: 'FILL'; email: string; password: string }
  | { type: 'SUBMIT' }
  | { type: 'FAIL' }
  | { type: 'SUCCEED' }
  | { type: 'TICK' }
  | { type: 'RESET' };

export const initialLogin: LoginState = { phase: 'idle', email: '', password: '', lives: LOGIN_LIVES, lockoutIn: 0 };

export const canEdit = (phase: LoginPhase) => phase === 'idle' || phase === 'wrong';
export const canSubmit = (s: LoginState) => canEdit(s.phase) && s.email.trim() !== '' && s.password !== '';

export function loginReducer(state: LoginState, ev: LoginEvent): LoginState {
  switch (ev.type) {
    case 'SET_EMAIL':
      return canEdit(state.phase) ? { ...state, email: ev.value } : state;
    case 'SET_PASSWORD':
      // typing a new password dismisses the error
      return canEdit(state.phase) ? { ...state, password: ev.value, phase: 'idle' } : state;
    case 'FILL':
      return canEdit(state.phase) ? { ...state, email: ev.email, password: ev.password, phase: 'idle' } : state;
    case 'SUBMIT':
      return canSubmit(state) ? { ...state, phase: 'checking' } : state;
    case 'FAIL': {
      // keep the email, clear the password; out of lives → timed lockout
      const lives = state.lives - 1;
      if (lives <= 0) return { ...state, phase: 'locked', lives: 0, password: '', lockoutIn: LOCKOUT_SECONDS };
      return { ...state, phase: 'wrong', lives, password: '' };
    }
    case 'SUCCEED':
      return { ...state, phase: 'success' };
    case 'TICK':
      if (state.phase !== 'locked') return state;
      return state.lockoutIn > 1 ? { ...state, lockoutIn: state.lockoutIn - 1 } : { ...state, phase: 'idle', lockoutIn: 0, lives: LOGIN_LIVES };
    case 'RESET':
      return initialLogin;
  }
}

export const triesText = (n: number) => `${n} ${n === 1 ? 'try' : 'tries'} left`;
