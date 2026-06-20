// Song 16: "CITY GLOW" — City Pop style (シティポップ)
// G major, 108 BPM — Gmaj7→Em7→Am7→D7 (I→vi→ii→V)
// New: AMSynth melody, PolySynth(amtriangle)+Reverb pad, MonoSynth(fmsawtooth) bass
import * as Tone from 'tone';

export const META = { name: 'CITY GLOW', bpm: 108 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -12, ratio: 5, attack: 0.003, release: 0.12 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 8000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (80s city pop: kick 1&3, snare+clap 2&4, 8th hats, open hat and-of-4) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.07, octaves: 5,
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.14 }, volume: -5,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.14, sustain: 0, release: 0.04 }, volume: -9,
  }).toDestination();
  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.003, decay: 0.09, sustain: 0, release: 0.02 }, volume: -13,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9500, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }, volume: -19,
  }).connect(hhHpf);
  const openHpf = new Tone.Filter({ frequency: 7000, type: 'highpass' });
  openHpf.connect(warm);
  const openhat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.06 }, volume: -24,
  }).connect(openHpf);

  const dp = {
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    clap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    open:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],  // and-of-4 open hat
  };
  const hhV = [0.75,0,0.42,0, 0.7,0,0.42,0, 0.75,0,0.42,0, 0.7,0,0.42,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.clap[i])  clap.triggerAttackRelease('16n', time, 0.5);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    if (dp.open[i])  openhat.triggerAttackRelease('8n', time, 0.5);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(fmsawtooth) — FM sawtooth, punchy with overtones ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fmsawtooth' } as any,
    filter: { Q: 2, type: 'lowpass', rolloff: -24, frequency: 500 },
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.65, release: 0.2 },
    filterEnvelope: { attack: 0.01, decay: 0.18, sustain: 0.6, release: 0.2, baseFrequency: 180, octaves: 2 },
    volume: -10,
  }).toDestination();

  // --- pad: PolySynth(amtriangle) + Reverb — warm 80s shimmer ---
  const reverb = new Tone.Reverb({ decay: 1.8, preDelay: 0.02 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'amtriangle' } as any,
    envelope: { attack: 0.12, decay: 0.3, sustain: 0.5, release: 0.6 },
    volume: -23,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: AMSynth — AM synthesis, warm smooth city pop lead ---
  const mel = new Tone.AMSynth({
    harmonicity: 3,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.12, sustain: 0.65, release: 0.5 },
    modulation: { type: 'triangle' },
    modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.6, release: 0.5 },
    volume: -11,
  }).connect(warm);

  // Gmaj7 → Em7 → Am7 → D7 (I→vi→ii→V, city pop 定番)
  const NAMES = ['Gmaj7','Em7','Am7','D7','Gmaj7','Em7','Am7','D7'];
  const chords = [
    { time: '0:0:0', notes: ['G2','B2','D3','F#3'], dur: '1m', vel: 0.30 },
    { time: '1:0:0', notes: ['E3','G3','B3','D4'],  dur: '1m', vel: 0.30 },
    { time: '2:0:0', notes: ['A2','C3','E3','G3'],  dur: '1m', vel: 0.30 },
    { time: '3:0:0', notes: ['D3','F#3','A3','C4'], dur: '1m', vel: 0.32 },
    { time: '4:0:0', notes: ['G2','B2','D3','F#3'], dur: '1m', vel: 0.28 },
    { time: '5:0:0', notes: ['E3','G3','B3','D4'],  dur: '1m', vel: 0.28 },
    { time: '6:0:0', notes: ['A2','C3','E3','G3'],  dur: '1m', vel: 0.30 },
    { time: '7:0:0', notes: ['D3','F#3','A3','C4'], dur: '1m', vel: 0.33 },
  ];
  const bassLine = [
    { time: '0:0:0', p: 'G1',  d: '4n' }, { time: '0:1:0', p: 'D2',  d: '4n' },
    { time: '0:2:0', p: 'G1',  d: '4n' }, { time: '0:3:0', p: 'B1',  d: '4n' },
    { time: '1:0:0', p: 'E2',  d: '4n' }, { time: '1:1:0', p: 'B1',  d: '4n' },
    { time: '1:2:0', p: 'E2',  d: '4n' }, { time: '1:3:0', p: 'G1',  d: '4n' },
    { time: '2:0:0', p: 'A1',  d: '4n' }, { time: '2:1:0', p: 'E2',  d: '4n' },
    { time: '2:2:0', p: 'A1',  d: '4n' }, { time: '2:3:0', p: 'C2',  d: '4n' },
    { time: '3:0:0', p: 'D2',  d: '4n' }, { time: '3:1:0', p: 'A1',  d: '4n' },
    { time: '3:2:0', p: 'D2',  d: '4n' }, { time: '3:3:0', p: 'F#1', d: '4n' },
    { time: '4:0:0', p: 'G1',  d: '4n' }, { time: '4:1:0', p: 'B1',  d: '4n' },
    { time: '4:2:0', p: 'D2',  d: '4n' }, { time: '4:3:0', p: 'F#2', d: '4n' },
    { time: '5:0:0', p: 'E2',  d: '4n' }, { time: '5:1:0', p: 'D2',  d: '4n' },
    { time: '5:2:0', p: 'B1',  d: '4n' }, { time: '5:3:0', p: 'A1',  d: '4n' },
    { time: '6:0:0', p: 'A1',  d: '4n' }, { time: '6:1:0', p: 'C2',  d: '4n' },
    { time: '6:2:0', p: 'E2',  d: '4n' }, { time: '6:3:0', p: 'G2',  d: '4n' },
    { time: '7:0:0', p: 'D2',  d: '4n' }, { time: '7:1:0', p: 'F#2', d: '4n' },
    { time: '7:2:0', p: 'A1',  d: '4n' }, { time: '7:3:0', p: 'C2',  d: '4n' },
  ];
  // G major (G A B C D E F#) — smooth city pop phrases, off-beat starts
  const melNotes = [
    { time: '0:0:2', n: 'F#5', d: '8n',  v: 0.68 }, { time: '0:1:0', n: 'D5',  d: '8n',  v: 0.58 },
    { time: '0:1:2', n: 'B4',  d: '4n',  v: 0.65 }, { time: '0:2:2', n: 'D5',  d: '8n',  v: 0.6  },
    { time: '0:3:0', n: 'E5',  d: '4n',  v: 0.62 },
    { time: '1:0:0', n: 'E5',  d: '8n',  v: 0.68 }, { time: '1:0:2', n: 'G5',  d: '8n',  v: 0.6  },
    { time: '1:1:0', n: 'B5',  d: '4n',  v: 0.65 }, { time: '1:2:2', n: 'A5',  d: '8n',  v: 0.58 },
    { time: '1:3:0', n: 'G5',  d: '4n',  v: 0.62 },
    { time: '2:0:0', n: 'A5',  d: '8n',  v: 0.68 }, { time: '2:0:2', n: 'G5',  d: '8n',  v: 0.58 },
    { time: '2:1:0', n: 'E5',  d: '4n',  v: 0.65 }, { time: '2:2:2', n: 'C5',  d: '4n',  v: 0.6  },
    { time: '2:3:2', n: 'D5',  d: '8n',  v: 0.58 },
    { time: '3:0:0', n: 'F#5', d: '8n',  v: 0.68 }, { time: '3:0:2', n: 'A5',  d: '8n',  v: 0.6  },
    { time: '3:1:0', n: 'D5',  d: '4n',  v: 0.65 }, { time: '3:2:0', n: 'C5',  d: '8n',  v: 0.58 },
    { time: '3:2:2', n: 'A4',  d: '8n',  v: 0.55 }, { time: '3:3:0', n: 'G4',  d: '4n',  v: 0.58 },
    // Second half: higher register, more energy
    { time: '4:0:0', n: 'B5',  d: '8n',  v: 0.7  }, { time: '4:0:2', n: 'A5',  d: '8n',  v: 0.6  },
    { time: '4:1:0', n: 'G5',  d: '4n',  v: 0.68 }, { time: '4:2:2', n: 'F#5', d: '4n',  v: 0.62 },
    { time: '4:3:2', n: 'G5',  d: '8n',  v: 0.6  },
    { time: '5:0:0', n: 'E5',  d: '8n',  v: 0.68 }, { time: '5:0:2', n: 'D5',  d: '8n',  v: 0.58 },
    { time: '5:1:0', n: 'B4',  d: '4n',  v: 0.65 }, { time: '5:2:0', n: 'A4',  d: '8n',  v: 0.58 },
    { time: '5:2:2', n: 'G4',  d: '8n',  v: 0.55 }, { time: '5:3:0', n: 'B4',  d: '4n',  v: 0.6  },
    { time: '6:0:0', n: 'C5',  d: '8n',  v: 0.68 }, { time: '6:0:2', n: 'E5',  d: '8n',  v: 0.6  },
    { time: '6:1:0', n: 'G5',  d: '4n',  v: 0.68 }, { time: '6:2:0', n: 'A5',  d: '8n',  v: 0.62 },
    { time: '6:2:2', n: 'G5',  d: '8n',  v: 0.58 }, { time: '6:3:0', n: 'E5',  d: '4n',  v: 0.62 },
    { time: '7:0:0', n: 'D5',  d: '8n',  v: 0.7  }, { time: '7:0:2', n: 'F#5', d: '8n',  v: 0.6  },
    { time: '7:1:0', n: 'A5',  d: '4n',  v: 0.68 }, { time: '7:2:0', n: 'G5',  d: '8n',  v: 0.62 },
    { time: '7:2:2', n: 'F#5', d: '8n',  v: 0.58 }, { time: '7:3:0', n: 'E5',  d: '8n',  v: 0.6  },
    { time: '7:3:2', n: 'D5',  d: '8n',  v: 0.65 },
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
    kick.dispose(); snare.dispose(); clap.dispose(); hihat.dispose(); openhat.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    reverb.dispose(); warm.dispose(); comp.dispose();
    hhHpf.dispose(); openHpf.dispose();
  };
}
