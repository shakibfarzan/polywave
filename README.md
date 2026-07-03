# Polywave

An installable, offline-first **Progressive Web App** for music learners, built
around the circle of fifths. It's a rebuild of an older Electron + vanilla-JS
app into a real practice tool: audible notes and scales, theory overlays, and a
scored key-signature quiz.

## Features

**Explore & hear (Phases 1–2)**

- **Interactive circle of fifths** — a fixed circle (C at top) where the active
  key's diatonic notes light up, the tonic is emphasised, and note spelling
  adapts per key (D major shows F♯/C♯, not G♭/D♭).
- **Click to hear** any note; **Play scale** plays the active key ascending or
  descending with the current note highlighted live and an adjustable tempo.
- **Overlays** — toggle scale degrees or Roman numerals on the diatonic notes.
- **Relative major/minor** switch.
- **Key-signature quiz** — two directions (signature → key, key → accidental
  count), scored with streak tracking.
- **Searchable key selector** across all 7 modes and 12 keys.

**Intermediate tools (Phase 3)**

- **Chord-wheel ring** — an inner ring of the seven diatonic chords (triads or
  7ths), click any to hear it.
- **Progression builder** — record a sequence of notes/chords by tapping the
  circle, see them connected by lines, then play the progression back.
- **Neighbor keys** — highlight the closely related modulation targets
  (dominant, subdominant, relative) one accidental away.
- **Metronome** (accented, Tone.Transport-locked) and a **practice timer**.

**Throughout**

- **Dark / light mode**, persisted. Fully keyboard-navigable and ARIA-labelled.
- **PWA** — installable, works fully offline after first load.

## Tech stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Zustand
(persisted) · Tone.js (lazy-loaded) · vite-plugin-pwa · lucide-react.

## The theory engine

`src/lib/theory.ts` computes everything from `(tonic, mode)` — scale spelling,
diatonic triads, Roman numerals, key signatures and the 12 circle positions —
using mode interval formulas and a letter-stepping speller. No hardcoded note
tables. See `src/lib/theory.test.ts` for the spec.

## Scripts

```bash
npm install
npm run dev      # start the dev server
npm run test     # run the theory-engine unit tests
npm run build    # type-check + production build (generates the service worker)
npm run preview  # preview the production build
```

PWA icons are generated from an SVG via `node scripts/generate-icons.mjs`
(outputs to `public/icons/`).

## Project layout

```
src/
  components/
    ui/        shadcn primitives (generated style — do not hand-edit)
    circle/    CircleOfFifths, NoteSegment, KeySelector, OverlayToggles,
               PlaybackControls, RelativeSwitch
    quiz/      QuizMode
  lib/
    theory.ts  key/mode generation (+ theory.test.ts)
    audio.ts   Tone.js wrapper (lazy-loaded on first gesture)
    store.ts   Zustand store (persisted)
```

## Roadmap

Phases 1–3 are complete. Remaining, designed to be additive:

- **Phase 4** — Web MIDI input (detect a played chord, highlight matching keys),
  secondary-dominant / modal-interchange overlays, MIDI export of a progression.
- **Phase 5** — practice-stats dashboard, instrument/notation settings.
