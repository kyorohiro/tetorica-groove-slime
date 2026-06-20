// Song 20: "RIO BEAT" — Samba style (サンバ)
// D major, 120 BPM — Dmaj7→Bm7→Em7→A7 (×2)
// New: PolySynth(amsawtooth) bright pad, MonoSynth(pulse) punchy bass, Synth(fatsquare)+Chorus horn
// Samba drum: 16th hats (pandeiro), syncopated kick, off-beat snare
import * as Tone from 'tone';

export const META = { name: 'RIO BEAT', bpm: 120 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -11, ratio: 5, attack: 0.003, release: 0.1 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 8500, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: samba (16th hats = pandeiro, syncopated kick, off-beat snare) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.07, octaves: 5,
    envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.12 }, volume: -5,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.03 }, volume: -11,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9500, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.008 }, volume: -20,
  }).connect(hhHpf);

  // Samba-inspired: kick on 1 and syncopated, snare on off-beats, 16th hats
  const dp = {
    kick:  [1,0,0,0, 0,0,0,1, 0,1,0,0, 0,0,1,0],
    snare: [0,0,1,0, 0,1,0,0, 0,0,1,0, 0,1,0,0],
    hhat:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],  // 16th notes = pandeiro
  };
  const hhV = [0.7,0.35,0.5,0.35, 0.65,0.35,0.5,0.35, 0.7,0.35,0.5,0.35, 0.65,0.35,0.5,0.35];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(pulse) — short, punchy samba bass ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'pulse', width: 0.4 } as any,
    filter: { Q: 2, type: 'lowpass', rolloff: -24, frequency: 450 },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.55, release: 0.15 },
    filterEnvelope: { attack: 0.01, decay: 0.12, sustain: 0.5, release: 0.15, baseFrequency: 180, octaves: 2 },
    volume: -10,
  }).toDestination();

  // --- pad: PolySynth(amsawtooth) — bright, punchy chord stabs ---
  const reverb = new Tone.Reverb({ decay: 1.2, preDelay: 0.01 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'amsawtooth' } as any,
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
    volume: -23,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: Synth(fatsquare) + Chorus — samba horn section (different from song8 which used Distortion) ---
  const chorus = new Tone.Chorus({ frequency: 3.5, delayTime: 3.5, depth: 0.5, wet: 0.4 }).start();
  chorus.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'fatsquare', count: 2, spread: 18 } as any,
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.25 },
    volume: -12,
  }).connect(chorus);

  // Dmaj7→Bm7→Em7→A7 (I→VIm→IIm→V7, D major)
  const NAMES = ['Dmaj7','Bm7','Em7','A7','Dmaj7','Bm7','Em7','A7'];
  const chords = [
    { time:'0:0:0', notes:['D3','F#3','A3','C#4'], dur:'1m', vel:0.30 },
    { time:'1:0:0', notes:['B2','D3','F#3','A3'],  dur:'1m', vel:0.30 },
    { time:'2:0:0', notes:['E3','G3','B3','D4'],   dur:'1m', vel:0.30 },
    { time:'3:0:0', notes:['A2','C#3','E3','G3'],  dur:'1m', vel:0.32 },
    { time:'4:0:0', notes:['D3','F#3','A3','C#4'], dur:'1m', vel:0.28 },
    { time:'5:0:0', notes:['B2','D3','F#3','A3'],  dur:'1m', vel:0.28 },
    { time:'6:0:0', notes:['E3','G3','B3','D4'],   dur:'1m', vel:0.30 },
    { time:'7:0:0', notes:['A2','C#3','E3','G3'],  dur:'1m', vel:0.33 },
  ];
  // Samba bass: roots + fifths, energetic
  const bassLine = [
    { time:'0:0:0', p:'D2',  d:'4n' }, { time:'0:1:0', p:'A1',  d:'4n' },
    { time:'0:2:0', p:'D2',  d:'4n' }, { time:'0:3:0', p:'F#2', d:'4n' },
    { time:'1:0:0', p:'B1',  d:'4n' }, { time:'1:1:0', p:'F#2', d:'4n' },
    { time:'1:2:0', p:'B1',  d:'4n' }, { time:'1:3:0', p:'D2',  d:'4n' },
    { time:'2:0:0', p:'E2',  d:'4n' }, { time:'2:1:0', p:'B1',  d:'4n' },
    { time:'2:2:0', p:'E2',  d:'4n' }, { time:'2:3:0', p:'G2',  d:'4n' },
    { time:'3:0:0', p:'A1',  d:'4n' }, { time:'3:1:0', p:'E2',  d:'4n' },
    { time:'3:2:0', p:'A1',  d:'4n' }, { time:'3:3:0', p:'C#2', d:'4n' },
    { time:'4:0:0', p:'D2',  d:'4n' }, { time:'4:1:0', p:'F#2', d:'4n' },
    { time:'4:2:0', p:'A2',  d:'4n' }, { time:'4:3:0', p:'D2',  d:'4n' },
    { time:'5:0:0', p:'B1',  d:'4n' }, { time:'5:1:0', p:'D2',  d:'4n' },
    { time:'5:2:0', p:'F#2', d:'4n' }, { time:'5:3:0', p:'B2',  d:'4n' },
    { time:'6:0:0', p:'E2',  d:'4n' }, { time:'6:1:0', p:'G2',  d:'4n' },
    { time:'6:2:0', p:'B2',  d:'4n' }, { time:'6:3:0', p:'E2',  d:'4n' },
    { time:'7:0:0', p:'A1',  d:'4n' }, { time:'7:1:0', p:'C#2', d:'4n' },
    { time:'7:2:0', p:'E2',  d:'4n' }, { time:'7:3:0', p:'A2',  d:'4n' },
  ];
  // D major (D E F# G A B C#) — bright samba horn riff
  const melNotes = [
    { time:'0:0:0', n:'D5',  d:'8n',  v:0.72 }, { time:'0:0:2', n:'F#5', d:'8n',  v:0.65 },
    { time:'0:1:0', n:'A5',  d:'4n',  v:0.72 }, { time:'0:2:0', n:'F#5', d:'8n',  v:0.60 },
    { time:'0:2:2', n:'D5',  d:'4n',  v:0.65 },
    { time:'1:0:0', n:'B4',  d:'8n',  v:0.70 }, { time:'1:0:2', n:'D5',  d:'8n',  v:0.62 },
    { time:'1:1:0', n:'F#5', d:'4n',  v:0.70 }, { time:'1:2:0', n:'A5',  d:'8n',  v:0.65 },
    { time:'1:2:2', n:'F#5', d:'4n',  v:0.62 },
    { time:'2:0:0', n:'E5',  d:'8n',  v:0.70 }, { time:'2:0:2', n:'G5',  d:'8n',  v:0.62 },
    { time:'2:1:0', n:'B5',  d:'4n',  v:0.72 }, { time:'2:2:0', n:'G5',  d:'8n',  v:0.62 },
    { time:'2:2:2', n:'E5',  d:'4n',  v:0.65 },
    { time:'3:0:0', n:'A4',  d:'8n',  v:0.72 }, { time:'3:0:2', n:'C#5', d:'8n',  v:0.65 },
    { time:'3:1:0', n:'E5',  d:'4n',  v:0.70 }, { time:'3:2:0', n:'G5',  d:'8n',  v:0.68 },
    { time:'3:2:2', n:'E5',  d:'8n',  v:0.60 }, { time:'3:3:0', n:'C#5', d:'4n',  v:0.65 },
    // Second half: higher energy
    { time:'4:0:0', n:'F#5', d:'8n',  v:0.75 }, { time:'4:0:2', n:'A5',  d:'8n',  v:0.68 },
    { time:'4:1:0', n:'D6',  d:'4n',  v:0.75 }, { time:'4:2:0', n:'A5',  d:'8n',  v:0.65 },
    { time:'4:2:2', n:'F#5', d:'4n',  v:0.68 },
    { time:'5:0:0', n:'D5',  d:'8n',  v:0.70 }, { time:'5:0:2', n:'F#5', d:'8n',  v:0.62 },
    { time:'5:1:0', n:'A5',  d:'4n',  v:0.72 }, { time:'5:2:0', n:'F#5', d:'8n',  v:0.65 },
    { time:'5:2:2', n:'D5',  d:'8n',  v:0.58 }, { time:'5:3:0', n:'B4',  d:'4n',  v:0.62 },
    { time:'6:0:0', n:'G5',  d:'8n',  v:0.72 }, { time:'6:0:2', n:'E5',  d:'8n',  v:0.62 },
    { time:'6:1:0', n:'B4',  d:'4n',  v:0.68 }, { time:'6:2:0', n:'D5',  d:'8n',  v:0.62 },
    { time:'6:2:2', n:'G5',  d:'8n',  v:0.68 }, { time:'6:3:0', n:'B5',  d:'4n',  v:0.72 },
    { time:'7:0:0', n:'C#5', d:'8n',  v:0.75 }, { time:'7:0:2', n:'E5',  d:'8n',  v:0.65 },
    { time:'7:1:0', n:'A5',  d:'4n',  v:0.72 }, { time:'7:2:0', n:'E5',  d:'8n',  v:0.65 },
    { time:'7:2:2', n:'C#5', d:'8n',  v:0.60 }, { time:'7:3:0', n:'A4',  d:'4n',  v:0.65 },
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
    kick.dispose(); snare.dispose(); hihat.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    chorus.dispose(); reverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
