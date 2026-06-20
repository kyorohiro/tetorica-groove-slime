import * as Tone from 'tone';
import * as Song1 from './song1';
import * as Song2 from './song2';
import * as Song3 from './song3';
import * as Song4 from './song4';
import * as Song5 from './song5';
import * as Song6 from './song6';
import * as Song7  from './song7';
import * as Song8  from './song8';
import * as Song9  from './song9';
import * as Song10 from './song10';
import * as Song11 from './song11';
import * as Song12 from './song12';
import * as Song13 from './song13';
import * as Song14 from './song14';
import * as Song15 from './song15';
import * as Song16 from './song16';
import * as Song17 from './song17';
import * as Song18 from './song18';
import * as Song19 from './song19';
import * as Song20 from './song20';
import * as Song21 from './song21';
import * as Song22 from './song22';
import * as Song23 from './song23';
import * as Song24 from './song24';
import * as Song25 from './song25';
import * as Song26 from './song26';
import * as Song27 from './song27';
import * as Song28 from './song28';
import * as Song29 from './song29';
import * as Song30 from './song30';
import * as Song31 from './song31';
import * as Song32 from './song32';
import * as Song33 from './song33';
import * as Song34 from './song34';
import * as Song35 from './song35';

// ============================================================
// UI refs
// ============================================================
const playBtn      = document.getElementById('play-btn')!;
const chordDisplay = document.getElementById('chord-display')!;
const barDisplay   = document.getElementById('bar-display')!;
const stepsEl      = document.getElementById('steps')!;
const bpmSlider    = document.getElementById('bpm-slider') as HTMLInputElement;
const bpmVal       = document.getElementById('bpm-val')!;
const songBtns     = document.querySelectorAll<HTMLButtonElement>('.song-btn');

// 16-step indicator dots
const stepEls: HTMLElement[] = [];
for (let i = 0; i < 16; i++) {
  const d = document.createElement('div');
  d.className = 'step';
  stepsEl.appendChild(d);
  stepEls.push(d);
}

// ============================================================
// Song registry
// ============================================================
const SONGS = [
  { meta: Song1.META, create: Song1.create },
  { meta: Song2.META, create: Song2.create },
  { meta: Song3.META, create: Song3.create },
  { meta: Song4.META, create: Song4.create },
  { meta: Song5.META, create: Song5.create },
  { meta: Song6.META, create: Song6.create },
  { meta: Song7.META,  create: Song7.create  },
  { meta: Song8.META,  create: Song8.create  },
  { meta: Song9.META,  create: Song9.create  },
  { meta: Song10.META, create: Song10.create },
  { meta: Song11.META, create: Song11.create },
  { meta: Song12.META, create: Song12.create },
  { meta: Song13.META, create: Song13.create },
  { meta: Song14.META, create: Song14.create },
  { meta: Song15.META, create: Song15.create },
  { meta: Song16.META, create: Song16.create },
  { meta: Song17.META, create: Song17.create },
  { meta: Song18.META, create: Song18.create },
  { meta: Song19.META, create: Song19.create },
  { meta: Song20.META, create: Song20.create },
  { meta: Song21.META, create: Song21.create },
  { meta: Song22.META, create: Song22.create },
  { meta: Song23.META, create: Song23.create },
  { meta: Song24.META, create: Song24.create },
  { meta: Song25.META, create: Song25.create },
  { meta: Song26.META, create: Song26.create },
  { meta: Song27.META, create: Song27.create },
  { meta: Song28.META, create: Song28.create },
  { meta: Song29.META, create: Song29.create },
  { meta: Song30.META, create: Song30.create },
  { meta: Song31.META, create: Song31.create },
  { meta: Song32.META, create: Song32.create },
  { meta: Song33.META, create: Song33.create },
  { meta: Song34.META, create: Song34.create },
  { meta: Song35.META, create: Song35.create },
];

// ============================================================
// State
// ============================================================
let playing     = false;
let songIndex   = 0;
let disposeSong: (() => void) | null = null;

// ============================================================
// Transport
// ============================================================
Tone.getTransport().loop      = true;
Tone.getTransport().loopStart = 0;
Tone.getTransport().loopEnd   = '8m';

// ============================================================
// UI callbacks from song modules
// ============================================================
function onStep(s: number, kick: boolean, snare: boolean) {
  stepEls.forEach((el, i) => {
    el.classList.toggle('active', i === s);
    el.classList.toggle('kick',   i === s && kick);
    el.classList.toggle('snare',  i === s && snare);
  });
}

function onChord(name: string, bar: number) {
  chordDisplay.textContent = name;
  barDisplay.textContent   = `bar ${bar + 1} / 8`;
}

// ============================================================
// Song switching
// ============================================================
function loadSong(idx: number) {
  const wasPlaying = playing;

  if (playing) {
    Tone.getTransport().stop();
    playing = false;
    playBtn.textContent = '▶';
    playBtn.classList.remove('playing');
  }

  disposeSong?.();
  disposeSong = null;
  Tone.getTransport().position = 0;

  songIndex = idx;
  const song = SONGS[idx];
  Tone.getTransport().bpm.value = song.meta.bpm;
  bpmSlider.value    = String(song.meta.bpm);
  bpmSlider.min      = String(Math.max(40, song.meta.bpm - 40));
  bpmSlider.max      = String(song.meta.bpm + 40);
  bpmVal.textContent = String(song.meta.bpm);

  disposeSong = song.create(onStep, onChord);

  chordDisplay.textContent = '—';
  barDisplay.textContent   = 'bar — / 8';
  stepEls.forEach(el => (el.className = 'step'));
  songBtns.forEach((btn, i) => btn.classList.toggle('active', i === idx));

  if (wasPlaying) {
    Tone.getTransport().start();
    playing = true;
    playBtn.textContent = '■';
    playBtn.classList.add('playing');
  }
}

// ============================================================
// Play / Stop
// ============================================================
playBtn.addEventListener('click', async () => {
  await Tone.start();

  if (!disposeSong) {
    disposeSong = SONGS[songIndex].create(onStep, onChord);
  }

  if (playing) {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    playBtn.textContent = '▶';
    playBtn.classList.remove('playing');
    chordDisplay.textContent = '—';
    barDisplay.textContent   = 'bar — / 8';
    stepEls.forEach(el => (el.className = 'step'));
  } else {
    Tone.getTransport().start();
    playBtn.textContent = '■';
    playBtn.classList.add('playing');
  }
  playing = !playing;
});

// Song select buttons
songBtns.forEach((btn, i) => {
  btn.addEventListener('click', async () => {
    await Tone.start();
    loadSong(i);
  });
});

// BPM slider
bpmSlider.addEventListener('input', () => {
  const v = Number(bpmSlider.value);
  Tone.getTransport().bpm.value = v;
  bpmVal.textContent = String(v);
});

// Initial highlight
songBtns[0]?.classList.add('active');

// ============================================================
// Frequency band visualizer
// ============================================================
const dotKick  = document.getElementById('band-kick')!;
const dotSnare = document.getElementById('band-snare')!;
const dotMid   = document.getElementById('band-mid')!;
const dotHi    = document.getElementById('band-hi')!;
const bandDots = [dotKick, dotSnare, dotMid, dotHi];

// fftSize 256 → 128 bins, each bin ≈ 172 Hz (at 44100 Hz)
// Kick:  0–200 Hz  → bins 0–1
// Snare: 200–700 Hz → bins 1–4
// Mid:   700–3500 Hz → bins 4–20
// Hi:    3500–10000 Hz → bins 20–58
const BAND_RANGES = [[0, 2], [2, 5], [5, 21], [21, 59]] as const;
const BAND_COLORS = [
  [255, 107, 138],  // pink  – kick
  [255, 217,  61],  // yellow – snare
  [107, 203, 119],  // green  – mid
  [ 77, 150, 255],  // blue   – hi
] as const;

const analyser = new Tone.Analyser('fft', 256);
analyser.smoothing = 0.75;
Tone.getDestination().connect(analyser);

// Envelope per band — slow decay so dots don't flicker
const envelope = [0, 0, 0, 0];
const ATTACK = 0.8;
const DECAY  = 0.12;

function avgBand(data: Float32Array, lo: number, hi: number): number {
  let sum = 0;
  for (let i = lo; i < hi; i++) sum += data[i];
  return sum / (hi - lo);
}

function dbToLevel(db: number): number {
  // Tone.Analyser returns dB; map -90..0 → 0..1
  return Math.max(0, Math.min(1, (db + 90) / 90));
}

function tickVisualizer() {
  requestAnimationFrame(tickVisualizer);
  if (!playing) {
    // fade out when stopped
    for (let i = 0; i < 4; i++) {
      envelope[i] *= 0.9;
      applyDot(i, envelope[i]);
    }
    return;
  }

  const data = analyser.getValue() as Float32Array;

  for (let i = 0; i < 4; i++) {
    const [lo, hi] = BAND_RANGES[i];
    const level = dbToLevel(avgBand(data, lo, hi));
    envelope[i] = level > envelope[i]
      ? envelope[i] + (level - envelope[i]) * ATTACK
      : envelope[i] * (1 - DECAY);
    applyDot(i, envelope[i]);
  }
}

function applyDot(i: number, level: number) {
  const dot = bandDots[i];
  const [r, g, b] = BAND_COLORS[i];
  const opacity = 0.18 + level * 0.82;
  const scale   = 1 + level * 0.35;
  const glow    = Math.round(level * 24);
  dot.style.opacity   = String(opacity.toFixed(3));
  dot.style.transform = `scale(${scale.toFixed(3)})`;
  dot.style.boxShadow = glow > 1 ? `0 0 ${glow}px rgba(${r},${g},${b},${(level * 0.8).toFixed(2)})` : '';
}

tickVisualizer();
