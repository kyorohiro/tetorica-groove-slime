// Song 30: "POLY GROOVE" — 3:4 ポリリズム (Afrobeat)
// Bb minor, 92 BPM — Bbm7 (3 bars) → Ebm7 (3 bars)
// NEW: 2つの異なるタイミングの Sequence = 3:4 ポリリズム!
//      loopEnd = '6m' (24 beats = LCM(3,4)×2 → 3-feel と 4-feel が完全に解決)
//      4-feel: Sequence(16 steps, '16n') = standard drums
//      3-feel: Sequence(3 steps, '4n') = bass/melody が 3拍ごとに循環
//              → 3と4が 12拍ごとに再同期 (= 3小節ごと)
import * as Tone from 'tone';

export const META = { name: 'POLY GROOVE', bpm: 92 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  // 6m = LCM(3,4) × 2 拍 → 3-feel/4-feel の両方がきれいに解決する最小単位
  Tone.getTransport().loopEnd = '6m';

  const comp = new Tone.Compressor({ threshold: -12, ratio: 4, attack: 0.002, release: 0.1 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 10000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums (4-feel: 16 steps × '16n') ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06, octaves: 6,
    envelope: { attack: 0.001, decay: 0.30, sustain: 0, release: 0.10 }, volume: -5,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.12, sustain: 0, release: 0.04 }, volume: -10,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }, volume: -22,
  }).connect(hhHpf);

  // Afrobeat 4/4 drum (standard 4-feel)
  const dp4 = {
    kick:  [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  };
  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp4.kick[i])  kick.triggerAttackRelease('C1', '16n', time);
    if (dp4.snare[i]) snare.triggerAttackRelease('16n', time, 0.48);
    if (dp4.hhat[i])  hihat.triggerAttackRelease('32n', time, 0.40);
    Tone.getDraw().schedule(() => onStep(i, !!dp4.kick[i], !!dp4.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- pad: PolySynth(fmtriangle) + Reverb ---
  const padRev = new Tone.Reverb({ decay: 2.0, preDelay: 0.02 });
  padRev.connect(warm);
  void padRev.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fmtriangle' } as any,
    envelope: { attack: 0.12, decay: 0.4, sustain: 0.65, release: 1.0 },
    volume: -24,
  });
  pad.maxPolyphony = 10;
  pad.connect(padRev);

  // --- bass (3-feel: Sequence 3 steps × '4n') ---
  // 3拍ごとに Bb→Db→F を循環。4/4 ドラムと「ずれ」→12拍(3小節)で再同期!
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fmsawtooth' } as any,
    filter: { Q: 3, type: 'lowpass', rolloff: -24, frequency: 450 },
    envelope: { attack: 0.01, decay: 0.10, sustain: 0.72, release: 0.14 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.55, release: 0.14, baseFrequency: 150, octaves: 2 },
    volume: -7,
  }).toDestination();

  // 3-feel bass: 3ステップ × 4分音符 = 3拍サイクル
  // これが4拍ドラムに対して「ずれ続ける」のがポリリズムの核心!
  const bassSeq = new Tone.Sequence((time, n) => {
    bass.triggerAttackRelease(n as string, '4n', time);
  }, ['Bb1', 'Db2', 'F1'], '4n').start(0);

  // --- melody (3-feel: Synth でも3拍サイクル) ---
  const melRev = new Tone.Reverb({ decay: 1.5, preDelay: 0.01 });
  melRev.connect(warm);
  void melRev.ready;
  const mel = new Tone.Synth({
    oscillator: { type: 'amsine' } as any,
    envelope: { attack: 0.02, decay: 0.25, sustain: 0.50, release: 0.30 },
    volume: -17,
  }).connect(melRev);

  // メロディも3拍サイクル (Bb minor: Bb Db Eb F Ab)
  // バスと異なる音域で重なることでポリリズムの「うねり」が感じられる
  const melSeq = new Tone.Sequence((time, n) => {
    if (n !== null) mel.triggerAttackRelease(n as string, '8n', time, 0.60);
  }, ['Bb4', null, 'Db5', 'F5', null, 'Eb5'], '4n').start(0);
  // 注: 6ステップ × 4分音符 = 6拍サイクル (= 4/4 の 1.5小節)

  // Bbm7 (3 bars) → Ebm7 (3 bars) — '6m' loop
  const NAMES = ['Bbm7','Bbm7','Bbm7','Ebm7','Ebm7','Ebm7'];
  const padEvt = [
    { time:'0:0:0', notes:['Bb2','Db3','F3','Ab3'], dur:'3m', vel:0.28 },
    { time:'3:0:0', notes:['Eb2','Gb2','Bb2','Db3'],dur:'3m', vel:0.28 },
  ];

  const cp = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
    const bar = parseInt((ev.time as string).split(':')[0]);
    const chordBar = bar < 3 ? 0 : 3;
    Tone.getDraw().schedule(() => onChord(NAMES[chordBar], chordBar), time);
  }, padEvt).start(0);

  return () => {
    Tone.getTransport().loopEnd = '8m'; // restore
    drumSeq.dispose(); bassSeq.dispose(); melSeq.dispose(); cp.dispose();
    kick.dispose(); snare.dispose(); hihat.dispose();
    pad.dispose(); bass.dispose(); mel.dispose();
    padRev.dispose(); melRev.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
