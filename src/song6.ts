// Song 6: "Dark Orbit"
// C minor, 76 BPM
// Sound: fatsawtooth melody + Phaser, Reverb pad (PolySynth FMSynth), epic half-time drums
import * as Tone from 'tone';

export const META = { name: 'Dark Orbit', bpm: 76 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -13, ratio: 6, attack: 0.004, release: 0.18 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 7000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (epic half-time, heavy kick) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.12, octaves: 7,
    envelope: { attack: 0.001, decay: 0.45, sustain: 0, release: 0.25 }, volume: -2,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.002, decay: 0.22, sustain: 0, release: 0.07 }, volume: -6,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.01 }, volume: -21,
  }).connect(hhHpf);
  // low tom: MembraneSynth with higher pitch decay
  const tom = new Tone.MembraneSynth({
    pitchDecay: 0.04, octaves: 3,
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.1 }, volume: -14,
  }).toDestination();

  // epic half-time: big kick on 1, snare on 3, toms on "and" of 4
  const dp = {
    kick:  [1,0,0,0, 0,0,0,0, 0,0,0,1, 0,0,0,0],
    snare: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    hhat:  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],  // off-beat 16ths
    tom:   [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
  };
  const hhV = [0,0,0.5,0, 0,0,0.45,0, 0,0,0.5,0, 0,0,0.45,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    if (dp.tom[i])   tom.triggerAttackRelease('G1', '8n', time);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: fatsawtooth MonoSynth (thick, growling) ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fatsawtooth', count: 3, spread: 20 } as any,
    filter: { Q: 2, type: 'lowpass', rolloff: -24, frequency: 450 },
    envelope: { attack: 0.03, decay: 0.2, sustain: 0.6, release: 0.4 },
    filterEnvelope: { attack: 0.05, decay: 0.25, sustain: 0.5, release: 0.4, baseFrequency: 180, octaves: 2 },
    volume: -11,
  }).toDestination();

  // --- pad: PolySynth(FMSynth) + Reverb — lush atmospheric ---
  const reverb = new Tone.Reverb({ decay: 4.0, preDelay: 0.05 });
  reverb.connect(warm);
  const pad = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 0.5,
    modulationIndex: 2,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.2, decay: 0.5, sustain: 0.5, release: 1.0 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.5, decay: 0.3, sustain: 0.3, release: 0.8 },
    volume: -24,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: fatsawtooth + Phaser (wide, chorused lead) ---
  const phaser = new Tone.Phaser({ frequency: 0.5, octaves: 3, baseFrequency: 800, wet: 0.5 });
  phaser.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'fatsawtooth', count: 2, spread: 25 } as any,
    envelope: { attack: 0.03, decay: 0.2, sustain: 0.55, release: 1.0 },
    volume: -14,
  }).connect(phaser);

  // Cm Ab Eb Bb  Cm Ab Fm G
  const NAMES = ['Cm','Ab','Eb','Bb','Cm','Ab','Fm','G'];
  const chords = [
    { time: '0:0:0', notes: ['C3','Eb3','G3','Bb3'], dur: '1m', vel: 0.33 }, // Cm7
    { time: '1:0:0', notes: ['Ab2','C3','Eb3','G3'], dur: '1m', vel: 0.33 }, // Abmaj7
    { time: '2:0:0', notes: ['Eb3','G3','Bb3','D4'], dur: '1m', vel: 0.33 }, // Ebmaj7
    { time: '3:0:0', notes: ['Bb2','D3','F3','A3'],  dur: '1m', vel: 0.35 }, // Bbmaj7
    { time: '4:0:0', notes: ['C3','Eb3','G3','Bb3'], dur: '1m', vel: 0.31 }, // Cm7
    { time: '5:0:0', notes: ['Ab2','C3','Eb3','G3'], dur: '1m', vel: 0.31 }, // Abmaj7
    { time: '6:0:0', notes: ['F2','Ab2','C3','Eb3'], dur: '1m', vel: 0.33 }, // Fm7
    { time: '7:0:0', notes: ['G2','B2','D3','F3'],   dur: '1m', vel: 0.36 }, // G7
  ];
  const bassLine = [
    { time: '0:0:0', p: 'C2',  d: '2n' }, { time: '0:2:0', p: 'G1',  d: '2n' },
    { time: '1:0:0', p: 'Ab1', d: '2n' }, { time: '1:2:0', p: 'Eb2', d: '2n' },
    { time: '2:0:0', p: 'Eb2', d: '2n' }, { time: '2:2:0', p: 'Bb1', d: '2n' },
    { time: '3:0:0', p: 'Bb1', d: '2n' }, { time: '3:2:0', p: 'F2',  d: '2n' },
    { time: '4:0:0', p: 'C2',  d: '2n' }, { time: '4:2:0', p: 'Eb2', d: '2n' },
    { time: '5:0:0', p: 'Ab1', d: '2n' }, { time: '5:2:0', p: 'C2',  d: '2n' },
    { time: '6:0:0', p: 'F2',  d: '2n' }, { time: '6:2:0', p: 'Ab1', d: '2n' },
    { time: '7:0:0', p: 'G1',  d: '2n' }, { time: '7:2:0', p: 'D2',  d: '2n' },
  ];
  // C natural minor (C D Eb F G Ab Bb) melody — dark and epic
  const melNotes = [
    // bar 0 Cm
    { time: '0:0:0', n: 'G4',  d: '4n',  v: 0.7  }, { time: '0:1:0', n: 'Eb5', d: '8n',  v: 0.6  },
    { time: '0:1:2', n: 'D5',  d: '8n',  v: 0.52 }, { time: '0:2:0', n: 'C5',  d: '2n',  v: 0.65 },
    // bar 1 Ab
    { time: '1:0:0', n: 'Ab4', d: '4n',  v: 0.68 }, { time: '1:1:0', n: 'C5',  d: '8n',  v: 0.55 },
    { time: '1:1:2', n: 'Eb5', d: '8n',  v: 0.52 }, { time: '1:2:0', n: 'G4',  d: '2n',  v: 0.6  },
    // bar 2 Eb
    { time: '2:0:0', n: 'Bb4', d: '4n',  v: 0.68 }, { time: '2:1:0', n: 'G4',  d: '8n',  v: 0.55 },
    { time: '2:1:2', n: 'Eb5', d: '8n',  v: 0.58 }, { time: '2:2:0', n: 'D5',  d: '2n',  v: 0.62 },
    // bar 3 Bb
    { time: '3:0:0', n: 'F5',  d: '4n',  v: 0.7  }, { time: '3:1:0', n: 'D5',  d: '8n',  v: 0.55 },
    { time: '3:1:2', n: 'Bb4', d: '8n',  v: 0.52 }, { time: '3:2:0', n: 'Ab4', d: '2n',  v: 0.6  },
    // bar 4 Cm (rise)
    { time: '4:0:0', n: 'C5',  d: '8n',  v: 0.7  }, { time: '4:0:2', n: 'Eb5', d: '8n',  v: 0.6  },
    { time: '4:1:0', n: 'G5',  d: '4n',  v: 0.68 }, { time: '4:2:0', n: 'F5',  d: '8n',  v: 0.58 },
    { time: '4:2:2', n: 'Eb5', d: '4n',  v: 0.62 },
    // bar 5 Ab
    { time: '5:0:0', n: 'Eb5', d: '4n',  v: 0.68 }, { time: '5:1:0', n: 'C5',  d: '8n',  v: 0.52 },
    { time: '5:1:2', n: 'Ab4', d: '8n',  v: 0.5  }, { time: '5:2:0', n: 'Bb4', d: '2n',  v: 0.6  },
    // bar 6 Fm
    { time: '6:0:0', n: 'C5',  d: '8n',  v: 0.68 }, { time: '6:0:2', n: 'Ab4', d: '8n',  v: 0.55 },
    { time: '6:1:0', n: 'F4',  d: '4n',  v: 0.62 }, { time: '6:2:0', n: 'Ab4', d: '8n',  v: 0.55 },
    { time: '6:2:2', n: 'C5',  d: '4n',  v: 0.6  },
    // bar 7 G (tension → resolve)
    { time: '7:0:0', n: 'D5',  d: '8n',  v: 0.72 }, { time: '7:0:2', n: 'B4',  d: '8n',  v: 0.6  },
    { time: '7:1:0', n: 'G4',  d: '4n',  v: 0.65 }, { time: '7:2:0', n: 'F4',  d: '4n',  v: 0.58 },
    { time: '7:3:0', n: 'D4',  d: '4n',  v: 0.62 },
  ];

  // Reverb is async — generate it (non-blocking in browser)
  void reverb.ready;

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
    kick.dispose(); snare.dispose(); hihat.dispose(); tom.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    reverb.dispose(); phaser.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
