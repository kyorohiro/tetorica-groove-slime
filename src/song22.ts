// Song 22: "AMEN WAVE" — Drum and Bass / Jazz DnB (ドラムンベース)
// A minor, 170 BPM — Am7(2bars)→Fmaj7(2bars)→Dm7(2bars)→E7(2bars)
// New: PolySynth(fatsquare)+Reverb jazz pad, FMSynth(harm:0.25) sub-bass, Synth(sine)+PingPong float mel
// Drum: amen-style break beat (busy 16th hat, syncopated kick)
import * as Tone from 'tone';

export const META = { name: 'AMEN WAVE', bpm: 170 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

// ---- volume mixer (dB) — set to -Infinity to mute ----
const VOL = {
  kick:   -4,
  snare: -16,
  hihat:  -24,
  bass:   -11,
  pad:    -24,
  mel:    -12,
};

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -10, ratio: 6, attack: 0.002, release: 0.08 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 9000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: amen-style break beat (fast 16th hats with groove, syncopated kick) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06, octaves: 6,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 }, volume: VOL.kick,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.09, sustain: 0, release: 0.04 }, volume: VOL.snare,
  }).connect(warm);
  const hhHpf = new Tone.Filter({ frequency: 8000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.01 }, volume: VOL.hihat,
  }).connect(hhHpf);

  // DnB break: classic syncopated kick, 2&4 snare, 16th hat with ghost accents
  const dp = {
    kick:  [1,0,0,0, 0,0,0,1, 0,0,1,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,0,1, 1,0,0,1, 1,0,0,1, 1,0,1,0],
  };
  const hhV = [0.70,0,0,0.40, 0.65,0,0,0.50, 0.70,0,0,0.40, 0.60,0,0.45,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: FMSynth(harmonicity:0.25) — deep sub-bass rumble ---
  const bass = new Tone.FMSynth({
    harmonicity: 1,
    modulationIndex: 0.5,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.7, release: 0.2 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.02, decay: 0.1, sustain: 0.4, release: 0.1 },
    volume: VOL.bass,
  }).connect(warm);

  // --- pad: PolySynth(fatsquare) + Reverb — beefy jazz chord voicings ---
  const reverb = new Tone.Reverb({ decay: 2.0, preDelay: 0.03 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsquare', count: 2, spread: 15 } as any,
    envelope: { attack: 0.1, decay: 0.4, sustain: 0.5, release: 0.8 },
    volume: VOL.pad,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: Synth(sine) + PingPongDelay — floating jazz line over the break ---
  const pingPong = new Tone.PingPongDelay({ delayTime: '8n', feedback: 0.18, wet: 0.3 });
  pingPong.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.7, release: 0.8 },
    volume: VOL.mel,
  }).connect(pingPong);

  // 2-bar chord changes (harmonic rhythm slower than the beat)
  const NAMES = ['Am7','Fmaj7','Dm7','E7'];
  const chords = [
    { time:'0:0:0', notes:['A2','C3','E3','G3'],  dur:'2m', vel:0.28 }, // Am7
    { time:'2:0:0', notes:['F2','A2','C3','E3'],  dur:'2m', vel:0.28 }, // Fmaj7
    { time:'4:0:0', notes:['D3','F3','A3','C4'],  dur:'2m', vel:0.28 }, // Dm7
    { time:'6:0:0', notes:['E2','G#2','B2','D3'], dur:'2m', vel:0.30 }, // E7
  ];
  // Bass: quarter notes at 170 BPM = energetic, DnB-style
  const bassLine = [
    { time:'0:0:0', p:'A1', d:'4n' }, { time:'0:1:0', p:'E2', d:'4n' },
    { time:'0:2:0', p:'A1', d:'4n' }, { time:'0:3:0', p:'G1', d:'4n' },
    { time:'1:0:0', p:'A1', d:'4n' }, { time:'1:1:0', p:'C2', d:'4n' },
    { time:'1:2:0', p:'E2', d:'4n' }, { time:'1:3:0', p:'G2', d:'4n' },
    { time:'2:0:0', p:'F1', d:'4n' }, { time:'2:1:0', p:'C2', d:'4n' },
    { time:'2:2:0', p:'F1', d:'4n' }, { time:'2:3:0', p:'A1', d:'4n' },
    { time:'3:0:0', p:'F1', d:'4n' }, { time:'3:1:0', p:'E2', d:'4n' },
    { time:'3:2:0', p:'C2', d:'4n' }, { time:'3:3:0', p:'F2', d:'4n' },
    { time:'4:0:0', p:'D2', d:'4n' }, { time:'4:1:0', p:'A1', d:'4n' },
    { time:'4:2:0', p:'D2', d:'4n' }, { time:'4:3:0', p:'F2', d:'4n' },
    { time:'5:0:0', p:'D2', d:'4n' }, { time:'5:1:0', p:'C2', d:'4n' },
    { time:'5:2:0', p:'A1', d:'4n' }, { time:'5:3:0', p:'D2', d:'4n' },
    { time:'6:0:0', p:'E2', d:'4n' }, { time:'6:1:0', p:'B1', d:'4n' },
    { time:'6:2:0', p:'E2', d:'4n' }, { time:'6:3:0', p:'G#1',d:'4n' },
    { time:'7:0:0', p:'E2', d:'4n' }, { time:'7:1:0', p:'D2', d:'4n' },
    { time:'7:2:0', p:'B1', d:'4n' }, { time:'7:3:0', p:'E2', d:'4n' },
  ];
  // Floating jazz melody (half notes & whole notes at 170 BPM = still moves quickly)
  const melNotes = [
    { time:'0:0:0', n:'A4', d:'2n',  v:0.65 }, { time:'0:2:0', n:'E5', d:'2n',  v:0.60 },
    { time:'1:0:0', n:'G4', d:'4n',  v:0.62 }, { time:'1:1:0', n:'C5', d:'4n',  v:0.58 },
    { time:'1:2:0', n:'E5', d:'2n',  v:0.65 },
    { time:'2:0:0', n:'F4', d:'2n',  v:0.65 }, { time:'2:2:0', n:'A4', d:'2n',  v:0.60 },
    { time:'3:0:0', n:'C5', d:'4n',  v:0.65 }, { time:'3:1:0', n:'E5', d:'4n',  v:0.62 },
    { time:'3:2:0', n:'A5', d:'2n',  v:0.68 },
    { time:'4:0:0', n:'D5', d:'2n',  v:0.65 }, { time:'4:2:0', n:'A4', d:'2n',  v:0.60 },
    { time:'5:0:0', n:'F4', d:'4n',  v:0.60 }, { time:'5:1:0', n:'A4', d:'4n',  v:0.62 },
    { time:'5:2:0', n:'C5', d:'2n',  v:0.65 },
    { time:'6:0:0', n:'E5', d:'2n',  v:0.68 }, { time:'6:2:0', n:'B4', d:'2n',  v:0.62 },
    { time:'7:0:0', n:'G#4',d:'4n',  v:0.65 }, { time:'7:1:0', n:'D5', d:'4n',  v:0.62 },
    { time:'7:2:0', n:'E5', d:'4n',  v:0.68 }, { time:'7:3:0', n:'B4', d:'4n',  v:0.72 },
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
    kick.dispose(); snare.dispose(); hihat.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    pingPong.dispose(); reverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
