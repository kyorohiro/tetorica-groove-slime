// Song 32: "PRAISE SONG" — Gospel style (ゴスペル)
// C major, 84 BPM — Cmaj7→F9→G13→Am7→Cmaj7→F9→Dm7→G7
// NEW: Tone.PolySynth(Tone.MonoSynth) (初使用! — MonoSynth を PolySynth の voice に)
//      各ノートが固有のフィルターエンベロープを持つ = 有機的なピアノ表現!
//      Tone.Freeverb (大カテドラル残響) = ゴスペルの大空間感
// Drums: kick 1&3, big clap 2&4, 16th tambourine (ゴスペル必須パターン!)
import * as Tone from 'tone';

export const META = { name: 'PRAISE SONG', bpm: 84 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -11, ratio: 4, attack: 0.002, release: 0.15 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 10000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: gospel kick + clap + 16th tambourine ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.07, octaves: 7,
    envelope: { attack: 0.001, decay: 0.40, sustain: 0, release: 0.14 }, volume: -4,
  }).toDestination();
  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.15, sustain: 0, release: 0.04 }, volume: -5,
  }).toDestination();
  // タンバリン: 16ths with HPF (ゴスペルのエネルギー源!)
  const tambHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  tambHpf.connect(warm);
  const tamb = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.005 }, volume: -22,
  }).connect(tambHpf);

  const dp = {
    kick:  [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], // 1 and 3
    clap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],  // 2 and 4 (BIG!)
    tamb:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],  // 16ths (ゴスペル驚異のエネルギー!)
  };
  const tambV = [0.55,0.30,0.38,0.28, 0.50,0.28,0.38,0.28,
                 0.55,0.28,0.38,0.28, 0.50,0.28,0.38,0.28];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i]) kick.triggerAttackRelease('C1', '8n', time);
    if (dp.clap[i]) clap.triggerAttackRelease('16n', time, 0.62);
    if (dp.tamb[i]) tamb.triggerAttackRelease('32n', time, tambV[i]);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.clap[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- choir pad: PolySynth(fatsawtooth) + Freeverb (大リバーブ = 大聖堂感) ---
  // Freeverb 2回目: roomSize 0.9 で大空間
  const choirFreeverb = new Tone.Freeverb({ roomSize: 0.90, dampening: 4000, wet: 0.55 });
  choirFreeverb.connect(warm);
  const choir = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 3, spread: 22 } as any,
    envelope: { attack: 1.2, decay: 0.6, sustain: 0.70, release: 2.5 }, // very slow attack = "aaah" effect
    volume: -26,
  });
  choir.maxPolyphony = 12;
  choir.connect(choirFreeverb);

  // --- gospel piano: PolySynth(Tone.MonoSynth) — 初使用の voice type! ---
  // 各ノートが個別のフィルターエンベロープ = 非常に有機的な和音表現
  const pianoFreeverb = new Tone.Freeverb({ roomSize: 0.55, dampening: 5000, wet: 0.28 });
  pianoFreeverb.connect(warm);
  const gospelPiano = new Tone.PolySynth(Tone.MonoSynth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.25, sustain: 0.55, release: 0.50 },
    filter: { Q: 2.5, type: 'lowpass', rolloff: -24, frequency: 2500 },
    filterEnvelope: { attack: 0.005, decay: 0.12, sustain: 0.75, release: 0.50, baseFrequency: 700, octaves: 2.5 },
    volume: -18,
  } as any);
  gospelPiano.maxPolyphony = 12;
  gospelPiano.connect(pianoFreeverb);

  // --- bass: MonoSynth(sawtooth) with filter —  gospel walking bass ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'sawtooth' },
    filter: { Q: 2, type: 'lowpass', rolloff: -24, frequency: 500 },
    envelope: { attack: 0.01, decay: 0.10, sustain: 0.80, release: 0.16 },
    filterEnvelope: { attack: 0.01, decay: 0.15, sustain: 0.65, release: 0.16, baseFrequency: 200, octaves: 2 },
    volume: -7,
  }).toDestination();

  // Gospel chord progression: Cmaj7→F9→G13→Am7→Cmaj7→F9→Dm7→G7
  // コード拡張 (9th, 13th) がゴスペルの豊かな和声の特徴!
  const NAMES = ['Cmaj7','F9','G13','Am7','Cmaj7','F9','Dm7','G7'];

  // Choir: sustaining pads (slow attack → "aaah" choir swell)
  const choirEvt = [
    { time:'0:0:0', notes:['C3','E3','G3','B3'],       dur:'1m', vel:0.30 },
    { time:'1:0:0', notes:['F3','A3','C4','E4','G4'],  dur:'1m', vel:0.30 },
    { time:'2:0:0', notes:['G3','B3','D4','F4','A4'],  dur:'1m', vel:0.32 },
    { time:'3:0:0', notes:['A2','C3','E3','G3','B3'],  dur:'1m', vel:0.28 },
    { time:'4:0:0', notes:['C3','E3','G3','B3'],       dur:'1m', vel:0.30 },
    { time:'5:0:0', notes:['F3','A3','C4','E4','G4'],  dur:'1m', vel:0.30 },
    { time:'6:0:0', notes:['D3','F3','A3','C4'],       dur:'1m', vel:0.28 },
    { time:'7:0:0', notes:['G2','B2','D3','F3'],       dur:'1m', vel:0.30 },
  ];

  // Gospel piano: punchy chord stabs (syncopated, call-response feel)
  const pianoEvt = [
    // Bar 0 Cmaj7: beat1 + syncopated
    { time:'0:0:0', notes:['C4','E4','G4','B4'],       dur:'8n', vel:0.55 },
    { time:'0:1:2', notes:['C4','E4','G4','B4'],       dur:'8n', vel:0.48 },
    { time:'0:2:0', notes:['C4','E4','G4','B4'],       dur:'8n', vel:0.52 },
    { time:'0:3:2', notes:['C4','E4','G4','B4'],       dur:'8n', vel:0.50 },
    // Bar 1 F9
    { time:'1:0:0', notes:['F4','A4','C5','E5','G4'],  dur:'8n', vel:0.56 },
    { time:'1:0:2', notes:['F4','A4','C5','E5'],       dur:'8n', vel:0.46 },
    { time:'1:2:0', notes:['F4','A4','C5','G4'],       dur:'8n', vel:0.52 },
    { time:'1:3:2', notes:['F4','A4','C5','E5'],       dur:'8n', vel:0.48 },
    // Bar 2 G13
    { time:'2:0:0', notes:['G4','B4','D5','F4','A4'],  dur:'8n', vel:0.58 },
    { time:'2:1:2', notes:['G4','B4','D5'],            dur:'8n', vel:0.48 },
    { time:'2:2:0', notes:['G4','B4','D5','F4'],       dur:'8n', vel:0.54 },
    { time:'2:3:2', notes:['G4','B4','D5'],            dur:'8n', vel:0.50 },
    // Bar 3 Am7
    { time:'3:0:0', notes:['A3','C4','E4','G4'],       dur:'8n', vel:0.54 },
    { time:'3:1:2', notes:['A3','C4','E4','G4'],       dur:'8n', vel:0.46 },
    { time:'3:2:0', notes:['A3','C4','E4','G4'],       dur:'8n', vel:0.50 },
    { time:'3:3:0', notes:['A3','C4','E4','G4'],       dur:'8n', vel:0.52 },
    // Bar 4 Cmaj7 (second half — more energetic)
    { time:'4:0:0', notes:['C4','E4','G4','B4'],       dur:'8n', vel:0.60 },
    { time:'4:0:2', notes:['C4','E4','G4'],            dur:'8n', vel:0.50 },
    { time:'4:1:2', notes:['C4','E4','G4','B4'],       dur:'8n', vel:0.56 },
    { time:'4:2:2', notes:['C4','E4','G4'],            dur:'8n', vel:0.52 },
    { time:'4:3:0', notes:['C4','E4','G4','B4'],       dur:'8n', vel:0.58 },
    // Bar 5 F9
    { time:'5:0:0', notes:['F4','A4','C5','E5'],       dur:'8n', vel:0.60 },
    { time:'5:0:2', notes:['F4','A4','C5'],            dur:'8n', vel:0.50 },
    { time:'5:1:0', notes:['F4','A4','C5','G4'],       dur:'8n', vel:0.58 },
    { time:'5:2:2', notes:['F4','A4','C5','E5'],       dur:'8n', vel:0.54 },
    { time:'5:3:2', notes:['F4','A4','C5'],            dur:'8n', vel:0.50 },
    // Bar 6 Dm7
    { time:'6:0:0', notes:['D4','F4','A4','C5'],       dur:'8n', vel:0.58 },
    { time:'6:1:2', notes:['D4','F4','A4'],            dur:'8n', vel:0.50 },
    { time:'6:2:0', notes:['D4','F4','A4','C5'],       dur:'8n', vel:0.55 },
    { time:'6:3:2', notes:['D4','F4','A4'],            dur:'8n', vel:0.52 },
    // Bar 7 G7 (turnaround with extra energy!)
    { time:'7:0:0', notes:['G4','B4','D5','F4'],       dur:'8n', vel:0.62 },
    { time:'7:0:2', notes:['G4','B4','D5'],            dur:'8n', vel:0.54 },
    { time:'7:1:0', notes:['G4','B4','D5','F4'],       dur:'8n', vel:0.60 },
    { time:'7:2:0', notes:['G4','B4','D5'],            dur:'8n', vel:0.56 },
    { time:'7:2:2', notes:['G4','B4','D5','F4'],       dur:'8n', vel:0.62 },
    { time:'7:3:0', notes:['G4','B4','D5'],            dur:'8n', vel:0.58 },
    { time:'7:3:2', notes:['G4','B4','D5','F4'],       dur:'8n', vel:0.65 },
  ];

  // Gospel bass: strong root movement
  const bassEvt = [
    { time:'0:0:0', p:'C2',  d:'4n' }, { time:'0:1:0', p:'E2',  d:'4n' },
    { time:'0:2:0', p:'G2',  d:'4n' }, { time:'0:3:0', p:'E2',  d:'4n' },
    { time:'1:0:0', p:'F1',  d:'4n' }, { time:'1:1:0', p:'A1',  d:'4n' },
    { time:'1:2:0', p:'C2',  d:'4n' }, { time:'1:3:0', p:'A1',  d:'4n' },
    { time:'2:0:0', p:'G1',  d:'4n' }, { time:'2:1:0', p:'B1',  d:'4n' },
    { time:'2:2:0', p:'D2',  d:'4n' }, { time:'2:3:0', p:'B1',  d:'4n' },
    { time:'3:0:0', p:'A1',  d:'4n' }, { time:'3:1:0', p:'C2',  d:'4n' },
    { time:'3:2:0', p:'E2',  d:'4n' }, { time:'3:3:0', p:'G1',  d:'4n' },
    { time:'4:0:0', p:'C2',  d:'8n' }, { time:'4:0:2', p:'E2',  d:'8n' },
    { time:'4:1:0', p:'G2',  d:'8n' }, { time:'4:1:2', p:'B1',  d:'8n' },
    { time:'4:2:0', p:'C2',  d:'4n' }, { time:'4:3:0', p:'D2',  d:'4n' },
    { time:'5:0:0', p:'F1',  d:'8n' }, { time:'5:0:2', p:'A1',  d:'8n' },
    { time:'5:1:0', p:'C2',  d:'8n' }, { time:'5:1:2', p:'E2',  d:'8n' },
    { time:'5:2:0', p:'F2',  d:'4n' }, { time:'5:3:0', p:'E2',  d:'4n' },
    { time:'6:0:0', p:'D2',  d:'8n' }, { time:'6:0:2', p:'F2',  d:'8n' },
    { time:'6:1:0', p:'A1',  d:'8n' }, { time:'6:1:2', p:'C2',  d:'8n' },
    { time:'6:2:0', p:'D2',  d:'4n' }, { time:'6:3:0', p:'C2',  d:'4n' },
    { time:'7:0:0', p:'G1',  d:'8n' }, { time:'7:0:2', p:'B1',  d:'8n' },
    { time:'7:1:0', p:'D2',  d:'8n' }, { time:'7:1:2', p:'F2',  d:'8n' },
    { time:'7:2:0', p:'G2',  d:'4n' }, { time:'7:3:0', p:'B1',  d:'4n' },
  ];

  const cp = new Tone.Part((time, ev) => {
    choir.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
    const bar = parseInt((ev.time as string).split(':')[0]);
    Tone.getDraw().schedule(() => onChord(NAMES[bar], bar), time);
  }, choirEvt).start(0);

  const pp = new Tone.Part((time, ev) => {
    gospelPiano.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
  }, pianoEvt).start(0);

  const bp = new Tone.Part((time, ev) => {
    bass.triggerAttackRelease(ev.p, ev.d, time);
  }, bassEvt).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); pp.dispose(); bp.dispose();
    kick.dispose(); clap.dispose(); tamb.dispose();
    choir.dispose(); gospelPiano.dispose(); bass.dispose();
    choirFreeverb.dispose(); pianoFreeverb.dispose();
    warm.dispose(); comp.dispose(); tambHpf.dispose();
  };
}
