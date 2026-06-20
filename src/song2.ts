// Song 2: "Rain Window"
// A minor, 75 BPM
// Sound: PluckSynth melody (koto-like), triangle pad, pink noise brush drums
import * as Tone from 'tone';

export const META = { name: 'Rain Window', bpm: 75 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -14, ratio: 5, attack: 0.01, release: 0.2 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 6000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (sparse / brush feel) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 4,           // shorter, muffled
    envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.12 }, volume: -6,
  }).toDestination();

  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },               // pink = warmer brush sound
    envelope: { attack: 0.005, decay: 0.28, sustain: 0, release: 0.08 }, volume: -10,
  }).toDestination();

  const hhHpf = new Tone.Filter({ frequency: 8500, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }, volume: -22,
  }).connect(hhHpf);

  // sparse pattern: quarter-note hats, half-time snare, kick on 1 & 3
  const dp = {
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],  // ghost snare just before beat 1
    hhat:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],  // quarter notes only
    rim:   [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],  // rim ghost on "e" of 1 and 3
  };
  const hhV = [0.6,0,0,0, 0.5,0,0,0, 0.6,0,0,0, 0.5,0,0,0];

  const rimHpf = new Tone.Filter({ frequency: 5000, type: 'bandpass' });
  rimHpf.connect(warm);
  const rim = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }, volume: -28,
  }).connect(rimHpf);

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    if (dp.rim[i])   rim.triggerAttackRelease('32n', time, 0.45);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass (sawtooth, darker) ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: { Q: 3, type: 'lowpass', rolloff: -24, frequency: 300 },
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.6 },
    filterEnvelope: { attack: 0.1, decay: 0.3, sustain: 0.3, release: 0.6, baseFrequency: 100, octaves: 2 },
    volume: -14,
  }).toDestination();

  // --- pad (triangle PolySynth — warmer/darker than sine) ---
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.18, decay: 0.4, sustain: 0.5, release: 0.6 }, volume: -22,
  });
  pad.maxPolyphony = 12;
  pad.connect(warm);

  // --- melody: PluckSynth (koto / guitar body feel) ---
  const mel = new Tone.PluckSynth({
    attackNoise: 1.2,
    dampening: 3800,
    resonance: 0.97,
    volume: -10,
  }).connect(warm);

  // Am7 → Dm7 → G7 → Cmaj7 | Fmaj7 → Dm7 → E7 → Am7
  const NAMES = ['Am7','Dm7','G7','Cmaj7','Fmaj7','Dm7','E7','Am7'];
  const chords = [
    { time: '0:0:0', notes: ['A2','C3','E3','G3'], dur: '1m', vel: 0.32 }, // Am7
    { time: '1:0:0', notes: ['D3','F3','A3','C4'], dur: '1m', vel: 0.32 }, // Dm7
    { time: '2:0:0', notes: ['G2','B2','D3','F3'], dur: '1m', vel: 0.35 }, // G7
    { time: '3:0:0', notes: ['C3','E3','G3','B3'], dur: '1m', vel: 0.32 }, // Cmaj7
    { time: '4:0:0', notes: ['F2','A2','C3','E3'], dur: '1m', vel: 0.32 }, // Fmaj7
    { time: '5:0:0', notes: ['D3','F3','A3','C4'], dur: '1m', vel: 0.32 }, // Dm7
    { time: '6:0:0', notes: ['E3','Ab3','B3','D4'],dur: '1m', vel: 0.36 }, // E7 (G#=Ab)
    { time: '7:0:0', notes: ['A2','C3','E3','G3'], dur: '1m', vel: 0.33 }, // Am7
  ];
  const bassLine = [
    { time: '0:0:0', p: 'A1', d: '4n' }, { time: '0:2:0', p: 'E2', d: '4n' },
    { time: '1:0:0', p: 'D2', d: '4n' }, { time: '1:2:0', p: 'A1', d: '4n' },
    { time: '2:0:0', p: 'G1', d: '4n' }, { time: '2:2:0', p: 'D2', d: '4n' },
    { time: '3:0:0', p: 'C2', d: '4n' }, { time: '3:2:0', p: 'G1', d: '4n' },
    { time: '4:0:0', p: 'F2', d: '4n' }, { time: '4:2:0', p: 'C2', d: '4n' },
    { time: '5:0:0', p: 'D2', d: '4n' }, { time: '5:2:0', p: 'A1', d: '4n' },
    { time: '6:0:0', p: 'E2', d: '4n' }, { time: '6:2:0', p: 'B1', d: '4n' },
    { time: '7:0:0', p: 'A1', d: '2n' },
  ];
  // Pluck melody — A natural minor (A B C D E F G)
  const melNotes = [
    // bar 0 Am7
    { time: '0:0:0', n: 'A4', d: '8n'  }, { time: '0:0:2', n: 'C5', d: '8n'  },
    { time: '0:1:0', n: 'E5', d: '4n'  }, { time: '0:2:2', n: 'D5', d: '8n'  },
    { time: '0:3:0', n: 'C5', d: '4n'  },
    // bar 1 Dm7
    { time: '1:0:0', n: 'D5', d: '8n'  }, { time: '1:0:2', n: 'F5', d: '8n'  },
    { time: '1:1:0', n: 'A4', d: '4n'  }, { time: '1:2:2', n: 'G4', d: '4n.' },
    // bar 2 G7
    { time: '2:0:0', n: 'G4', d: '8n'  }, { time: '2:0:2', n: 'B4', d: '8n'  },
    { time: '2:1:0', n: 'D5', d: '4n'  }, { time: '2:2:2', n: 'C5', d: '8n'  },
    { time: '2:3:0', n: 'B4', d: '4n'  },
    // bar 3 Cmaj7
    { time: '3:0:0', n: 'E5', d: '8n'  }, { time: '3:0:2', n: 'C5', d: '8n'  },
    { time: '3:1:0', n: 'G4', d: '4n'  }, { time: '3:3:0', n: 'A4', d: '4n'  },
    // bar 4 Fmaj7
    { time: '4:0:0', n: 'C5', d: '8n'  }, { time: '4:0:2', n: 'A4', d: '8n'  },
    { time: '4:1:0', n: 'F4', d: '4n'  }, { time: '4:2:0', n: 'G4', d: '8n'  },
    { time: '4:2:2', n: 'A4', d: '4n'  },
    // bar 5 Dm7
    { time: '5:0:0', n: 'F4', d: '8n'  }, { time: '5:0:2', n: 'A4', d: '8n'  },
    { time: '5:1:0', n: 'D5', d: '4n'  }, { time: '5:3:0', n: 'C5', d: '4n'  },
    // bar 6 E7
    { time: '6:0:0', n: 'B4', d: '8n'  }, { time: '6:0:2', n: 'E5', d: '8n'  },
    { time: '6:1:0', n: 'B4', d: '4n'  }, { time: '6:2:2', n: 'Ab4',d: '4n.' },
    // bar 7 Am7 (resolve, hold)
    { time: '7:0:0', n: 'A4', d: '2n'  }, { time: '7:2:0', n: 'E4', d: '8n'  },
    { time: '7:2:2', n: 'C4', d: '8n'  }, { time: '7:3:0', n: 'A3', d: '4n'  },
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
    mel.triggerAttack(ev.n, time);  // PluckSynth: triggerAttack only
  }, melNotes).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); bp.dispose(); mp.dispose();
    kick.dispose(); snare.dispose(); hihat.dispose(); rim.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose(); rimHpf.dispose();
  };
}
