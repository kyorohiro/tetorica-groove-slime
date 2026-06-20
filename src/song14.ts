// Song 14: "JAZZ NIGHT" — 東京事変 style
// D minor, 92 BPM — ハーモニックマイナー + Em7b5, amtriangle+Vibrato mel, amsquare pad
import * as Tone from 'tone';

export const META = { name: 'JAZZ NIGHT', bpm: 92 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -13, ratio: 5, attack: 0.004, release: 0.15 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 7500, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (jazz-lite: light kick, rim snare, light hats + clap) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06, octaves: 4,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.12 }, volume: -8,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.18, sustain: 0, release: 0.07 }, volume: -10,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }, volume: -21,
  }).connect(hhHpf);
  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0, release: 0.03 }, volume: -15,
  }).toDestination();

  const dp = {
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    clap:  [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,1],
  };
  const hhV = [0.55,0,0.32,0, 0.5,0,0.32,0, 0.55,0,0.32,0, 0.5,0,0.32,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    if (dp.clap[i])  clap.triggerAttackRelease('16n', time, 0.45);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(amsawtooth) — jazz walking bass ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'amsawtooth' } as any,
    filter: { Q: 1.5, type: 'lowpass', rolloff: -12, frequency: 400 },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.6, release: 0.3 },
    filterEnvelope: { attack: 0.03, decay: 0.2, sustain: 0.5, release: 0.3, baseFrequency: 200, octaves: 1.5 },
    volume: -11,
  }).toDestination();

  // --- pad: PolySynth(amsquare) + Reverb — vintage organ/electric piano ---
  const reverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.03 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'amsquare' } as any,
    envelope: { attack: 0.15, decay: 0.4, sustain: 0.4, release: 0.8 },
    volume: -24,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: Synth(amtriangle) + Vibrato — Rhodes-like expressive lead ---
  const vibrato = new Tone.Vibrato({ frequency: 5, depth: 0.1, wet: 0.6 });
  vibrato.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'amtriangle' } as any,
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.55, release: 0.8 },
    volume: -12,
  }).connect(vibrato);

  // Dm7 → Bbmaj7 → Gm7 → A7 | Dm7 → Em7b5 → A7 → Dm7
  // Em7b5 = half-diminished: E G Bb D (iiø7 in D harmonic minor)
  const NAMES = ['Dm7','Bbmaj7','Gm7','A7','Dm7','Em7b5','A7','Dm7'];
  const chords = [
    { time: '0:0:0', notes: ['D3','F3','A3','C4'],   dur: '1m', vel: 0.30 },
    { time: '1:0:0', notes: ['Bb2','D3','F3','A3'],  dur: '1m', vel: 0.30 },
    { time: '2:0:0', notes: ['G2','Bb2','D3','F3'],  dur: '1m', vel: 0.30 },
    { time: '3:0:0', notes: ['A2','C#3','E3','G3'],  dur: '1m', vel: 0.33 }, // A7 with raised 3rd
    { time: '4:0:0', notes: ['D3','F3','A3','C4'],   dur: '1m', vel: 0.28 },
    { time: '5:0:0', notes: ['E3','G3','Bb3','D4'],  dur: '1m', vel: 0.30 }, // Em7b5 (half-dim)
    { time: '6:0:0', notes: ['A2','C#3','E3','G3'],  dur: '1m', vel: 0.33 },
    { time: '7:0:0', notes: ['D3','F3','A3','C4'],   dur: '1m', vel: 0.30 },
  ];
  // Walking jazz bass (quarter notes)
  const bassLine = [
    { time: '0:0:0', p: 'D2',  d: '4n' }, { time: '0:1:0', p: 'E2',  d: '4n' },
    { time: '0:2:0', p: 'F2',  d: '4n' }, { time: '0:3:0', p: 'G2',  d: '4n' },
    { time: '1:0:0', p: 'Bb1', d: '4n' }, { time: '1:1:0', p: 'C2',  d: '4n' },
    { time: '1:2:0', p: 'D2',  d: '4n' }, { time: '1:3:0', p: 'Eb2', d: '4n' },
    { time: '2:0:0', p: 'G1',  d: '4n' }, { time: '2:1:0', p: 'A1',  d: '4n' },
    { time: '2:2:0', p: 'Bb1', d: '4n' }, { time: '2:3:0', p: 'C2',  d: '4n' },
    { time: '3:0:0', p: 'A1',  d: '4n' }, { time: '3:1:0', p: 'B1',  d: '4n' },
    { time: '3:2:0', p: 'C#2', d: '4n' }, { time: '3:3:0', p: 'D2',  d: '4n' },
    { time: '4:0:0', p: 'D2',  d: '4n' }, { time: '4:1:0', p: 'F2',  d: '4n' },
    { time: '4:2:0', p: 'A2',  d: '4n' }, { time: '4:3:0', p: 'C2',  d: '4n' },
    { time: '5:0:0', p: 'E2',  d: '4n' }, { time: '5:1:0', p: 'G2',  d: '4n' },
    { time: '5:2:0', p: 'Bb1', d: '4n' }, { time: '5:3:0', p: 'D2',  d: '4n' },
    { time: '6:0:0', p: 'A1',  d: '4n' }, { time: '6:1:0', p: 'C#2', d: '4n' },
    { time: '6:2:0', p: 'E2',  d: '4n' }, { time: '6:3:0', p: 'G2',  d: '4n' },
    { time: '7:0:0', p: 'D2',  d: '4n' }, { time: '7:1:0', p: 'C2',  d: '4n' },
    { time: '7:2:0', p: 'Bb1', d: '4n' }, { time: '7:3:0', p: 'A1',  d: '4n' },
  ];
  // D minor (D E F G A Bb C) + harmonic minor C# over A7, jazz phrasing
  const melNotes = [
    // Bar 0 Dm7 — start on off-beat (jazz)
    { time: '0:0:2', n: 'A4',  d: '8n',  v: 0.65 }, { time: '0:1:0', n: 'F4',  d: '8n',  v: 0.58 },
    { time: '0:1:2', n: 'A4',  d: '8n',  v: 0.6  }, { time: '0:2:0', n: 'C5',  d: '4n',  v: 0.65 },
    { time: '0:3:0', n: 'A4',  d: '8n',  v: 0.55 }, { time: '0:3:2', n: 'F4',  d: '8n',  v: 0.5  },
    // Bar 1 Bbmaj7
    { time: '1:0:0', n: 'D5',  d: '4n',  v: 0.68 }, { time: '1:1:2', n: 'Bb4', d: '8n',  v: 0.55 },
    { time: '1:2:0', n: 'A4',  d: '4n',  v: 0.62 }, { time: '1:3:0', n: 'F4',  d: '4n',  v: 0.55 },
    // Bar 2 Gm7
    { time: '2:0:0', n: 'G4',  d: '8n',  v: 0.65 }, { time: '2:0:2', n: 'Bb4', d: '8n',  v: 0.55 },
    { time: '2:1:0', n: 'D5',  d: '4n',  v: 0.65 }, { time: '2:2:0', n: 'F5',  d: '8n',  v: 0.6  },
    { time: '2:2:2', n: 'Eb5', d: '4n',  v: 0.55 }, // chromatic passing Eb→D
    // Bar 3 A7 — use C# (harmonic minor flavor)
    { time: '3:0:0', n: 'E5',  d: '8n',  v: 0.68 }, { time: '3:0:2', n: 'C#5', d: '8n',  v: 0.58 },
    { time: '3:1:0', n: 'A4',  d: '4n',  v: 0.65 }, { time: '3:2:0', n: 'G4',  d: '8n',  v: 0.55 },
    { time: '3:2:2', n: 'F4',  d: '8n',  v: 0.5  }, { time: '3:3:0', n: 'E4',  d: '4n',  v: 0.55 },
    // Bar 4 Dm7
    { time: '4:0:0', n: 'D4',  d: '8n',  v: 0.65 }, { time: '4:0:2', n: 'E4',  d: '8n',  v: 0.52 },
    { time: '4:1:0', n: 'A4',  d: '4n',  v: 0.65 }, { time: '4:2:2', n: 'C5',  d: '4n.', v: 0.6  },
    // Bar 5 Em7b5 — half-dim color (E G Bb as melody)
    { time: '5:0:0', n: 'E5',  d: '8n',  v: 0.65 }, { time: '5:0:2', n: 'G5',  d: '8n',  v: 0.6  },
    { time: '5:1:0', n: 'Bb5', d: '4n',  v: 0.65 }, { time: '5:2:0', n: 'G5',  d: '8n',  v: 0.58 },
    { time: '5:2:2', n: 'F5',  d: '4n',  v: 0.55 },
    // Bar 6 A7 — tension before resolve
    { time: '6:0:0', n: 'E5',  d: '8n',  v: 0.68 }, { time: '6:0:2', n: 'C#5', d: '8n',  v: 0.6  },
    { time: '6:1:0', n: 'A4',  d: '4n',  v: 0.65 }, { time: '6:2:0', n: 'G4',  d: '8n',  v: 0.55 },
    { time: '6:2:2', n: 'E4',  d: '8n',  v: 0.5  }, { time: '6:3:0', n: 'C#4', d: '4n',  v: 0.55 },
    // Bar 7 Dm7 — resolve
    { time: '7:0:0', n: 'D5',  d: '2n',  v: 0.65 }, { time: '7:2:0', n: 'F4',  d: '8n',  v: 0.52 },
    { time: '7:2:2', n: 'A4',  d: '8n',  v: 0.55 }, { time: '7:3:0', n: 'D4',  d: '4n',  v: 0.6  },
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
    vibrato.dispose(); reverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
