// Song 21: "COLD SYNTH" — New Wave / Cold Wave style (ニューウェーブ)
// E minor, 126 BPM — Em→G→D→A (i→III→VII→VI, cold & mechanical)
// New: PolySynth(fmsquare) cold pad, MonoSynth(amsine) pulsing bass, Synth(pwm)+FeedbackDelay arpeggio
// Drum: TR-808 style (punchy kick, sharp snare, machine-tight hats)
import * as Tone from 'tone';

export const META = { name: 'COLD SYNTH', bpm: 126 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -12, ratio: 6, attack: 0.002, release: 0.1 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 9000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: TR-808 style (electronic, mechanical precision) ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 6,  // punchy TR-808 kick
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.1 }, volume: -4,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.03 }, volume: -8,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 10000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }, volume: -18,
  }).connect(hhHpf);

  // TR-808 pattern: kick slightly syncopated, snare 2&4
  const dp = {
    kick:  [1,0,0,0, 1,0,0,0, 0,0,1,0, 0,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
  };
  const hhV = [0.72,0,0.45,0, 0.68,0,0.45,0, 0.72,0,0.45,0, 0.68,0,0.45,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- bass: MonoSynth(amsine) — pulsing AM sine, subtly modulated ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'amsine' } as any,
    filter: { Q: 1.5, type: 'lowpass', rolloff: -12, frequency: 700 },
    envelope: { attack: 0.01, decay: 0.12, sustain: 0.72, release: 0.2 },
    filterEnvelope: { attack: 0.01, decay: 0.12, sustain: 0.7, release: 0.2, baseFrequency: 250, octaves: 1.5 },
    volume: -10,
  }).toDestination();

  // --- pad: PolySynth(fmsquare) + Reverb — cold, digital, synthetic ---
  const reverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.03 });
  reverb.connect(warm);
  void reverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fmsquare' } as any,
    envelope: { attack: 0.08, decay: 0.4, sustain: 0.5, release: 0.6 },
    volume: -25,
  });
  pad.maxPolyphony = 10;
  pad.connect(reverb);

  // --- melody: Synth(pwm) + FeedbackDelay — arpeggiated echo (new wave signature) ---
  const delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.35, wet: 0.45 });
  delay.connect(warm);
  const mel = new Tone.Synth({
    oscillator: { type: 'pwm', modulationFrequency: 0.4 } as any,
    envelope: { attack: 0.005, decay: 0.08, sustain: 0.4, release: 0.3 },
    volume: -14,
  }).connect(delay);

  // Em→G→D→A (E natural minor: E F# G A B C D)
  const NAMES = ['Em','G','D','A','Em','G','D','A'];
  const chords = [
    { time:'0:0:0', notes:['E3','G3','B3'], dur:'1m', vel:0.32 },
    { time:'1:0:0', notes:['G2','B2','D3'], dur:'1m', vel:0.32 },
    { time:'2:0:0', notes:['D3','F#3','A3'],dur:'1m', vel:0.32 },
    { time:'3:0:0', notes:['A2','C#3','E3'],dur:'1m', vel:0.34 },
    { time:'4:0:0', notes:['E3','G3','B3'], dur:'1m', vel:0.30 },
    { time:'5:0:0', notes:['G2','B2','D3'], dur:'1m', vel:0.30 },
    { time:'6:0:0', notes:['D3','F#3','A3'],dur:'1m', vel:0.30 },
    { time:'7:0:0', notes:['A2','C#3','E3'],dur:'1m', vel:0.33 },
  ];
  // Bass: root + syncopation
  const bassLine = [
    { time:'0:0:0', p:'E2', d:'4n' }, { time:'0:1:0', p:'E2', d:'4n' },
    { time:'0:2:0', p:'E2', d:'4n' }, { time:'0:3:0', p:'B1', d:'4n' },
    { time:'1:0:0', p:'G1', d:'4n' }, { time:'1:1:0', p:'G2', d:'4n' },
    { time:'1:2:0', p:'G1', d:'4n' }, { time:'1:3:0', p:'D2', d:'4n' },
    { time:'2:0:0', p:'D2', d:'4n' }, { time:'2:1:0', p:'D1', d:'4n' },
    { time:'2:2:0', p:'A1', d:'4n' }, { time:'2:3:0', p:'F#2',d:'4n' },
    { time:'3:0:0', p:'A1', d:'4n' }, { time:'3:1:0', p:'A2', d:'4n' },
    { time:'3:2:0', p:'E2', d:'4n' }, { time:'3:3:0', p:'A1', d:'4n' },
    { time:'4:0:0', p:'E2', d:'2n' }, { time:'4:2:0', p:'B1', d:'4n' },
    { time:'4:3:0', p:'G1', d:'4n' },
    { time:'5:0:0', p:'G1', d:'2n' }, { time:'5:2:0', p:'D2', d:'4n' },
    { time:'5:3:0', p:'B1', d:'4n' },
    { time:'6:0:0', p:'D2', d:'2n' }, { time:'6:2:0', p:'A1', d:'4n' },
    { time:'6:3:0', p:'F#2',d:'4n' },
    { time:'7:0:0', p:'A1', d:'2n' }, { time:'7:2:0', p:'E2', d:'4n' },
    { time:'7:3:0', p:'C#2',d:'4n' },
  ];
  // PWM arpeggio (new wave signature): 8th note arpeggio ascending then back
  const melNotes = [
    // Bar 0 Em: E-G-B-E-B-G-E-G
    { time:'0:0:0', n:'E4',  d:'8n', v:0.68 }, { time:'0:0:2', n:'G4',  d:'8n', v:0.58 },
    { time:'0:1:0', n:'B4',  d:'8n', v:0.65 }, { time:'0:1:2', n:'E5',  d:'8n', v:0.70 },
    { time:'0:2:0', n:'B4',  d:'8n', v:0.62 }, { time:'0:2:2', n:'G4',  d:'8n', v:0.55 },
    { time:'0:3:0', n:'E4',  d:'8n', v:0.65 }, { time:'0:3:2', n:'G4',  d:'8n', v:0.58 },
    // Bar 1 G: G-B-D-G-D-B-G-B
    { time:'1:0:0', n:'G4',  d:'8n', v:0.68 }, { time:'1:0:2', n:'B4',  d:'8n', v:0.58 },
    { time:'1:1:0', n:'D5',  d:'8n', v:0.65 }, { time:'1:1:2', n:'G5',  d:'8n', v:0.70 },
    { time:'1:2:0', n:'D5',  d:'8n', v:0.62 }, { time:'1:2:2', n:'B4',  d:'8n', v:0.55 },
    { time:'1:3:0', n:'G4',  d:'8n', v:0.65 }, { time:'1:3:2', n:'B4',  d:'8n', v:0.58 },
    // Bar 2 D: D-F#-A-D-A-F#-D-F#
    { time:'2:0:0', n:'D4',  d:'8n', v:0.68 }, { time:'2:0:2', n:'F#4', d:'8n', v:0.58 },
    { time:'2:1:0', n:'A4',  d:'8n', v:0.65 }, { time:'2:1:2', n:'D5',  d:'8n', v:0.70 },
    { time:'2:2:0', n:'A4',  d:'8n', v:0.62 }, { time:'2:2:2', n:'F#4', d:'8n', v:0.55 },
    { time:'2:3:0', n:'D4',  d:'8n', v:0.65 }, { time:'2:3:2', n:'F#4', d:'8n', v:0.58 },
    // Bar 3 A: A-C#-E-A-E-C#-A-C#
    { time:'3:0:0', n:'A4',  d:'8n', v:0.68 }, { time:'3:0:2', n:'C#5', d:'8n', v:0.58 },
    { time:'3:1:0', n:'E5',  d:'8n', v:0.65 }, { time:'3:1:2', n:'A5',  d:'8n', v:0.72 },
    { time:'3:2:0', n:'E5',  d:'8n', v:0.62 }, { time:'3:2:2', n:'C#5', d:'8n', v:0.55 },
    { time:'3:3:0', n:'A4',  d:'8n', v:0.65 }, { time:'3:3:2', n:'C#5', d:'8n', v:0.58 },
    // Bars 4-7: same pattern, one octave higher for climax
    { time:'4:0:0', n:'E5',  d:'8n', v:0.72 }, { time:'4:0:2', n:'G5',  d:'8n', v:0.62 },
    { time:'4:1:0', n:'B5',  d:'8n', v:0.68 }, { time:'4:1:2', n:'E6',  d:'8n', v:0.75 },
    { time:'4:2:0', n:'B5',  d:'8n', v:0.65 }, { time:'4:2:2', n:'G5',  d:'8n', v:0.58 },
    { time:'4:3:0', n:'E5',  d:'8n', v:0.68 }, { time:'4:3:2', n:'G5',  d:'8n', v:0.62 },
    { time:'5:0:0', n:'G5',  d:'8n', v:0.70 }, { time:'5:0:2', n:'B5',  d:'8n', v:0.60 },
    { time:'5:1:0', n:'D6',  d:'8n', v:0.68 }, { time:'5:1:2', n:'G6',  d:'8n', v:0.72 },
    { time:'5:2:0', n:'D6',  d:'8n', v:0.65 }, { time:'5:2:2', n:'B5',  d:'8n', v:0.58 },
    { time:'5:3:0', n:'G5',  d:'8n', v:0.68 }, { time:'5:3:2', n:'B5',  d:'8n', v:0.62 },
    { time:'6:0:0', n:'D5',  d:'8n', v:0.70 }, { time:'6:0:2', n:'F#5', d:'8n', v:0.60 },
    { time:'6:1:0', n:'A5',  d:'8n', v:0.68 }, { time:'6:1:2', n:'D6',  d:'8n', v:0.72 },
    { time:'6:2:0', n:'A5',  d:'8n', v:0.65 }, { time:'6:2:2', n:'F#5', d:'8n', v:0.58 },
    { time:'6:3:0', n:'D5',  d:'8n', v:0.68 }, { time:'6:3:2', n:'F#5', d:'8n', v:0.62 },
    { time:'7:0:0', n:'A4',  d:'8n', v:0.72 }, { time:'7:0:2', n:'C#5', d:'8n', v:0.62 },
    { time:'7:1:0', n:'E5',  d:'8n', v:0.70 }, { time:'7:1:2', n:'A5',  d:'8n', v:0.75 },
    { time:'7:2:0', n:'E5',  d:'8n', v:0.68 }, { time:'7:2:2', n:'C#5', d:'8n', v:0.60 },
    { time:'7:3:0', n:'A4',  d:'8n', v:0.70 }, { time:'7:3:2', n:'E5',  d:'8n', v:0.65 },
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
    delay.dispose(); reverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose();
  };
}
