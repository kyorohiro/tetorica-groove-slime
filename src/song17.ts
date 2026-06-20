// Song 17: "CANON LIGHT" — Classical / Baroque style
// D major, 66 BPM — D→A→Bm→F#m→G→D→G→A (Pachelbel-inspired)
// New: PluckSynth harpsichord (very different settings from song2),
//      PolySynth(triangle)+long Reverb strings, MonoSynth(amsquare) bass, timpani
import * as Tone from 'tone';

export const META = { name: 'CANON LIGHT', bpm: 66 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -14, ratio: 4, attack: 0.005, release: 0.2 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 7000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- minimal drums: only a soft timpani on beat 1 (MembraneSynth, deep pitch) ---
  const timpani = new Tone.MembraneSynth({
    pitchDecay: 0.2, octaves: 3,
    envelope: { attack: 0.002, decay: 0.8, sustain: 0, release: 0.5 },
    volume: -14,
  }).toDestination();

  const dp = {
    timp: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0],  // beat 1 only
  };

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.timp[i]) timpani.triggerAttackRelease('D1', '4n', time);
    Tone.getDraw().schedule(() => onStep(i, !!dp.timp[i], false), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(amsquare) — basso continuo, organistic quality ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'amsquare' } as any,
    filter: { Q: 1, type: 'lowpass', rolloff: -12, frequency: 600 },
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.7, release: 0.4 },
    filterEnvelope: { attack: 0.04, decay: 0.2, sustain: 0.7, release: 0.4, baseFrequency: 300, octaves: 1 },
    volume: -12,
  }).toDestination();

  // --- strings pad: PolySynth(triangle) + long Reverb — slow-attack orchestral strings ---
  const reverb = new Tone.Reverb({ decay: 4.0, preDelay: 0.05 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.4, decay: 0.3, sustain: 0.7, release: 1.5 },
    volume: -21,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: PluckSynth (harpsichord) — short, bright attack; song2 was dark & resonant ---
  // song2: attackNoise:1.2 dampening:3800 resonance:0.97 → dark, long sustain (guitar)
  // song17: attackNoise:2.5 dampening:1800 resonance:0.68 → bright, shorter decay (harpsichord)
  const melReverb = new Tone.Reverb({ decay: 1.0, preDelay: 0.01 });
  melReverb.connect(warm);
  void melReverb.ready;
  const mel = new Tone.PluckSynth({
    attackNoise: 2.5,
    dampening: 1800,
    resonance: 0.68,
    volume: -6,
  }).connect(melReverb);

  // D→A→Bm→F#m→G→D→G→A  (Pachelbel-like harmonic descent)
  const NAMES = ['D','A','Bm','F#m','G','D','G','A'];
  const chords = [
    { time: '0:0:0', notes: ['D3','F#3','A3'],  dur: '1m', vel: 0.30 },
    { time: '1:0:0', notes: ['A2','C#3','E3'],  dur: '1m', vel: 0.30 },
    { time: '2:0:0', notes: ['B2','D3','F#3'],  dur: '1m', vel: 0.30 },
    { time: '3:0:0', notes: ['F#2','A2','C#3'], dur: '1m', vel: 0.30 },
    { time: '4:0:0', notes: ['G2','B2','D3'],   dur: '1m', vel: 0.30 },
    { time: '5:0:0', notes: ['D2','F#2','A2'],  dur: '1m', vel: 0.28 },
    { time: '6:0:0', notes: ['G2','B2','D3'],   dur: '1m', vel: 0.30 },
    { time: '7:0:0', notes: ['A2','C#3','E3'],  dur: '1m', vel: 0.32 },
  ];
  // Basso continuo: arpeggiated quarter notes per bar
  const bassLine = [
    { time: '0:0:0', p: 'D2',  d: '4n' }, { time: '0:1:0', p: 'F#1', d: '4n' },
    { time: '0:2:0', p: 'A1',  d: '4n' }, { time: '0:3:0', p: 'F#1', d: '4n' },
    { time: '1:0:0', p: 'A1',  d: '4n' }, { time: '1:1:0', p: 'C#2', d: '4n' },
    { time: '1:2:0', p: 'E2',  d: '4n' }, { time: '1:3:0', p: 'C#2', d: '4n' },
    { time: '2:0:0', p: 'B1',  d: '4n' }, { time: '2:1:0', p: 'D2',  d: '4n' },
    { time: '2:2:0', p: 'F#2', d: '4n' }, { time: '2:3:0', p: 'D2',  d: '4n' },
    { time: '3:0:0', p: 'F#1', d: '4n' }, { time: '3:1:0', p: 'A1',  d: '4n' },
    { time: '3:2:0', p: 'C#2', d: '4n' }, { time: '3:3:0', p: 'A1',  d: '4n' },
    { time: '4:0:0', p: 'G1',  d: '4n' }, { time: '4:1:0', p: 'B1',  d: '4n' },
    { time: '4:2:0', p: 'D2',  d: '4n' }, { time: '4:3:0', p: 'B1',  d: '4n' },
    { time: '5:0:0', p: 'D2',  d: '4n' }, { time: '5:1:0', p: 'F#1', d: '4n' },
    { time: '5:2:0', p: 'A1',  d: '4n' }, { time: '5:3:0', p: 'C#2', d: '4n' },
    { time: '6:0:0', p: 'G1',  d: '4n' }, { time: '6:1:0', p: 'B1',  d: '4n' },
    { time: '6:2:0', p: 'D2',  d: '4n' }, { time: '6:3:0', p: 'F#2', d: '4n' },
    { time: '7:0:0', p: 'A1',  d: '4n' }, { time: '7:1:0', p: 'C#2', d: '4n' },
    { time: '7:2:0', p: 'E2',  d: '4n' }, { time: '7:3:0', p: 'A2',  d: '4n' },
  ];
  // D major (D E F# G A B C#) — baroque-style ornamental harpsichord melody
  const melNotes = [
    // Bar 0 D — upward figure
    { time: '0:0:0', n: 'D5',  v: 0.72 }, { time: '0:1:0', n: 'F#5', v: 0.62 },
    { time: '0:1:2', n: 'E5',  v: 0.55 }, { time: '0:2:0', n: 'F#5', v: 0.65 },
    { time: '0:2:2', n: 'G5',  v: 0.6  }, { time: '0:3:0', n: 'A5',  v: 0.68 },
    { time: '0:3:2', n: 'G5',  v: 0.55 },
    // Bar 1 A — stepwise descent
    { time: '1:0:0', n: 'A5',  v: 0.7  }, { time: '1:0:2', n: 'G5',  v: 0.55 },
    { time: '1:0:3', n: 'F#5', v: 0.52 }, { time: '1:1:0', n: 'E5',  v: 0.68 },
    { time: '1:2:0', n: 'C#5', v: 0.62 }, { time: '1:2:2', n: 'D5',  v: 0.58 },
    { time: '1:3:0', n: 'E5',  v: 0.65 },
    // Bar 2 Bm — step down then leap
    { time: '2:0:0', n: 'B5',  v: 0.68 }, { time: '2:0:2', n: 'A5',  v: 0.58 },
    { time: '2:1:0', n: 'G5',  v: 0.62 }, { time: '2:1:2', n: 'F#5', v: 0.58 },
    { time: '2:2:0', n: 'E5',  v: 0.65 }, { time: '2:3:0', n: 'F#5', v: 0.62 },
    // Bar 3 F#m — arpeggiation
    { time: '3:0:0', n: 'F#5', v: 0.7  }, { time: '3:0:2', n: 'E5',  v: 0.58 },
    { time: '3:1:0', n: 'C#5', v: 0.65 }, { time: '3:2:0', n: 'A4',  v: 0.6  },
    { time: '3:2:2', n: 'B4',  v: 0.58 }, { time: '3:3:0', n: 'C#5', v: 0.62 },
    // Bar 4 G — trochaic figure
    { time: '4:0:0', n: 'G5',  v: 0.68 }, { time: '4:0:2', n: 'F#5', v: 0.55 },
    { time: '4:0:3', n: 'E5',  v: 0.52 }, { time: '4:1:0', n: 'D5',  v: 0.65 },
    { time: '4:2:0', n: 'E5',  v: 0.6  }, { time: '4:2:2', n: 'F#5', v: 0.58 },
    { time: '4:3:0', n: 'G5',  v: 0.65 },
    // Bar 5 D — lower register contrast
    { time: '5:0:0', n: 'F#5', v: 0.68 }, { time: '5:0:2', n: 'E5',  v: 0.58 },
    { time: '5:1:0', n: 'D5',  v: 0.65 }, { time: '5:2:0', n: 'C#5', v: 0.6  },
    { time: '5:2:2', n: 'B4',  v: 0.55 }, { time: '5:3:0', n: 'A4',  v: 0.62 },
    // Bar 6 G — rising sequence
    { time: '6:0:0', n: 'B4',  v: 0.65 }, { time: '6:0:2', n: 'C5',  v: 0.58 },
    { time: '6:1:0', n: 'D5',  v: 0.65 }, { time: '6:1:2', n: 'E5',  v: 0.58 },
    { time: '6:2:0', n: 'D5',  v: 0.65 }, { time: '6:2:2', n: 'C5',  v: 0.55 },
    { time: '6:3:0', n: 'B4',  v: 0.62 },
    // Bar 7 A — ascending cadential run into loop
    { time: '7:0:0', n: 'A4',  v: 0.68 }, { time: '7:0:2', n: 'B4',  v: 0.6  },
    { time: '7:1:0', n: 'C#5', v: 0.65 }, { time: '7:1:2', n: 'D5',  v: 0.62 },
    { time: '7:2:0', n: 'E5',  v: 0.65 }, { time: '7:2:2', n: 'F#5', v: 0.62 },
    { time: '7:3:0', n: 'G#5', v: 0.68 }, { time: '7:3:2', n: 'A5',  v: 0.72 },
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
    mel.triggerAttack(ev.n, time, ev.v);  // PluckSynth: triggerAttack only
  }, melNotes).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); bp.dispose(); mp.dispose();
    timpani.dispose(); bass.dispose(); pad.dispose(); mel.dispose();
    reverb.dispose(); melReverb.dispose(); warm.dispose(); comp.dispose();
  };
}
