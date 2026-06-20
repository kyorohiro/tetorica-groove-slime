// Song 15: "HERO CALL" — アニメ OP style
// G major, 148 BPM — vi→IV→I→V: Em→Cmaj7→Gmaj7→D7, fmsine+PingPong lead, 16th runs
import * as Tone from 'tone';

export const META = { name: 'HERO CALL', bpm: 148 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -10, ratio: 5, attack: 0.002, release: 0.08 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 10000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: anime 4-on-floor, fast 8th hats ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.07, octaves: 5,
    envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.14 }, volume: -3,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.04 }, volume: -7,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 10000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.035, sustain: 0, release: 0.01 }, volume: -17,
  }).connect(hhHpf);

  // 4-on-floor kick, 2&4 snare, 8th hats — classic anime OP energy
  const dp = {
    kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  };
  const hhV = [0.78,0,0.48,0, 0.72,0,0.48,0, 0.78,0,0.48,0, 0.72,0,0.48,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(sine) — clean sub bass, punchy ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sine' },
    filter: { Q: 1, type: 'lowpass', rolloff: -12, frequency: 700 },
    envelope: { attack: 0.008, decay: 0.1, sustain: 0.8, release: 0.15 },
    filterEnvelope: { attack: 0.008, decay: 0.12, sustain: 0.8, release: 0.15, baseFrequency: 300, octaves: 1 },
    volume: -7,
  }).toDestination();

  // --- pad: PolySynth(sawtooth) + Reverb — orchestral strings swell ---
  const reverb = new Tone.Reverb({ decay: 1.5, preDelay: 0.02 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.12, decay: 0.25, sustain: 0.55, release: 0.7 },
    volume: -21,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: Synth(fmsine) + PingPongDelay — bright bell-like anime lead ---
  const pingPong = new Tone.PingPongDelay({ delayTime: '16n', feedback: 0.12, wet: 0.2 });
  pingPong.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'fmsine' } as any,
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.5, release: 0.28 },
    volume: -11,
  }).connect(pingPong);

  // vi→IV→I→V in G: Em→Cmaj7→Gmaj7→D7 (×2, bar6=Am7)
  const NAMES = ['Em7','Cmaj7','Gmaj7','D7','Em7','Cmaj7','Am7','D7'];
  const chords = [
    { time: '0:0:0', notes: ['E3','G3','B3','D4'],  dur: '1m', vel: 0.33 },
    { time: '1:0:0', notes: ['C3','E3','G3','B3'],  dur: '1m', vel: 0.33 },
    { time: '2:0:0', notes: ['G3','B3','D4','F#4'], dur: '1m', vel: 0.33 },
    { time: '3:0:0', notes: ['D3','F#3','A3','C4'], dur: '1m', vel: 0.36 },
    { time: '4:0:0', notes: ['E3','G3','B3','D4'],  dur: '1m', vel: 0.31 },
    { time: '5:0:0', notes: ['C3','E3','G3','B3'],  dur: '1m', vel: 0.31 },
    { time: '6:0:0', notes: ['A2','C3','E3','G3'],  dur: '1m', vel: 0.33 }, // Am7 variation
    { time: '7:0:0', notes: ['D3','F#3','A3','C4'], dur: '1m', vel: 0.36 },
  ];
  const bassLine = [
    { time: '0:0:0', p: 'E2',  d: '2n' }, { time: '0:2:0', p: 'B1',  d: '2n' },
    { time: '1:0:0', p: 'C2',  d: '2n' }, { time: '1:2:0', p: 'G1',  d: '2n' },
    { time: '2:0:0', p: 'G1',  d: '2n' }, { time: '2:2:0', p: 'D2',  d: '2n' },
    { time: '3:0:0', p: 'D2',  d: '2n' }, { time: '3:2:0', p: 'A1',  d: '2n' },
    { time: '4:0:0', p: 'E2',  d: '2n' }, { time: '4:2:0', p: 'G2',  d: '2n' },
    { time: '5:0:0', p: 'C2',  d: '2n' }, { time: '5:2:0', p: 'E2',  d: '2n' },
    { time: '6:0:0', p: 'A1',  d: '2n' }, { time: '6:2:0', p: 'C2',  d: '2n' },
    { time: '7:0:0', p: 'D2',  d: '2n' }, { time: '7:2:0', p: 'F#1', d: '2n' },
  ];
  // G major scale (G A B C D E F#) — anime OP melody with 16th note runs!
  const melNotes = [
    // Bar 0 Em7 — descending then rising
    { time: '0:0:0', n: 'E5',  d: '8n',  v: 0.78 }, { time: '0:0:2', n: 'D5',  d: '8n',  v: 0.65 },
    { time: '0:1:0', n: 'B4',  d: '8n',  v: 0.7  }, { time: '0:1:2', n: 'G4',  d: '8n',  v: 0.62 },
    { time: '0:2:0', n: 'A4',  d: '8n',  v: 0.65 }, { time: '0:2:2', n: 'B4',  d: '8n',  v: 0.65 },
    { time: '0:3:0', n: 'D5',  d: '8n',  v: 0.68 }, { time: '0:3:2', n: 'E5',  d: '8n',  v: 0.7  },
    // Bar 1 Cmaj7
    { time: '1:0:0', n: 'G5',  d: '8n',  v: 0.75 }, { time: '1:0:2', n: 'E5',  d: '8n',  v: 0.6  },
    { time: '1:1:0', n: 'C5',  d: '4n',  v: 0.7  }, { time: '1:2:0', n: 'B4',  d: '8n',  v: 0.62 },
    { time: '1:2:2', n: 'G4',  d: '8n',  v: 0.58 }, { time: '1:3:0', n: 'E4',  d: '4n',  v: 0.62 },
    // Bar 2 Gmaj7
    { time: '2:0:0', n: 'D5',  d: '8n',  v: 0.75 }, { time: '2:0:2', n: 'E5',  d: '8n',  v: 0.65 },
    { time: '2:1:0', n: 'G5',  d: '4n',  v: 0.72 }, { time: '2:2:0', n: 'F#5', d: '8n',  v: 0.65 },
    { time: '2:2:2', n: 'D5',  d: '8n',  v: 0.6  }, { time: '2:3:0', n: 'B4',  d: '4n',  v: 0.65 },
    // Bar 3 D7
    { time: '3:0:0', n: 'A5',  d: '8n',  v: 0.78 }, { time: '3:0:2', n: 'F#5', d: '8n',  v: 0.65 },
    { time: '3:1:0', n: 'D5',  d: '4n',  v: 0.72 }, { time: '3:2:0', n: 'C5',  d: '8n',  v: 0.62 },
    { time: '3:2:2', n: 'A4',  d: '8n',  v: 0.58 }, { time: '3:3:0', n: 'F#4', d: '4n',  v: 0.62 },
    // Bar 4 Em7 — 16th note ascending run (アニメ的カタルシス)
    { time: '4:0:0', n: 'E4',  d: '16n', v: 0.72 }, { time: '4:0:1', n: 'F#4', d: '16n', v: 0.65 },
    { time: '4:0:2', n: 'G4',  d: '16n', v: 0.68 }, { time: '4:0:3', n: 'A4',  d: '16n', v: 0.65 },
    { time: '4:1:0', n: 'B4',  d: '16n', v: 0.7  }, { time: '4:1:1', n: 'C5',  d: '16n', v: 0.65 },
    { time: '4:1:2', n: 'D5',  d: '16n', v: 0.68 }, { time: '4:1:3', n: 'E5',  d: '16n', v: 0.65 },
    { time: '4:2:0', n: 'G5',  d: '4n',  v: 0.8  }, { time: '4:3:0', n: 'E5',  d: '8n',  v: 0.68 },
    { time: '4:3:2', n: 'D5',  d: '8n',  v: 0.62 },
    // Bar 5 Cmaj7
    { time: '5:0:0', n: 'C5',  d: '8n',  v: 0.75 }, { time: '5:0:2', n: 'B4',  d: '8n',  v: 0.6  },
    { time: '5:1:0', n: 'G5',  d: '4n',  v: 0.72 }, { time: '5:2:0', n: 'E5',  d: '8n',  v: 0.65 },
    { time: '5:2:2', n: 'G5',  d: '8n',  v: 0.68 }, { time: '5:3:0', n: 'A5',  d: '4n',  v: 0.72 },
    // Bar 6 Am7
    { time: '6:0:0', n: 'A5',  d: '8n',  v: 0.75 }, { time: '6:0:2', n: 'G5',  d: '8n',  v: 0.62 },
    { time: '6:1:0', n: 'E5',  d: '4n',  v: 0.7  }, { time: '6:2:0', n: 'C5',  d: '8n',  v: 0.62 },
    { time: '6:2:2', n: 'A4',  d: '8n',  v: 0.58 }, { time: '6:3:0', n: 'C5',  d: '4n',  v: 0.65 },
    // Bar 7 D7 — descending 16th finish, building back to start
    { time: '7:0:0', n: 'D6',  d: '16n', v: 0.8  }, { time: '7:0:1', n: 'C6',  d: '16n', v: 0.7  },
    { time: '7:0:2', n: 'B5',  d: '16n', v: 0.68 }, { time: '7:0:3', n: 'A5',  d: '16n', v: 0.65 },
    { time: '7:1:0', n: 'F#5', d: '4n',  v: 0.72 }, { time: '7:2:0', n: 'D5',  d: '8n',  v: 0.65 },
    { time: '7:2:2', n: 'F#5', d: '8n',  v: 0.68 }, { time: '7:3:0', n: 'A5',  d: '8n',  v: 0.72 },
    { time: '7:3:2', n: 'C6',  d: '8n',  v: 0.7  },
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
    pingPong.dispose(); reverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
