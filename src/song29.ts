// Song 29: "SEVEN PULSE" — 7/8 変拍子 (odd time)
// F# minor, 132 BPM — F#m7→A→E7→D (各2小節 of 7/8)
// NEW: Tone.Sequence([0..6], '8n') = 7/8 rhythm!
//      Tone.PitchShift (初使用!) = +5 semitones (perfect 4th) 自動ハーモニー
//      loopEnd = '7m' (8 bars of 7/8 = 7 bars of 4/4 in Tone.js units)
// 7/8 drum = 3+2+2 grouping (kick=0, snare=3, snare=5)
import * as Tone from 'tone';

export const META = { name: 'SEVEN PULSE', bpm: 132 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  // 8 bars of 7/8 = 56 eighth notes = 28 quarter notes = 7 bars of 4/4 = '7m'
  Tone.getTransport().loopEnd = '7m';

  const comp = new Tone.Compressor({ threshold: -12, ratio: 4, attack: 0.002, release: 0.1 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 10000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: 7-step Sequence in 7/8 (3+2+2) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06, octaves: 6,
    envelope: { attack: 0.001, decay: 0.32, sustain: 0, release: 0.12 }, volume: -4,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.12, sustain: 0, release: 0.04 }, volume: -9,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }, volume: -22,
  }).connect(hhHpf);

  // 3+2+2 pattern over 7 steps
  // kick on 0, snare on 3 and 5
  const dp = {
    kick:  [1,0,0,0,0,0,0],
    snare: [0,0,0,1,0,1,0],
    hhat:  [1,1,1,1,1,1,1],
  };
  // 7ステップのSeqがそのまま 7/8 になる
  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '16n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time, 0.52);
    if (dp.hhat[i])  hihat.triggerAttackRelease('16n', time, i === 0 ? 0.70 : 0.40);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, [0,1,2,3,4,5,6], '8n').start(0);

  // --- pad: PolySynth(fmsquare) + Reverb ---
  const padRev = new Tone.Reverb({ decay: 2.5, preDelay: 0.02 });
  padRev.connect(warm);
  void padRev.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fmsquare' } as any,
    envelope: { attack: 0.08, decay: 0.4, sustain: 0.60, release: 0.8 },
    volume: -26,
  });
  pad.maxPolyphony = 10;
  pad.connect(padRev);

  // --- melody: Synth(amtriangle) + PitchShift (PitchShift 初使用! +5半音 = perfect 4th 自動ハーモニー) ---
  const melRev = new Tone.Reverb({ decay: 1.8, preDelay: 0.01 });
  melRev.connect(warm);
  void melRev.ready;
  const pitchShift = new Tone.PitchShift({ pitch: 5, windowSize: 0.1, delayTime: 0, feedback: 0, wet: 0.55 });
  pitchShift.connect(melRev);
  const mel = new Tone.Synth({
    oscillator: { type: 'amtriangle' } as any,
    envelope: { attack: 0.02, decay: 0.18, sustain: 0.60, release: 0.25 },
    volume: -13,
  }).connect(pitchShift);

  // --- bass: MonoSynth(sawtooth) ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: { Q: 3, type: 'lowpass', rolloff: -24, frequency: 500 },
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.7, release: 0.14 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.55, release: 0.14, baseFrequency: 180, octaves: 2.2 },
    volume: -8,
  }).toDestination();

  // 7/8 bar start times within '7m' loop (beat notation in 4/4 space):
  // 7/8 bar 0 = 0 beats      → '0:0:0'
  // 7/8 bar 1 = 3.5 beats    → '0:3:2'
  // 7/8 bar 2 = 7 beats      → '1:3:0'
  // 7/8 bar 3 = 10.5 beats   → '2:2:2'
  // 7/8 bar 4 = 14 beats     → '3:2:0'
  // 7/8 bar 5 = 17.5 beats   → '4:1:2'
  // 7/8 bar 6 = 21 beats     → '5:1:0'
  // 7/8 bar 7 = 24.5 beats   → '6:0:2'
  const bt = ['0:0:0','0:3:2','1:3:0','2:2:2','3:2:0','4:1:2','5:1:0','6:0:2'];

  // F#m7→A→E7→D (各 2bars of 7/8 = 7 beats = dur '1:3:0')
  const NAMES = ['F#m7','F#m7','A','A','E7','E7','D','D'];
  const padEvt = [
    { time:bt[0], notes:['F#2','A2','C#3','E3'], dur:'1:3:0', vel:0.30 },
    { time:bt[2], notes:['A2','C#3','E3','G#3'], dur:'1:3:0', vel:0.30 },
    { time:bt[4], notes:['E2','G#2','B2','D3'],  dur:'1:3:0', vel:0.34 },
    { time:bt[6], notes:['D2','F#2','A2','C3'],  dur:'1:3:0', vel:0.30 },
  ];

  // Bass: one note per 7/8 bar (= 3.5 beats apart)
  const bassEvt = [
    { time:bt[0], p:'F#1', d:'0:3:2' }, { time:bt[1], p:'C#2', d:'0:3:2' },
    { time:bt[2], p:'A1',  d:'0:3:2' }, { time:bt[3], p:'E2',  d:'0:3:2' },
    { time:bt[4], p:'E1',  d:'0:3:2' }, { time:bt[5], p:'B1',  d:'0:3:2' },
    { time:bt[6], p:'D2',  d:'0:3:2' }, { time:bt[7], p:'A1',  d:'0:3:2' },
  ];

  // Melody: 7-step ostinato riff (F# minor pentatonic: F# A B C# E)
  // 7ステップで繰り返すリフが7/8のグルーヴを強調する
  // PitchShift が上のパーフェクト4度ハーモニーを自動生成
  const melSeq = new Tone.Sequence((time, n) => {
    if (n !== null) mel.triggerAttackRelease(n as string, '16n', time, 0.68);
  }, ['F#5', null, 'A5', 'B5', null, 'C#5', null], '8n').start(0);

  const cp = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
    const idx = bt.indexOf(ev.time as string);
    const bar78 = idx * 2; // each event = 2 bars of 7/8
    Tone.getDraw().schedule(() => onChord(NAMES[bar78], bar78), time);
  }, padEvt).start(0);

  const bp = new Tone.Part((time, ev) => {
    bass.triggerAttackRelease(ev.p, ev.d, time);
  }, bassEvt).start(0);

  return () => {
    Tone.getTransport().loopEnd = '8m'; // restore
    drumSeq.dispose(); melSeq.dispose(); cp.dispose(); bp.dispose();
    kick.dispose(); snare.dispose(); hihat.dispose();
    pad.dispose(); mel.dispose(); bass.dispose();
    pitchShift.dispose(); padRev.dispose(); melRev.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
