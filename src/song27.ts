// Song 27: "FLAMENCO FUEGO" — Flamenco Rumba style (フラメンコ)
// A Phrygian (Am area), 155 BPM — Am→G→F→E7 (アンダルシアカデンス ×2)
// NEW: PolySynth(pulse) rasgueado stabs (pulse 初使用 in PolySynth!)
//      PluckSynth 3rd use: flamenco guitar (attackNoise:4.0, bright)
// Drums: cajon body + cajon slap/palma (no standard kick/snare)
// E7 の G# がフラメンコ特有のフリギア・ドミナント音色!
import * as Tone from 'tone';

export const META = { name: 'FLAMENCO FUEGO', bpm: 155 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  const comp = new Tone.Compressor({ threshold: -13, ratio: 3.5, attack: 0.003, release: 0.15 });
  comp.toDestination();
  const warm = new Tone.Filter({ frequency: 11000, type: 'lowpass', rolloff: -12 });
  warm.connect(comp);

  // --- cajon: MembraneSynth (body) + NoiseSynth (slap/palma) ---
  // 体打ち: low, round body hit
  const body = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 4,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.10 }, volume: -6,
  }).toDestination();
  // スラップ/パルマ: crisp, hand clap-like
  const slap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.02 }, volume: -9,
  }).toDestination();
  // パルマ (finger clap): high-pass filtered for a brighter "clap" accent
  const palmaHpf = new Tone.Filter({ frequency: 8000, type: 'highpass' });
  palmaHpf.connect(warm);
  const palma = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 }, volume: -14,
  }).connect(palmaHpf);

  // Flamenco Rumba pattern (16 steps)
  // body:  [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0]  ← Rumba feel: 3+3+2+2+2+2 groupings
  // slap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0]  ← 2 & 4
  // palma: [0,0,1,0, 0,0,0,1, 0,0,1,0, 0,0,0,0]  ← syncopated off-beats
  const dp = {
    body:  [1,0,0,1, 0,0,1,0, 1,0,0,0, 0,1,0,0],
    slap:  [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
    palma: [0,0,1,0, 0,0,0,1, 0,0,1,0, 0,0,0,0],
  };
  const bodyV  = [0.65,0,0,0.50, 0,0,0.58,0, 0.62,0,0,0, 0,0.55,0,0];

  const drumSeq = new Tone.Sequence((time, s) => {
    const i = s as number;
    if (dp.body[i])  body.triggerAttackRelease('G1', '8n', time, bodyV[i] || 0.50);
    if (dp.slap[i])  slap.triggerAttackRelease('16n', time, 0.55);
    if (dp.palma[i]) palma.triggerAttackRelease('32n', time, 0.48);
    Tone.getDraw().schedule(() => onStep(i, !!dp.body[i], !!dp.slap[i]), time);
  }, Array.from({ length: 16 }, (_, i) => i), '16n').start(0);

  // --- guitar melody: PluckSynth (flamenco settings — bright, percussive attack) ---
  const guitarRev = new Tone.Reverb({ decay: 1.2, preDelay: 0.01 });
  guitarRev.connect(warm);
  void guitarRev.ready;
  const guitar = new Tone.PluckSynth({
    attackNoise: 4.0,    // very sharp = flamenco percussive pluck
    dampening: 4200,     // brighter than guitar/harpsichord
    resonance: 0.82,
    volume: -10,
  }).connect(guitarRev);

  // --- rasgueado: PolySynth(pulse) — staccato chord stabs (pulse in PolySynth 初使用!) ---
  const rasRev = new Tone.Reverb({ decay: 0.8, preDelay: 0.01 });
  rasRev.connect(warm);
  void rasRev.ready;
  const ras = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'pulse', width: 0.3 } as any,
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.04 },
    volume: -24,
  });
  ras.maxPolyphony = 8;
  ras.connect(rasRev);

  // Am→G→F→E7 (アンダルシアカデンス = フラメンコ por arriba)
  // E7 の G# がフリジア・ドミナント特有の音
  const NAMES = ['Am','G','F','E7','Am','G','F','E7'];
  const rasChords: Record<string,string[]> = {
    '0': ['A2','E3','A3'],       // Am (open voicing, no 7th = flamenco feel)
    '1': ['G2','D3','G3'],       // G major
    '2': ['F2','C3','F3'],       // F major
    '3': ['E2','B2','G#3','E3'], // E7 — G# is the key flamenco note!
    '4': ['A2','E3','A3'],
    '5': ['G2','D3','G3'],
    '6': ['F2','C3','F3'],
    '7': ['E2','B2','G#3','E3'],
  };

  // Rasgueado chord stabs: Rumba syncopated positions
  // Pattern per bar: hits on beat1, beat2+, beat3, beat4+ (=steps 0,6,8,14)
  const rasEvt: { time: string; notes: string[]; dur: string; vel: number }[] = [];
  for (let bar = 0; bar < 8; bar++) {
    const ns = rasChords[String(bar)];
    const v = bar < 4 ? 0.38 : 0.44;
    // Flamenco rumba stab positions: steps 0,3,6,8,10,12,14 (varied)
    const positions = [
      { step:0, vel:v+0.06 }, { step:3, vel:v-0.02 }, { step:6, vel:v+0.04 },
      { step:8, vel:v+0.06 }, { step:10, vel:v+0.00 }, { step:12, vel:v+0.04 },
      { step:14, vel:v+0.02 },
    ];
    for (const { step, vel } of positions) {
      const beat = Math.floor(step / 4);
      const sixteenth = step % 4;
      rasEvt.push({ time:`${bar}:${beat}:${sixteenth}`, notes:ns, dur:'32n', vel });
    }
  }

  // Guitar melody: alternating bass/treble (picado + alzapúa technique simulation)
  // A Phrygian scale: A B C D E F G (natural minor + E major chord = Phrygian dominant)
  const melEvt = [
    // Bar 0 Am: bass A3 → melody ascending/descending
    { time:'0:0:0', n:'A3', d:'8n', v:0.65 }, { time:'0:0:2', n:'E5', d:'8n', v:0.72 },
    { time:'0:1:0', n:'C5', d:'8n', v:0.68 }, { time:'0:1:2', n:'A4', d:'8n', v:0.62 },
    { time:'0:2:0', n:'A3', d:'8n', v:0.60 }, { time:'0:2:2', n:'E5', d:'8n', v:0.70 },
    { time:'0:3:0', n:'C5', d:'4n', v:0.65 },
    // Bar 1 G:
    { time:'1:0:0', n:'G3', d:'8n', v:0.62 }, { time:'1:0:2', n:'D5', d:'8n', v:0.70 },
    { time:'1:1:0', n:'B4', d:'8n', v:0.65 }, { time:'1:1:2', n:'G4', d:'8n', v:0.60 },
    { time:'1:2:0', n:'G3', d:'8n', v:0.58 }, { time:'1:2:2', n:'D5', d:'8n', v:0.68 },
    { time:'1:3:0', n:'B4', d:'4n', v:0.62 },
    // Bar 2 F:
    { time:'2:0:0', n:'F3', d:'8n', v:0.62 }, { time:'2:0:2', n:'C5', d:'8n', v:0.70 },
    { time:'2:1:0', n:'A4', d:'8n', v:0.65 }, { time:'2:1:2', n:'F4', d:'8n', v:0.60 },
    { time:'2:2:0', n:'F3', d:'8n', v:0.58 }, { time:'2:2:2', n:'C5', d:'8n', v:0.68 },
    { time:'2:3:0', n:'A4', d:'4n', v:0.62 },
    // Bar 3 E7: G# = フラメンコの核心音!
    { time:'3:0:0', n:'E3', d:'8n', v:0.68 }, { time:'3:0:2', n:'B4', d:'8n', v:0.75 },
    { time:'3:1:0', n:'G#4',d:'8n', v:0.72 }, { time:'3:1:2', n:'E4', d:'8n', v:0.65 },
    { time:'3:2:0', n:'E3', d:'8n', v:0.62 }, { time:'3:2:2', n:'B4', d:'8n', v:0.72 },
    { time:'3:3:0', n:'G#4',d:'4n', v:0.70 },
    // Bars 4-7: higher octave, more intensity
    { time:'4:0:0', n:'A3', d:'8n', v:0.68 }, { time:'4:0:2', n:'E6', d:'8n', v:0.75 },
    { time:'4:1:0', n:'C5', d:'8n', v:0.70 }, { time:'4:1:2', n:'A5', d:'8n', v:0.68 },
    { time:'4:2:0', n:'E5', d:'8n', v:0.72 }, { time:'4:2:2', n:'C6', d:'8n', v:0.75 },
    { time:'4:3:0', n:'A5', d:'4n', v:0.72 },
    { time:'5:0:0', n:'G3', d:'8n', v:0.65 }, { time:'5:0:2', n:'D6', d:'8n', v:0.72 },
    { time:'5:1:0', n:'B4', d:'8n', v:0.68 }, { time:'5:1:2', n:'G5', d:'8n', v:0.70 },
    { time:'5:2:0', n:'D5', d:'8n', v:0.70 }, { time:'5:2:2', n:'B5', d:'8n', v:0.72 },
    { time:'5:3:0', n:'G5', d:'4n', v:0.70 },
    { time:'6:0:0', n:'F3', d:'8n', v:0.65 }, { time:'6:0:2', n:'C6', d:'8n', v:0.72 },
    { time:'6:1:0', n:'A4', d:'8n', v:0.68 }, { time:'6:1:2', n:'F5', d:'8n', v:0.70 },
    { time:'6:2:0', n:'C5', d:'8n', v:0.70 }, { time:'6:2:2', n:'A5', d:'8n', v:0.72 },
    { time:'6:3:0', n:'F5', d:'4n', v:0.70 },
    { time:'7:0:0', n:'E3', d:'8n', v:0.72 }, { time:'7:0:2', n:'B5', d:'8n', v:0.80 },
    { time:'7:1:0', n:'G#5',d:'8n', v:0.78 }, { time:'7:1:2', n:'E5', d:'8n', v:0.72 },
    { time:'7:2:0', n:'B4', d:'8n', v:0.75 }, { time:'7:2:2', n:'G#5',d:'8n', v:0.78 },
    { time:'7:3:0', n:'E5', d:'2n', v:0.75 },
  ];

  // Chord event (string pads — minimal, one per bar for chord display)
  const chordEvt = NAMES.map((_, bar) => ({ time:`${bar}:0:0`, bar }));

  const cp = new Tone.Part((time, ev) => {
    Tone.getDraw().schedule(() => onChord(NAMES[ev.bar], ev.bar), time);
  }, chordEvt).start(0);

  const rp = new Tone.Part((time, ev) => {
    ras.triggerAttackRelease(ev.notes, ev.dur, time, ev.vel);
  }, rasEvt).start(0);

  const mp = new Tone.Part((time, ev) => {
    guitar.triggerAttack(ev.n, time, ev.v);
  }, melEvt).start(0);

  return () => {
    drumSeq.dispose(); cp.dispose(); rp.dispose(); mp.dispose();
    body.dispose(); slap.dispose(); palma.dispose();
    guitar.dispose(); ras.dispose();
    guitarRev.dispose(); rasRev.dispose();
    warm.dispose(); comp.dispose(); palmaHpf.dispose();
  };
}
