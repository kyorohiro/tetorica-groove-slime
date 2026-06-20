// Song 5: "8bit Blues"
// G blues, 78 BPM
// Sound: pulse oscillator melody (Famicom-like), PingPongDelay, BitCrusher crunch
import * as Tone from 'tone';

export const META = { name: '8bit Blues', bpm: 78 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -12, ratio: 5, attack: 0.003, release: 0.12 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 6500, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (shuffled blues feel) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08, octaves: 6,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.18 }, volume: -4,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.04 }, volume: -8,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9500, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }, volume: -20,
  }).connect(hhHpf);

  // blues shuffle: kick on 1 and "and of 2", snare on 2&4
  const dp = {
    kick:  [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  };
  const hhV = [0.7,0,0.4,0, 0.65,0,0.4,0, 0.7,0,0.4,0, 0.65,0,0.4,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: Synth(square) — chunky chiptune bass ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'square' },
    filter: { Q: 1, type: 'lowpass', rolloff: -12, frequency: 400 },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.7, release: 0.2 },
    filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.7, release: 0.2, baseFrequency: 200, octaves: 1.5 },
    volume: -10,
  }).toDestination();

  // --- pad: light chords via PolySynth(sine) — minimal, not dominant ---
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.4 }, volume: -26,
  });
  pad.maxPolyphony = 8;
  pad.connect(warm);

  // --- melody: pulse oscillator (Famicom 12.5% duty) + BitCrusher + PingPongDelay ---
  const crusher = new Tone.BitCrusher(6);   // 6-bit crunch
  const delay   = new Tone.PingPongDelay({ delayTime: '8n', feedback: 0.25, wet: 0.3 });
  crusher.connect(delay);
  delay.connect(warm);

  const mel = new Tone.Synth({
    oscillator: { type: 'pulse', width: 0.125 } as any,  // 12.5% = Famicom ch2
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.7, release: 0.15 },
    volume: -13,
  }).connect(crusher);

  // G blues: G7 C7 G7 G7  C7 C7 G7 D7
  const NAMES = ['G7','C7','G7','G7','C7','C7','G7','D7'];
  const chords = [
    { time: '0:0:0', notes: ['G2','B2','D3','F3'],  dur: '1m', vel: 0.30 }, // G7
    { time: '1:0:0', notes: ['C3','E3','G3','Bb3'], dur: '1m', vel: 0.30 }, // C7
    { time: '2:0:0', notes: ['G2','B2','D3','F3'],  dur: '1m', vel: 0.30 }, // G7
    { time: '3:0:0', notes: ['G2','B2','D3','F3'],  dur: '1m', vel: 0.30 }, // G7
    { time: '4:0:0', notes: ['C3','E3','G3','Bb3'], dur: '1m', vel: 0.30 }, // C7
    { time: '5:0:0', notes: ['C3','E3','G3','Bb3'], dur: '1m', vel: 0.30 }, // C7
    { time: '6:0:0', notes: ['G2','B2','D3','F3'],  dur: '1m', vel: 0.30 }, // G7
    { time: '7:0:0', notes: ['D3','F#3','A3','C4'], dur: '1m', vel: 0.33 }, // D7
  ];
  const bassLine = [
    // walking blues bass
    { time: '0:0:0', p: 'G1', d: '4n' }, { time: '0:1:0', p: 'B1',  d: '4n' },
    { time: '0:2:0', p: 'D2', d: '4n' }, { time: '0:3:0', p: 'F2',  d: '4n' },
    { time: '1:0:0', p: 'C2', d: '4n' }, { time: '1:1:0', p: 'E2',  d: '4n' },
    { time: '1:2:0', p: 'G2', d: '4n' }, { time: '1:3:0', p: 'Bb1', d: '4n' },
    { time: '2:0:0', p: 'G1', d: '4n' }, { time: '2:1:0', p: 'B1',  d: '4n' },
    { time: '2:2:0', p: 'D2', d: '4n' }, { time: '2:3:0', p: 'F2',  d: '4n' },
    { time: '3:0:0', p: 'G1', d: '4n' }, { time: '3:1:0', p: 'A1',  d: '4n' },
    { time: '3:2:0', p: 'Bb1',d: '4n' }, { time: '3:3:0', p: 'B1',  d: '4n' },
    { time: '4:0:0', p: 'C2', d: '4n' }, { time: '4:1:0', p: 'E2',  d: '4n' },
    { time: '4:2:0', p: 'G2', d: '4n' }, { time: '4:3:0', p: 'Bb1', d: '4n' },
    { time: '5:0:0', p: 'C2', d: '4n' }, { time: '5:1:0', p: 'B1',  d: '4n' },
    { time: '5:2:0', p: 'Bb1',d: '4n' }, { time: '5:3:0', p: 'A1',  d: '4n' },
    { time: '6:0:0', p: 'G1', d: '4n' }, { time: '6:1:0', p: 'B1',  d: '4n' },
    { time: '6:2:0', p: 'D2', d: '4n' }, { time: '6:3:0', p: 'F2',  d: '4n' },
    { time: '7:0:0', p: 'D2', d: '4n' }, { time: '7:1:0', p: 'F#1', d: '4n' },
    { time: '7:2:0', p: 'A1', d: '4n' }, { time: '7:3:0', p: 'C2',  d: '4n' },
  ];
  // G blues scale melody: G Bb B C C# D F
  const melNotes = [
    // bar 0 G7
    { time: '0:0:0', n: 'G4',  d: '8n',  v: 0.72 }, { time: '0:0:2', n: 'Bb4', d: '8n',  v: 0.55 },
    { time: '0:1:0', n: 'B4',  d: '8n',  v: 0.65 }, { time: '0:1:2', n: 'D5',  d: '8n',  v: 0.55 },
    { time: '0:2:0', n: 'B4',  d: '4n',  v: 0.62 }, { time: '0:3:0', n: 'G4',  d: '4n',  v: 0.55 },
    // bar 1 C7
    { time: '1:0:0', n: 'C5',  d: '8n',  v: 0.7  }, { time: '1:0:2', n: 'Bb4', d: '8n',  v: 0.55 },
    { time: '1:1:0', n: 'G4',  d: '4n',  v: 0.62 }, { time: '1:2:2', n: 'F4',  d: '4n.', v: 0.55 },
    // bar 2 G7
    { time: '2:0:0', n: 'D5',  d: '8n',  v: 0.68 }, { time: '2:0:2', n: 'B4',  d: '8n',  v: 0.52 },
    { time: '2:1:0', n: 'G4',  d: '4n',  v: 0.6  }, { time: '2:2:0', n: 'F4',  d: '8n',  v: 0.52 },
    { time: '2:2:2', n: 'D4',  d: '4n',  v: 0.55 },
    // bar 3 G7 (call)
    { time: '3:0:0', n: 'G4',  d: '8n',  v: 0.7  }, { time: '3:0:2', n: 'Bb4', d: '8n',  v: 0.55 },
    { time: '3:1:0', n: 'C5',  d: '8n',  v: 0.65 }, { time: '3:1:2', n: 'C#5', d: '8n',  v: 0.6  },
    { time: '3:2:0', n: 'D5',  d: '2n',  v: 0.65 },
    // bar 4 C7
    { time: '4:0:0', n: 'E5',  d: '8n',  v: 0.7  }, { time: '4:0:2', n: 'C5',  d: '8n',  v: 0.55 },
    { time: '4:1:0', n: 'Bb4', d: '4n',  v: 0.62 }, { time: '4:2:2', n: 'G4',  d: '4n.', v: 0.55 },
    // bar 5 C7
    { time: '5:0:0', n: 'G4',  d: '8n',  v: 0.65 }, { time: '5:0:2', n: 'F4',  d: '8n',  v: 0.52 },
    { time: '5:1:0', n: 'E4',  d: '4n',  v: 0.6  }, { time: '5:2:0', n: 'C4',  d: '2n',  v: 0.58 },
    // bar 6 G7
    { time: '6:0:0', n: 'B4',  d: '8n',  v: 0.68 }, { time: '6:0:2', n: 'D5',  d: '8n',  v: 0.55 },
    { time: '6:1:0', n: 'F5',  d: '4n',  v: 0.65 }, { time: '6:2:0', n: 'D5',  d: '4n',  v: 0.55 },
    { time: '6:3:0', n: 'B4',  d: '4n',  v: 0.58 },
    // bar 7 D7 (turnaround)
    { time: '7:0:0', n: 'D5',  d: '8n',  v: 0.7  }, { time: '7:0:2', n: 'C5',  d: '8n',  v: 0.58 },
    { time: '7:1:0', n: 'A4',  d: '8n',  v: 0.62 }, { time: '7:1:2', n: 'F4',  d: '8n',  v: 0.52 },
    { time: '7:2:0', n: 'D4',  d: '4n',  v: 0.6  }, { time: '7:3:0', n: 'F4',  d: '4n',  v: 0.55 },
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
    crusher.dispose(); delay.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
