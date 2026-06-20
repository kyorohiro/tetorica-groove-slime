// Song 28: "SPAIN NIGHTS" — Latin Jazz Fusion (Chick Corea "Spain" インスパイア)
// D major, 138 BPM — Dmaj7→C#7→F#m7→Bm7→Em7→A7→Dmaj7→A7
// NEW: Tone.JCReverb (初使用! — 別アルゴリズムのリバーブ)
//      PolySynth(pulse) piano chords (pulse in PolySynth + JCReverb!)
//      MembraneSynth を高音ピッチ = clave/bongo as NEW percussion use!
// C#7 の G# が Spain 特有のセカンダリ・ドミナント (Phrygian touch)
import * as Tone from 'tone';

export const META = { name: 'SPAIN NIGHTS', bpm: 138 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -11, ratio: 4, attack: 0.002, release: 0.12 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 12000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- Latin percussion: MembraneSynth for clave + bongo (高音使用 = 初の非キックドラム用途!) ---
  // クラベ: very short, high-pitched wood block
  const clave = new Tone.MembraneSynth({
    pitchDecay: 0.002, octaves: 0.5,
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 }, volume: -8,
  }).toDestination();
  // ボンゴ (high): medium-high, open tone
  const bongo = new Tone.MembraneSynth({
    pitchDecay: 0.02, octaves: 1.2,
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.04 }, volume: -14,
  }).toDestination();
  // シェーカー: very short high-pass filtered noise
  const shakerHpf = new Tone.Filter({ frequency: 9500, type: 'highpass' });
  shakerHpf.connect(warm);
  const shaker = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.005 }, volume: -26,
  }).connect(shakerHpf);

  // Son 3-2 clave pattern: steps 0,3,6,10,12
  const dp = {
    clave:  [1,0,0,1, 0,0,1,0, 0,0,1,0, 1,0,0,0],  // 3-2 son clave
    bongo:  [0,0,0,0, 1,0,1,0, 0,0,0,0, 1,0,1,0],  // bongo marcato
    shaker: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],  // 8th note shaker
  };

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.clave[i])  clave.triggerAttackRelease('C5', '16n', time, 0.65);   // C5 = clave pitch
    if (dp.bongo[i])  bongo.triggerAttackRelease('G3', '16n', time, 0.45);   // G3 = bongo tone
    if (dp.shaker[i]) shaker.triggerAttackRelease('32n', time, 0.35);
    Tone.getDraw().schedule(() => onStep(i, !!dp.clave[i], !!dp.bongo[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- piano chords: PolySynth(pulse) + JCReverb (JCReverb 初使用! pulse in PolySynth 初使用!) ---
  // JCReverb: John Chowning リバーブ = 独特のスプリング感のある金属的な残響
  const pianoRev = new Tone.JCReverb({ roomSize: 0.55, wet: 0.30 });
  pianoRev.connect(warm);
  const piano = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'pulse', width: 0.28 } as any,
    envelope: { attack: 0.008, decay: 0.55, sustain: 0.32, release: 0.85 },
    volume: -22,
  });
  piano.maxPolyphony = 10;
  piano.connect(pianoRev);

  // --- bass: PluckSynth (アップライトベース風 — 3rd distinct use: song2=guitar, song17=harpsichord) ---
  const bassRev = new Tone.Reverb({ decay: 1.0, preDelay: 0.01 });
  bassRev.connect(warm);
  void bassRev.ready;
  const bassPluck = new Tone.PluckSynth({
    attackNoise: 0.2,    // very subtle = clean upright bass attack
    dampening: 2200,
    resonance: 0.92,     // long sustain = upright bass string vibration
    volume: -10,
  }).connect(bassRev);

  // --- Spain melody: DuoSynth (portamento + vibrato = expressive piano/horn lead) ---
  const melRev = new Tone.Reverb({ decay: 1.8, preDelay: 0.02 });
  melRev.connect(warm);
  void melRev.ready;
  const mel = new Tone.DuoSynth({
    harmonicity: 1.0,
    vibratoAmount: 0.025,
    vibratoRate: 5.5,
    portamento: 0.025,  // 25ms legato slide
    voice0: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.72, release: 0.55 },
      volume: 0,
    },
    voice1: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.3, sustain: 0.60, release: 0.55 },
      volume: -8,
    },
    volume: -14,
  }).connect(melRev);

  // Spain chord progression: Dmaj7→C#7→F#m7→Bm7→Em7→A7→Dmaj7→A7 (各1小節)
  // C#7 (= V7/F#m) が Spain 特有のセカンダリ・ドミナント: C# E# G# B = Db F Ab B
  const NAMES = ['Dmaj7','C#7','F#m7','Bm7','Em7','A7','Dmaj7','A7'];
  const padEvt = [
    { time:'0:0:0', notes:['D3','F#3','A3','C#4'], dur:'1m', vel:0.32 },
    { time:'1:0:0', notes:['Db3','F3','Ab3','B3'], dur:'1m', vel:0.34 }, // C#7 (C#=Db, E#=F, G#=Ab)
    { time:'2:0:0', notes:['F#2','A2','C#3','E3'], dur:'1m', vel:0.32 },
    { time:'3:0:0', notes:['B2','D3','F#3','A3'],  dur:'1m', vel:0.32 },
    { time:'4:0:0', notes:['E3','G3','B3','D4'],   dur:'1m', vel:0.32 },
    { time:'5:0:0', notes:['A2','C#3','E3','G3'],  dur:'1m', vel:0.34 },
    { time:'6:0:0', notes:['D3','F#3','A3','C#4'], dur:'1m', vel:0.30 },
    { time:'7:0:0', notes:['A2','C#3','E3','G3'],  dur:'1m', vel:0.32 },
  ];

  // Walking jazz bass (upright bass feel — PluckSynth triggerAttack only)
  const bassEvt = [
    { time:'0:0:0', n:'D2' }, { time:'0:1:0', n:'F#2' }, { time:'0:2:0', n:'A2' },  { time:'0:3:0', n:'C#2' },
    { time:'1:0:0', n:'Db2'},  { time:'1:1:0', n:'F2' },  { time:'1:2:0', n:'Ab2' }, { time:'1:3:0', n:'B1' },
    { time:'2:0:0', n:'F#2'}, { time:'2:1:0', n:'A2' },  { time:'2:2:0', n:'C#3' }, { time:'2:3:0', n:'E2' },
    { time:'3:0:0', n:'B1' }, { time:'3:1:0', n:'D2' },  { time:'3:2:0', n:'F#2' }, { time:'3:3:0', n:'A2' },
    { time:'4:0:0', n:'E2' }, { time:'4:1:0', n:'G2' },  { time:'4:2:0', n:'B2' },  { time:'4:3:0', n:'D3' },
    { time:'5:0:0', n:'A1' }, { time:'5:1:0', n:'C#2' }, { time:'5:2:0', n:'E2' },  { time:'5:3:0', n:'G2' },
    { time:'6:0:0', n:'D2' }, { time:'6:1:0', n:'A2' },  { time:'6:2:0', n:'F#2' }, { time:'6:3:0', n:'E2' },
    { time:'7:0:0', n:'E2' }, { time:'7:1:0', n:'A2' },  { time:'7:2:0', n:'C#2' }, { time:'7:3:0', n:'A1' },
  ];

  // Spain melody (Chick Corea "Spain" インスパイア — D major, lyrical)
  // 特徴: A から始まる下行、C#7 での G# 使用、付点リズム
  const melEvt = [
    // Bar 0 Dmaj7: A5 → F#5 → E5 → D5 (Spain main descending line)
    { time:'0:0:0', n:'A5',  d:'4n',  v:0.72 },
    { time:'0:1:0', n:'F#5', d:'4n',  v:0.68 },
    { time:'0:2:0', n:'E5',  d:'8n',  v:0.65 }, { time:'0:2:2', n:'D5', d:'8n', v:0.62 },
    { time:'0:3:0', n:'C#5', d:'4n',  v:0.65 },
    // Bar 1 C#7: G# = Phrygian dominant note! (Spain's Spanish flavor)
    { time:'1:0:0', n:'B4',  d:'4n',  v:0.68 },
    { time:'1:1:0', n:'G#4', d:'4n',  v:0.72 }, // ← G# = C#7 特有音!
    { time:'1:2:0', n:'A4',  d:'8n',  v:0.65 }, { time:'1:2:2', n:'B4', d:'8n', v:0.68 },
    { time:'1:3:0', n:'C#5', d:'4n',  v:0.70 },
    // Bar 2 F#m7: ascending F# minor
    { time:'2:0:0', n:'F#5', d:'4n.', v:0.72 },
    { time:'2:1:2', n:'A4',  d:'8n',  v:0.62 },
    { time:'2:2:0', n:'C#5', d:'4n',  v:0.68 },
    { time:'2:3:0', n:'E5',  d:'4n',  v:0.70 },
    // Bar 3 Bm7: Bm descent
    { time:'3:0:0', n:'D5',  d:'4n',  v:0.70 },
    { time:'3:1:0', n:'B4',  d:'4n',  v:0.68 },
    { time:'3:2:0', n:'F#4', d:'8n',  v:0.60 }, { time:'3:2:2', n:'A4', d:'8n', v:0.62 },
    { time:'3:3:0', n:'D5',  d:'4n',  v:0.68 },
    // Bar 4 Em7: Em ascending
    { time:'4:0:0', n:'E5',  d:'4n.', v:0.72 },
    { time:'4:1:2', n:'G5',  d:'8n',  v:0.68 },
    { time:'4:2:0', n:'B5',  d:'4n',  v:0.75 },
    { time:'4:3:0', n:'A5',  d:'4n',  v:0.72 },
    // Bar 5 A7: A7 climax run
    { time:'5:0:0', n:'G5',  d:'8n',  v:0.72 }, { time:'5:0:2', n:'A5', d:'8n', v:0.75 },
    { time:'5:1:0', n:'C#5', d:'4n',  v:0.70 },
    { time:'5:2:0', n:'E5',  d:'4n.', v:0.72 },
    { time:'5:3:2', n:'D5',  d:'8n',  v:0.65 },
    // Bar 6 Dmaj7: returning to D
    { time:'6:0:0', n:'D5',  d:'4n',  v:0.72 },
    { time:'6:1:0', n:'C#5', d:'4n',  v:0.68 },
    { time:'6:2:0', n:'B4',  d:'8n',  v:0.62 }, { time:'6:2:2', n:'A4', d:'8n', v:0.60 },
    { time:'6:3:0', n:'G4',  d:'4n',  v:0.58 },
    // Bar 7 A7: turnaround run
    { time:'7:0:0', n:'F#4', d:'4n',  v:0.65 },
    { time:'7:1:0', n:'E4',  d:'4n',  v:0.62 },
    { time:'7:2:0', n:'A4',  d:'8n',  v:0.68 }, { time:'7:2:2', n:'C#5', d:'8n', v:0.72 },
    { time:'7:3:0', n:'A5',  d:'4n',  v:0.78 },
  ];

  const cp = new Tone.Part((time, ev) => {
    piano.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
    const bar = parseInt((ev.time as string).split(':')[0]);
    Tone.getDraw().schedule(() => onChord(NAMES[bar], bar), time);
  }, padEvt).start(0);

  const bp = new Tone.Part((time, ev) => {
    bassPluck.triggerAttack(ev.n, time);
  }, bassEvt).start(0);

  const mp = new Tone.Part((time, ev) => {
    mel.triggerAttackRelease(ev.n, ev.d, time, ev.v);
  }, melEvt).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); bp.dispose(); mp.dispose();
    clave.dispose(); bongo.dispose(); shaker.dispose();
    piano.dispose(); bassPluck.dispose(); mel.dispose();
    pianoRev.dispose(); bassRev.dispose(); melRev.dispose();
    warm.dispose(); comp.dispose(); shakerHpf.dispose();
  };
}
