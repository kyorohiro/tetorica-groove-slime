// Song 34: "FUSION FIVE" — Jazz Fusion 5/4
// Gb major, 138 BPM — Gbmaj7→Ebm7→Cbmaj7→Db7 (4 bars of 5/4, loopEnd='5m')
// Pad: PolySynth(amsawtooth)+FeedbackCombFilter+Reverb, Mel: Synth(triangle),
// Bass: Synth(sawtooth) シンプルモノ bass
import * as Tone from 'tone';

export const META = { name: 'FUSION FIVE', bpm: 138 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  // 4 bars of 5/4 = 20 quarter-note beats = '5m' in 4/4 notation
  Tone.getTransport().loopEnd = '5m';

  const limiter = new Tone.Limiter(-2);
  limiter.toDestination();
  const comp = new Tone.Compressor({ threshold: -14, ratio: 4, attack: 0.005, release: 0.15 });
  comp.connect(limiter);

  // --- drums: Take Five feel — 2+3 grouping in 5/4 ---
  // 10 eighth-note steps = 1 bar of 5/4
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.06, octaves: 5,
    envelope: { attack: 0.001, decay: 0.28, sustain: 0, release: 0.1 }, volume: -6,
  }).connect(comp);
  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.04 }, volume: -13,
  }).connect(comp);
  const hhHpf = new Tone.Filter({ frequency: 8500, type: 'highpass' });
  hhHpf.connect(comp);
  const hihat = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.01 }, volume: -23,
  }).connect(hhHpf);

  // 2+3 grouping: K on 1 & 4, snare on 3, ride 8ths
  const dp = {
    kick:  [1,0,0,0, 0,0,1,0, 1,0],
    snare: [0,0,0,0, 1,0,0,0, 0,0],
    hhat:  [1,1,0,1, 1,0,1,1, 0,1],
  };
  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.kick[i])  kick.triggerAttackRelease('C1', '8n', time);
    if (dp.snare[i]) snare.triggerAttackRelease('16n', time);
    if (dp.hhat[i])  hihat.triggerAttackRelease('32n', time, 0.5);
    Tone.getDraw().schedule(() => onStep(i, !!dp.kick[i], !!dp.snare[i]), time);
  }, Array.from({ length: 10 }, (_, i) => i), '8n').start(0);

  // --- pad: PolySynth(amsawtooth) + FeedbackCombFilter + Reverb ---
  const reverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.04 });
  reverb.connect(comp);
  void reverb.ready;
  const combFilter = new Tone.FeedbackCombFilter({ delayTime: 0.018, resonance: 0.35 });
  combFilter.connect(reverb);
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'amsawtooth' } as any,
    envelope: { attack: 0.07, decay: 0.35, sustain: 0.45, release: 2.0 },
    volume: -20,
  });
  pad.maxPolyphony = 10;
  pad.connect(combFilter);

  // --- bass: Synth(sawtooth) — シンプルモノ bass (new) ---
  const bassLpf = new Tone.Filter({ frequency: 700, type: 'lowpass' });
  bassLpf.connect(comp);
  const bass = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.14, sustain: 0.65, release: 0.22 },
    volume: -12,
  }).connect(bassLpf);

  // --- melody: Synth(triangle) + FeedbackDelay — jazz single-note line ---
  const delay = new Tone.FeedbackDelay({ delayTime: '8n', feedback: 0.2, wet: 0.22 });
  delay.connect(comp);
  const mel = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.12, sustain: 0.55, release: 0.5 },
    volume: -14,
  }).connect(delay);

  // Chord times in 4/4 bar notation (4/4 bar position of each 5/4 bar start):
  // 5/4 bar 0 → beat  0 → '0:0:0'
  // 5/4 bar 1 → beat  5 → '1:1:0'
  // 5/4 bar 2 → beat 10 → '2:2:0'
  // 5/4 bar 3 → beat 15 → '3:3:0'
  const chordDefs = [
    { time: '0:0:0', notes: ['Gb2','Bb2','Db3','F3'],  name: 'Gbmaj7', bar: 0 },
    { time: '1:1:0', notes: ['Eb2','Gb2','Bb2','Db3'], name: 'Ebm7',   bar: 2 },
    { time: '2:2:0', notes: ['B2', 'Eb3','Gb3','Bb3'], name: 'Cbmaj7', bar: 4 }, // Cb=B
    { time: '3:3:0', notes: ['Db2','F2', 'Ab2','B2'],  name: 'Db7',    bar: 6 }, // Cb=B
  ];
  const cp = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.notes, '1n', time, 0.32);
    Tone.getDraw().schedule(() => onChord(ev.name, ev.bar), time);
  }, chordDefs).start(0);

  // Bass: one note per beat in 5/4 (5 beats per bar)
  const bassLine = [
    { time:'0:0:0',p:'Gb1',d:'4n'},{ time:'0:1:0',p:'Db2',d:'4n'},
    { time:'0:2:0',p:'Bb1',d:'4n'},{ time:'0:3:0',p:'Gb1',d:'4n'},
    { time:'1:0:0',p:'F1', d:'4n'},
    { time:'1:1:0',p:'Eb1',d:'4n'},{ time:'1:2:0',p:'Bb1',d:'4n'},
    { time:'1:3:0',p:'Gb1',d:'4n'},{ time:'2:0:0',p:'Eb1',d:'4n'},
    { time:'2:1:0',p:'Db2',d:'4n'},
    { time:'2:2:0',p:'B1', d:'4n'},{ time:'2:3:0',p:'Gb1',d:'4n'}, // Cb=B
    { time:'3:0:0',p:'Eb2',d:'4n'},{ time:'3:1:0',p:'Bb1',d:'4n'},
    { time:'3:2:0',p:'B1', d:'4n'},
    { time:'3:3:0',p:'Db1',d:'4n'},{ time:'4:0:0',p:'Ab1',d:'4n'},
    { time:'4:1:0',p:'F1', d:'4n'},{ time:'4:2:0',p:'Db2',d:'4n'},
    { time:'4:3:0',p:'B1', d:'4n'},
  ];
  const bp = new Tone.Part((time, ev) => {
    bass.triggerAttackRelease(ev.p, ev.d, time);
  }, bassLine).start(0);

  // Jazz melody over 5/4 (flowing 8th-note lines)
  const melNotes = [
    { time:'0:0:0',n:'Gb4',d:'8n',v:0.72},{ time:'0:0:2',n:'Bb4',d:'8n',v:0.68},
    { time:'0:1:0',n:'Db5',d:'4n', v:0.75},
    { time:'0:2:0',n:'F5', d:'8n',v:0.70},{ time:'0:2:2',n:'Eb5',d:'8n',v:0.68},
    { time:'0:3:0',n:'Db5',d:'4n', v:0.72},
    { time:'1:0:0',n:'Bb4',d:'4n', v:0.70},
    { time:'1:1:0',n:'Eb4',d:'8n',v:0.72},{ time:'1:1:2',n:'Gb4',d:'8n',v:0.68},
    { time:'1:2:0',n:'Bb4',d:'4n', v:0.75},
    { time:'1:3:0',n:'Db5',d:'8n',v:0.72},{ time:'1:3:2',n:'B4', d:'8n',v:0.68},
    { time:'2:0:0',n:'Bb4',d:'4n', v:0.72},
    { time:'2:1:0',n:'Gb4',d:'4n', v:0.68},
    { time:'2:2:0',n:'B3', d:'8n',v:0.72},{ time:'2:2:2',n:'Eb4',d:'8n',v:0.68},
    { time:'2:3:0',n:'Gb4',d:'4n', v:0.75},
    { time:'3:0:0',n:'Bb4',d:'8n',v:0.72},{ time:'3:0:2',n:'Ab4',d:'8n',v:0.68},
    { time:'3:1:0',n:'Gb4',d:'4n', v:0.70},
    { time:'3:2:0',n:'Eb4',d:'4n', v:0.68},
    { time:'3:3:0',n:'F4', d:'8n',v:0.72},{ time:'3:3:2',n:'Ab4',d:'8n',v:0.70},
    { time:'4:0:0',n:'B4', d:'4n', v:0.75},
    { time:'4:1:0',n:'Ab4',d:'8n',v:0.70},{ time:'4:1:2',n:'F4', d:'8n',v:0.68},
    { time:'4:2:0',n:'Db4',d:'4n', v:0.72},
    { time:'4:3:0',n:'F4', d:'4n', v:0.70},
  ];
  const mp = new Tone.Part((time, ev) => {
    mel.triggerAttackRelease(ev.n, ev.d, time, ev.v);
  }, melNotes).start(0);

  return () => {
    Tone.getTransport().loopEnd = '8m'; // restore
    drumSeq.dispose(); cp.dispose(); bp.dispose(); mp.dispose();
    kick.dispose(); snare.dispose(); hihat.dispose(); hhHpf.dispose();
    bass.dispose(); bassLpf.dispose();
    pad.dispose(); combFilter.dispose(); reverb.dispose();
    mel.dispose(); delay.dispose();
    comp.dispose(); limiter.dispose();
  };
}
