// Song 11: "Shimmer"
// B minor, 78 BPM — fmcosine+FrequencyShifter melody, fmtriangle pad, fmsquare bass
import * as Tone from 'tone';

export const META = { name: 'Shimmer', bpm: 78 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -13, ratio: 5, attack: 0.004, release: 0.15 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 8000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (gentle half-time with MetalSynth hats) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08, octaves: 5,
    envelope: { attack: 0.001, decay: 0.32, sustain: 0, release: 0.18 }, volume: -6,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.002, decay: 0.14, sustain: 0, release: 0.05 }, volume: -10,
  }).toDestination();
  // MetalSynth as hi-hat (different settings from song7 — higher freq, shorter)
  const metal = new Tone.MetalSynth({
    frequency: 600, envelope: { attack: 0.001, decay: 0.03, release: 0.008 },
    harmonicity: 8.5, modulationIndex: 40, resonance: 5000, octaves: 1.2,
    volume: -22,
  });
  metal.connect(warm);
  const openMetal = new Tone.MetalSynth({
    frequency: 350, envelope: { attack: 0.001, decay: 0.15, release: 0.05 },
    harmonicity: 5.1, modulationIndex: 28, resonance: 3000, octaves: 1.5,
    volume: -26,
  });
  openMetal.connect(warm);

  const dp = {
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
    metal: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    open:  [0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
  };
  const mV = [0.5,0,0.3,0, 0.45,0,0.3,0, 0.5,0,0.3,0, 0.45,0,0.3,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.metal[i]) metal.triggerAttackRelease('32n', time, mV[i]);
    if (dp.open[i])  openMetal.triggerAttackRelease('8n', time, 0.5);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(fmsquare) — buzzy, reedy ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fmsquare' } as any,
    filter: { Q: 2, type: 'lowpass', rolloff: -24, frequency: 500 },
    envelope: { attack: 0.02, decay: 0.18, sustain: 0.55, release: 0.4 },
    filterEnvelope: { attack: 0.03, decay: 0.2, sustain: 0.5, release: 0.4, baseFrequency: 180, octaves: 1.8 },
    volume: -11,
  }).toDestination();

  // --- pad: PolySynth(Synth, fmtriangle) + PingPongDelay ---
  const pingPong = new Tone.PingPongDelay({ delayTime: '4n', feedback: 0.2, wet: 0.25 });
  pingPong.connect(warm);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fmtriangle' } as any,
    envelope: { attack: 0.18, decay: 0.3, sustain: 0.5, release: 0.8 },
    volume: -21,
  });
  pad.maxPolyphony = 10;
  pad.connect(pingPong);

  // --- melody: Synth(fmsawtooth) + FrequencyShifter (shimmer, detuned shimmer) ---
  const freqShift = new Tone.FrequencyShifter({ frequency: 35, wet: 0.45 });
  freqShift.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'fmsawtooth' } as any,
    envelope: { attack: 0.03, decay: 0.2, sustain: 0.55, release: 0.9 },
    volume: -12,
  }).connect(freqShift);

  // Bm7 G D A7  Bm7 Em7 F#7 Bm7
  const NAMES = ['Bm7','G','D','A7','Bm7','Em7','F#7','Bm7'];
  const chords = [
    { time: '0:0:0', notes: ['B2','D3','F#3','A3'],  dur: '1m', vel: 0.31 },
    { time: '1:0:0', notes: ['G2','B2','D3','F#3'],  dur: '1m', vel: 0.31 },
    { time: '2:0:0', notes: ['D3','F#3','A3','C#4'], dur: '1m', vel: 0.31 },
    { time: '3:0:0', notes: ['A2','C#3','E3','G3'],  dur: '1m', vel: 0.34 },
    { time: '4:0:0', notes: ['B2','D3','F#3','A3'],  dur: '1m', vel: 0.29 },
    { time: '5:0:0', notes: ['E3','G3','B3','D4'],   dur: '1m', vel: 0.31 },
    { time: '6:0:0', notes: ['F#2','A#2','C#3','E3'],dur: '1m', vel: 0.34 },
    { time: '7:0:0', notes: ['B2','D3','F#3','A3'],  dur: '1m', vel: 0.33 },
  ];
  const bassLine = [
    { time: '0:0:0', p: 'B1',  d: '2n' }, { time: '0:2:0', p: 'F#1', d: '2n' },
    { time: '1:0:0', p: 'G1',  d: '2n' }, { time: '1:2:0', p: 'D2',  d: '2n' },
    { time: '2:0:0', p: 'D2',  d: '2n' }, { time: '2:2:0', p: 'A1',  d: '2n' },
    { time: '3:0:0', p: 'A1',  d: '2n' }, { time: '3:2:0', p: 'E2',  d: '2n' },
    { time: '4:0:0', p: 'B1',  d: '2n' }, { time: '4:2:0', p: 'D2',  d: '2n' },
    { time: '5:0:0', p: 'E2',  d: '2n' }, { time: '5:2:0', p: 'B1',  d: '2n' },
    { time: '6:0:0', p: 'F#1', d: '2n' }, { time: '6:2:0', p: 'C#2', d: '2n' },
    { time: '7:0:0', p: 'B1',  d: '2n' }, { time: '7:2:0', p: 'F#1', d: '2n' },
  ];
  // B natural minor (B C# D E F# G A) — shimmering legato phrases
  const melNotes = [
    { time: '0:0:0', n: 'F#4', d: '4n',  v: 0.65 }, { time: '0:1:0', n: 'A4',  d: '8n',  v: 0.52 },
    { time: '0:1:2', n: 'B4',  d: '8n',  v: 0.5  }, { time: '0:2:0', n: 'D5',  d: '2n',  v: 0.62 },
    { time: '1:0:0', n: 'B4',  d: '4n',  v: 0.65 }, { time: '1:1:0', n: 'G4',  d: '8n',  v: 0.5  },
    { time: '1:1:2', n: 'A4',  d: '8n',  v: 0.48 }, { time: '1:2:0', n: 'F#4', d: '2n',  v: 0.6  },
    { time: '2:0:0', n: 'A4',  d: '4n',  v: 0.65 }, { time: '2:1:0', n: 'F#4', d: '8n',  v: 0.52 },
    { time: '2:1:2', n: 'D4',  d: '8n',  v: 0.48 }, { time: '2:2:0', n: 'E4',  d: '2n',  v: 0.6  },
    { time: '3:0:0', n: 'E4',  d: '4n',  v: 0.65 }, { time: '3:1:0', n: 'C#5', d: '8n',  v: 0.55 },
    { time: '3:1:2', n: 'A4',  d: '8n',  v: 0.5  }, { time: '3:2:0', n: 'G4',  d: '2n',  v: 0.62 },
    { time: '4:0:0', n: 'D5',  d: '8n',  v: 0.68 }, { time: '4:0:2', n: 'F#5', d: '8n',  v: 0.58 },
    { time: '4:1:0', n: 'A5',  d: '4n',  v: 0.65 }, { time: '4:2:0', n: 'G5',  d: '8n',  v: 0.55 },
    { time: '4:2:2', n: 'F#5', d: '4n',  v: 0.6  },
    { time: '5:0:0', n: 'E5',  d: '4n',  v: 0.65 }, { time: '5:1:0', n: 'D5',  d: '8n',  v: 0.52 },
    { time: '5:1:2', n: 'B4',  d: '8n',  v: 0.5  }, { time: '5:2:0', n: 'A4',  d: '2n',  v: 0.6  },
    { time: '6:0:0', n: 'F#5', d: '8n',  v: 0.7  }, { time: '6:0:2', n: 'E5',  d: '8n',  v: 0.58 },
    { time: '6:1:0', n: 'C#5', d: '4n',  v: 0.65 }, { time: '6:2:0', n: 'A#4', d: '4n',  v: 0.58 },
    { time: '6:3:0', n: 'F#4', d: '4n',  v: 0.62 },
    { time: '7:0:0', n: 'B4',  d: '4n',  v: 0.65 }, { time: '7:1:0', n: 'A4',  d: '8n',  v: 0.52 },
    { time: '7:1:2', n: 'F#4', d: '8n',  v: 0.5  }, { time: '7:2:0', n: 'D4',  d: '2n',  v: 0.58 },
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
    kick.dispose(); snare.dispose(); metal.dispose(); openMetal.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    pingPong.dispose(); freqShift.dispose();
    warm.dispose(); comp.dispose();
  };
}
