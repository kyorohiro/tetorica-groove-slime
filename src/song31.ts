// Song 31: "SOUL GROOVE" — R&B / Soul style (R&B/ソウル)
// Eb major, 72 BPM — Ebmaj9→Cm9→Abmaj9→Bb7 (×2)
// NEW: Tone.Freeverb (初使用! — 独立したリバーブアルゴリズム)
//      PolySynth(triangle)+Tremolo = ローズ・エレクトリックピアノ風
// Drums: half-time feel (スネアが3拍目のみ = ネオソウル/R&Bの核心)
import * as Tone from 'tone';

export const META = { name: 'SOUL GROOVE', bpm: 72 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -12, ratio: 4, attack: 0.002, release: 0.18 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 10000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: half-time soul groove ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.07, octaves: 7,
    envelope: { attack: 0.001, decay: 0.38, sustain: 0, release: 0.14 }, volume: -4,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.20, sustain: 0, release: 0.06 }, volume: -6,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 8500, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }, volume: -21,
  }).connect(hhHpf);

  // Half-time: kick 1&3、スネアは3拍目のみ (step 8) = ネオソウルのグルーヴ
  const dp = {
    kick:  [1,0,0,0, 0,0,1,0, 0,0,0,0, 0,0,0,0],
    snare: [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    ghost: [0,1,0,1, 0,0,0,1, 0,1,0,0, 0,1,0,0],
  };

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time, 0.60);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, 0.42);
    if (dp.ghost[i]) snare.triggerAttackRelease('16n', time, 0.15); // ghost notes
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- electric piano: PolySynth(triangle) + Tremolo + Freeverb ---
  // Freeverb 初使用: JCReverbとは別アルゴリズム (Schroeder-Freeverb)
  const freeverb = new Tone.Freeverb({ roomSize: 0.6, dampening: 3500, wet: 0.35 });
  freeverb.connect(warm);
  const tremolo = new Tone.Tremolo({ frequency: 5.5, depth: 0.30, type: 'sine', wet: 0.60 });
  tremolo.connect(freeverb);
  tremolo.start();
  const ep = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.008, decay: 0.45, sustain: 0.42, release: 0.75 },
    volume: -20,
  });
  ep.maxPolyphony = 12;
  ep.connect(tremolo);

  // --- bass: FMSynth (harmonicity:1.0, modulationIndex:2 = ウォームなエレクトリックベース) ---
  const bass = new Tone.FMSynth({
    harmonicity: 1.0,
    modulationIndex: 2,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.80, release: 0.4 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.4 },
    volume: -8,
  }).toDestination();

  // Ebmaj9→Cm9→Abmaj9→Bb7 (I→VIm→IV→V in Eb major) — 9th/13th extensions!
  const NAMES = ['Ebmaj9','Cm9','Abmaj9','Bb7','Ebmaj9','Cm9','Abmaj9','Bb7'];
  const padEvt = [
    { time:'0:0:0', notes:['Eb3','G3','Bb3','D4','F4'],  dur:'2m', vel:0.28 },
    { time:'2:0:0', notes:['C3','Eb3','G3','Bb3','D4'],  dur:'2m', vel:0.28 },
    { time:'4:0:0', notes:['Ab2','C3','Eb3','G3','Bb3'], dur:'2m', vel:0.28 },
    { time:'6:0:0', notes:['Bb2','D3','F3','Ab3'],       dur:'2m', vel:0.30 },
    { time:'0:0:0', notes:['Eb3','G3','Bb3','D4','F4'],  dur:'2m', vel:0.26 }, // loop 2
    { time:'2:0:0', notes:['C3','Eb3','G3','Bb3','D4'],  dur:'2m', vel:0.26 },
    { time:'4:0:0', notes:['Ab2','C3','Eb3','G3','Bb3'], dur:'2m', vel:0.26 },
    { time:'6:0:0', notes:['Bb2','D3','F3','Ab3'],       dur:'2m', vel:0.28 },
  ];

  // R&B/Soul bass line: smooth, melodic, close to chord tones
  const bassEvt = [
    // Bar 0-1 Ebmaj9
    { time:'0:0:0', p:'Eb2', d:'4n' }, { time:'0:1:0', p:'G2',  d:'4n' },
    { time:'0:2:0', p:'Bb2', d:'4n' }, { time:'0:3:0', p:'G2',  d:'4n' },
    { time:'1:0:0', p:'Eb2', d:'8n' }, { time:'1:0:2', p:'F2',  d:'8n' },
    { time:'1:1:0', p:'G2',  d:'4n' }, { time:'1:2:0', p:'Bb2', d:'4n' },
    { time:'1:3:0', p:'Eb2', d:'4n' },
    // Bar 2-3 Cm9
    { time:'2:0:0', p:'C2',  d:'4n' }, { time:'2:1:0', p:'Eb2', d:'4n' },
    { time:'2:2:0', p:'G2',  d:'4n' }, { time:'2:3:0', p:'Eb2', d:'4n' },
    { time:'3:0:0', p:'C2',  d:'8n' }, { time:'3:0:2', p:'D2',  d:'8n' },
    { time:'3:1:0', p:'Eb2', d:'4n' }, { time:'3:2:0', p:'G2',  d:'4n' },
    { time:'3:3:0', p:'C2',  d:'4n' },
    // Bar 4-5 Abmaj9
    { time:'4:0:0', p:'Ab1', d:'4n' }, { time:'4:1:0', p:'C2',  d:'4n' },
    { time:'4:2:0', p:'Eb2', d:'4n' }, { time:'4:3:0', p:'C2',  d:'4n' },
    { time:'5:0:0', p:'Ab1', d:'8n' }, { time:'5:0:2', p:'Bb1', d:'8n' },
    { time:'5:1:0', p:'C2',  d:'4n' }, { time:'5:2:0', p:'Eb2', d:'4n' },
    { time:'5:3:0', p:'Ab1', d:'4n' },
    // Bar 6-7 Bb7
    { time:'6:0:0', p:'Bb1', d:'4n' }, { time:'6:1:0', p:'D2',  d:'4n' },
    { time:'6:2:0', p:'F2',  d:'4n' }, { time:'6:3:0', p:'D2',  d:'4n' },
    { time:'7:0:0', p:'Bb1', d:'8n' }, { time:'7:0:2', p:'Ab1', d:'8n' },
    { time:'7:1:0', p:'F1',  d:'4n' }, { time:'7:2:0', p:'Eb2', d:'4n' },
    { time:'7:3:0', p:'Bb1', d:'4n' },
  ];

  const cp = new Tone.Part((time, ev) => {
    ep.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
    const bar = parseInt((ev.time as string).split(':')[0]);
    Tone.getDraw().schedule(() => onChord(NAMES[bar], bar), time);
  }, padEvt).start(0);

  const bp = new Tone.Part((time, ev) => {
    bass.triggerAttackRelease(ev.p, ev.d, time);
  }, bassEvt).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); bp.dispose();
    kick.dispose(); snare.dispose(); hihat.dispose();
    ep.dispose(); bass.dispose();
    tremolo.dispose(); freeverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
