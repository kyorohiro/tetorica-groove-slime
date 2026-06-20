// Song 33: "NEON SEOUL" — K-pop Synth
// C# minor, 120 BPM — C#m7→Amaj7→E7→B7 (×2)
// Pad: PolySynth(fmsawtooth)+Reverb, Mel: Synth(fatsquare)+Wah(LFO),
// Bass: Oscillator(sawtooth)+AmplitudeEnvelope (低レベル手動合成)
import * as Tone from 'tone';

export const META = { name: 'NEON SEOUL', bpm: 120 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const limiter = new Tone.Limiter(-2);
  limiter.toDestination();
  const comp = new Tone.Compressor({ threshold: -12, ratio: 4, attack: 0.003, release: 0.1 });
  comp.connect(limiter);

  // --- drums: 4-on-floor kick, clap 2&4, straight 8th hats ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 5,
    envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.1 }, volume: -4,
  }).connect(comp);

  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.03 }, volume: -10,
  }).connect(comp);

  const hhHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  hhHpf.connect(comp);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.008 }, volume: -22,
  }).connect(hhHpf);

  const dp = {
    kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    clap: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  };

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.clap[i])  clap.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, 0.6);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.clap[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: Oscillator + AmplitudeEnvelope (低レベル手動合成) ---
  const bassFilter = new Tone.Filter({ frequency: 900, type: 'lowpass', rolloff: -24 });
  bassFilter.connect(comp);
  const bassEnv = new Tone.AmplitudeEnvelope({ attack: 0.008, decay: 0.12, sustain: 0.65, release: 0.2 });
  bassEnv.connect(bassFilter);
  const bassOsc = new Tone.Oscillator({ type: 'sawtooth', volume: -10 });
  bassOsc.connect(bassEnv);
  bassOsc.start();

  // --- pad: PolySynth(fmsawtooth) + Reverb ---
  const reverb = new Tone.Reverb({ decay: 1.8, preDelay: 0.02 });
  reverb.connect(comp);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fmsawtooth' } as any,
    envelope: { attack: 0.08, decay: 0.3, sustain: 0.55, release: 0.7 },
    volume: -22,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: Synth(fatsquare) + BPF wah (Filter + LFO で手動ワウ) ---
  const wahFilter = new Tone.Filter({ frequency: 900, type: 'bandpass', Q: 3 });
  wahFilter.connect(comp);
  const wahLfo = new Tone.LFO({ frequency: 3, min: 400, max: 2600, type: 'sine' });
  wahLfo.connect(wahFilter.frequency);
  wahLfo.start();
  const mel = new Tone.Synth({
    oscillator: { type: 'fatsquare', count: 2, spread: 18 } as any,
    envelope: { attack: 0.005, decay: 0.09, sustain: 0.45, release: 0.18 },
    volume: -10,
  }).connect(wahFilter);

  // chord voicings (C# minor)
  const NAMES = ['C#m7', 'Amaj7', 'E7', 'B7'];
  const chords = [
    { time: '0:0:0', notes: ['C#3','E3','G#3','B3'],  dur: '2m', vel: 0.30 },
    { time: '2:0:0', notes: ['A2','C#3','E3','G#3'],  dur: '2m', vel: 0.30 },
    { time: '4:0:0', notes: ['E3','G#3','B3','D#4'],  dur: '2m', vel: 0.30 },
    { time: '6:0:0', notes: ['B2','D#3','F#3','A#3'], dur: '2m', vel: 0.30 },
  ];

  const bassLine = [
    { time: '0:0:0', p: 'C#2', d: '4n' }, { time: '0:1:0', p: 'C#2', d: '8n' },
    { time: '0:2:0', p: 'E2',  d: '4n' }, { time: '0:3:0', p: 'G#1', d: '8n' },
    { time: '1:0:0', p: 'C#2', d: '4n' }, { time: '1:1:0', p: 'B1',  d: '8n' },
    { time: '1:2:0', p: 'C#2', d: '4n' }, { time: '1:3:0', p: 'G#1', d: '8n' },
    { time: '2:0:0', p: 'A1',  d: '4n' }, { time: '2:1:0', p: 'A1',  d: '8n' },
    { time: '2:2:0', p: 'C#2', d: '4n' }, { time: '2:3:0', p: 'E2',  d: '8n' },
    { time: '3:0:0', p: 'A1',  d: '4n' }, { time: '3:1:0', p: 'G#1', d: '8n' },
    { time: '3:2:0', p: 'A1',  d: '4n' }, { time: '3:3:0', p: 'E2',  d: '8n' },
    { time: '4:0:0', p: 'E2',  d: '4n' }, { time: '4:1:0', p: 'E2',  d: '8n' },
    { time: '4:2:0', p: 'G#2', d: '4n' }, { time: '4:3:0', p: 'B1',  d: '8n' },
    { time: '5:0:0', p: 'E2',  d: '4n' }, { time: '5:1:0', p: 'D#2', d: '8n' },
    { time: '5:2:0', p: 'E2',  d: '4n' }, { time: '5:3:0', p: 'B1',  d: '8n' },
    { time: '6:0:0', p: 'B1',  d: '4n' }, { time: '6:1:0', p: 'B1',  d: '8n' },
    { time: '6:2:0', p: 'D#2', d: '4n' }, { time: '6:3:0', p: 'F#2', d: '8n' },
    { time: '7:0:0', p: 'B1',  d: '4n' }, { time: '7:1:0', p: 'A#1', d: '8n' },
    { time: '7:2:0', p: 'B1',  d: '4n' }, { time: '7:3:0', p: 'F#2', d: '8n' },
  ];

  // staccato K-pop melody
  const melNotes = [
    { time: '0:0:0', n: 'C#5', d: '8n', v: 0.76 }, { time: '0:0:2', n: 'B4',  d: '8n', v: 0.70 },
    { time: '0:1:0', n: 'G#4', d: '4n', v: 0.72 },
    { time: '0:2:0', n: 'B4',  d: '8n', v: 0.74 }, { time: '0:2:2', n: 'C#5', d: '8n', v: 0.72 },
    { time: '0:3:0', n: 'E5',  d: '4n', v: 0.78 },
    { time: '1:0:0', n: 'D#5', d: '8n', v: 0.72 }, { time: '1:0:2', n: 'C#5', d: '8n', v: 0.70 },
    { time: '1:1:0', n: 'B4',  d: '4n', v: 0.75 },
    { time: '1:2:0', n: 'G#4', d: '8n', v: 0.68 }, { time: '1:2:2', n: 'A4',  d: '8n', v: 0.70 },
    { time: '1:3:0', n: 'B4',  d: '4n', v: 0.72 },
    { time: '2:0:0', n: 'A4',  d: '8n', v: 0.75 }, { time: '2:0:2', n: 'C#5', d: '8n', v: 0.72 },
    { time: '2:1:0', n: 'E5',  d: '4n', v: 0.78 },
    { time: '2:2:0', n: 'C#5', d: '8n', v: 0.72 }, { time: '2:2:2', n: 'B4',  d: '8n', v: 0.70 },
    { time: '2:3:0', n: 'A4',  d: '4n', v: 0.74 },
    { time: '3:0:0', n: 'G#4', d: '8n', v: 0.70 }, { time: '3:0:2', n: 'A4',  d: '8n', v: 0.68 },
    { time: '3:1:0', n: 'C#5', d: '4n', v: 0.75 },
    { time: '3:2:0', n: 'E5',  d: '8n', v: 0.78 }, { time: '3:2:2', n: 'F#5', d: '8n', v: 0.75 },
    { time: '3:3:0', n: 'G#5', d: '4n', v: 0.80 },
    { time: '4:0:0', n: 'G#4', d: '8n', v: 0.75 }, { time: '4:0:2', n: 'B4',  d: '8n', v: 0.70 },
    { time: '4:1:0', n: 'D#5', d: '4n', v: 0.78 },
    { time: '4:2:0', n: 'B4',  d: '8n', v: 0.72 }, { time: '4:2:2', n: 'G#4', d: '8n', v: 0.68 },
    { time: '4:3:0', n: 'E4',  d: '4n', v: 0.70 },
    { time: '5:0:0', n: 'G#4', d: '8n', v: 0.72 }, { time: '5:0:2', n: 'B4',  d: '8n', v: 0.70 },
    { time: '5:1:0', n: 'E5',  d: '4n', v: 0.78 },
    { time: '5:2:0', n: 'D#5', d: '8n', v: 0.72 }, { time: '5:2:2', n: 'C#5', d: '8n', v: 0.70 },
    { time: '5:3:0', n: 'B4',  d: '4n', v: 0.72 },
    { time: '6:0:0', n: 'B4',  d: '8n', v: 0.75 }, { time: '6:0:2', n: 'D#5', d: '8n', v: 0.72 },
    { time: '6:1:0', n: 'F#5', d: '4n', v: 0.78 },
    { time: '6:2:0', n: 'D#5', d: '8n', v: 0.72 }, { time: '6:2:2', n: 'B4',  d: '8n', v: 0.70 },
    { time: '6:3:0', n: 'A#4', d: '4n', v: 0.72 },
    { time: '7:0:0', n: 'D#5', d: '8n', v: 0.75 }, { time: '7:0:2', n: 'F#5', d: '8n', v: 0.72 },
    { time: '7:1:0', n: 'A#5', d: '4n', v: 0.80 },
    { time: '7:2:0', n: 'G#5', d: '8n', v: 0.75 }, { time: '7:2:2', n: 'F#5', d: '8n', v: 0.72 },
    { time: '7:3:0', n: 'D#5', d: '4n', v: 0.75 },
  ];

  const cp = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
    const bar = parseInt((ev.time as string).split(':')[0]);
    const chordIdx = Math.floor(bar / 2);
    Tone.getDraw().schedule(() => onChord(NAMES[chordIdx], bar), time);
  }, chords).start(0);

  const bp = new Tone.Part((time, ev) => {
    bassOsc.frequency.setValueAtTime(Tone.Frequency(ev.p).toFrequency(), time);
    bassEnv.triggerAttackRelease(ev.d, time);
  }, bassLine).start(0);

  const mp = new Tone.Part((time, ev) => {
    mel.triggerAttackRelease(ev.n, ev.d, time, ev.v);
  }, melNotes).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); bp.dispose(); mp.dispose();
    kick.dispose(); clap.dispose(); hihat.dispose(); hhHpf.dispose();
    bassOsc.stop(); bassOsc.dispose(); bassEnv.dispose(); bassFilter.dispose();
    pad.dispose(); reverb.dispose();
    mel.dispose(); wahFilter.dispose(); wahLfo.dispose();
    comp.dispose(); limiter.dispose();
  };
}
