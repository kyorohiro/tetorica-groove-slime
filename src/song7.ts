// Song 7: "Jazz Wah"
// Bb major, 85 BPM — FMSynth bass, PolySynth(DuoSynth) pad, AutoFilter wah melody
import * as Tone from 'tone';

export const META = { name: 'Jazz Wah', bpm: 85 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -12, ratio: 5, attack: 0.003, release: 0.12 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 8000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (jazz-ish, light) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.07, octaves: 5,
    envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.15 }, volume: -6,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.002, decay: 0.12, sustain: 0, release: 0.04 }, volume: -10,
  }).toDestination();
  // MetalSynth as hi-hat (browser only)
  const metal = new Tone.MetalSynth({
    frequency: 400, envelope: { attack: 0.001, decay: 0.04, release: 0.01 },
    harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5,
    volume: -20,
  });
  metal.connect(warm);
  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.005, decay: 0.08, sustain: 0, release: 0.02 }, volume: -15,
  }).toDestination();

  const dp = {
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    metal: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    clap:  [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,1],
  };
  const mV = [0.6,0,0.35,0, 0.55,0,0.35,0, 0.6,0,0.35,0, 0.55,0,0.35,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.metal[i]) metal.triggerAttackRelease('32n', time, mV[i]);
    if (dp.clap[i])  clap.triggerAttackRelease('16n', time, 0.5);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: FMSynth (first time as bass — punchy, hollow) ---
  const bass = new Tone.FMSynth({
    harmonicity: 1, modulationIndex: 3,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.55, release: 0.4 },
    modulation: { type: 'square' },
    modulationEnvelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.3 },
    volume: -10,
  }).toDestination();

  // --- pad: PolySynth(DuoSynth) — detuned polyphonic warmth ---
  const pad = new Tone.PolySynth(Tone.DuoSynth, {
    vibratoAmount: 0.02, vibratoRate: 3,
    harmonicity: 1.004,
    voice0: { oscillator: { type: 'triangle' }, envelope: { attack: 0.15, decay: 0.3, sustain: 0.5, release: 0.6 } },
    voice1: { oscillator: { type: 'sine' },     envelope: { attack: 0.2,  decay: 0.3, sustain: 0.4, release: 0.6 } },
    volume: -22,
  } as any);
  pad.maxPolyphony = 8;
  pad.connect(warm);

  // --- melody: Synth(fmtriangle) + AutoFilter (wah) ---
  const autoFilter = new Tone.AutoFilter({
    frequency: '8n', baseFrequency: 400, octaves: 3, depth: 0.8, wet: 0.7,
  }).start();
  autoFilter.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'fmtriangle' } as any,
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.6, release: 0.5 },
    volume: -12,
  }).connect(autoFilter);

  // Bbmaj7 Gm7 Ebmaj7 F7  Bbmaj7 Gm7 Cm7 F7
  const NAMES = ['Bbmaj7','Gm7','Ebmaj7','F7','Bbmaj7','Gm7','Cm7','F7'];
  const chords = [
    { time: '0:0:0', notes: ['Bb2','D3','F3','A3'],  dur: '1m', vel: 0.32 },
    { time: '1:0:0', notes: ['G2','Bb2','D3','F3'],  dur: '1m', vel: 0.32 },
    { time: '2:0:0', notes: ['Eb3','G3','Bb3','D4'], dur: '1m', vel: 0.32 },
    { time: '3:0:0', notes: ['F2','A2','C3','Eb3'],  dur: '1m', vel: 0.35 },
    { time: '4:0:0', notes: ['Bb2','D3','F3','A3'],  dur: '1m', vel: 0.30 },
    { time: '5:0:0', notes: ['G2','Bb2','D3','F3'],  dur: '1m', vel: 0.30 },
    { time: '6:0:0', notes: ['C3','Eb3','G3','Bb3'], dur: '1m', vel: 0.32 },
    { time: '7:0:0', notes: ['F2','A2','C3','Eb3'],  dur: '1m', vel: 0.35 },
  ];
  const bassLine = [
    { time: '0:0:0', p: 'Bb1', d: '4n' }, { time: '0:2:0', p: 'F2',  d: '4n' },
    { time: '1:0:0', p: 'G1',  d: '4n' }, { time: '1:2:0', p: 'D2',  d: '4n' },
    { time: '2:0:0', p: 'Eb2', d: '4n' }, { time: '2:2:0', p: 'Bb1', d: '4n' },
    { time: '3:0:0', p: 'F1',  d: '4n' }, { time: '3:2:0', p: 'C2',  d: '4n' },
    { time: '4:0:0', p: 'Bb1', d: '4n' }, { time: '4:2:0', p: 'D2',  d: '4n' },
    { time: '5:0:0', p: 'G1',  d: '4n' }, { time: '5:2:0', p: 'Bb1', d: '4n' },
    { time: '6:0:0', p: 'C2',  d: '4n' }, { time: '6:2:0', p: 'G1',  d: '4n' },
    { time: '7:0:0', p: 'F1',  d: '4n' }, { time: '7:2:0', p: 'A1',  d: '4n' },
  ];
  // Bb major scale melody (Bb C D Eb F G A)
  const melNotes = [
    { time: '0:0:0', n: 'F4',  d: '8n',  v: 0.7  }, { time: '0:0:2', n: 'A4',  d: '8n',  v: 0.55 },
    { time: '0:1:0', n: 'D5',  d: '4n',  v: 0.65 }, { time: '0:2:2', n: 'C5',  d: '4n.', v: 0.55 },
    { time: '1:0:0', n: 'Bb4', d: '8n',  v: 0.68 }, { time: '1:0:2', n: 'G4',  d: '8n',  v: 0.52 },
    { time: '1:1:0', n: 'F4',  d: '4n',  v: 0.62 }, { time: '1:2:2', n: 'Eb4', d: '4n.', v: 0.5  },
    { time: '2:0:0', n: 'G4',  d: '8n',  v: 0.68 }, { time: '2:0:2', n: 'Bb4', d: '8n',  v: 0.55 },
    { time: '2:1:0', n: 'D5',  d: '4n',  v: 0.62 }, { time: '2:2:0', n: 'Eb5', d: '8n',  v: 0.55 },
    { time: '2:2:2', n: 'D5',  d: '4n',  v: 0.58 },
    { time: '3:0:0', n: 'C5',  d: '8n',  v: 0.7  }, { time: '3:0:2', n: 'A4',  d: '8n',  v: 0.55 },
    { time: '3:1:0', n: 'F4',  d: '4n',  v: 0.62 }, { time: '3:2:0', n: 'G4',  d: '8n',  v: 0.55 },
    { time: '3:2:2', n: 'A4',  d: '4n',  v: 0.6  },
    { time: '4:0:0', n: 'D5',  d: '8n',  v: 0.7  }, { time: '4:0:2', n: 'F5',  d: '8n',  v: 0.58 },
    { time: '4:1:0', n: 'A5',  d: '4n',  v: 0.65 }, { time: '4:2:0', n: 'G5',  d: '8n',  v: 0.55 },
    { time: '4:2:2', n: 'F5',  d: '4n',  v: 0.6  },
    { time: '5:0:0', n: 'Bb4', d: '4n',  v: 0.65 }, { time: '5:1:0', n: 'D5',  d: '8n',  v: 0.55 },
    { time: '5:1:2', n: 'F5',  d: '8n',  v: 0.52 }, { time: '5:2:0', n: 'Eb5', d: '2n',  v: 0.6  },
    { time: '6:0:0', n: 'Eb5', d: '8n',  v: 0.68 }, { time: '6:0:2', n: 'C5',  d: '8n',  v: 0.52 },
    { time: '6:1:0', n: 'Bb4', d: '4n',  v: 0.62 }, { time: '6:2:0', n: 'G4',  d: '8n',  v: 0.52 },
    { time: '6:2:2', n: 'Bb4', d: '4n',  v: 0.58 },
    { time: '7:0:0', n: 'A4',  d: '8n',  v: 0.7  }, { time: '7:0:2', n: 'C5',  d: '8n',  v: 0.55 },
    { time: '7:1:0', n: 'F5',  d: '4n',  v: 0.65 }, { time: '7:2:0', n: 'Eb5', d: '4n',  v: 0.55 },
    { time: '7:3:0', n: 'D5',  d: '4n',  v: 0.62 },
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
    kick.dispose(); snare.dispose(); metal.dispose(); clap.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    autoFilter.dispose(); warm.dispose(); comp.dispose();
  };
}
