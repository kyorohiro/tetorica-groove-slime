// Song 8: "Rock Edge"
// E minor, 90 BPM — fatsquare melody + Distortion, fatsawtooth+Chorus pad, heavy drums
import * as Tone from 'tone';

export const META = { name: 'Rock Edge', bpm: 90 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -10, ratio: 6, attack: 0.002, release: 0.1 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 9000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (rock: straight kick on 1&3, snare 2&4) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.09, octaves: 6,
    envelope: { attack: 0.001, decay: 0.38, sustain: 0, release: 0.2 }, volume: -3,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.06 }, volume: -7,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 10000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }, volume: -19,
  }).connect(hhHpf);
  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0, release: 0.03 }, volume: -14,
  }).toDestination();

  // rock straight beat
  const dp = {
    kick:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    clap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,1],
  };
  const hhV = [0.8,0,0.4,0, 0.75,0,0.4,0, 0.8,0,0.4,0, 0.75,0,0.4,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    if (dp.clap[i])  clap.triggerAttackRelease('16n', time, 0.6);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(fatsawtooth) — thick rock bass ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fatsawtooth', count: 2, spread: 15 } as any,
    filter: { Q: 3, type: 'lowpass', rolloff: -24, frequency: 350 },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.7, release: 0.25 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.25, baseFrequency: 150, octaves: 1.8 },
    volume: -9,
  }).toDestination();

  // --- pad: PolySynth(Synth, fatsawtooth) + Chorus — guitar-like power chords ---
  const chorus = new Tone.Chorus({ frequency: 2, delayTime: 3, depth: 0.5, wet: 0.5 }).connect(warm);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 3, spread: 30 } as any,
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.6, release: 0.4 },
    volume: -22,
  });
  pad.maxPolyphony = 8;
  pad.connect(chorus);

  // --- melody: Synth(fatsquare) + Distortion (lead guitar feel) ---
  const dist = new Tone.Distortion({ distortion: 0.45, wet: 0.6 });
  dist.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'fatsquare', count: 2, spread: 20 } as any,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.3 },
    volume: -15,
  }).connect(dist);

  // Em C G D  Em C Am B
  const NAMES = ['Em','C','G','D','Em','C','Am','B'];
  const chords = [
    { time: '0:0:0', notes: ['E3','G3','B3','D4'],  dur: '1m', vel: 0.35 },
    { time: '1:0:0', notes: ['C3','E3','G3','B3'],  dur: '1m', vel: 0.35 },
    { time: '2:0:0', notes: ['G2','B2','D3','F#3'], dur: '1m', vel: 0.35 },
    { time: '3:0:0', notes: ['D3','F#3','A3','C4'], dur: '1m', vel: 0.38 },
    { time: '4:0:0', notes: ['E3','G3','B3','D4'],  dur: '1m', vel: 0.33 },
    { time: '5:0:0', notes: ['C3','E3','G3','B3'],  dur: '1m', vel: 0.33 },
    { time: '6:0:0', notes: ['A2','C3','E3','G3'],  dur: '1m', vel: 0.35 },
    { time: '7:0:0', notes: ['B2','D#3','F#3','A3'],dur: '1m', vel: 0.38 },
  ];
  const bassLine = [
    { time: '0:0:0', p: 'E2',  d: '4n' }, { time: '0:2:0', p: 'B1',  d: '4n' },
    { time: '1:0:0', p: 'C2',  d: '4n' }, { time: '1:2:0', p: 'G1',  d: '4n' },
    { time: '2:0:0', p: 'G1',  d: '4n' }, { time: '2:2:0', p: 'D2',  d: '4n' },
    { time: '3:0:0', p: 'D2',  d: '4n' }, { time: '3:2:0', p: 'A1',  d: '4n' },
    { time: '4:0:0', p: 'E2',  d: '4n' }, { time: '4:2:0', p: 'G2',  d: '4n' },
    { time: '5:0:0', p: 'C2',  d: '4n' }, { time: '5:2:0', p: 'E2',  d: '4n' },
    { time: '6:0:0', p: 'A1',  d: '4n' }, { time: '6:2:0', p: 'E2',  d: '4n' },
    { time: '7:0:0', p: 'B1',  d: '4n' }, { time: '7:2:0', p: 'F#2', d: '4n' },
  ];
  // E natural minor (E F# G A B C D) melody — driving rock riff
  const melNotes = [
    { time: '0:0:0', n: 'E4',  d: '8n',  v: 0.75 }, { time: '0:0:2', n: 'G4',  d: '8n',  v: 0.6  },
    { time: '0:1:0', n: 'B4',  d: '8n',  v: 0.7  }, { time: '0:1:2', n: 'A4',  d: '8n',  v: 0.58 },
    { time: '0:2:0', n: 'G4',  d: '4n',  v: 0.65 }, { time: '0:3:0', n: 'E4',  d: '4n',  v: 0.6  },
    { time: '1:0:0', n: 'C5',  d: '8n',  v: 0.72 }, { time: '1:0:2', n: 'B4',  d: '8n',  v: 0.58 },
    { time: '1:1:0', n: 'G4',  d: '4n',  v: 0.65 }, { time: '1:2:2', n: 'A4',  d: '4n.', v: 0.6  },
    { time: '2:0:0', n: 'B4',  d: '8n',  v: 0.7  }, { time: '2:0:2', n: 'D5',  d: '8n',  v: 0.58 },
    { time: '2:1:0', n: 'B4',  d: '4n',  v: 0.65 }, { time: '2:2:0', n: 'A4',  d: '8n',  v: 0.55 },
    { time: '2:2:2', n: 'G4',  d: '4n',  v: 0.6  },
    { time: '3:0:0', n: 'F#4', d: '8n',  v: 0.72 }, { time: '3:0:2', n: 'A4',  d: '8n',  v: 0.58 },
    { time: '3:1:0', n: 'D5',  d: '4n',  v: 0.68 }, { time: '3:2:0', n: 'C5',  d: '4n',  v: 0.55 },
    { time: '3:3:0', n: 'B4',  d: '4n',  v: 0.62 },
    { time: '4:0:0', n: 'E5',  d: '8n',  v: 0.78 }, { time: '4:0:2', n: 'D5',  d: '8n',  v: 0.62 },
    { time: '4:1:0', n: 'B4',  d: '4n',  v: 0.7  }, { time: '4:2:0', n: 'G4',  d: '8n',  v: 0.58 },
    { time: '4:2:2', n: 'A4',  d: '4n',  v: 0.62 },
    { time: '5:0:0', n: 'G4',  d: '8n',  v: 0.7  }, { time: '5:0:2', n: 'E4',  d: '8n',  v: 0.55 },
    { time: '5:1:0', n: 'C5',  d: '4n',  v: 0.65 }, { time: '5:2:2', n: 'B4',  d: '4n.', v: 0.6  },
    { time: '6:0:0', n: 'A4',  d: '8n',  v: 0.68 }, { time: '6:0:2', n: 'C5',  d: '8n',  v: 0.55 },
    { time: '6:1:0', n: 'E5',  d: '4n',  v: 0.65 }, { time: '6:2:0', n: 'D5',  d: '4n',  v: 0.58 },
    { time: '6:3:0', n: 'C5',  d: '4n',  v: 0.6  },
    { time: '7:0:0', n: 'B4',  d: '8n',  v: 0.75 }, { time: '7:0:2', n: 'D5',  d: '8n',  v: 0.6  },
    { time: '7:1:0', n: 'F#5', d: '4n',  v: 0.7  }, { time: '7:2:0', n: 'E5',  d: '4n',  v: 0.6  },
    { time: '7:3:0', n: 'D5',  d: '4n',  v: 0.65 },
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
    kick.dispose(); snare.dispose(); hihat.dispose(); clap.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    dist.dispose(); chorus.dispose(); warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
