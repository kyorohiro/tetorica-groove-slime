// Song 26: "GROOVE MACHINE" — Disco / R&B style (ディスコ)
// Ab major, 118 BPM — Abmaj7→Fm7→Dbmaj7→Eb7 (×2)
// NEW: Tone.StereoWidener (初使用!), MonoSynth(fmsine) bass (初使用!)
// Drums: 4-on-floor kick, snare 2&4, 8th hats, off-beat chord stabs
import * as Tone from 'tone';

export const META = { name: 'GROOVE MACHINE', bpm: 118 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -12, ratio: 4, attack: 0.002, release: 0.12 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 10500, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- drums: disco 4-on-floor ---
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.07, octaves: 7,
    envelope: { attack: 0.001, decay: 0.40, sustain: 0, release: 0.15 }, volume: -4,
  }).toDestination();
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.003, decay: 0.14, sustain: 0, release: 0.04 }, volume: -7,
  }).toDestination();
  const hhHpf = new Tone.Filter({ frequency: 9000, type: 'highpass' });
  hhHpf.connect(warm);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }, volume: -20,
  }).connect(hhHpf);
  const openHpf = new Tone.Filter({ frequency: 7500, type: 'highpass' });
  openHpf.connect(warm);
  const openhat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.32, sustain: 0, release: 0.08 }, volume: -25,
  }).connect(openHpf);

  const dp = {
    kick:  [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    hhat:  [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
    open:  [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,1,0],
  };
  const hhV = [0.68,0,0.44,0, 0.65,0,0.44,0, 0.68,0,0.44,0, 0.65,0,0.44,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time, 0.52);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, hhV[i]);
    if (dp.open[i])  openhat.triggerAttackRelease('8n', time, 0.48);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- strings: PolySynth(fatsawtooth) + StereoWidener + Reverb (StereoWidener 初使用!) ---
  const reverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.03 });
  reverb.connect(warm);
  void reverb.ready;
  const stereoW = new Tone.StereoWidener({ width: 0.8 });
  stereoW.connect(reverb);
  const strings = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'fatsawtooth', count: 3, spread: 18 } as any,
    envelope: { attack: 0.40, decay: 0.5, sustain: 0.72, release: 1.2 },
    volume: -24,
  });
  strings.maxPolyphony = 10;
  strings.connect(stereoW);

  // --- chord stabs: PolySynth(sawtooth) staccato — disco guitar/piano chops (off-beat "and") ---
  const stabRev = new Tone.Reverb({ decay: 0.7, preDelay: 0.01 });
  stabRev.connect(warm);
  void stabRev.ready;
  const stab = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.001, decay: 0.07, sustain: 0, release: 0.04 },
    volume: -20,
  });
  stab.maxPolyphony = 10;
  stab.connect(stabRev);

  // --- bass: MonoSynth(fmsine) — slightly metallic, punchy disco bass (初使用!) ---
  const bass = new Tone.MonoSynth({
    oscillator: { type: 'fmsine' } as any,
    filter: { Q: 3, type: 'lowpass', rolloff: -24, frequency: 480 },
    envelope: { attack: 0.01, decay: 0.10, sustain: 0.72, release: 0.15 },
    filterEnvelope: { attack: 0.01, decay: 0.18, sustain: 0.55, release: 0.15, baseFrequency: 160, octaves: 2.2 },
    volume: -8,
  }).toDestination();

  const NAMES = ['Abmaj7','Fm7','Dbmaj7','Eb7','Abmaj7','Fm7','Dbmaj7','Eb7'];

  // Sustaining string pads
  const padEvt = [
    { time:'0:0:0', notes:['Ab2','C3','Eb3','G3'],  dur:'1m', vel:0.30 },
    { time:'1:0:0', notes:['F2','Ab2','C3','Eb3'],  dur:'1m', vel:0.30 },
    { time:'2:0:0', notes:['Db2','F2','Ab2','C3'],  dur:'1m', vel:0.30 },
    { time:'3:0:0', notes:['Eb2','G2','Bb2','Db3'], dur:'1m', vel:0.32 },
    { time:'4:0:0', notes:['Ab2','C3','Eb3','G3'],  dur:'1m', vel:0.28 },
    { time:'5:0:0', notes:['F2','Ab2','C3','Eb3'],  dur:'1m', vel:0.28 },
    { time:'6:0:0', notes:['Db2','F2','Ab2','C3'],  dur:'1m', vel:0.28 },
    { time:'7:0:0', notes:['Eb2','G2','Bb2','Db3'], dur:'1m', vel:0.30 },
  ];

  // Off-beat stabs: step 2,6,10,14 = "and" of every beat (disco classic)
  type StabEvent = { time: string; notes: string[]; dur: string; vel: number };
  const stabChords: Record<string, string[]> = {
    '0': ['Ab3','C4','Eb4','G4'], '1': ['F3','Ab3','C4','Eb4'],
    '2': ['Db3','F3','Ab3','C4'], '3': ['Eb3','G3','Bb3','Db4'],
    '4': ['Ab3','C4','Eb4','G4'], '5': ['F3','Ab3','C4','Eb4'],
    '6': ['Db3','F3','Ab3','C4'], '7': ['Eb3','G3','Bb3','Db4'],
  };
  const stabEvt: StabEvent[] = [];
  for (let bar = 0; bar < 8; bar++) {
    const ns = stabChords[String(bar)];
    const v = bar < 4 ? 0.54 : 0.60;
    for (let beat = 0; beat < 4; beat++) {
      stabEvt.push({ time:`${bar}:${beat}:2`, notes: ns, dur:'32n', vel: v - beat * 0.02 });
    }
  }

  // Walking disco bass (Ab major, energetic quarter-note movement)
  const bassEvt = [
    { time:'0:0:0', p:'Ab1', d:'4n' }, { time:'0:1:0', p:'Eb2', d:'4n' },
    { time:'0:2:0', p:'C2',  d:'4n' }, { time:'0:3:0', p:'G1',  d:'4n' },
    { time:'1:0:0', p:'F1',  d:'4n' }, { time:'1:1:0', p:'C2',  d:'4n' },
    { time:'1:2:0', p:'Ab1', d:'4n' }, { time:'1:3:0', p:'Eb2', d:'4n' },
    { time:'2:0:0', p:'Db2', d:'4n' }, { time:'2:1:0', p:'F1',  d:'4n' },
    { time:'2:2:0', p:'Ab1', d:'4n' }, { time:'2:3:0', p:'Db2', d:'4n' },
    { time:'3:0:0', p:'Eb2', d:'4n' }, { time:'3:1:0', p:'G1',  d:'4n' },
    { time:'3:2:0', p:'Bb1', d:'4n' }, { time:'3:3:0', p:'Eb2', d:'4n' },
    // Second half: 8th-note runs for energy
    { time:'4:0:0', p:'Ab1', d:'8n' }, { time:'4:0:2', p:'C2',  d:'8n' },
    { time:'4:1:0', p:'Eb2', d:'8n' }, { time:'4:1:2', p:'G2',  d:'8n' },
    { time:'4:2:0', p:'Ab2', d:'4n' }, { time:'4:3:0', p:'G1',  d:'4n' },
    { time:'5:0:0', p:'F1',  d:'8n' }, { time:'5:0:2', p:'Ab1', d:'8n' },
    { time:'5:1:0', p:'C2',  d:'8n' }, { time:'5:1:2', p:'Eb2', d:'8n' },
    { time:'5:2:0', p:'F2',  d:'4n' }, { time:'5:3:0', p:'Eb2', d:'4n' },
    { time:'6:0:0', p:'Db2', d:'8n' }, { time:'6:0:2', p:'F1',  d:'8n' },
    { time:'6:1:0', p:'Ab1', d:'8n' }, { time:'6:1:2', p:'C2',  d:'8n' },
    { time:'6:2:0', p:'Db2', d:'4n' }, { time:'6:3:0', p:'C2',  d:'4n' },
    { time:'7:0:0', p:'Eb2', d:'8n' }, { time:'7:0:2', p:'G1',  d:'8n' },
    { time:'7:1:0', p:'Bb1', d:'8n' }, { time:'7:1:2', p:'Db2', d:'8n' },
    { time:'7:2:0', p:'Eb2', d:'4n' }, { time:'7:3:0', p:'Ab1', d:'4n' },
  ];

  const cp = new Tone.Part((time, ev) => {
    strings.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
    const bar = parseInt((ev.time as string).split(':')[0]);
    Tone.getDraw().schedule(() => onChord(NAMES[bar], bar), time);
  }, padEvt).start(0);

  const sp = new Tone.Part((time, ev) => {
    stab.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
  }, stabEvt).start(0);

  const bp = new Tone.Part((time, ev) => {
    bass.triggerAttackRelease(ev.p, ev.d, time);
  }, bassEvt).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); sp.dispose(); bp.dispose();
    kick.dispose(); snare.dispose(); hihat.dispose(); openhat.dispose();
    strings.dispose(); stab.dispose(); bass.dispose();
    stereoW.dispose(); reverb.dispose(); stabRev.dispose();
    warm.dispose(); comp.dispose(); hhHpf.dispose(); openHpf.dispose();
  };
}
