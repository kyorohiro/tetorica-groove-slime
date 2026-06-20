// Song 13: "STARLIGHT" — L'Arc-en-Ciel style
// A major, 130 BPM — 王道進行 IV→V→IIIm→VIm: Dmaj7→E7→C#m7→F#m7
// New: amsawtooth lead, PolySynth(fatsine)+Chorus pad, MonoSynth(fmtriangle) bass
import * as Tone from 'tone';

export const META = { name: 'STARLIGHT', bpm: 130 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -11, ratio: 5, attack: 0.002, release: 0.1 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 9000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: 130 BPM rock (kick on 1 & and-of-2 & 3 & and-of-4) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08, octaves: 5,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.15 }, volume: -4,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.05 }, volume: -7,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9500, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }, volume: -18,
  }).connect(hhHpf);

  const dp = {
    kick:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,1,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  };
  const hhV = [0.8,0,0.45,0, 0.75,0,0.45,0, 0.8,0,0.45,0, 0.75,0,0.45,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(fmtriangle) — round but with FM hollow quality ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fmtriangle' } as any,
    filter: { Q: 2, type: 'lowpass', rolloff: -12, frequency: 500 },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2 },
    filterEnvelope: { attack: 0.01, decay: 0.15, sustain: 0.6, release: 0.2, baseFrequency: 200, octaves: 1.5 },
    volume: -9,
  }).toDestination();

  // --- pad: PolySynth(fatsine) + Chorus — warm strings-like fill ---
  const chorus = new Tone.Chorus({ frequency: 2.5, delayTime: 3, depth: 0.4, wet: 0.4 }).start().connect(warm);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsine', count: 3, spread: 20 } as any,
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.6 },
    volume: -23,
  });
  pad.maxPolyphony = 10;
  pad.connect(chorus);

  // --- melody: Synth(amsawtooth) — bright AM sawtooth J-rock lead ---
  const mel = new Tone.Synth({
    oscillator: { type: 'amsawtooth' } as any,
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.6, release: 0.4 },
    volume: -13,
  }).connect(warm);

  // 王道進行 in A: IV→V→IIIm→VIm = Dmaj7→E7→C#m7→F#m7
  const NAMES = ['Dmaj7','E7','C#m7','F#m7','Dmaj7','E7','C#m7','F#m7'];
  const chords = [
    { time: '0:0:0', notes: ['D3','F#3','A3','C#4'], dur: '1m', vel: 0.33 },
    { time: '1:0:0', notes: ['E3','G#3','B3','D4'],  dur: '1m', vel: 0.35 },
    { time: '2:0:0', notes: ['C#3','E3','G#3','B3'], dur: '1m', vel: 0.33 },
    { time: '3:0:0', notes: ['F#3','A3','C#4','E4'], dur: '1m', vel: 0.33 },
    { time: '4:0:0', notes: ['D3','F#3','A3','C#4'], dur: '1m', vel: 0.31 },
    { time: '5:0:0', notes: ['E3','G#3','B3','D4'],  dur: '1m', vel: 0.35 },
    { time: '6:0:0', notes: ['C#3','E3','G#3','B3'], dur: '1m', vel: 0.31 },
    { time: '7:0:0', notes: ['F#3','A3','C#4','E4'], dur: '1m', vel: 0.35 },
  ];
  // Driving quarter-note bass with 5th movement
  const bassLine = [
    { time: '0:0:0', p: 'D2',  d: '4n' }, { time: '0:1:0', p: 'A1',  d: '4n' },
    { time: '0:2:0', p: 'D2',  d: '4n' }, { time: '0:3:0', p: 'F#1', d: '4n' },
    { time: '1:0:0', p: 'E2',  d: '4n' }, { time: '1:1:0', p: 'B1',  d: '4n' },
    { time: '1:2:0', p: 'E2',  d: '4n' }, { time: '1:3:0', p: 'G#1', d: '4n' },
    { time: '2:0:0', p: 'C#2', d: '4n' }, { time: '2:1:0', p: 'G#1', d: '4n' },
    { time: '2:2:0', p: 'C#2', d: '4n' }, { time: '2:3:0', p: 'E2',  d: '4n' },
    { time: '3:0:0', p: 'F#1', d: '4n' }, { time: '3:1:0', p: 'C#2', d: '4n' },
    { time: '3:2:0', p: 'F#1', d: '4n' }, { time: '3:3:0', p: 'A1',  d: '4n' },
    { time: '4:0:0', p: 'D2',  d: '4n' }, { time: '4:1:0', p: 'A1',  d: '4n' },
    { time: '4:2:0', p: 'F#1', d: '4n' }, { time: '4:3:0', p: 'D2',  d: '4n' },
    { time: '5:0:0', p: 'E2',  d: '4n' }, { time: '5:1:0', p: 'B1',  d: '4n' },
    { time: '5:2:0', p: 'G#1', d: '4n' }, { time: '5:3:0', p: 'E2',  d: '4n' },
    { time: '6:0:0', p: 'C#2', d: '4n' }, { time: '6:1:0', p: 'E2',  d: '4n' },
    { time: '6:2:0', p: 'G#1', d: '4n' }, { time: '6:3:0', p: 'C#2', d: '4n' },
    { time: '7:0:0', p: 'F#1', d: '4n' }, { time: '7:1:0', p: 'A1',  d: '4n' },
    { time: '7:2:0', p: 'C#2', d: '4n' }, { time: '7:3:0', p: 'E2',  d: '4n' },
  ];
  // A major scale (A B C# D E F# G#) — J-rock synth lead
  const melNotes = [
    { time: '0:0:0', n: 'F#5', d: '8n',  v: 0.72 }, { time: '0:0:2', n: 'A5',  d: '8n',  v: 0.62 },
    { time: '0:1:0', n: 'D5',  d: '4n',  v: 0.68 }, { time: '0:2:0', n: 'E5',  d: '8n',  v: 0.62 },
    { time: '0:2:2', n: 'F#5', d: '8n',  v: 0.6  }, { time: '0:3:2', n: 'A5',  d: '8n',  v: 0.58 },
    { time: '1:0:0', n: 'E5',  d: '8n',  v: 0.72 }, { time: '1:0:2', n: 'G#5', d: '8n',  v: 0.62 },
    { time: '1:1:0', n: 'B5',  d: '4n',  v: 0.68 }, { time: '1:2:0', n: 'A5',  d: '8n',  v: 0.62 },
    { time: '1:2:2', n: 'G#5', d: '8n',  v: 0.58 }, { time: '1:3:0', n: 'E5',  d: '4n',  v: 0.6  },
    { time: '2:0:0', n: 'C#5', d: '8n',  v: 0.7  }, { time: '2:0:2', n: 'E5',  d: '8n',  v: 0.6  },
    { time: '2:1:0', n: 'G#5', d: '4n',  v: 0.68 }, { time: '2:2:0', n: 'B5',  d: '8n',  v: 0.62 },
    { time: '2:2:2', n: 'A5',  d: '8n',  v: 0.58 }, { time: '2:3:0', n: 'G#5', d: '4n',  v: 0.6  },
    { time: '3:0:0', n: 'F#5', d: '4n',  v: 0.72 }, { time: '3:1:0', n: 'A5',  d: '8n',  v: 0.62 },
    { time: '3:1:2', n: 'F#5', d: '8n',  v: 0.58 }, { time: '3:2:0', n: 'E5',  d: '8n',  v: 0.6  },
    { time: '3:2:2', n: 'C#5', d: '8n',  v: 0.55 }, { time: '3:3:0', n: 'A4',  d: '4n',  v: 0.58 },
    // Second half: escalate higher
    { time: '4:0:0', n: 'D5',  d: '8n',  v: 0.7  }, { time: '4:0:2', n: 'E5',  d: '8n',  v: 0.6  },
    { time: '4:1:0', n: 'F#5', d: '4n',  v: 0.68 }, { time: '4:2:0', n: 'A5',  d: '4n',  v: 0.65 },
    { time: '4:3:0', n: 'G#5', d: '8n',  v: 0.6  }, { time: '4:3:2', n: 'F#5', d: '8n',  v: 0.55 },
    { time: '5:0:0', n: 'G#5', d: '4n',  v: 0.72 }, { time: '5:1:0', n: 'B5',  d: '8n',  v: 0.65 },
    { time: '5:1:2', n: 'D6',  d: '8n',  v: 0.62 }, { time: '5:2:0', n: 'C#6', d: '4n',  v: 0.7  },
    { time: '5:3:0', n: 'B5',  d: '4n',  v: 0.65 },
    { time: '6:0:0', n: 'A5',  d: '8n',  v: 0.68 }, { time: '6:0:2', n: 'G#5', d: '8n',  v: 0.58 },
    { time: '6:1:0', n: 'E5',  d: '4n',  v: 0.65 }, { time: '6:2:0', n: 'F#5', d: '8n',  v: 0.6  },
    { time: '6:2:2', n: 'E5',  d: '4n',  v: 0.58 },
    { time: '7:0:0', n: 'F#5', d: '4n',  v: 0.72 }, { time: '7:1:0', n: 'A5',  d: '4n',  v: 0.65 },
    { time: '7:2:0', n: 'C#6', d: '4n',  v: 0.72 }, { time: '7:3:0', n: 'B5',  d: '4n',  v: 0.65 },
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
    chorus.dispose(); warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
