// Song 3: "Midnight Keys"
// F major, 88 BPM
// Sound: FMSynth melody (bell-like), sawtooth pad, punchy standard drums
import * as Tone from 'tone';

export const META = { name: 'Midnight Keys', bpm: 88 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -12, ratio: 5, attack: 0.003, release: 0.1 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 8500, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (punchy, standard 2&4 snare) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 8,           // punchy / snappy
    envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.1 }, volume: -3,
  }).toDestination();

  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.04 }, volume: -7,
  }).toDestination();

  const hhHpf = new Tone.Filter({ frequency: 9500, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }, volume: -19,
  }).connect(hhHpf);

  const openHpf = new Tone.Filter({ frequency: 7500, type: 'highpass' });
  openHpf.connect(warm);
  const openhat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.06 }, volume: -23,
  }).connect(openHpf);

  // standard 2-and-4 snare, busier kick
  const dp = {
    kick:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],  // 2 and 4
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    open:  [0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0],
  };
  const hhV = [0.8,0,0.55,0, 0.7,0,0.55,0, 0.8,0,0.55,0, 0.7,0,0.55,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    if (dp.open[i])  openhat.triggerAttackRelease('8n', time);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass (square wave, mid-forward) ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'square' },
    filter: { Q: 1, type: 'lowpass', rolloff: -24, frequency: 600 },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.3 },
    filterEnvelope: { attack: 0.02, decay: 0.15, sustain: 0.6, release: 0.3, baseFrequency: 250, octaves: 2 },
    volume: -11,
  }).toDestination();

  // --- pad (sawtooth PolySynth — brighter shimmer) ---
  const chorus = new Tone.Chorus({ frequency: 1.5, delayTime: 3.5, depth: 0.4, wet: 0.4 }).connect(warm);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.35 }, volume: -24,
  });
  pad.maxPolyphony = 12;
  pad.connect(chorus);

  // --- melody: FMSynth (bell / electric piano character) ---
  const mel = new Tone.FMSynth({
    harmonicity: 3.01,
    modulationIndex: 4,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.3, release: 1.0 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.2, decay: 0.4, sustain: 0.1, release: 0.5 },
    volume: -13,
  }).connect(warm);

  // Fmaj7 Gm7 Am7 Bbmaj7 Fmaj7 Cm7 Dm7 C7
  const NAMES = ['Fmaj7','Gm7','Am7','Bbmaj7','Fmaj7','Cm7','Dm7','C7'];
  const chords = [
    { time: '0:0:0', notes: ['F3','A3','C4','E4'],  dur: '1m', vel: 0.33 }, // Fmaj7
    { time: '1:0:0', notes: ['G3','Bb3','D4','F4'], dur: '1m', vel: 0.33 }, // Gm7
    { time: '2:0:0', notes: ['A3','C4','E4','G4'],  dur: '1m', vel: 0.33 }, // Am7
    { time: '3:0:0', notes: ['Bb3','D4','F4','A4'], dur: '1m', vel: 0.33 }, // Bbmaj7
    { time: '4:0:0', notes: ['F3','A3','C4','E4'],  dur: '1m', vel: 0.31 }, // Fmaj7
    { time: '5:0:0', notes: ['C3','Eb3','G3','Bb3'],dur: '1m', vel: 0.33 }, // Cm7
    { time: '6:0:0', notes: ['D3','F3','A3','C4'],  dur: '1m', vel: 0.33 }, // Dm7
    { time: '7:0:0', notes: ['C3','E3','G3','Bb3'], dur: '1m', vel: 0.36 }, // C7
  ];
  const bassLine = [
    { time: '0:0:0', p: 'F2', d: '4n' }, { time: '0:2:0', p: 'C2', d: '4n' },
    { time: '1:0:0', p: 'G2', d: '4n' }, { time: '1:2:0', p: 'D2', d: '4n' },
    { time: '2:0:0', p: 'A1', d: '4n' }, { time: '2:2:0', p: 'E2', d: '4n' },
    { time: '3:0:0', p: 'Bb1',d: '4n' }, { time: '3:2:0', p: 'F2', d: '4n' },
    { time: '4:0:0', p: 'F2', d: '4n' }, { time: '4:2:0', p: 'A1', d: '4n' },
    { time: '5:0:0', p: 'C2', d: '4n' }, { time: '5:2:0', p: 'G1', d: '4n' },
    { time: '6:0:0', p: 'D2', d: '4n' }, { time: '6:2:0', p: 'A1', d: '4n' },
    { time: '7:0:0', p: 'C2', d: '4n' }, { time: '7:2:0', p: 'G1', d: '4n' },
  ];
  // FM melody — F major (F G A Bb C D E)
  const melNotes = [
    // bar 0 Fmaj7
    { time: '0:0:0', n: 'A4', d: '8n',  v: 0.7  }, { time: '0:0:2', n: 'C5', d: '8n',  v: 0.55 },
    { time: '0:1:0', n: 'E5', d: '4n',  v: 0.65 }, { time: '0:2:2', n: 'D5', d: '8n',  v: 0.5  },
    { time: '0:3:0', n: 'C5', d: '4n',  v: 0.6  },
    // bar 1 Gm7
    { time: '1:0:0', n: 'D5', d: '8n',  v: 0.68 }, { time: '1:0:2', n: 'Bb4',d: '8n',  v: 0.52 },
    { time: '1:1:0', n: 'D5', d: '4n',  v: 0.62 }, { time: '1:2:2', n: 'C5', d: '4n.', v: 0.55 },
    // bar 2 Am7
    { time: '2:0:0', n: 'C5', d: '8n',  v: 0.68 }, { time: '2:0:2', n: 'E5', d: '8n',  v: 0.55 },
    { time: '2:1:0', n: 'C5', d: '4n',  v: 0.62 }, { time: '2:2:0', n: 'A4', d: '4n',  v: 0.5  },
    { time: '2:3:0', n: 'G4', d: '4n',  v: 0.5  },
    // bar 3 Bbmaj7
    { time: '3:0:0', n: 'F5', d: '8n',  v: 0.7  }, { time: '3:0:2', n: 'D5', d: '8n',  v: 0.55 },
    { time: '3:1:0', n: 'Bb4',d: '4n',  v: 0.62 }, { time: '3:2:2', n: 'A4', d: '4n.', v: 0.55 },
    // bar 4 Fmaj7 (variation)
    { time: '4:0:0', n: 'E5', d: '8n',  v: 0.68 }, { time: '4:0:2', n: 'C5', d: '8n',  v: 0.52 },
    { time: '4:1:0', n: 'A4', d: '4n',  v: 0.6  }, { time: '4:2:0', n: 'F4', d: '8n',  v: 0.55 },
    { time: '4:2:2', n: 'G4', d: '4n',  v: 0.55 },
    // bar 5 Cm7
    { time: '5:0:0', n: 'Eb5',d: '4n',  v: 0.68 }, { time: '5:1:0', n: 'C5', d: '8n',  v: 0.52 },
    { time: '5:1:2', n: 'Bb4',d: '8n',  v: 0.5  }, { time: '5:2:0', n: 'G4', d: '2n',  v: 0.55 },
    // bar 6 Dm7
    { time: '6:0:0', n: 'D5', d: '8n',  v: 0.68 }, { time: '6:0:2', n: 'F5', d: '8n',  v: 0.55 },
    { time: '6:1:0', n: 'A4', d: '4n',  v: 0.62 }, { time: '6:2:0', n: 'D4', d: '2n',  v: 0.6  },
    // bar 7 C7 (tension → Fmaj7)
    { time: '7:0:0', n: 'E5', d: '8n',  v: 0.7  }, { time: '7:0:2', n: 'G5', d: '8n',  v: 0.6  },
    { time: '7:1:0', n: 'E5', d: '4n',  v: 0.65 }, { time: '7:2:0', n: 'Bb4',d: '8n',  v: 0.55 },
    { time: '7:2:2', n: 'G4', d: '8n',  v: 0.5  }, { time: '7:3:0', n: 'E4', d: '4n',  v: 0.55 },
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
    warm.dispose(); comp.dispose(); chorus.dispose();
    hhHpf.dispose(); openHpf.dispose();
  };
}
