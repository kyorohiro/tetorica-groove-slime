// Song 35: "MISTY GLEN" — Celtic / Folk
// D Dorian (D E F G A B C), 96 BPM — Dm7→C→G→Am (2 bars each, ×2)
// Drone: 2× Oscillator (D+A open fifth), Melody: Synth(triangle)+LowpassCombFilter,
// Rhythm: MembraneSynth bodhran
import * as Tone from 'tone';

export const META = { name: 'MISTY GLEN', bpm: 96 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const limiter = new Tone.Limiter(-2);
  limiter.toDestination();
  const comp = new Tone.Compressor({ threshold: -16, ratio: 3, attack: 0.01, release: 0.2 });
  comp.connect(limiter);

  // --- drone: D + A open fifth (bagpipe / hurdy-gurdy feel) ---
  const droneReverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.06 });
  droneReverb.connect(comp);
  void droneReverb.ready;
  const droneD = new Tone.Oscillator({ type: 'triangle', frequency: 'D2', volume: -28 });
  const droneA = new Tone.Oscillator({ type: 'triangle', frequency: 'A2', volume: -30 });
  droneD.connect(droneReverb);
  droneA.connect(droneReverb);
  droneD.start();
  droneA.start();

  // --- bodhran: frame drum pattern (down-up feel) ---
  const bodhranDown = new Tone.MembraneSynth({
    pitchDecay: 0.04, octaves: 3,
    envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.06 }, volume: -8,
  }).connect(comp);
  const bodhranUp = new Tone.MembraneSynth({
    pitchDecay: 0.02, octaves: 2,
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.04 }, volume: -14,
  }).connect(comp);

  // Celtic 8th-note bodhran (down down up down-up): "boom-boom-tak-boom-tak"
  // 16-step pattern at 16n (4 beats × 4 steps)
  const bd = {
    down: [1,0,0,0, 1,0,1,0, 1,0,0,0, 1,0,1,0], // strong beats + swing feel
    up:   [0,0,1,0, 0,0,0,1, 0,0,1,0, 0,0,0,1], // upstrokes
  };

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    const isKick  = !!bd.down[i];
    const isSnare = !!bd.up[i];
    if (isKick)  bodhranDown.triggerAttackRelease('A1', '16n', time);
    if (isSnare) bodhranUp.triggerAttackRelease('D2', '16n', time, 0.55);
    Tone.getDraw().schedule(() => onStep(i, isKick, isSnare), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- melody: Synth(triangle) + LowpassCombFilter — tin whistle ---
  const combFilter = new Tone.LowpassCombFilter({ delayTime: 0.0095, resonance: 0.65, dampening: 4500 });
  combFilter.connect(comp);
  const melReverb = new Tone.Reverb({ decay: 1.4, preDelay: 0.02 });
  melReverb.connect(comp);
  void melReverb.ready;
  const mel = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.015, decay: 0.06, sustain: 0.7, release: 0.12 },
    volume: -10,
  });
  mel.connect(combFilter);
  mel.connect(melReverb); // blend direct + comb

  // --- pad: PolySynth(triangle) + Reverb — soft chordal fill ---
  const padReverb = new Tone.Reverb({ decay: 2.5, preDelay: 0.04 });
  padReverb.connect(comp);
  void padReverb.ready;
  const pad = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.1, decay: 0.4, sustain: 0.4, release: 1.5 },
    volume: -24,
  });
  pad.maxPolyphony = 8;
  pad.connect(padReverb);

  // Chord progression (D Dorian): Dm7 → C → G → Am
  const NAMES = ['Dm7', 'C', 'G', 'Am'];
  const chordDefs = [
    { time: '0:0:0', notes: ['D3','F3','A3','C4'], name: 'Dm7', bar: 0 },
    { time: '2:0:0', notes: ['C3','E3','G3'],      name: 'C',   bar: 2 },
    { time: '4:0:0', notes: ['G2','B2','D3'],       name: 'G',   bar: 4 },
    { time: '6:0:0', notes: ['A2','C3','E3'],       name: 'Am',  bar: 6 },
  ];
  const cp = new Tone.Part((time, ev) => {
    pad.triggerAttackRelease(ev.notes, '2m', time, 0.28);
    Tone.getDraw().schedule(() => onChord(ev.name, ev.bar), time);
  }, chordDefs).start(0);

  // Celtic reel melody (D Dorian, flowing 8th notes)
  // Characteristic: natural 6th (B natural) over Dm
  const melNotes = [
    // Dm7 (bars 0-1)
    { time:'0:0:0', n:'D5', d:'8n', v:0.78 }, { time:'0:0:2', n:'E5', d:'8n', v:0.70 },
    { time:'0:1:0', n:'F5', d:'8n', v:0.75 }, { time:'0:1:2', n:'G5', d:'8n', v:0.72 },
    { time:'0:2:0', n:'A5', d:'4n', v:0.80 },
    { time:'0:3:0', n:'B4', d:'8n', v:0.72 }, { time:'0:3:2', n:'A4', d:'8n', v:0.70 },
    { time:'1:0:0', n:'G4', d:'8n', v:0.74 }, { time:'1:0:2', n:'F4', d:'8n', v:0.70 },
    { time:'1:1:0', n:'E4', d:'4n', v:0.76 },
    { time:'1:2:0', n:'D4', d:'8n', v:0.72 }, { time:'1:2:2', n:'E4', d:'8n', v:0.70 },
    { time:'1:3:0', n:'F4', d:'8n', v:0.72 }, { time:'1:3:2', n:'A4', d:'8n', v:0.74 },
    // C (bars 2-3)
    { time:'2:0:0', n:'G5', d:'4n', v:0.78 },
    { time:'2:1:0', n:'E5', d:'8n', v:0.74 }, { time:'2:1:2', n:'D5', d:'8n', v:0.70 },
    { time:'2:2:0', n:'C5', d:'8n', v:0.75 }, { time:'2:2:2', n:'B4', d:'8n', v:0.72 },
    { time:'2:3:0', n:'C5', d:'4n', v:0.76 },
    { time:'3:0:0', n:'D5', d:'8n', v:0.74 }, { time:'3:0:2', n:'E5', d:'8n', v:0.72 },
    { time:'3:1:0', n:'G5', d:'4n', v:0.80 },
    { time:'3:2:0', n:'E5', d:'8n', v:0.74 }, { time:'3:2:2', n:'C5', d:'8n', v:0.70 },
    { time:'3:3:0', n:'D5', d:'8n', v:0.72 }, { time:'3:3:2', n:'B4', d:'8n', v:0.70 },
    // G (bars 4-5)
    { time:'4:0:0', n:'B4', d:'8n', v:0.76 }, { time:'4:0:2', n:'D5', d:'8n', v:0.74 },
    { time:'4:1:0', n:'G5', d:'4n', v:0.80 },
    { time:'4:2:0', n:'F5', d:'8n', v:0.75 }, { time:'4:2:2', n:'E5', d:'8n', v:0.72 },
    { time:'4:3:0', n:'D5', d:'4n', v:0.76 },
    { time:'5:0:0', n:'B4', d:'8n', v:0.74 }, { time:'5:0:2', n:'G4', d:'8n', v:0.70 },
    { time:'5:1:0', n:'A4', d:'8n', v:0.74 }, { time:'5:1:2', n:'B4', d:'8n', v:0.72 },
    { time:'5:2:0', n:'D5', d:'4n', v:0.78 },
    { time:'5:3:0', n:'C5', d:'8n', v:0.72 }, { time:'5:3:2', n:'B4', d:'8n', v:0.70 },
    // Am (bars 6-7)
    { time:'6:0:0', n:'A4', d:'8n', v:0.76 }, { time:'6:0:2', n:'C5', d:'8n', v:0.74 },
    { time:'6:1:0', n:'E5', d:'4n', v:0.80 },
    { time:'6:2:0', n:'D5', d:'8n', v:0.74 }, { time:'6:2:2', n:'C5', d:'8n', v:0.72 },
    { time:'6:3:0', n:'B4', d:'4n', v:0.76 }, // B natural = characteristic Dorian note
    { time:'7:0:0', n:'G4', d:'8n', v:0.72 }, { time:'7:0:2', n:'A4', d:'8n', v:0.74 },
    { time:'7:1:0', n:'C5', d:'8n', v:0.75 }, { time:'7:1:2', n:'D5', d:'8n', v:0.76 },
    { time:'7:2:0', n:'E5', d:'4n', v:0.80 },
    { time:'7:3:0', n:'D5', d:'8n', v:0.75 }, { time:'7:3:2', n:'A4', d:'8n', v:0.72 },
  ];
  const mp = new Tone.Part((time, ev) => {
    mel.triggerAttackRelease(ev.n, ev.d, time, ev.v);
  }, melNotes).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); mp.dispose();
    droneD.stop(); droneD.dispose();
    droneA.stop(); droneA.dispose();
    droneReverb.dispose();
    bodhranDown.dispose(); bodhranUp.dispose();
    mel.dispose(); combFilter.dispose(); melReverb.dispose();
    pad.dispose(); padReverb.dispose();
    comp.dispose(); limiter.dispose();
  };
}
