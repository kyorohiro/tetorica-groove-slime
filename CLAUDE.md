# tetorica-groove-slime

## 最重要ゴール

**音に合わせて動く Monster Engine を作ること。**

ループ音楽を再生しながら、スライム（またはモンスター）キャラクターが  
グルーブに反応してリアルタイムにアニメーションするプロトタイプ。  
最終的には Jukebox 的な「手元に置いておきたいデスクトップおもちゃ」。

---

## 現状

Tone.js + Vite のブラウザデモ（もとは `tetorica-retro-player/examples/demo-tonejs-vite`）を移植。

- **35曲**のループ音楽が収録済み（`src/song1.ts` 〜 `src/song35.ts`）
- **4バンドAnalyserNode ビジュアライザー**が `src/main.ts` に実装済み
  - KICK (0–200 Hz)、SNARE (200–700 Hz)、MID (700–3500 Hz)、HI (3500–10kHz)
  - `playing` フラグ、attack/decay エンベロープで滑らかに反応
  - 現在は4つの丸（`#band-kick` 〜 `#band-hi`）が光るだけ

```
index.html      タブUI、ステップインジケーター、4バンド丸
src/
  main.ts       UI管理、曲切り替え、BPMスライダー、AnalyserNode
  song1.ts      各曲モジュール (META + create関数)
  ...
  song35.ts
```

---

## Monster Engine の方針

- 4バンドの数値（0〜1）をキャラの**部位 / 状態**に割り当てる
- 「それっぽく見える」だけで十分 — 本物の同期よりも見た目の楽しさ優先
- アニメーション手法は **SVG or Canvas** で実験中（まだ未実装）
- キャラは複数体を想定（4匹のスライムが別々の楽器担当、など）

### バンドとキャラの割り当てイメージ

| バンド | 周波数 | キャラへの反映例 |
|--------|--------|-----------------|
| KICK   | 低域   | 体全体が弾む・大きくなる |
| SNARE  | 中低域 | 腕・手のアクション |
| MID    | 中域   | 顔・表情の変化 |
| HI     | 高域   | 耳・触覚・細かいパーツ |

---

## 曲追加のルール

新しい曲は `song36.ts` から連番で追加する。  
追加後に以下を更新：

1. `src/main.ts` — import と SONGS 配列に追加
2. `index.html` — `.song-tabs` にボタン追加（data-song は 35 から）
3. `README.md` — 収録曲一覧と音色一覧テーブルを更新

### 各曲モジュールの構造

```typescript
export const META = { name: '曲名', bpm: 120 };

type StepCb  = (s: number, kick: boolean, snare: boolean) => void;
type ChordCb = (name: string, bar: number) => void;

export function create(onStep: StepCb, onChord: ChordCb): () => void {
  // Tone.js ノードを生成・接続
  // Tone.Sequence / Tone.Part で再生スケジュール
  return () => { /* 全ノードを dispose */ };
}
```

### 音色ルール

- `PolySynth` は `maxPolyphony = 10` を設定
- カスタム oscillator type は `as any` キャスト: `{ type: 'fmsawtooth' } as any`
- `Tone.Wah` は v15 に存在しない → `Filter(bandpass) + LFO` で代替
- Transport ループは `main.ts` で `loopEnd = '8m'` を設定
  - 変拍子曲は `create()` で上書き・`dispose()` で `'8m'` に復元
  - 例: song34 (5/4拍子) は `loopEnd = '5m'`

### 有効な oscillator type

```
基本:  sine / square / sawtooth / triangle
fat-:  fatsine / fatsquare / fatsawtooth / fattriangle
am-:   amsine  / amsquare  / amsawtooth  / amtriangle
fm-:   fmsine  / fmsquare  / fmsawtooth  / fmtriangle
特殊:  pwm / pulse
❌ cosine 系は無効
```

### まだ使っていない主なエフェクト

- `Tone.EQ3` — 3バンドEQ
- `Tone.OnePoleFilter` — シンプルな1ポールフィルター

---

## 起動

```bash
npm install
npm run dev
# → http://localhost:5173
```
