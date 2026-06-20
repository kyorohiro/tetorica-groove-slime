// Song 24: "HOUSE DRIVE" — House / EDM style (ハウス)
// A minor, 128 BPM — Am7→Fmaj7→Cmaj7→G7 (×2)
// New: PolySynth(amsine)+Reverb pad, MonoSynth(fattriangle) bass,
//      Synth(sawtooth)+AutoWah melody (AutoWah 初使用!)
// Drums: 4-on-floor kick (全ビート), clap 2&4, 8th hats, and-of-4 open hat
import * as Tone from 'tone';

export const META = { name: 'HOUSE DRIVE', bpm: 128 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -11, ratio: 5, attack: 0.002, release: 0.08 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 9000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: house 4-on-floor kick + clap + hats ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06, octaves: 6,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.12 }, volume: -4,
  }).toDestination();
  const clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.003, decay: 0.1, sustain: 0, release: 0.03 }, volume: -10,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9500, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.045, sustain: 0, release: 0.01 }, volume: -19,
  }).connect(hhHpf);
  const openHpf = new Tone.Filter({ frequency: 7500, type: 'highpass' });
  openHpf.connect(warm);
  const openhat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.08 }, volume: -23,
  }).connect(openHpf);

  // 4-on-floor = house の象徴
  const dp = {
    kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    clap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    open:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
  };
  const hhV = [0.70,0,0.42,0, 0.65,0,0.42,0, 0.70,0,0.42,0, 0.65,0,0.42,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.clap[i])  clap.triggerAttackRelease('16n', time, 0.5);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    if (dp.open[i])  openhat.triggerAttackRelease('8n', time, 0.48);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.clap[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(fattriangle) — warm, punchy house bass ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fattriangle', count: 2, spread: 12 } as any,
    filter: { Q: 2.5, type: 'lowpass', rolloff: -24, frequency: 600 },
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.7, release: 0.18 },
    filterEnvelope: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.18, baseFrequency: 200, octaves: 2.5 },
    volume: -9,
  }).toDestination();

  // --- pad: PolySynth(amsine) + Reverb — AM-sine chord stabs ---
  const reverb = new Tone.Reverb({ decay: 2.0, preDelay: 0.02 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'amsine' } as any,
    envelope: { attack: 0.04, decay: 0.35, sustain: 0.45, release: 0.5 },
    volume: -22,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: Synth(sawtooth) + AutoWah — filter sweep house lead (AutoWah 初登場!) ---
  const autoWah = new Tone.AutoWah({
    baseFrequency: 100,
    octaves: 4,
    sensitivity: -30,
    Q: 3,
    gain: 8,
    wet: 0.75,
  });
  autoWah.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.008, decay: 0.1, sustain: 0.6, release: 0.35 },
    volume: -12,
  }).connect(autoWah);

  // Am7→Fmaj7→Cmaj7→G7 (vi→IV→I→V in C major)
  const NAMES = ['Am7','Fmaj7','Cmaj7','G7','Am7','Fmaj7','Cmaj7','G7'];
  const chords = [
    { time:'0:0:0', notes:['A2','C3','E3','G3'],  dur:'1m', vel:0.32 },
    { time:'1:0:0', notes:['F2','A2','C3','E3'],  dur:'1m', vel:0.32 },
    { time:'2:0:0', notes:['C3','E3','G3','B3'],  dur:'1m', vel:0.32 },
    { time:'3:0:0', notes:['G2','B2','D3','F3'],  dur:'1m', vel:0.34 },
    { time:'4:0:0', notes:['A2','C3','E3','G3'],  dur:'1m', vel:0.30 },
    { time:'5:0:0', notes:['F2','A2','C3','E3'],  dur:'1m', vel:0.30 },
    { time:'6:0:0', notes:['C3','E3','G3','B3'],  dur:'1m', vel:0.30 },
    { time:'7:0:0', notes:['G2','B2','D3','F3'],  dur:'1m', vel:0.33 },
  ];
  // Bass: bouncing house line, root + fifth pattern
  const bassLine = [
    { time:'0:0:0', p:'A1', d:'4n' }, { time:'0:1:0', p:'E2', d:'4n' },
    { time:'0:2:0', p:'A1', d:'4n' }, { time:'0:3:0', p:'G1', d:'4n' },
    { time:'1:0:0', p:'F1', d:'4n' }, { time:'1:1:0', p:'C2', d:'4n' },
    { time:'1:2:0', p:'F1', d:'4n' }, { time:'1:3:0', p:'A1', d:'4n' },
    { time:'2:0:0', p:'C2', d:'4n' }, { time:'2:1:0', p:'G1', d:'4n' },
    { time:'2:2:0', p:'C2', d:'4n' }, { time:'2:3:0', p:'E2', d:'4n' },
    { time:'3:0:0', p:'G1', d:'4n' }, { time:'3:1:0', p:'D2', d:'4n' },
    { time:'3:2:0', p:'G1', d:'4n' }, { time:'3:3:0', p:'B1', d:'4n' },
    { time:'4:0:0', p:'A1', d:'4n' }, { time:'4:1:0', p:'C2', d:'4n' },
    { time:'4:2:0', p:'E2', d:'4n' }, { time:'4:3:0', p:'A2', d:'4n' },
    { time:'5:0:0', p:'F1', d:'4n' }, { time:'5:1:0', p:'A1', d:'4n' },
    { time:'5:2:0', p:'C2', d:'4n' }, { time:'5:3:0', p:'F2', d:'4n' },
    { time:'6:0:0', p:'C2', d:'4n' }, { time:'6:1:0', p:'E2', d:'4n' },
    { time:'6:2:0', p:'G2', d:'4n' }, { time:'6:3:0', p:'C2', d:'4n' },
    { time:'7:0:0', p:'G1', d:'4n' }, { time:'7:1:0', p:'B1', d:'4n' },
    { time:'7:2:0', p:'D2', d:'4n' }, { time:'7:3:0', p:'G2', d:'4n' },
  ];
  // A natural minor (A B C D E F G) — syncopated house riff (AutoWah opens on accented notes)
  const melNotes = [
    { time:'0:0:2', n:'E5',  d:'8n',  v:0.75 }, { time:'0:1:0', n:'A5',  d:'4n',  v:0.80 },
    { time:'0:2:2', n:'G5',  d:'8n',  v:0.68 }, { time:'0:3:0', n:'E5',  d:'4n',  v:0.72 },
    { time:'1:0:0', n:'F5',  d:'8n',  v:0.75 }, { time:'1:0:2', n:'A5',  d:'8n',  v:0.65 },
    { time:'1:1:0', n:'C5',  d:'4n',  v:0.70 }, { time:'1:2:2', n:'E5',  d:'4n.', v:0.68 },
    { time:'2:0:0', n:'C5',  d:'8n',  v:0.72 }, { time:'2:0:2', n:'E5',  d:'8n',  v:0.65 },
    { time:'2:1:0', n:'G5',  d:'4n',  v:0.78 }, { time:'2:2:2', n:'E5',  d:'8n',  v:0.65 },
    { time:'2:3:0', n:'D5',  d:'4n',  v:0.70 },
    { time:'3:0:0', n:'B4',  d:'8n',  v:0.72 }, { time:'3:0:2', n:'D5',  d:'8n',  v:0.65 },
    { time:'3:1:0', n:'G5',  d:'4n',  v:0.78 }, { time:'3:2:0', n:'F5',  d:'8n',  v:0.65 },
    { time:'3:2:2', n:'D5',  d:'8n',  v:0.60 }, { time:'3:3:0', n:'B4',  d:'4n',  v:0.68 },
    // Second half: higher, more intense
    { time:'4:0:0', n:'A5',  d:'4n',  v:0.82 }, { time:'4:1:0', n:'G5',  d:'8n',  v:0.68 },
    { time:'4:1:2', n:'E5',  d:'8n',  v:0.62 }, { time:'4:2:0', n:'G5',  d:'4n',  v:0.75 },
    { time:'4:3:0', n:'A5',  d:'4n',  v:0.80 },
    { time:'5:0:0', n:'C6',  d:'8n',  v:0.82 }, { time:'5:0:2', n:'A5',  d:'8n',  v:0.70 },
    { time:'5:1:0', n:'F5',  d:'4n',  v:0.78 }, { time:'5:2:2', n:'G5',  d:'4n.', v:0.75 },
    { time:'6:0:0', n:'G5',  d:'8n',  v:0.78 }, { time:'6:0:2', n:'E5',  d:'8n',  v:0.68 },
    { time:'6:1:0', n:'C5',  d:'4n',  v:0.75 }, { time:'6:2:0', n:'E5',  d:'8n',  v:0.70 },
    { time:'6:2:2', n:'G5',  d:'8n',  v:0.75 }, { time:'6:3:0', n:'B5',  d:'4n',  v:0.80 },
    { time:'7:0:0', n:'A5',  d:'8n',  v:0.82 }, { time:'7:0:2', n:'G5',  d:'8n',  v:0.72 },
    { time:'7:1:0', n:'D5',  d:'4n',  v:0.78 }, { time:'7:2:0', n:'F5',  d:'8n',  v:0.70 },
    { time:'7:2:2', n:'D5',  d:'8n',  v:0.65 }, { time:'7:3:0', n:'B4',  d:'8n',  v:0.68 },
    { time:'7:3:2', n:'A4',  d:'8n',  v:0.72 },
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
    kick.dispose(); clap.dispose(); hihat.dispose(); openhat.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    autoWah.dispose(); reverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose(); openHpf.dispose();
  };
}
