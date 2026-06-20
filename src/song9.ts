// Song 9: "Tremolo Sky"
// A major, 72 BPM — amsine melody + Tremolo, Chebyshev harmonic pad, dreamy/floating
import * as Tone from 'tone';

export const META = { name: 'Tremolo Sky', bpm: 72 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -14, ratio: 4, attack: 0.005, release: 0.2 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 7500, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (sparse, brushy — half-time feel) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06, octaves: 4,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.18 }, volume: -8,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.004, decay: 0.2, sustain: 0, release: 0.08 }, volume: -12,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 8500, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.02 }, volume: -24,
  }).connect(hhHpf);

  // sparse half-time: light and airy
  const dp = {
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
  };
  const hhV = [0,0,0.45,0, 0,0,0.4,0, 0,0,0.45,0, 0,0,0.4,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(amtriangle) — soft and round ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'amtriangle' } as any,
    filter: { Q: 1.5, type: 'lowpass', rolloff: -12, frequency: 500 },
    envelope: { attack: 0.06, decay: 0.2, sustain: 0.6, release: 0.6 },
    filterEnvelope: { attack: 0.08, decay: 0.3, sustain: 0.5, release: 0.5, baseFrequency: 200, octaves: 1.5 },
    volume: -12,
  }).toDestination();

  // --- pad: PolySynth(Synth, sine) + Chebyshev (odd harmonics) + Reverb ---
  const reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.04 });
  reverb.connect(warm);
  void reverb.ready;
  const cheby = new Tone.Chebyshev(3);  // order-3: adds odd harmonics
  cheby.connect(reverb);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.25, decay: 0.4, sustain: 0.5, release: 1.2 },
    volume: -20,
  });
  pad.maxPolyphony = 10;
  pad.connect(cheby);

  // --- melody: Synth(amsine) + Tremolo (floating, pulsing) ---
  const tremolo = new Tone.Tremolo({ frequency: 4, depth: 0.6, wet: 0.7 }).start();
  tremolo.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'amsine' } as any,
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 1.2 },
    volume: -12,
  }).connect(tremolo);

  // A E F#m D  A E Bm E
  const NAMES = ['A','E','F#m','D','A','E','Bm','E'];
  const chords = [
    { time: '0:0:0', notes: ['A2','C#3','E3','G#3'], dur: '1m', vel: 0.30 }, // Amaj7
    { time: '1:0:0', notes: ['E3','G#3','B3','D#4'], dur: '1m', vel: 0.30 }, // Emaj7
    { time: '2:0:0', notes: ['F#2','A2','C#3','E3'], dur: '1m', vel: 0.30 }, // F#m7
    { time: '3:0:0', notes: ['D3','F#3','A3','C#4'], dur: '1m', vel: 0.32 }, // Dmaj7
    { time: '4:0:0', notes: ['A2','C#3','E3','G#3'], dur: '1m', vel: 0.28 }, // Amaj7
    { time: '5:0:0', notes: ['E3','G#3','B3','D#4'], dur: '1m', vel: 0.28 }, // Emaj7
    { time: '6:0:0', notes: ['B2','D3','F#3','A3'],  dur: '1m', vel: 0.30 }, // Bm7
    { time: '7:0:0', notes: ['E3','G#3','B3','D#4'], dur: '1m', vel: 0.33 }, // E7
  ];
  const bassLine = [
    { time: '0:0:0', p: 'A1',  d: '2n' }, { time: '0:2:0', p: 'E2',  d: '2n' },
    { time: '1:0:0', p: 'E2',  d: '2n' }, { time: '1:2:0', p: 'B1',  d: '2n' },
    { time: '2:0:0', p: 'F#1', d: '2n' }, { time: '2:2:0', p: 'C#2', d: '2n' },
    { time: '3:0:0', p: 'D2',  d: '2n' }, { time: '3:2:0', p: 'A1',  d: '2n' },
    { time: '4:0:0', p: 'A1',  d: '2n' }, { time: '4:2:0', p: 'C#2', d: '2n' },
    { time: '5:0:0', p: 'E2',  d: '2n' }, { time: '5:2:0', p: 'G#1', d: '2n' },
    { time: '6:0:0', p: 'B1',  d: '2n' }, { time: '6:2:0', p: 'F#1', d: '2n' },
    { time: '7:0:0', p: 'E2',  d: '2n' }, { time: '7:2:0', p: 'B1',  d: '2n' },
  ];
  // A major scale (A B C# D E F# G#) — gentle, floating melody
  const melNotes = [
    { time: '0:0:0', n: 'C#5', d: '4n',  v: 0.65 }, { time: '0:1:0', n: 'E5',  d: '8n',  v: 0.52 },
    { time: '0:1:2', n: 'F#5', d: '8n',  v: 0.48 }, { time: '0:2:0', n: 'E5',  d: '2n',  v: 0.6  },
    { time: '1:0:0', n: 'B4',  d: '4n',  v: 0.62 }, { time: '1:1:0', n: 'G#4', d: '8n',  v: 0.5  },
    { time: '1:1:2', n: 'A4',  d: '8n',  v: 0.48 }, { time: '1:2:0', n: 'B4',  d: '2n',  v: 0.58 },
    { time: '2:0:0', n: 'A4',  d: '4n',  v: 0.65 }, { time: '2:1:0', n: 'C#5', d: '8n',  v: 0.52 },
    { time: '2:1:2', n: 'E5',  d: '8n',  v: 0.5  }, { time: '2:2:0', n: 'D5',  d: '2n',  v: 0.58 },
    { time: '3:0:0', n: 'F#5', d: '4n',  v: 0.65 }, { time: '3:1:0', n: 'E5',  d: '8n',  v: 0.52 },
    { time: '3:1:2', n: 'D5',  d: '8n',  v: 0.5  }, { time: '3:2:0', n: 'C#5', d: '2n',  v: 0.62 },
    { time: '4:0:0', n: 'E5',  d: '8n',  v: 0.68 }, { time: '4:0:2', n: 'G#5', d: '8n',  v: 0.55 },
    { time: '4:1:0', n: 'A5',  d: '4n',  v: 0.65 }, { time: '4:2:0', n: 'G#5', d: '8n',  v: 0.55 },
    { time: '4:2:2', n: 'F#5', d: '4n',  v: 0.6  },
    { time: '5:0:0', n: 'E5',  d: '4n',  v: 0.62 }, { time: '5:1:0', n: 'B4',  d: '8n',  v: 0.5  },
    { time: '5:1:2', n: 'C#5', d: '8n',  v: 0.48 }, { time: '5:2:0', n: 'D#5', d: '2n',  v: 0.58 },
    { time: '6:0:0', n: 'D5',  d: '4n',  v: 0.62 }, { time: '6:1:0', n: 'B4',  d: '8n',  v: 0.5  },
    { time: '6:1:2', n: 'A4',  d: '8n',  v: 0.48 }, { time: '6:2:0', n: 'F#4', d: '2n',  v: 0.55 },
    { time: '7:0:0', n: 'G#4', d: '8n',  v: 0.65 }, { time: '7:0:2', n: 'B4',  d: '8n',  v: 0.55 },
    { time: '7:1:0', n: 'E5',  d: '4n',  v: 0.65 }, { time: '7:2:0', n: 'D#5', d: '4n',  v: 0.58 },
    { time: '7:3:0', n: 'C#5', d: '4n',  v: 0.62 },
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
    kick.dispose(); snare.dispose(); hihat.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    tremolo.dispose(); cheby.dispose(); reverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
