// Song 25: "TRAP NIGHT" — Trap / Hip Hop style (トラップ)
// F minor, 72 BPM — Fm7→Dbmaj7→Abmaj7→Eb7 (×2)
// New: DuoSynth (portamento) 808 bass, PolySynth(fattriangle)+Reverb pad,
//      FMSynth (harmonicity:2) bell melody
// Drums: sparse kick, 2&4 snare, 16th hi-hat rolls (trap 特有!)
import * as Tone from 'tone';

export const META = { name: 'TRAP NIGHT', bpm: 72 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -12, ratio: 4, attack: 0.003, release: 0.25 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 11000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: trap pattern ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.1, octaves: 8,
    envelope: { attack: 0.001, decay: 0.55, sustain: 0, release: 0.2 }, volume: -3,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.003, decay: 0.22, sustain: 0, release: 0.05 }, volume: -8,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 10000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.025, sustain: 0, release: 0.005 }, volume: -22,
  }).connect(hhHpf);
  const openHpf = new Tone.Filter({ frequency: 8000, type: 'highpass' });
  openHpf.connect(warm);
  const openhat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.06 }, volume: -26,
  }).connect(openHpf);

  // sparse trap kick + snare + 16th hi-hat rolls (velocity crescendo = roll 感)
  const dp = {
    kick:  [1,0,0,0, 0,0,0,0, 0,0,0,0, 1,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
    open:  [0,0,1,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
  };
  // velocity crescendo at bar-end = trap hi-hat roll 特有の表現
  const hhV = [0.50, 0.30, 0.38, 0.30, 0.52, 0.30, 0.38, 0.35,
               0.54, 0.34, 0.42, 0.38, 0.58, 0.52, 0.68, 0.80];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time, 0.55);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    if (dp.open[i])  openhat.triggerAttackRelease('16n', time, 0.38);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- 808 bass: DuoSynth with portamento — trap 808 スライド音 (DuoSynth as bass 初使用!) ---
  const bass = new Tone.DuoSynth({
    harmonicity: 0.5,   // voice1 = 1 octave below = thick sub
    vibratoAmount: 0,
    vibratoRate: 5,
    portamento: 0.08,   // 80ms glide = trap 808 slide
    voice0: {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.85, release: 1.5 },
      filter: { Q: 2, type: 'lowpass', rolloff: -24, frequency: 350 },
      filterEnvelope: { attack: 0.01, decay: 0.6, sustain: 0.7, release: 1.5, baseFrequency: 120, octaves: 3 },
      volume: -6,
    },
    voice1: {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.5, sustain: 0.85, release: 1.5 },
      volume: -12,
    },
    volume: -5,
  }).toDestination();

  // --- pad: PolySynth(fattriangle) + Reverb — dark atmospheric (fattriangle 初使用!) ---
  const padReverb = new Tone.Reverb({ decay: 5.0, preDelay: 0.05 });
  padReverb.connect(warm);
  void padReverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fattriangle', count: 3, spread: 15 } as any,
    envelope: { attack: 0.8, decay: 0.5, sustain: 0.70, release: 3.0 },
    volume: -24,
  });
  pad.maxPolyphony = 10;
  pad.connect(padReverb);

  // --- melody: FMSynth bell/glass — haunting trap lead (harmonicity:2 = metallic bell) ---
  const melReverb = new Tone.Reverb({ decay: 4.0, preDelay: 0.03 });
  melReverb.connect(warm);
  void melReverb.ready;
  const mel = new Tone.FMSynth({
    harmonicity: 2,
    modulationIndex: 5,
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 2.0 },
    modulation: { type: 'sine' },
    modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.05, release: 0.8 },
    volume: -16,
  }).connect(melReverb);

  // Fm7→Dbmaj7→Abmaj7→Eb7 (i→VI→III→VII in F minor)
  const NAMES = ['Fm7','Dbmaj7','Abmaj7','Eb7','Fm7','Dbmaj7','Abmaj7','Eb7'];
  const chords = [
    { time:'0:0:0', notes:['F2','Ab2','C3','Eb3'],  dur:'1m', vel:0.28 },
    { time:'1:0:0', notes:['Db2','F2','Ab2','C3'],  dur:'1m', vel:0.28 },
    { time:'2:0:0', notes:['Ab1','C2','Eb2','G2'],  dur:'1m', vel:0.26 },
    { time:'3:0:0', notes:['Eb2','G2','Bb2','Db3'], dur:'1m', vel:0.28 },
    { time:'4:0:0', notes:['F2','Ab2','C3','Eb3'],  dur:'1m', vel:0.30 },
    { time:'5:0:0', notes:['Db2','F2','Ab2','C3'],  dur:'1m', vel:0.30 },
    { time:'6:0:0', notes:['Ab1','C2','Eb2','G2'],  dur:'1m', vel:0.28 },
    { time:'7:0:0', notes:['Eb2','G2','Bb2','Db3'], dur:'1m', vel:0.30 },
  ];
  // 808 bass: portamento creates automatic slide between consecutive pitches
  const bassLine = [
    { time:'0:0:0', p:'F1',  d:'1n'   },
    { time:'1:0:0', p:'F1',  d:'2n'   }, { time:'1:2:0', p:'Eb1', d:'2n'  },
    { time:'2:0:0', p:'Db1', d:'1n'   },   // portamento slides from Eb→Db
    { time:'3:0:0', p:'Db2', d:'2n'   }, { time:'3:2:0', p:'Db1', d:'2n'  },
    { time:'4:0:0', p:'Ab1', d:'1n'   },   // portamento slides from Db→Ab
    { time:'5:0:0', p:'Ab1', d:'2n'   }, { time:'5:2:0', p:'G1',  d:'2n'  },
    { time:'6:0:0', p:'Eb1', d:'1n'   },
    { time:'7:0:0', p:'Eb2', d:'2n'   }, { time:'7:2:0', p:'Bb1', d:'2n'  },
  ];
  // F minor pentatonic (F Ab Bb C Eb) — sparse, haunting bell melody
  const melNotes = [
    { time:'0:1:0', n:'Ab4', d:'2n.',  v:0.60 },
    { time:'0:3:2', n:'C5',  d:'4n',   v:0.52 },
    { time:'1:1:0', n:'Eb5', d:'2n',   v:0.56 },
    { time:'1:3:0', n:'C5',  d:'4n',   v:0.48 },
    { time:'2:0:0', n:'Db5', d:'2n.',  v:0.58 },
    { time:'2:2:2', n:'F4',  d:'4n',   v:0.50 },
    { time:'3:1:0', n:'Ab4', d:'2n.',  v:0.54 },
    { time:'4:0:0', n:'C5',  d:'4n',   v:0.62 }, { time:'4:0:2', n:'Eb5', d:'8n', v:0.55 },
    { time:'4:1:0', n:'Ab5', d:'2n',   v:0.68 },
    { time:'4:3:0', n:'C5',  d:'4n',   v:0.55 },
    { time:'5:0:0', n:'Eb5', d:'4n',   v:0.60 }, { time:'5:0:2', n:'Db5', d:'8n', v:0.52 },
    { time:'5:1:0', n:'F5',  d:'2n',   v:0.64 },
    { time:'5:3:2', n:'Ab4', d:'4n',   v:0.50 },
    { time:'6:0:0', n:'C5',  d:'2n.',  v:0.60 },
    { time:'6:2:2', n:'Eb5', d:'4n',   v:0.55 },
    { time:'7:0:0', n:'G5',  d:'4n',   v:0.62 }, { time:'7:0:2', n:'Eb5', d:'8n', v:0.54 },
    { time:'7:1:0', n:'Bb4', d:'4n',   v:0.58 }, { time:'7:2:0', n:'G4',  d:'4n', v:0.52 },
    { time:'7:3:0', n:'F4',  d:'4n',   v:0.55 },
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
    kick.dispose(); snare.dispose(); hihat.dispose(); openhat.dispose();
    bass.dispose(); pad.dispose(); mel.dispose();
    padReverb.dispose(); melReverb.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose(); openHpf.dispose();
  };
}
