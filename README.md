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

**Advanced tools (Phase 4)**

- **Web MIDI input** — connect a keyboard, and held chords are identified live
  (triads and 7ths, any inversion) with the matching keys highlighted on the
  circle with their degree. Progressive enhancement: unsupported browsers
  (Safari) see a graceful notice.
- **Secondary dominants** — ring overlay showing V7 of each tonicizable degree
  (V7/ii … V7/vi) at its root's circle position.
- **Modal interchange** — ring overlay of chords borrowed from the parallel
  key (iv, ♭III, ♭VI, ♭VII, … in major), labelled relative to the tonic.
- **MIDI export** — download a built progression as a standard `.mid` file
  (type-0 SMF, tempo included, dependency-free encoder).

**Polish (Phase 5)**

- **Practice stats** — quiz accuracy, best quiz streak, consecutive-day streak,
  total practice time, and sounds played, all persisted locally with a
  dashboard on the Stats tab.
- **Settings panel** — dark mode, accidental notation (both / sharps / flats
  for out-of-key notes), and instrument choice (triangle, sine, sawtooth,
  square, FM e-piano).

**Throughout**

- **Bilingual** — full English and Persian (فارسی) UI with proper RTL layout,
  Persian digits, and the Vazirmatn typeface; switch from the header or
  settings, persisted. All ARIA labels are translated too.
- **"Midnight conservatory" design language** — warm ink & cream palette with
  a brass-gold tonic and vermilion playing accents; Fraunces display serif +
  Alegreya Sans; staff-line texture background. All fonts bundled locally so
  offline still works.
- **Dark / light mode**, persisted. Fully keyboard-navigable and ARIA-labelled.
- **PWA** — installable, works fully offline after first load.

## Tech stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix) · Zustand
(persisted) · Tone.js (lazy-loaded) · vite-plugin-pwa · lucide-react.

i18n is a hand-rolled typed dictionary (`src/lib/i18n.ts`, ~140 keys ×
en/fa) — the `fa` dictionary is compile-time checked for completeness. RTL is
driven by `dir` on `<html>` plus Radix's `DirectionProvider`.

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

All five phases of the original build brief are complete. Ideas beyond v1:
cloud-synced practice stats (would need a backend — revisit the Vite-vs-Next
decision then), audio-input key detection, and deep-linking keys via a router.
