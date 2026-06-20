// Song 19: "ONE DROP" — Reggae style (レゲエ)
// A minor, 80 BPM — Am7→Fmaj7→G7→Em7 | Am7→Dm7→G7→E7
// New: PolySynth(fmsawtooth) skank stabs, MonoSynth(fatsquare) bass, Synth(amsquare) melodica
// Defining feature: kick on beat 3 only (one-drop), skank chords strictly on off-beats
import * as Tone from 'tone';

export const META = { name: 'ONE DROP', bpm: 80 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -13, ratio: 4, attack: 0.004, release: 0.15 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 7000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: one-drop (beat 3 kick, 2&4 snare, off-beat hats) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.08, octaves: 5,
    envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.14 }, volume: -6,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.002, decay: 0.18, sustain: 0, release: 0.06 }, volume: -10,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.01 }, volume: -21,
  }).connect(hhHpf);

  // One-drop: NO kick on beat 1, kick only on beat 3
  const dp = {
    kick:  [0,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],  // beat 3 only — the one-drop!
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],  // off-beat 8ths (reggae feel)
  };

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, 0.48);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(fatsquare) — warm, round reggae bass ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fatsquare', count: 2, spread: 10 } as any,
    filter: { Q: 2, type: 'lowpass', rolloff: -24, frequency: 550 },
    envelope: { attack: 0.02, decay: 0.15, sustain: 0.7, release: 0.3 },
    filterEnvelope: { attack: 0.02, decay: 0.15, sustain: 0.65, release: 0.3, baseFrequency: 200, octaves: 2 },
    volume: -10,
  }).toDestination();

  // --- skank pad: PolySynth(fmsawtooth) — staccato off-beat chord stabs ---
  const reverb = new Tone.Reverb({ decay: 1.5, preDelay: 0.02 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fmsawtooth' } as any,
    envelope: { attack: 0.004, decay: 0.12, sustain: 0.15, release: 0.08 },  // staccato skank!
    volume: -21,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: Synth(amsquare) — melodica / harmonium color ---
  const mel = new Tone.Synth({
    oscillator: { type: 'amsquare' } as any,
    envelope: { attack: 0.05, decay: 0.2, sustain: 0.65, release: 0.6 },
    volume: -13,
  }).connect(warm);

  // Am7→Fmaj7→G7→Em7 | Am7→Dm7→G7→E7 (E7 = leading back to Am)
  const NAMES = ['Am7','Fmaj7','G7','Em7','Am7','Dm7','G7','E7'];
  // Skank chords: staccato stabs on off-beats ('0:0:2' = "and of beat 1", etc.)
  const skankChords = [
    // Bar 0 Am7
    { time:'0:0:2', notes:['A2','C3','E3','G3'], dur:'16n', vel:0.32 },
    { time:'0:1:2', notes:['A2','C3','E3','G3'], dur:'16n', vel:0.28 },
    { time:'0:2:2', notes:['A2','C3','E3','G3'], dur:'16n', vel:0.32 },
    { time:'0:3:2', notes:['A2','C3','E3','G3'], dur:'16n', vel:0.28 },
    // Bar 1 Fmaj7
    { time:'1:0:2', notes:['F2','A2','C3','E3'], dur:'16n', vel:0.32 },
    { time:'1:1:2', notes:['F2','A2','C3','E3'], dur:'16n', vel:0.28 },
    { time:'1:2:2', notes:['F2','A2','C3','E3'], dur:'16n', vel:0.32 },
    { time:'1:3:2', notes:['F2','A2','C3','E3'], dur:'16n', vel:0.28 },
    // Bar 2 G7
    { time:'2:0:2', notes:['G2','B2','D3','F3'], dur:'16n', vel:0.32 },
    { time:'2:1:2', notes:['G2','B2','D3','F3'], dur:'16n', vel:0.28 },
    { time:'2:2:2', notes:['G2','B2','D3','F3'], dur:'16n', vel:0.32 },
    { time:'2:3:2', notes:['G2','B2','D3','F3'], dur:'16n', vel:0.28 },
    // Bar 3 Em7
    { time:'3:0:2', notes:['E3','G3','B3','D4'], dur:'16n', vel:0.32 },
    { time:'3:1:2', notes:['E3','G3','B3','D4'], dur:'16n', vel:0.28 },
    { time:'3:2:2', notes:['E3','G3','B3','D4'], dur:'16n', vel:0.32 },
    { time:'3:3:2', notes:['E3','G3','B3','D4'], dur:'16n', vel:0.28 },
    // Bar 4 Am7
    { time:'4:0:2', notes:['A2','C3','E3','G3'], dur:'16n', vel:0.32 },
    { time:'4:1:2', notes:['A2','C3','E3','G3'], dur:'16n', vel:0.28 },
    { time:'4:2:2', notes:['A2','C3','E3','G3'], dur:'16n', vel:0.32 },
    { time:'4:3:2', notes:['A2','C3','E3','G3'], dur:'16n', vel:0.28 },
    // Bar 5 Dm7
    { time:'5:0:2', notes:['D3','F3','A3','C4'], dur:'16n', vel:0.32 },
    { time:'5:1:2', notes:['D3','F3','A3','C4'], dur:'16n', vel:0.28 },
    { time:'5:2:2', notes:['D3','F3','A3','C4'], dur:'16n', vel:0.32 },
    { time:'5:3:2', notes:['D3','F3','A3','C4'], dur:'16n', vel:0.28 },
    // Bar 6 G7
    { time:'6:0:2', notes:['G2','B2','D3','F3'], dur:'16n', vel:0.32 },
    { time:'6:1:2', notes:['G2','B2','D3','F3'], dur:'16n', vel:0.28 },
    { time:'6:2:2', notes:['G2','B2','D3','F3'], dur:'16n', vel:0.32 },
    { time:'6:3:2', notes:['G2','B2','D3','F3'], dur:'16n', vel:0.28 },
    // Bar 7 E7 (leading back to Am)
    { time:'7:0:2', notes:['E2','G#2','B2','D3'], dur:'16n', vel:0.34 },
    { time:'7:1:2', notes:['E2','G#2','B2','D3'], dur:'16n', vel:0.30 },
    { time:'7:2:2', notes:['E2','G#2','B2','D3'], dur:'16n', vel:0.34 },
    { time:'7:3:2', notes:['E2','G#2','B2','D3'], dur:'16n', vel:0.30 },
  ];
  // Bass line: root + 5th pattern, reggae feel
  const bassLine = [
    { time:'0:0:0', p:'A1', d:'4n' }, { time:'0:1:0', p:'E2', d:'4n' },
    { time:'0:2:0', p:'A1', d:'4n' }, { time:'0:3:0', p:'G1', d:'4n' },
    { time:'1:0:0', p:'F1', d:'4n' }, { time:'1:1:0', p:'C2', d:'4n' },
    { time:'1:2:0', p:'F1', d:'4n' }, { time:'1:3:0', p:'A1', d:'4n' },
    { time:'2:0:0', p:'G1', d:'4n' }, { time:'2:1:0', p:'D2', d:'4n' },
    { time:'2:2:0', p:'G1', d:'4n' }, { time:'2:3:0', p:'F1', d:'4n' },
    { time:'3:0:0', p:'E2', d:'4n' }, { time:'3:1:0', p:'B1', d:'4n' },
    { time:'3:2:0', p:'E2', d:'4n' }, { time:'3:3:0', p:'D2', d:'4n' },
    { time:'4:0:0', p:'A1', d:'4n' }, { time:'4:1:0', p:'E2', d:'4n' },
    { time:'4:2:0', p:'A1', d:'4n' }, { time:'4:3:0', p:'C2', d:'4n' },
    { time:'5:0:0', p:'D2', d:'4n' }, { time:'5:1:0', p:'A1', d:'4n' },
    { time:'5:2:0', p:'D2', d:'4n' }, { time:'5:3:0', p:'F2', d:'4n' },
    { time:'6:0:0', p:'G1', d:'4n' }, { time:'6:1:0', p:'D2', d:'4n' },
    { time:'6:2:0', p:'G2', d:'4n' }, { time:'6:3:0', p:'B1', d:'4n' },
    { time:'7:0:0', p:'E2', d:'4n' }, { time:'7:1:0', p:'B1', d:'4n' },
    { time:'7:2:0', p:'E2', d:'4n' }, { time:'7:3:0', p:'G#1',d:'4n' },
  ];
  // A minor (A B C D E F G) — laid-back melodica, enters on beat 2
  const melNotes = [
    { time:'0:1:0', n:'E5', d:'4n',  v:0.62 }, { time:'0:2:0', n:'G5', d:'8n',  v:0.55 },
    { time:'0:2:2', n:'A5', d:'4n',  v:0.65 },
    { time:'1:0:2', n:'C5', d:'8n',  v:0.58 }, { time:'1:1:0', n:'A4', d:'4n',  v:0.62 },
    { time:'1:2:0', n:'F4', d:'4n',  v:0.58 }, { time:'1:3:0', n:'A4', d:'4n',  v:0.55 },
    { time:'2:1:0', n:'B4', d:'8n',  v:0.62 }, { time:'2:1:2', n:'G4', d:'8n',  v:0.55 },
    { time:'2:2:0', n:'D5', d:'4n',  v:0.65 }, { time:'2:3:0', n:'G4', d:'4n',  v:0.58 },
    { time:'3:1:0', n:'E4', d:'4n',  v:0.62 }, { time:'3:2:0', n:'B4', d:'8n',  v:0.58 },
    { time:'3:2:2', n:'G4', d:'4n',  v:0.55 },
    { time:'4:1:0', n:'E5', d:'4n.', v:0.65 }, { time:'4:2:2', n:'G5', d:'8n',  v:0.58 },
    { time:'4:3:0', n:'A5', d:'4n',  v:0.68 },
    { time:'5:0:2', n:'D5', d:'4n',  v:0.60 }, { time:'5:1:2', n:'F5', d:'4n',  v:0.62 },
    { time:'5:2:0', n:'A5', d:'4n',  v:0.65 }, { time:'5:3:0', n:'C5', d:'4n',  v:0.58 },
    { time:'6:1:0', n:'D5', d:'4n',  v:0.60 }, { time:'6:2:0', n:'B4', d:'8n',  v:0.55 },
    { time:'6:2:2', n:'D5', d:'4n',  v:0.60 },
    { time:'7:0:0', n:'E5', d:'8n',  v:0.65 }, { time:'7:0:2', n:'G#4',d:'8n',  v:0.60 },
    { time:'7:1:0', n:'B4', d:'4n',  v:0.65 }, { time:'7:2:0', n:'E5', d:'2n',  v:0.68 },
  ];

  const cp = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
    const bar = parseInt((ev.time as string).split(':')[0]);
    if ((ev.time as string).includes(':0:2')) {  // only on first skank of each bar
      Tone.getDraw().schedule(() => onChord(NAMES[bar], bar), time);
    }
  }, skankChords).start(0);

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
    reverb.dispose(); warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
