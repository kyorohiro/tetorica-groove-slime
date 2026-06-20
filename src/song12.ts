// Song 12: "Lofi Tape"
// D minor, 70 BPM — triangle+Chorus+FeedbackDelay melody, square pad+Reverb, FMSynth bass, boom bap
import * as Tone from 'tone';

export const META = { name: 'Lofi Tape', bpm: 70 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -14, ratio: 4, attack: 0.005, release: 0.2 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 6000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (lo-fi boom bap: kick on 1 and "and of 3", snare 2&4) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.1, octaves: 6,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.22 }, volume: -5,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.003, decay: 0.25, sustain: 0, release: 0.1 }, volume: -9,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 7500, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.02 }, volume: -22,
  }).connect(hhHpf);
  const openHpf = new Tone.Filter({ frequency: 6000, type: 'highpass' });
  openHpf.connect(warm);
  const openhat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }, volume: -26,
  }).connect(openHpf);

  // boom bap: kick 1 & and-of-3
  const dp = {
    kick:  [1,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],   // quarter hats
    open:  [0,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,1,0],
  };

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('16n', time, 0.55);
    if (dp.open[i])  openhat.triggerAttackRelease('8n', time, 0.45);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: FMSynth (darker, sub-bass feel) ---
  const bass = new Tone.FMSynth({
    harmonicity: 0.5, modulationIndex: 2,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.04, decay: 0.25, sustain: 0.6, release: 0.5 },
    modulation: { type: 'triangle' },
    modulationEnvelope: { attack: 0.08, decay: 0.3, sustain: 0.4, release: 0.5 },
    volume: -8,
  }).toDestination();

  // --- pad: PolySynth(Synth, square) + Reverb — hollow retro pads ---
  const reverb = new Tone.Reverb({ decay: 3.0, preDelay: 0.03 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'square' },
    envelope: { attack: 0.2, decay: 0.3, sustain: 0.4, release: 1.0 },
    volume: -26,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: Synth(triangle) + Chorus + FeedbackDelay (lo-fi lush lead) ---
  const melChorus = new Tone.Chorus({ frequency: 1.2, delayTime: 4, depth: 0.45, wet: 0.5 }).start();
  const melDelay  = new Tone.FeedbackDelay({ delayTime: '8n.', feedback: 0.28, wet: 0.3 });
  melChorus.connect(melDelay);
  melDelay.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.04, decay: 0.18, sustain: 0.55, release: 1.0 },
    volume: -12,
  }).connect(melChorus);

  // Dm7 Am7 Bbmaj7 F7  Dm7 Am7 Gm7 A7
  const NAMES = ['Dm7','Am7','Bbmaj7','F7','Dm7','Am7','Gm7','A7'];
  const chords = [
    { time: '0:0:0', notes: ['D3','F3','A3','C4'],  dur: '1m', vel: 0.28 },
    { time: '1:0:0', notes: ['A2','C3','E3','G3'],  dur: '1m', vel: 0.28 },
    { time: '2:0:0', notes: ['Bb2','D3','F3','A3'], dur: '1m', vel: 0.28 },
    { time: '3:0:0', notes: ['F2','A2','C3','Eb3'], dur: '1m', vel: 0.30 },
    { time: '4:0:0', notes: ['D3','F3','A3','C4'],  dur: '1m', vel: 0.26 },
    { time: '5:0:0', notes: ['A2','C3','E3','G3'],  dur: '1m', vel: 0.26 },
    { time: '6:0:0', notes: ['G2','Bb2','D3','F3'], dur: '1m', vel: 0.28 },
    { time: '7:0:0', notes: ['A2','C#3','E3','G3'], dur: '1m', vel: 0.31 },
  ];
  const bassLine = [
    { time: '0:0:0', p: 'D2',  d: '4n' }, { time: '0:2:0', p: 'A1',  d: '4n' },
    { time: '1:0:0', p: 'A1',  d: '4n' }, { time: '1:2:0', p: 'E2',  d: '4n' },
    { time: '2:0:0', p: 'Bb1', d: '4n' }, { time: '2:2:0', p: 'F2',  d: '4n' },
    { time: '3:0:0', p: 'F1',  d: '4n' }, { time: '3:2:0', p: 'C2',  d: '4n' },
    { time: '4:0:0', p: 'D2',  d: '4n' }, { time: '4:2:0', p: 'F2',  d: '4n' },
    { time: '5:0:0', p: 'A1',  d: '4n' }, { time: '5:2:0', p: 'C2',  d: '4n' },
    { time: '6:0:0', p: 'G1',  d: '4n' }, { time: '6:2:0', p: 'D2',  d: '4n' },
    { time: '7:0:0', p: 'A1',  d: '4n' }, { time: '7:2:0', p: 'E2',  d: '4n' },
  ];
  // D natural minor (D E F G A Bb C) melody — chill, melodic, sparse
  const melNotes = [
    { time: '0:0:0', n: 'F4',  d: '4n',  v: 0.62 }, { time: '0:1:0', n: 'A4',  d: '8n',  v: 0.5  },
    { time: '0:1:2', n: 'C5',  d: '8n',  v: 0.48 }, { time: '0:2:0', n: 'D5',  d: '2n',  v: 0.58 },
    { time: '1:0:0', n: 'C5',  d: '4n',  v: 0.6  }, { time: '1:1:0', n: 'A4',  d: '8n',  v: 0.5  },
    { time: '1:1:2', n: 'G4',  d: '8n',  v: 0.48 }, { time: '1:2:0', n: 'E4',  d: '2n',  v: 0.55 },
    { time: '2:0:0', n: 'D4',  d: '4n',  v: 0.6  }, { time: '2:1:0', n: 'F4',  d: '8n',  v: 0.5  },
    { time: '2:1:2', n: 'A4',  d: '8n',  v: 0.48 }, { time: '2:2:0', n: 'Bb4', d: '2n',  v: 0.58 },
    { time: '3:0:0', n: 'A4',  d: '4n',  v: 0.62 }, { time: '3:1:0', n: 'F4',  d: '8n',  v: 0.5  },
    { time: '3:1:2', n: 'C4',  d: '8n',  v: 0.48 }, { time: '3:2:0', n: 'Eb4', d: '2n',  v: 0.55 },
    { time: '4:0:0', n: 'F5',  d: '8n',  v: 0.65 }, { time: '4:0:2', n: 'E5',  d: '8n',  v: 0.52 },
    { time: '4:1:0', n: 'D5',  d: '4n',  v: 0.62 }, { time: '4:2:0', n: 'C5',  d: '8n',  v: 0.52 },
    { time: '4:2:2', n: 'Bb4', d: '4n',  v: 0.58 },
    { time: '5:0:0', n: 'A4',  d: '4n',  v: 0.62 }, { time: '5:1:0', n: 'G4',  d: '8n',  v: 0.5  },
    { time: '5:1:2', n: 'E4',  d: '8n',  v: 0.48 }, { time: '5:2:0', n: 'F4',  d: '2n',  v: 0.56 },
    { time: '6:0:0', n: 'G4',  d: '4n',  v: 0.6  }, { time: '6:1:0', n: 'Bb4', d: '8n',  v: 0.5  },
    { time: '6:1:2', n: 'D5',  d: '8n',  v: 0.5  }, { time: '6:2:0', n: 'F5',  d: '2n',  v: 0.58 },
    { time: '7:0:0', n: 'E5',  d: '8n',  v: 0.65 }, { time: '7:0:2', n: 'C#5', d: '8n',  v: 0.52 },
    { time: '7:1:0', n: 'A4',  d: '4n',  v: 0.62 }, { time: '7:2:0', n: 'G4',  d: '4n',  v: 0.55 },
    { time: '7:3:0', n: 'F4',  d: '4n',  v: 0.58 },
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
    melChorus.dispose(); melDelay.dispose(); reverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose(); openHpf.dispose();
  };
}
