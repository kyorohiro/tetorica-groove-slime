// Song 10: "Neon Funk"
// G minor, 95 BPM — pwm+Vibrato lead, PolySynth(fatsine) pad, funky AutoFilter wah bass
import * as Tone from 'tone';

export const META = { name: 'Neon Funk', bpm: 95 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -11, ratio: 5, attack: 0.002, release: 0.1 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 8500, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (funk syncopated) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.07, octaves: 5,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.15 }, volume: -4,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 }, volume: -8,
  }).toDestination();
  const ghost = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.02 }, volume: -20,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }, volume: -18,
  }).connect(hhHpf);

  // funk: syncopated kick, 2&4 snare, 8th hats, ghost 16ths
  const dp = {
    kick:  [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,1,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    ghost: [0,1,0,1, 0,1,0,0, 0,1,0,1, 0,0,0,1],
  };
  const hhV = [0.75,0,0.45,0, 0.7,0,0.45,0, 0.75,0,0.45,0, 0.7,0,0.45,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.ghost[i]) ghost.triggerAttackRelease('32n', time, 0.3);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(sawtooth) + AutoFilter (wah) — syncopated funk bass ---
  const bassWah = new Tone.AutoFilter({
    frequency: '8n', baseFrequency: 300, octaves: 3.5, depth: 0.9, wet: 0.75,
  }).start().toDestination();
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: { Q: 3, type: 'lowpass', rolloff: -24, frequency: 600 },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.7, release: 0.15 },
    filterEnvelope: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.2, baseFrequency: 200, octaves: 2 },
    volume: -10,
  }).connect(bassWah);

  // --- pad: PolySynth(Synth, fatsine) — round, warm ---
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsine', count: 3, spread: 20 } as any,
    envelope: { attack: 0.12, decay: 0.3, sustain: 0.5, release: 0.5 },
    volume: -23,
  });
  pad.maxPolyphony = 10;
  pad.connect(warm);

  // --- melody: Synth(pwm) + Vibrato — wobbly funkadelic lead ---
  const vibrato = new Tone.Vibrato({ frequency: 5.5, depth: 0.12, wet: 0.65 });
  vibrato.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'pwm', modulationFrequency: 0.35 } as any,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.65, release: 0.25 },
    volume: -13,
  }).connect(vibrato);

  // Gm7 Cm7 Ebmaj7 Bb7  Gm7 Cm7 F7 Gm7
  const NAMES = ['Gm7','Cm7','Ebmaj7','Bb7','Gm7','Cm7','F7','Gm7'];
  const chords = [
    { time: '0:0:0', notes: ['G2','Bb2','D3','F3'],  dur: '1m', vel: 0.30 },
    { time: '1:0:0', notes: ['C3','Eb3','G3','Bb3'], dur: '1m', vel: 0.30 },
    { time: '2:0:0', notes: ['Eb3','G3','Bb3','D4'], dur: '1m', vel: 0.30 },
    { time: '3:0:0', notes: ['Bb2','D3','F3','Ab3'], dur: '1m', vel: 0.32 },
    { time: '4:0:0', notes: ['G2','Bb2','D3','F3'],  dur: '1m', vel: 0.28 },
    { time: '5:0:0', notes: ['C3','Eb3','G3','Bb3'], dur: '1m', vel: 0.28 },
    { time: '6:0:0', notes: ['F2','A2','C3','Eb3'],  dur: '1m', vel: 0.32 },
    { time: '7:0:0', notes: ['G2','Bb2','D3','F3'],  dur: '1m', vel: 0.33 },
  ];
  // syncopated funk bass line
  const bassLine = [
    { time: '0:0:0', p: 'G1',  d: '8n' }, { time: '0:0:2', p: 'D2',  d: '8n' },
    { time: '0:1:2', p: 'Bb1', d: '8n' }, { time: '0:2:0', p: 'G1',  d: '8n' },
    { time: '0:3:0', p: 'F1',  d: '4n' },
    { time: '1:0:0', p: 'C2',  d: '8n' }, { time: '1:0:2', p: 'G1',  d: '8n' },
    { time: '1:1:2', p: 'Eb2', d: '8n' }, { time: '1:2:0', p: 'C2',  d: '8n' },
    { time: '1:3:0', p: 'Bb1', d: '4n' },
    { time: '2:0:0', p: 'Eb2', d: '8n' }, { time: '2:0:2', p: 'Bb1', d: '8n' },
    { time: '2:1:2', p: 'G1',  d: '8n' }, { time: '2:2:0', p: 'Eb2', d: '8n' },
    { time: '2:3:0', p: 'D2',  d: '4n' },
    { time: '3:0:0', p: 'Bb1', d: '8n' }, { time: '3:0:2', p: 'F2',  d: '8n' },
    { time: '3:1:2', p: 'D2',  d: '8n' }, { time: '3:2:0', p: 'Bb1', d: '8n' },
    { time: '3:3:0', p: 'Ab1', d: '4n' },
    { time: '4:0:0', p: 'G1',  d: '8n' }, { time: '4:0:2', p: 'Bb1', d: '8n' },
    { time: '4:1:2', p: 'D2',  d: '8n' }, { time: '4:2:0', p: 'G1',  d: '8n' },
    { time: '4:3:0', p: 'F1',  d: '4n' },
    { time: '5:0:0', p: 'C2',  d: '8n' }, { time: '5:0:2', p: 'Eb2', d: '8n' },
    { time: '5:1:2', p: 'G2',  d: '8n' }, { time: '5:2:0', p: 'C2',  d: '8n' },
    { time: '5:3:0', p: 'Bb1', d: '4n' },
    { time: '6:0:0', p: 'F1',  d: '8n' }, { time: '6:0:2', p: 'A1',  d: '8n' },
    { time: '6:1:2', p: 'C2',  d: '8n' }, { time: '6:2:0', p: 'F1',  d: '8n' },
    { time: '6:3:0', p: 'Eb2', d: '4n' },
    { time: '7:0:0', p: 'G1',  d: '8n' }, { time: '7:0:2', p: 'D2',  d: '8n' },
    { time: '7:1:2', p: 'Bb1', d: '8n' }, { time: '7:2:0', p: 'G1',  d: '8n' },
    { time: '7:3:0', p: 'F1',  d: '4n' },
  ];
  // G minor scale melody (G A Bb C D Eb F) — funky stabs and phrases
  const melNotes = [
    { time: '0:0:0', n: 'D5',  d: '16n', v: 0.75 }, { time: '0:0:2', n: 'Bb4', d: '16n', v: 0.6  },
    { time: '0:1:0', n: 'G4',  d: '8n',  v: 0.7  }, { time: '0:2:0', n: 'F4',  d: '16n', v: 0.62 },
    { time: '0:2:2', n: 'G4',  d: '8n',  v: 0.65 }, { time: '0:3:2', n: 'D4',  d: '8n',  v: 0.55 },
    { time: '1:0:0', n: 'Eb5', d: '16n', v: 0.72 }, { time: '1:0:2', n: 'C5',  d: '16n', v: 0.58 },
    { time: '1:1:0', n: 'Bb4', d: '8n',  v: 0.68 }, { time: '1:2:0', n: 'G4',  d: '16n', v: 0.6  },
    { time: '1:2:2', n: 'Bb4', d: '8n',  v: 0.62 }, { time: '1:3:2', n: 'Eb5', d: '8n',  v: 0.55 },
    { time: '2:0:0', n: 'G5',  d: '16n', v: 0.75 }, { time: '2:0:2', n: 'Eb5', d: '16n', v: 0.62 },
    { time: '2:1:0', n: 'Bb4', d: '8n',  v: 0.68 }, { time: '2:2:0', n: 'D5',  d: '16n', v: 0.6  },
    { time: '2:2:2', n: 'Eb5', d: '8n',  v: 0.65 }, { time: '2:3:2', n: 'G4',  d: '8n',  v: 0.55 },
    { time: '3:0:0', n: 'F5',  d: '16n', v: 0.72 }, { time: '3:0:2', n: 'D5',  d: '16n', v: 0.6  },
    { time: '3:1:0', n: 'Bb4', d: '8n',  v: 0.68 }, { time: '3:2:0', n: 'Ab4', d: '16n', v: 0.58 },
    { time: '3:2:2', n: 'F4',  d: '8n',  v: 0.62 }, { time: '3:3:0', n: 'D5',  d: '4n',  v: 0.65 },
    { time: '4:0:0', n: 'G5',  d: '16n', v: 0.78 }, { time: '4:0:2', n: 'F5',  d: '16n', v: 0.62 },
    { time: '4:1:0', n: 'D5',  d: '8n',  v: 0.72 }, { time: '4:2:0', n: 'Bb4', d: '16n', v: 0.6  },
    { time: '4:2:2', n: 'C5',  d: '8n',  v: 0.65 }, { time: '4:3:2', n: 'D5',  d: '8n',  v: 0.6  },
    { time: '5:0:0', n: 'Eb5', d: '16n', v: 0.72 }, { time: '5:0:2', n: 'C5',  d: '16n', v: 0.58 },
    { time: '5:1:0', n: 'Bb4', d: '8n',  v: 0.68 }, { time: '5:2:0', n: 'G4',  d: '16n', v: 0.6  },
    { time: '5:2:2', n: 'Ab4', d: '8n',  v: 0.62 }, { time: '5:3:2', n: 'Bb4', d: '8n',  v: 0.58 },
    { time: '6:0:0', n: 'F5',  d: '16n', v: 0.75 }, { time: '6:0:2', n: 'Eb5', d: '16n', v: 0.62 },
    { time: '6:1:0', n: 'C5',  d: '8n',  v: 0.7  }, { time: '6:2:0', n: 'A4',  d: '16n', v: 0.58 },
    { time: '6:2:2', n: 'C5',  d: '8n',  v: 0.65 }, { time: '6:3:2', n: 'Eb5', d: '8n',  v: 0.6  },
    { time: '7:0:0', n: 'D5',  d: '16n', v: 0.72 }, { time: '7:0:2', n: 'Bb4', d: '16n', v: 0.58 },
    { time: '7:1:0', n: 'G4',  d: '8n',  v: 0.68 }, { time: '7:2:0', n: 'F4',  d: '16n', v: 0.58 },
    { time: '7:2:2', n: 'G4',  d: '8n',  v: 0.62 }, { time: '7:3:0', n: 'Bb4', d: '4n',  v: 0.65 },
  ];

  const cp = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
    const bar = parseInt((ev.time as string).split(':')[0]);
    Tone.getDraw().schedule(() => onChord(NAMES[bar], bar), time);
  }, chords).start(0);

  const bp = new Tone.Part((time, ev) => {
    bass.triggerAttackRelease(ev.p, ev.d, time);
  }, bassLine).start(0);

  const mp = new Tone.Part((time, ev) => {
    mel.triggerAttackRelease(ev.n, ev.d, time, ev.v);
  }, melNotes).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); bp.dispose(); mp.dispose();
    kick.dispose(); snare.dispose(); ghost.dispose(); hihat.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    bassWah.dispose(); vibrato.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
