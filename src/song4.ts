// Song 4: "Duo Dusk"
// D major, 82 BPM
// Sound: DuoSynth melody (detuned unison), PolySynth(AMSynth) pad, AMSynth bass
import * as Tone from 'tone';

export const META = { name: 'Duo Dusk', bpm: 82 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -13, ratio: 5, attack: 0.005, release: 0.15 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 7000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (half-time, slightly swung) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08, octaves: 5,
    envelope: { attack: 0.001, decay: 0.32, sustain: 0, release: 0.18 }, volume: -5,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.05 }, volume: -9,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.055, sustain: 0, release: 0.01 }, volume: -21,
  }).connect(hhHpf);
  const openHpf = new Tone.Filter({ frequency: 7000, type: 'highpass' });
  openHpf.connect(warm);
  const openhat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.07 }, volume: -25,
  }).connect(openHpf);

  const dp = {
    kick:  [1,0,0,0, 0,0,1,0, 0,0,0,1, 0,0,0,0],
    snare: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    open:  [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
  };
  const hhV = [0.75,0,0.45,0, 0.65,0,0.45,0, 0.75,0,0.45,0, 0.65,0,0.45,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    if (dp.open[i])  openhat.triggerAttackRelease('8n', time);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: AMSynth (nasal, slightly gritty) ---
  const bass = new Tone.AMSynth({
    harmonicity: 2,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.03, decay: 0.2, sustain: 0.5, release: 0.5 },
    modulation: { type: 'square' },
    modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.5, release: 0.4 },
    volume: -13,
  }).toDestination();

  // --- pad: PolySynth(AMSynth) — organ-like warmth ---
  const pad = new Tone.PolySynth(Tone.AMSynth, {
    harmonicity: 1.5,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.14, decay: 0.4, sustain: 0.55, release: 0.5 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.4, decay: 0.3, sustain: 0.4, release: 0.4 },
    volume: -22,
  });
  pad.maxPolyphony = 10;
  pad.connect(warm);

  // --- melody: DuoSynth (detuned 2 voices, rich unison) ---
  const mel = new Tone.DuoSynth({
    vibratoAmount: 0.03,
    vibratoRate: 4.5,
    harmonicity: 1.005,           // very slight detune
    voice0: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.15, sustain: 0.5, release: 0.8 },
      filterEnvelope: { attack: 0.02, decay: 0.2, sustain: 0.5, release: 0.8, baseFrequency: 600, octaves: 2 },
    },
    voice1: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.15, sustain: 0.5, release: 0.8 },
      filterEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.8, baseFrequency: 400, octaves: 2 },
    },
    volume: -12,
  }).connect(warm);

  // Dmaj7 Bm7 Gmaj7 A7  Dmaj7 Bm7 Em7 A7
  const NAMES = ['Dmaj7','Bm7','Gmaj7','A7','Dmaj7','Bm7','Em7','A7'];
  const chords = [
    { time: '0:0:0', notes: ['D3','F#3','A3','C#4'], dur: '1m', vel: 0.33 }, // Dmaj7
    { time: '1:0:0', notes: ['B2','D3','F#3','A3'],  dur: '1m', vel: 0.33 }, // Bm7
    { time: '2:0:0', notes: ['G2','B2','D3','F#3'],  dur: '1m', vel: 0.33 }, // Gmaj7
    { time: '3:0:0', notes: ['A2','C#3','E3','G3'],  dur: '1m', vel: 0.36 }, // A7
    { time: '4:0:0', notes: ['D3','F#3','A3','C#4'], dur: '1m', vel: 0.31 }, // Dmaj7
    { time: '5:0:0', notes: ['B2','D3','F#3','A3'],  dur: '1m', vel: 0.31 }, // Bm7
    { time: '6:0:0', notes: ['E3','G3','B3','D4'],   dur: '1m', vel: 0.33 }, // Em7
    { time: '7:0:0', notes: ['A2','C#3','E3','G3'],  dur: '1m', vel: 0.36 }, // A7
  ];
  const bassLine = [
    { time: '0:0:0', p: 'D2', d: '4n' }, { time: '0:2:0', p: 'A1',  d: '4n' },
    { time: '1:0:0', p: 'B1', d: '4n' }, { time: '1:2:0', p: 'F#1', d: '4n' },
    { time: '2:0:0', p: 'G1', d: '4n' }, { time: '2:2:0', p: 'D2',  d: '4n' },
    { time: '3:0:0', p: 'A1', d: '4n' }, { time: '3:2:0', p: 'E2',  d: '4n' },
    { time: '4:0:0', p: 'D2', d: '4n' }, { time: '4:2:0', p: 'F#1', d: '4n' },
    { time: '5:0:0', p: 'B1', d: '4n' }, { time: '5:2:0', p: 'D2',  d: '4n' },
    { time: '6:0:0', p: 'E2', d: '4n' }, { time: '6:2:0', p: 'B1',  d: '4n' },
    { time: '7:0:0', p: 'A1', d: '4n' }, { time: '7:2:0', p: 'C#2', d: '4n' },
  ];
  // DuoSynth melody — D major (D E F# G A B C#)
  const melNotes = [
    // bar 0 Dmaj7
    { time: '0:0:0', n: 'F#4', d: '8n',  v: 0.68 }, { time: '0:0:2', n: 'A4',  d: '8n',  v: 0.52 },
    { time: '0:1:0', n: 'C#5', d: '4n',  v: 0.62 }, { time: '0:2:2', n: 'B4',  d: '8n',  v: 0.5  },
    { time: '0:3:0', n: 'A4',  d: '4n',  v: 0.58 },
    // bar 1 Bm7
    { time: '1:0:0', n: 'B4',  d: '8n',  v: 0.65 }, { time: '1:0:2', n: 'D5',  d: '8n',  v: 0.5  },
    { time: '1:1:0', n: 'B4',  d: '4n',  v: 0.6  }, { time: '1:2:2', n: 'A4',  d: '4n.', v: 0.52 },
    // bar 2 Gmaj7
    { time: '2:0:0', n: 'G4',  d: '8n',  v: 0.65 }, { time: '2:0:2', n: 'B4',  d: '8n',  v: 0.5  },
    { time: '2:1:0', n: 'D5',  d: '4n',  v: 0.62 }, { time: '2:2:2', n: 'C#5', d: '4n.', v: 0.52 },
    // bar 3 A7
    { time: '3:0:0', n: 'C#5', d: '8n',  v: 0.68 }, { time: '3:0:2', n: 'E5',  d: '8n',  v: 0.55 },
    { time: '3:1:0', n: 'A4',  d: '4n',  v: 0.62 }, { time: '3:2:0', n: 'G4',  d: '4n',  v: 0.52 },
    { time: '3:3:0', n: 'F#4', d: '4n',  v: 0.58 },
    // bar 4 Dmaj7 (variation)
    { time: '4:0:0', n: 'A4',  d: '8n',  v: 0.65 }, { time: '4:0:2', n: 'F#4', d: '8n',  v: 0.5  },
    { time: '4:1:0', n: 'D4',  d: '4n',  v: 0.6  }, { time: '4:2:0', n: 'E4',  d: '8n',  v: 0.52 },
    { time: '4:2:2', n: 'F#4', d: '4n',  v: 0.55 },
    // bar 5 Bm7
    { time: '5:0:0', n: 'B4',  d: '4n',  v: 0.62 }, { time: '5:1:0', n: 'A4',  d: '8n',  v: 0.5  },
    { time: '5:1:2', n: 'G4',  d: '8n',  v: 0.48 }, { time: '5:2:0', n: 'F#4', d: '2n',  v: 0.55 },
    // bar 6 Em7
    { time: '6:0:0', n: 'E4',  d: '8n',  v: 0.62 }, { time: '6:0:2', n: 'G4',  d: '8n',  v: 0.5  },
    { time: '6:1:0', n: 'B4',  d: '4n',  v: 0.6  }, { time: '6:2:0', n: 'A4',  d: '2n',  v: 0.55 },
    // bar 7 A7
    { time: '7:0:0', n: 'E5',  d: '8n',  v: 0.68 }, { time: '7:0:2', n: 'C#5', d: '8n',  v: 0.55 },
    { time: '7:1:0', n: 'A4',  d: '4n',  v: 0.62 }, { time: '7:2:0', n: 'G4',  d: '4n',  v: 0.52 },
    { time: '7:3:0', n: 'E4',  d: '4n',  v: 0.58 },
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
    kick.dispose(); snare.dispose(); hihat.dispose(); openhat.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose(); openHpf.dispose();
  };
}
