// Song 18: "IPANEMA NIGHTS" — Bossa Nova style (ボサノバ)
// F major, 88 BPM — Fmaj7→Gm7→C7→Fmaj7 | Dm7→Em7b5→A7→Dm7
// (Em7b5→A7→Dm7 = ii-V-i in D minor, classic Jobim motion)
// New: Synth(fatsine)+Tremolo mel, PolySynth(fmsine)+Reverb pad, MonoSynth(fatsine) bass
import * as Tone from 'tone';

export const META = { name: 'IPANEMA NIGHTS', bpm: 88 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -14, ratio: 4, attack: 0.004, release: 0.15 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 7500, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: bossa nova rhythm (soft kick, syncopated rim, off-beat hats) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 4,
    envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.1 }, volume: -8,
  }).toDestination();
  // rim click: very short pink noise burst
  const rimHpf = new Tone.Filter({ frequency: 4000, type: 'highpass' });
  rimHpf.connect(warm);
  const rim = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }, volume: -18,
  }).connect(rimHpf);
  const hhHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.055, sustain: 0, release: 0.01 }, volume: -22,
  }).connect(hhHpf);

  // Bossa nova pattern:
  // kick: beat 1 + "and of 3" (off-beat syncopation)
  // rim:  syncopated 16ths at step 5 & 13
  // hat:  off-beat 8ths (steps 2, 7, 10, 15) — the characteristic bossa "feel"
  const dp = {
    kick: [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    rim:  [0,0,0,0, 0,1,0,0, 0,0,0,0, 0,1,0,0],
    hhat: [0,0,1,0, 0,0,0,1, 0,0,1,0, 0,0,0,1],
  };
  const hhV = [0,0,0.5,0, 0,0,0,0.4, 0,0,0.5,0, 0,0,0,0.4];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i]) kick.triggerAttackRelease('C1', '8n', time);
    if (dp.rim[i])  rim.triggerAttackRelease('32n', time, 0.55);
    if (dp.hhat[i]) hihat.triggerAttackRelease('32n', time, hhV[i]);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.rim[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(fatsine) — round, warm walking bass (3 detuned sines) ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fatsine', count: 3, spread: 12 } as any,
    filter: { Q: 1, type: 'lowpass', rolloff: -12, frequency: 600 },
    envelope: { attack: 0.03, decay: 0.15, sustain: 0.7, release: 0.35 },
    filterEnvelope: { attack: 0.03, decay: 0.15, sustain: 0.7, release: 0.35, baseFrequency: 250, octaves: 1 },
    volume: -10,
  }).toDestination();

  // --- pad: PolySynth(fmsine) + Reverb — warm FM sine chord voicings ---
  const reverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.04 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fmsine' } as any,
    envelope: { attack: 0.2, decay: 0.3, sustain: 0.5, release: 0.9 },
    volume: -22,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: Synth(fatsine) + Tremolo — intimate nylon guitar-like lead ---
  const tremolo = new Tone.Tremolo({ frequency: 4, depth: 0.25, wet: 0.45 }).start();
  tremolo.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'fatsine', count: 3, spread: 15 } as any,
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.55, release: 0.8 },
    volume: -12,
  }).connect(tremolo);

  // Fmaj7→Gm7→C7→Fmaj7 | Dm7→Em7b5→A7→Dm7
  // Em7b5 = E G Bb D (half-diminished, iiø7 leading to A7→Dm)
  const NAMES = ['Fmaj7','Gm7','C7','Fmaj7','Dm7','Em7b5','A7','Dm7'];
  const chords = [
    { time: '0:0:0', notes: ['F3','A3','C4','E4'],   dur: '1m', vel: 0.28 },
    { time: '1:0:0', notes: ['G3','Bb3','D4','F4'],  dur: '1m', vel: 0.28 },
    { time: '2:0:0', notes: ['C3','E3','G3','Bb3'],  dur: '1m', vel: 0.28 },
    { time: '3:0:0', notes: ['F3','A3','C4','E4'],   dur: '1m', vel: 0.26 },
    { time: '4:0:0', notes: ['D3','F3','A3','C4'],   dur: '1m', vel: 0.28 },
    { time: '5:0:0', notes: ['E3','G3','Bb3','D4'],  dur: '1m', vel: 0.28 }, // Em7b5
    { time: '6:0:0', notes: ['A2','C#3','E3','G3'],  dur: '1m', vel: 0.30 }, // A7 (dominant of Dm)
    { time: '7:0:0', notes: ['D3','F3','A3','C4'],   dur: '1m', vel: 0.28 },
  ];
  // Walking bass line (F major / D minor, smooth 4-to-the-bar)
  const bassLine = [
    { time: '0:0:0', p: 'F2',  d: '4n' }, { time: '0:1:0', p: 'A1',  d: '4n' },
    { time: '0:2:0', p: 'C2',  d: '4n' }, { time: '0:3:0', p: 'E2',  d: '4n' },
    { time: '1:0:0', p: 'G1',  d: '4n' }, { time: '1:1:0', p: 'Bb1', d: '4n' },
    { time: '1:2:0', p: 'D2',  d: '4n' }, { time: '1:3:0', p: 'F2',  d: '4n' },
    { time: '2:0:0', p: 'C2',  d: '4n' }, { time: '2:1:0', p: 'E2',  d: '4n' },
    { time: '2:2:0', p: 'G1',  d: '4n' }, { time: '2:3:0', p: 'Bb1', d: '4n' },
    { time: '3:0:0', p: 'F2',  d: '4n' }, { time: '3:1:0', p: 'A1',  d: '4n' },
    { time: '3:2:0', p: 'F2',  d: '4n' }, { time: '3:3:0', p: 'Eb2', d: '4n' }, // chromatic to Dm
    { time: '4:0:0', p: 'D2',  d: '4n' }, { time: '4:1:0', p: 'F2',  d: '4n' },
    { time: '4:2:0', p: 'A1',  d: '4n' }, { time: '4:3:0', p: 'C2',  d: '4n' },
    { time: '5:0:0', p: 'E2',  d: '4n' }, { time: '5:1:0', p: 'G2',  d: '4n' },
    { time: '5:2:0', p: 'Bb1', d: '4n' }, { time: '5:3:0', p: 'D2',  d: '4n' },
    { time: '6:0:0', p: 'A1',  d: '4n' }, { time: '6:1:0', p: 'C#2', d: '4n' },
    { time: '6:2:0', p: 'E2',  d: '4n' }, { time: '6:3:0', p: 'G2',  d: '4n' },
    { time: '7:0:0', p: 'D2',  d: '4n' }, { time: '7:1:0', p: 'C2',  d: '4n' },
    { time: '7:2:0', p: 'Bb1', d: '4n' }, { time: '7:3:0', p: 'A1',  d: '4n' },
  ];
  // F major (F G A Bb C D E) — intimate bossa melody, off-beat entries typical of the style
  const melNotes = [
    // Bar 0 Fmaj7 — start on "and of 1"
    { time: '0:0:2', n: 'A4',  d: '8n',  v: 0.62 }, { time: '0:1:0', n: 'C5',  d: '4n',  v: 0.65 },
    { time: '0:2:0', n: 'F5',  d: '8n',  v: 0.62 }, { time: '0:2:2', n: 'E5',  d: '4n',  v: 0.58 },
    { time: '0:3:2', n: 'D5',  d: '8n',  v: 0.55 },
    // Bar 1 Gm7
    { time: '1:0:0', n: 'G5',  d: '8n',  v: 0.65 }, { time: '1:0:2', n: 'F5',  d: '8n',  v: 0.55 },
    { time: '1:1:0', n: 'D5',  d: '4n',  v: 0.62 }, { time: '1:2:2', n: 'Bb4', d: '4n.', v: 0.58 },
    // Bar 2 C7
    { time: '2:0:0', n: 'C5',  d: '8n',  v: 0.65 }, { time: '2:0:2', n: 'E5',  d: '8n',  v: 0.6  },
    { time: '2:1:0', n: 'G5',  d: '4n',  v: 0.65 }, { time: '2:2:2', n: 'F5',  d: '4n.', v: 0.6  },
    // Bar 3 Fmaj7 — long note, rest
    { time: '3:0:0', n: 'A5',  d: '4n',  v: 0.68 }, { time: '3:1:0', n: 'G5',  d: '8n',  v: 0.58 },
    { time: '3:1:2', n: 'F5',  d: '8n',  v: 0.55 }, { time: '3:2:0', n: 'E5',  d: '2n',  v: 0.62 },
    // Bar 4 Dm7 — lower register, intimate
    { time: '4:0:2', n: 'D5',  d: '8n',  v: 0.62 }, { time: '4:1:0', n: 'F5',  d: '8n',  v: 0.58 },
    { time: '4:1:2', n: 'A5',  d: '8n',  v: 0.65 }, { time: '4:2:0', n: 'C5',  d: '4n',  v: 0.62 },
    { time: '4:3:0', n: 'Bb4', d: '8n',  v: 0.55 }, { time: '4:3:2', n: 'A4',  d: '8n',  v: 0.52 },
    // Bar 5 Em7b5 — half-dim color (Bb highlights the b5)
    { time: '5:0:0', n: 'G5',  d: '8n',  v: 0.62 }, { time: '5:0:2', n: 'Bb5', d: '8n',  v: 0.58 },
    { time: '5:1:0', n: 'G5',  d: '4n',  v: 0.62 }, { time: '5:2:2', n: 'E5',  d: '4n.', v: 0.58 },
    // Bar 6 A7 — C# brings harmonic minor tension
    { time: '6:0:0', n: 'E5',  d: '8n',  v: 0.65 }, { time: '6:0:2', n: 'C#5', d: '8n',  v: 0.6  },
    { time: '6:1:0', n: 'A4',  d: '4n',  v: 0.65 }, { time: '6:2:2', n: 'G4',  d: '4n.', v: 0.58 },
    // Bar 7 Dm7 — gentle resolve
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
    kick.dispose(); rim.dispose(); hihat.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    tremolo.dispose(); reverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose(); rimHpf.dispose();
  };
}
