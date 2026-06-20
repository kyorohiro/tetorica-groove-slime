# demo-tonejs-vite

Tone.js + Vite によるブラウザ内ループミュージックデモ。  
35曲のループ曲を収録。様々な Tone.js の音色・エフェクトを試している。

## 起動

```bash
cd examples/demo-tonejs-vite
npm install
npm run dev
# → http://localhost:5173
```

## 収録曲一覧

| # | 曲名 | キー | BPM | ジャンル | コード進行 |
|---|---|---|---|---|---|
| 1  | Chill Loop      | C major | 80  | Lo-fi Pop   | Cmaj7 Em7 Am7 Fmaj7 |
| 2  | Rain Window     | A minor | 75  | Ambient Pop | Am7 Dm7 G7 Cmaj7 E7 |
| 3  | Midnight Keys   | F major | 88  | Latin Pop   | Fmaj7 Gm7 Am7 Bbmaj7 Cm7 |
| 4  | Duo Dusk        | D major | 82  | Country Pop | Dmaj7 Bm7 Gmaj7 A7 Em7 |
| 5  | 8bit Blues      | G blues | 78  | 8bit Blues  | G7 C7 G7 D7 |
| 6  | Dark Orbit      | C minor | 76  | Dark Rock   | Cm Ab Eb Bb Fm G |
| 7  | Jazz Wah        | Bb major| 85  | Smooth Jazz | Bbmaj7 Gm7 Ebmaj7 F7 |
| 8  | Rock Edge       | E minor | 90  | Rock        | Em C G D |
| 9  | Tremolo Sky     | A major | 72  | Pop Ballad  | A E F#m D |
| 10 | Neon Funk       | G minor | 95  | Funk        | Gm7 Cm7 Ebmaj7 Bb7 |
| 11 | Shimmer         | B minor | 78  | Synth Pop   | Bm7 G D A7 Em7 F#7 |
| 12 | Lofi Tape       | D minor | 70  | Lo-fi Hip Hop| Dm7 Am7 Bbmaj7 F7 |
| 13 | STARLIGHT       | A major |130  | J-pop (ラルク風) | Dmaj7 E7 C#m7 F#m7 ※王道進行 |
| 14 | JAZZ NIGHT      | D minor | 92  | J-jazz (東京事変風) | Dm7 Bbmaj7 Gm7 A7 Em7b5 |
| 15 | HERO CALL       | G major |148  | Anime OP    | Em7 Cmaj7 Gmaj7 D7 Am7 |
| 16 | CITY GLOW       | G major |108  | シティポップ  | Gmaj7 Em7 Am7 D7 |
| 17 | CANON LIGHT     | D major | 66  | クラシック   | D A Bm F#m G D G A |
| 18 | IPANEMA NIGHTS  | F major | 88  | ボサノバ     | Fmaj7 Gm7 C7 Dm7 Em7b5 A7 |
| 19 | ONE DROP        | A minor | 80  | レゲエ       | Am7 Fmaj7 G7 Em7 Dm7 E7 |
| 20 | RIO BEAT        | D major |120  | サンバ       | Dmaj7 Bm7 Em7 A7 |
| 21 | COLD SYNTH      | E minor |126  | ニューウェーブ | Em G D A |
| 22 | AMEN WAVE       | A minor |170  | Drum & Bass | Am7 Fmaj7 Dm7 E7 |
| 23 | STARFIELD       | C major | 60  | アンビエント  | Cmaj9 Fmaj9 Am9 G6/9 |
| 24 | HOUSE DRIVE     | A minor |128  | ハウス/EDM    | Am7 Fmaj7 Cmaj7 G7 (×2) |
| 25 | TRAP NIGHT      | F minor | 72  | トラップ      | Fm7 Dbmaj7 Abmaj7 Eb7 (×2) |
| 26 | GROOVE MACHINE  | Ab major|118  | ディスコ/R&B  | Abmaj7 Fm7 Dbmaj7 Eb7 (×2) |
| 27 | FLAMENCO FUEGO  | A Phrygian|155| フラメンコ   | Am G F E7 (アンダルシア ×2) |
| 28 | SPAIN NIGHTS    | D major |138  | ラテンジャズ  | Dmaj7 C#7 F#m7 Bm7 Em7 A7 Dmaj7 A7 |
| 29 | SEVEN PULSE     | F# minor|132  | 7/8 変拍子    | F#m7 A E7 D (各2bars of 7/8) |
| 30 | POLY GROOVE     | Bb minor| 92  | ポリリズム    | Bbm7 (3bars) → Ebm7 (3bars) |
| 31 | SOUL GROOVE     | Eb major| 72  | R&B/ソウル    | Ebmaj9 Cm9 Abmaj9 Bb7 (×2) |
| 32 | PRAISE SONG     | C major | 84  | ゴスペル      | Cmaj7 F9 G13 Am7 Cmaj7 F9 Dm7 G7 |
| 33 | NEON SEOUL      | C# minor|120  | K-pop        | C#m7 Amaj7 E7 B7 (×2) |
| 34 | FUSION FIVE     | Gb major|138  | Jazz Fusion 5/4 | Gbmaj7 Ebm7 Cbmaj7 Db7 (4 bars of 5/4) |
| 35 | MISTY GLEN      | D Dorian| 96  | Celtic/Folk  | Dm7 C G Am (×2, Dorian) |

## 音色・エフェクト一覧

各曲で異なる Tone.js の音色とエフェクトを意図的に使い分けている。

| # | 曲名 | Melody | Pad | Bass | ドラム |
|---|---|---|---|---|---|
| 1  | Chill Loop      | Synth(triangle)                      | PolySynth(sine)               | MonoSynth(triangle)    | half-time |
| 2  | Rain Window     | PluckSynth (guitar)                  | PolySynth(triangle)           | MonoSynth(sawtooth)    | sparse |
| 3  | Midnight Keys   | FMSynth                              | PolySynth(sawtooth)+Chorus    | MonoSynth(square)      | standard |
| 4  | Duo Dusk        | DuoSynth                             | PolySynth(AMSynth)            | AMSynth                | half-time |
| 5  | 8bit Blues      | Synth(pulse)+BitCrusher+PingPong     | PolySynth(sine)               | MonoSynth(square)      | blues |
| 6  | Dark Orbit      | Synth(fatsawtooth)+Phaser            | PolySynth(FMSynth)+Reverb     | MonoSynth(fatsawtooth) | epic half |
| 7  | Jazz Wah        | Synth(fmtriangle)+AutoFilter         | PolySynth(DuoSynth)           | FMSynth                | jazz |
| 8  | Rock Edge       | Synth(fatsquare)+Distortion          | PolySynth(fatsawtooth)+Chorus | MonoSynth(fatsawtooth) | rock |
| 9  | Tremolo Sky     | Synth(amsine)+Tremolo                | PolySynth(sine)+Chebyshev+Rev | MonoSynth(amtriangle)  | sparse |
| 10 | Neon Funk       | Synth(pwm)+Vibrato                   | PolySynth(fatsine)            | MonoSynth(sawtooth)+AutoFilter | funk |
| 11 | Shimmer         | Synth(fmsawtooth)+FrequencyShifter   | PolySynth(fmtriangle)+PingPong| MonoSynth(fmsquare)    | gentle |
| 12 | Lofi Tape       | Synth(triangle)+Chorus+FeedbackDelay | PolySynth(square)+Reverb      | FMSynth(harmonicity:0.5)| boom bap |
| 13 | STARLIGHT       | Synth(amsawtooth)                    | PolySynth(fatsine)+Chorus     | MonoSynth(fmtriangle)  | rock |
| 14 | JAZZ NIGHT      | Synth(amtriangle)+Vibrato            | PolySynth(amsquare)+Reverb    | MonoSynth(amsawtooth)  | jazz |
| 15 | HERO CALL       | Synth(fmsine)+PingPong               | PolySynth(sawtooth)+Reverb    | MonoSynth(sine)        | 4-on-floor |
| 16 | CITY GLOW       | AMSynth (class)                      | PolySynth(amtriangle)+Reverb  | MonoSynth(fmsawtooth)  | 80s clap |
| 17 | CANON LIGHT     | PluckSynth (harpsichord)             | PolySynth(triangle)+Rev(4s)   | MonoSynth(amsquare)    | timpani only |
| 18 | IPANEMA NIGHTS  | Synth(fatsine)+Tremolo               | PolySynth(fmsine)+Reverb      | MonoSynth(fatsine)     | bossa |
| 19 | ONE DROP        | Synth(amsquare) melodica             | PolySynth(fmsawtooth) skank   | MonoSynth(fatsquare)   | one-drop |
| 20 | RIO BEAT        | Synth(fatsquare)+Chorus horn         | PolySynth(amsawtooth)+Reverb  | MonoSynth(pulse)       | samba 16th |
| 21 | COLD SYNTH      | Synth(pwm)+FeedbackDelay arp         | PolySynth(fmsquare)+Reverb    | MonoSynth(amsine)      | TR-808 |
| 22 | AMEN WAVE       | Synth(sine)+PingPong                 | PolySynth(fatsquare)+Reverb   | FMSynth(harmonicity:0.25)| amen break |
| 23 | STARFIELD       | Synth(fmsine)+Reverb(5s)             | PolySynth(pwm)+Rev(8s)+Delay  | MonoSynth(pwm) drone   | bell only |
| 24 | HOUSE DRIVE     | Synth(sawtooth)+AutoWah              | PolySynth(amsine)+Reverb      | MonoSynth(fattriangle) | 4-on-floor house |
| 25 | TRAP NIGHT      | FMSynth(harm:2) bell+Rev             | PolySynth(fattriangle)+Rev    | DuoSynth(portamento)   | 16th hi-hat rolls |
| 26 | GROOVE MACHINE  | PolySynth(sawtooth) stabs            | PolySynth(fatsawtooth)+**StereoWidener** | MonoSynth(fmsine) | 4-on-floor disco |
| 27 | FLAMENCO FUEGO  | PluckSynth (flamenco)                | PolySynth(**pulse**) rasgueado | cajon only           | Rumba cajon |
| 28 | SPAIN NIGHTS    | DuoSynth (portamento, vibrato)       | PolySynth(**pulse**)+**JCReverb** | PluckSynth (upright) | clave+bongo+shaker |
| 29 | SEVEN PULSE     | Synth(amtriangle)+**PitchShift**     | PolySynth(fmsquare)+Reverb    | MonoSynth(sawtooth)    | 7/8 Sequence (3+2+2) |
| 30 | POLY GROOVE     | Synth(amsine) 3-feel Seq             | PolySynth(fmtriangle)+Reverb  | MonoSynth(fmsawtooth) 3-feel | 4-feel Afrobeat |
| 31 | SOUL GROOVE     | PolySynth(triangle)+Tremolo+**Freeverb** | — (EP兼用)               | FMSynth(harmonicity:1) | half-time Soul |
| 32 | PRAISE SONG     | **PolySynth(MonoSynth)**+**Freeverb** | PolySynth(fatsawtooth) choir | MonoSynth(sawtooth)   | NoiseSynth tambourine |
| 33 | NEON SEOUL      | Synth(fatsquare)+**Filter(BPF+LFO wah)** | PolySynth(fmsawtooth)+Reverb | **Oscillator+AmplitudeEnvelope** | 4-on-floor K-pop |
| 34 | FUSION FIVE     | Synth(triangle)+FeedbackDelay jazz line  | PolySynth(amsawtooth)+**FeedbackCombFilter**+Reverb | **Synth(sawtooth)** シンプルbass | 5/4 Take Five feel |
| 35 | MISTY GLEN      | Synth(triangle)+**LowpassCombFilter** tin whistle | PolySynth(triangle)+Reverb | — (drone) | bodhran frame drum |

## アーキテクチャ

```
src/
  main.ts       UI管理、曲切り替え、BPMスライダー
  song1.ts      各曲モジュール (META + create関数)
  ...
  song35.ts
index.html      タブUI、ステップインジケーター
```

**各曲モジュールの構造:**

```typescript
export const META = { name: '曲名', bpm: 120 };

export function create(
  onStep:  (step: number, kick: boolean, snare: boolean) => void,
  onChord: (name: string, bar: number) => void
): () => void {
  // Tone.js ノードを生成・接続
  // Tone.Sequence / Tone.Part で再生スケジュール
  return () => { /* 全ノードを dispose */ };
}
```

**ルール:**
- Transport ループは `main.ts` で `loopEnd = '8m'` を設定。変拍子曲は create() で上書き・dispose() で復元 (例: song34 は `'5m'`)
- UI 更新は `Tone.getDraw().schedule()` 経由で安全に行う
- `PolySynth` は `maxPolyphony = 10` を設定 (Max polyphony exceeded 防止)
- カスタム oscillator type は `as any` キャスト: `{ type: 'fmsawtooth' } as any`

## Tone.js 注意点

```
有効な oscillator type:
  基本:      sine / square / sawtooth / triangle
  fat-:      fatsine / fatsquare / fatsawtooth / fattriangle
  am-:       amsine  / amsquare  / amsawtooth  / amtriangle
  fm-:       fmsine  / fmsquare  / fmsawtooth  / fmtriangle
  特殊:      pwm / pulse

❌ cosine は無効 → fmcosine / amcosine も TypeError になる
```

- `PluckSynth` は `triggerAttack()` のみ (`triggerAttackRelease` の duration は無視)
- `Reverb` は async 生成 → `void reverb.ready` でノンブロッキング待機
- `FMSynth / AMSynth` はクラスとして直接インスタンス化可能 (PolySynth の型引数にも使える)
