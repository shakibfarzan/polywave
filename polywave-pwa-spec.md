# Polywave — React PWA rebuild

## 1. Context and goal

**Polywave** is a rebuild of an existing Electron app (vanilla JS + Tailwind-via-CDN) into a standalone, installable **Progressive Web App** for music learners — beginner to advanced. The circle-of-fifths visualization is the anchor UI, but the app should function as a real practice tool: audible notes/chords, quizzes, progression building, and (later) MIDI input.

Package name: `polywave`.

This doc is written to be handed directly to Claude Code as the build brief.

## 2. Tech stack and one deliberate departure

| Layer | Choice |
|---|---|
| Framework | **Vite + React 19 + TypeScript** |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| State | Zustand (with `persist` middleware) |
| Audio | Tone.js |
| MIDI | native Web MIDI API (Phase 4, no library needed) |
| PWA tooling | `vite-plugin-pwa` (Workbox under the hood) |
| Icons | `lucide-react` |

**Decision note:** this is Vite, not Next.js App Router, even though Next is the default for other projects. This app has no server component — no auth, no database, no SSR needs — it's a fully client-side tool. Vite + `vite-plugin-pwa` is the more mature, purpose-built path for an installable, offline-first PWA than retrofitting `next-pwa` onto a static export. If a future version needs a backend (e.g. cloud-synced practice stats), revisit this.

## 3. Core data model

Port the existing key/mode generation logic from `renderer.js` into typed, computed (not hardcoded) theory data — this is the one piece worth rewriting properly rather than porting verbatim, since hardcoded arrays like `MAJOR_ADDED`/`MINOR_ADDED` don't generalize and make adding new overlays (chords, Roman numerals) painful.

```ts
type Mode = 'ionian' | 'aeolian' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian';

interface NoteInfo {
  name: string;          // e.g. "G♭/F♯"
  scaleDegree: number;    // 1–7
  romanNumeral: string;   // e.g. "ii", "V", "vii°"
  chordTones: string[];   // diatonic triad for this degree in the active key
  accidentalCount: number; // position around the circle, 0–11
}

interface KeyInfo {
  tonic: string;
  mode: Mode;
  notes: NoteInfo[];       // 12 entries, circle order
  signature: { sharps: string[] } | { flats: string[] };
}
```

Compute `KeyInfo` from `(tonic, mode)` using interval patterns per mode rather than per-mode hardcoded note lists — the circle-of-fifths ordering plus a mode's interval formula is enough to derive everything (notes, roman numerals, diatonic chords) algorithmically. This also makes the existing `sharpsFlatsNumber`/`sharps`/`flats` arrays derivable instead of hand-maintained.

## 4. Feature scope (build in this order)

### Phase 1 — Foundation (MVP skeleton)
- Vite + TS + Tailwind v4 + shadcn/ui scaffolded, PWA plugin configured (manifest, icons, offline precache)
- `lib/theory.ts`: typed key/mode generator described above
- `lib/audio.ts`: Tone.js wrapper — `PolySynth` by default, lazy-initialized on first user gesture (browser autoplay policy)
- Circle renders as a proper component tree (not `innerHTML`), each note is a focusable, keyboard-accessible button
- Clicking a note plays it

### Phase 2 — Beginner tools
- "Play scale" — ascending/descending playback of the active key, current note highlighted as it plays
- Roman numeral / scale-degree overlay toggle
- Relative major/minor switch with a smooth highlight transition
- Key-signature flashcard quiz (signature → key, and key → accidental count), scored

### Phase 3 — Intermediate tools
- Inner chord-wheel ring: diatonic triads/7ths for the active key, click to hear the chord
- Progression builder: click notes/chords in sequence, connecting lines drawn across the circle, play back the built sequence
- "Neighbor keys" highlight (modulation targets — one accidental away)
- Metronome + practice timer

### Phase 4 — Advanced tools
- Web MIDI input: detect a played chord, highlight matching key(s)/degree live (note: Safari has no Web MIDI support — treat as progressive enhancement, not a hard requirement)
- Secondary dominants / modal interchange overlay
- Export a built progression as a MIDI file

### Phase 5 — Polish
- Practice stats (streaks, accuracy) persisted via Zustand `persist` (localStorage; IndexedDB if data grows)
- Settings: theme (light/dark), sharps-vs-flats notation, instrument/synth choice
- Full keyboard navigation + ARIA labels on every circle segment (currently zero accessibility in the old app)

**Build only Phases 1–2 for the first working version.** Architect the data model and component boundaries so Phases 3–5 are additive, not refactors.

## 5. Component breakdown (shadcn primitives to use)

| Component | shadcn primitives |
|---|---|
| `KeySelector` | `Command` (searchable combobox) instead of the old plain dropdown |
| `CircleOfFifths` | custom SVG/positioned-div component, no shadcn equivalent |
| `NoteSegment` | `Tooltip` for accidental info on hover/focus |
| `OverlayToggles` | `ToggleGroup` for Roman numerals / chord wheel / neighbor keys |
| `PlaybackControls` | `Button` (play/stop), `Slider` (tempo) |
| `ChordWheelRing` | custom SVG, `Tooltip` per chord |
| `ProgressionBuilder` | `Badge` for each step, `Button` for play/clear |
| `QuizMode` | `Dialog` or `Sheet`, `RadioGroup`, `Progress` |
| `SettingsPanel` | `Sheet`, `Switch`, `Select` |
| `StatsDashboard` (Phase 5) | `Card` grid |
| `MidiStatus` (Phase 4) | `Badge` showing connection + detected notes |
| Theme toggle | `Switch` + `class` strategy on `<html>`, persisted via Zustand |

No routing needed for v1 — keep it a single view with a `Tabs` component switching between Explore / Practice / Quiz, all backed by the same Zustand store. Add React Router later only if deep-linking a specific key/mode becomes a real need.

## 6. PWA requirements

- `manifest.webmanifest`: name, short_name, theme_color, background_color, `display: standalone`
- Icons: 192×192, 512×512, plus a maskable variant
- `vite-plugin-pwa` with `registerType: 'autoUpdate'`, precache all static assets (fonts, audio samples if any), so the app works fully offline after first load
- Verify installability (Chrome's install prompt / Add to Home Screen) on both desktop and mobile

## 7. Folder structure

```
src/
  components/
    ui/              shadcn-generated, do not hand-edit
    circle/           CircleOfFifths, NoteSegment, ChordWheelRing
    quiz/
    settings/
  lib/
    theory.ts         key/mode generation
    audio.ts          Tone.js wrapper
    midi.ts           Phase 4
    store.ts          Zustand store
  hooks/
  types/
public/
  manifest.webmanifest
  icons/
```

## 8. Definition of done for v1 (Phases 1–2)

- [ ] Clicking any note on the circle plays that pitch
- [ ] "Play scale" plays the active key's scale with the current note visually highlighted
- [ ] Roman numeral overlay toggles on/off
- [ ] Key-signature flashcard quiz works end-to-end with scoring
- [ ] Installable as a PWA, works offline after first load
- [ ] Fully keyboard-navigable, ARIA-labeled circle
- [ ] Responsive on mobile and desktop
- [ ] Dark mode

## 9. Explicit non-goals for v1

Do not build in the first pass — these are Phase 3+ and should not block shipping a usable beginner tool: chord wheel, progression builder, MIDI input, audio key detection, modal interchange overlays. Design the data model so they're additive later, not blocking now.
