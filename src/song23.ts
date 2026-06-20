// Song 23: "STARFIELD" — Ambient style (アンビエント)
// C major, 60 BPM — Cmaj9→Fmaj9→Am9→G6/9 (2 bars each, long evolving pads)
// New: PolySynth(pwm)+Reverb(8s)+Delay evolving pad, MonoSynth(pwm) drone bass, Synth(fmsine)+Reverb mel
// No drums — only a soft bell (MetalSynth) on beat 1 of each bar
import * as Tone from 'tone';

export const META = { name: 'STARFIELD', bpm: 60 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -16, ratio: 3, attack: 0.01, release: 0.3 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 6500, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- minimal percussion: soft triangle bell on beat 1 (step 0) ---
  const bell = new Tone.MetalSynth({
    frequency: 900,
    envelope: { attack: 0.001, decay: 1.5, release: 0.4, sustain: 0 },
    harmonicity: 5.1,
    modulationIndex: 16,
    resonance: 3000,
    octaves: 1.5,
    volume: -22,
  }).connect(warm);

  const dp = { bell: [1,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0] };

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.bell[i]) bell.triggerAttackRelease('16n', time);
    Tone.getDraw().schedule(() => onStep(i, !!dp.bell[i], false), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- drone bass: MonoSynth(pwm) — slowly breathing sub drone ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'pwm', modulationFrequency: 0.15 } as any,
    filter: { Q: 1, type: 'lowpass', rolloff: -12, frequency: 500 },
    envelope: { attack: 0.5, decay: 0.4, sustain: 0.8, release: 2.0 },
    filterEnvelope: { attack: 0.5, decay: 0.4, sustain: 0.7, release: 2.0, baseFrequency: 200, octaves: 1 },
    volume: -15,
  }).toDestination();

  // --- evolving pad: PolySynth(pwm) + 8s Reverb + FeedbackDelay — textures ---
  const padReverb = new Tone.Reverb({ decay: 8.0, preDelay: 0.08 });
  padReverb.connect(warm);
  void padReverb.ready;
  const padDelay = new Tone.FeedbackDelay({ delayTime: '4n', feedback: 0.5, wet: 0.35 });
  padDelay.connect(padReverb);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'pwm', modulationFrequency: 0.3 } as any,
    envelope: { attack: 1.5, decay: 0.5, sustain: 0.8, release: 3.0 },
    volume: -22,
  });
  pad.maxPolyphony = 12;
  pad.connect(padDelay);

  // --- melody: Synth(fmsine) + long Reverb — drifting, sparse melody ---
  const melReverb = new Tone.Reverb({ decay: 5.0, preDelay: 0.05 });
  melReverb.connect(warm);
  void melReverb.ready;
  const mel = new Tone.Synth({
    oscillator: { type: 'fmsine' } as any,
    envelope: { attack: 0.3, decay: 0.5, sustain: 0.6, release: 3.0 },
    volume: -14,
  }).connect(melReverb);

  // 2-bar chord changes: Cmaj9 → Fmaj9 → Am9 → G6/9
  // Extended voicings (9ths, 6ths) give lush ambient texture
  const NAMES = ['Cmaj9','Fmaj9','Am9','G6/9'];
  const chords = [
    { time:'0:0:0', notes:['C3','E3','G3','B3','D4'],  dur:'2m', vel:0.25 }, // Cmaj9
    { time:'2:0:0', notes:['F2','A2','C3','E3','G3'],  dur:'2m', vel:0.25 }, // Fmaj9
    { time:'4:0:0', notes:['A2','C3','E3','G3','B3'],  dur:'2m', vel:0.25 }, // Am9
    { time:'6:0:0', notes:['G2','B2','D3','E3','A3'],  dur:'2m', vel:0.25 }, // G6/9
  ];
  // Very sparse bass (root only on beat 1 and 3, very low volume)
  const bassLine = [
    { time:'0:0:0', p:'C2', d:'2n' }, { time:'0:2:0', p:'G1', d:'2n' },
    { time:'1:0:0', p:'C2', d:'2n' }, { time:'1:2:0', p:'E2', d:'2n' },
    { time:'2:0:0', p:'F1', d:'2n' }, { time:'2:2:0', p:'C2', d:'2n' },
    { time:'3:0:0', p:'F1', d:'2n' }, { time:'3:2:0', p:'A1', d:'2n' },
    { time:'4:0:0', p:'A1', d:'2n' }, { time:'4:2:0', p:'E2', d:'2n' },
    { time:'5:0:0', p:'A1', d:'2n' }, { time:'5:2:0', p:'C2', d:'2n' },
    { time:'6:0:0', p:'G1', d:'2n' }, { time:'6:2:0', p:'D2', d:'2n' },
    { time:'7:0:0', p:'G1', d:'2n' }, { time:'7:2:0', p:'B1', d:'2n' },
  ];
  // Ultra-sparse melody: just a few long notes per 2 bars
  // At 60 BPM, half note = 2 sec, whole note = 4 sec, 2m = 8 sec
  const melNotes = [
    { time:'0:1:0', n:'G4',  d:'2n.',  v:0.55 },  // bar 0 Cmaj9: G
    { time:'1:0:0', n:'E5',  d:'2n',   v:0.52 },  // bar 1: E
    { time:'1:2:0', n:'D5',  d:'2n',   v:0.48 },
    { time:'2:0:0', n:'C5',  d:'2n.',  v:0.55 },  // bar 2 Fmaj9: C
    { time:'3:1:0', n:'A4',  d:'2n',   v:0.50 },  // bar 3: A
    { time:'4:0:0', n:'E5',  d:'1m',   v:0.55 },  // bar 4 Am9: E (whole bar)
    { time:'5:2:0', n:'G4',  d:'2n',   v:0.48 },  // bar 5
    { time:'6:0:0', n:'B4',  d:'2n.',  v:0.55 },  // bar 6 G6/9: B
    { time:'7:0:0', n:'D5',  d:'2n',   v:0.52 },  // bar 7: D
    { time:'7:2:0', n:'G5',  d:'2n',   v:0.58 },
  ];

  const cp = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
    const bar = parseInt((ev.time as string).split(':')[0]);
    const chordIdx = Math.floor(bar / 2);
    Tone.getDraw().schedule(() => onChord(NAMES[chordIdx], bar), time);
  }, chords).start(0);

  const bp = new Tone.Part((time, ev) => {
    bass.triggerAttackRelease(ev.p, ev.d, time);
  }, bassLine).start(0);

  const mp = new Tone.Part((time, ev) => {
    mel.triggerAttackRelease(ev.n, ev.d, time, ev.v);
  }, melNotes).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); bp.dispose(); mp.dispose();
    bell.dispose(); bass.dispose(); pad.dispose(); mel.dispose();
    padReverb.dispose(); padDelay.dispose(); melReverb.dispose();
    warm.dispose(); comp.dispose();
  };
}
