// Tiny WebAudio chiptune synth — no audio files needed.

type Note = { f: number; d: number; type?: OscillatorType; slideTo?: number; gain?: number };

let ctx: AudioContext | null = null;
let muted = false;

export const setMuted = (m: boolean) => { muted = m; };
export const isMuted = () => muted;

function ac() {
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function play(notes: Note[]) {
  if (muted) return;
  try {
    const a = ac();
    let t = a.currentTime;
    for (const n of notes) {
      const osc = a.createOscillator();
      const g = a.createGain();
      osc.type = n.type ?? 'square';
      osc.frequency.setValueAtTime(n.f, t);
      if (n.slideTo) osc.frequency.exponentialRampToValueAtTime(n.slideTo, t + n.d);
      const vol = n.gain ?? 0.06;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + n.d);
      osc.connect(g).connect(a.destination);
      osc.start(t);
      osc.stop(t + n.d + 0.02);
      t += n.d * 0.9;
    }
  } catch {
    /* audio unavailable */
  }
}

export const sfx = {
  type: () => play([{ f: 880, d: 0.04, gain: 0.03 }]),
  erase: () => play([{ f: 440, d: 0.04, gain: 0.03 }]),
  jump: () => play([{ f: 300, d: 0.16, slideTo: 760, gain: 0.05 }]),
  bump: () => play([{ f: 140, d: 0.07, type: 'triangle', gain: 0.12 }]),
  coin: () => play([{ f: 988, d: 0.07 }, { f: 1319, d: 0.22 }]),
  wrong: () => play([{ f: 330, d: 0.09 }, { f: 220, d: 0.16 }]),
  fail: () => play([{ f: 392, d: 0.1 }, { f: 330, d: 0.1 }, { f: 262, d: 0.22 }]),
  merge: () => play([{ f: 523, d: 0.05 }, { f: 659, d: 0.05 }, { f: 784, d: 0.05 }]),
  success: () =>
    play([
      { f: 523, d: 0.1 }, { f: 659, d: 0.1 }, { f: 784, d: 0.1 },
      { f: 1047, d: 0.18 }, { f: 784, d: 0.08 }, { f: 1047, d: 0.3 },
    ]),
  gameOver: () =>
    play([
      { f: 494, d: 0.14 }, { f: 466, d: 0.14 }, { f: 440, d: 0.14 },
      { f: 415, d: 0.18 }, { f: 330, d: 0.12, type: 'triangle' }, { f: 165, d: 0.4, type: 'triangle' },
    ]),
  crumble: () => play([{ f: 180, d: 0.06, type: 'sawtooth', gain: 0.05 }, { f: 120, d: 0.08, type: 'sawtooth', gain: 0.05 }, { f: 90, d: 0.12, type: 'sawtooth', gain: 0.04 }]),
  flag: () => play([{ f: 1047, d: 0.6, slideTo: 330, type: 'triangle', gain: 0.05 }]),
  heart: () => play([{ f: 1175, d: 0.08, type: 'triangle' }, { f: 1568, d: 0.2, type: 'triangle' }]),
};
