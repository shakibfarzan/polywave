/**
 * theory.ts — Polywave's computed music-theory engine.
 *
 * The old Electron app hardcoded every key as a literal array
 * (MAJOR_ADDED, DORIAN_ADDED, sharpsFlatsNumber, ...). This module replaces all
 * of that with a chromatic pitch-class model: given a tonic and a mode, it
 * derives the scale spelling, diatonic triads, Roman numerals, key signature,
 * and the 12 circle-of-fifths positions algorithmically.
 *
 * The only theory "constants" are the seven mode interval formulas; everything
 * else (including correct enharmonic spelling — G♭ vs F♯) falls out of the
 * letter-stepping speller below.
 */

export type Mode =
  | "ionian"
  | "dorian"
  | "phrygian"
  | "lydian"
  | "mixolydian"
  | "aeolian"
  | "locrian";

export type ChordQuality = "major" | "minor" | "diminished" | "augmented";

export interface NoteInfo {
  /** Key-correct spelling for diatonic notes (e.g. "F♯"); slash form ("F♯/G♭") for non-diatonic circle positions. */
  name: string;
  /** 0–11, C = 0. Drives audio playback. */
  pitchClass: number;
  /** Is this circle position part of the active key? */
  diatonic: boolean;
  /** 1–7 when diatonic, otherwise null. */
  scaleDegree: number | null;
  /** e.g. "ii", "V", "vii°" when diatonic, otherwise null. */
  romanNumeral: string | null;
  /** Diatonic triad spelled in the active key (empty for non-diatonic positions). */
  chordTones: string[];
  /** Triad quality for the diatonic degree, otherwise null. */
  chordQuality: ChordQuality | null;
  /** 0–11 position around the circle of fifths (the spec's accidentalCount). */
  circleIndex: number;
}

export type KeySignature = { sharps: string[] } | { flats: string[] };

export interface KeyInfo {
  tonic: string;
  mode: Mode;
  /** 12 entries in circle-of-fifths order (index 0 = C, clockwise by fifths). */
  notes: NoteInfo[];
  /** The 7 diatonic notes in scale order (ascending), used for playback. */
  scale: NoteInfo[];
  signature: KeySignature;
}

// --- Constants --------------------------------------------------------------

const FLAT = "♭";
const SHARP = "♯";

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
/** Natural pitch class of each letter, aligned with LETTERS. */
const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];

/** Semitone offsets from the tonic for each mode. The only theory constants. */
export const MODE_INTERVALS: Record<Mode, number[]> = {
  ionian: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

/** Scale degree (0-indexed) within the parent major at which each mode begins. */
const MODE_DEGREE: Record<Mode, number> = {
  ionian: 0,
  dorian: 1,
  phrygian: 2,
  lydian: 3,
  mixolydian: 4,
  aeolian: 5,
  locrian: 6,
};

export const MODES: Mode[] = [
  "ionian",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "aeolian",
  "locrian",
];

export const MODE_LABELS: Record<Mode, string> = {
  ionian: "Ionian (Major)",
  dorian: "Dorian",
  phrygian: "Phrygian",
  lydian: "Lydian",
  mixolydian: "Mixolydian",
  aeolian: "Aeolian (Minor)",
  locrian: "Locrian",
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII"];

/** Canonical order accidentals appear in a key signature. */
const SHARP_ORDER = ["F", "C", "G", "D", "A", "E", "B"];
const FLAT_ORDER = ["B", "E", "A", "D", "G", "C", "F"];

/** Default slash spellings for the 12 chromatic pitch classes (non-diatonic display). */
const DEFAULT_NOTE_NAMES = [
  "C",
  `C${SHARP}/D${FLAT}`,
  "D",
  `D${SHARP}/E${FLAT}`,
  "E",
  "F",
  `F${SHARP}/G${FLAT}`,
  "G",
  `G${SHARP}/A${FLAT}`,
  "A",
  `A${SHARP}/B${FLAT}`,
  "B",
];

/** 12 "clean" major keys around the circle, used to enumerate practical mode keys. */
const MAJOR_CIRCLE = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  `F${SHARP}`,
  `D${FLAT}`,
  `A${FLAT}`,
  `E${FLAT}`,
  `B${FLAT}`,
  "F",
];

// --- Note spelling primitives ----------------------------------------------

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

function accidentalToString(value: number): string {
  if (value === 0) return "";
  return value > 0 ? SHARP.repeat(value) : FLAT.repeat(-value);
}

interface ParsedNote {
  letterIndex: number;
  accidental: number;
  pitchClass: number;
}

/** Parse a note name (accepts ♯/♭/♮ and ASCII #/b/x) into its components. */
export function parseNoteName(name: string): ParsedNote {
  const letter = name[0].toUpperCase();
  const letterIndex = LETTERS.indexOf(letter as (typeof LETTERS)[number]);
  if (letterIndex === -1) {
    throw new Error(`Invalid note name: "${name}"`);
  }
  let accidental = 0;
  for (const ch of name.slice(1)) {
    if (ch === SHARP || ch === "#") accidental += 1;
    else if (ch === FLAT || ch === "b") accidental -= 1;
    else if (ch === "x") accidental += 2;
    else if (ch === "♮") accidental += 0;
  }
  return {
    letterIndex,
    accidental,
    pitchClass: mod(LETTER_PC[letterIndex] + accidental, 12),
  };
}

export function noteNameToPitchClass(name: string): number {
  return parseNoteName(name).pitchClass;
}

/** Spell `targetPC` using a fixed letter, choosing the minimal accidental. */
function spellNote(letterIndex: number, targetPC: number): string {
  const natural = LETTER_PC[letterIndex];
  let diff = mod(targetPC - natural, 12);
  if (diff > 6) diff -= 12; // prefer flats over 6+ sharps
  return LETTERS[letterIndex] + accidentalToString(diff);
}

// --- Scale / chord derivation ----------------------------------------------

interface ScaleNote {
  name: string;
  pitchClass: number;
  scaleDegree: number;
  accidental: number;
}

function buildScale(tonic: string, mode: Mode): ScaleNote[] {
  const { letterIndex: tonicLetter, pitchClass: tonicPC } = parseNoteName(tonic);
  const intervals = MODE_INTERVALS[mode];
  return intervals.map((semitones, i) => {
    const letterIndex = (tonicLetter + i) % 7;
    const pitchClass = mod(tonicPC + semitones, 12);
    const name = spellNote(letterIndex, pitchClass);
    return {
      name,
      pitchClass,
      scaleDegree: i + 1,
      accidental: parseNoteName(name).accidental,
    };
  });
}

function triadQuality(thirdInterval: number, fifthInterval: number): ChordQuality {
  if (thirdInterval === 4 && fifthInterval === 7) return "major";
  if (thirdInterval === 3 && fifthInterval === 7) return "minor";
  if (thirdInterval === 3 && fifthInterval === 6) return "diminished";
  if (thirdInterval === 4 && fifthInterval === 8) return "augmented";
  // Theoretical/altered fallback — default to major flavour.
  return thirdInterval === 3 ? "minor" : "major";
}

function romanFor(degreeIndex: number, quality: ChordQuality): string {
  const base = ROMAN[degreeIndex];
  switch (quality) {
    case "major":
      return base;
    case "augmented":
      return `${base}+`;
    case "minor":
      return base.toLowerCase();
    case "diminished":
      return `${base.toLowerCase()}°`;
  }
}

interface DegreeChord {
  chordTones: string[];
  quality: ChordQuality;
  roman: string;
}

function diatonicChords(scale: ScaleNote[]): DegreeChord[] {
  return scale.map((root, i) => {
    const third = scale[(i + 2) % 7];
    const fifth = scale[(i + 4) % 7];
    const thirdInterval = mod(third.pitchClass - root.pitchClass, 12);
    const fifthInterval = mod(fifth.pitchClass - root.pitchClass, 12);
    const quality = triadQuality(thirdInterval, fifthInterval);
    return {
      chordTones: [root.name, third.name, fifth.name],
      quality,
      roman: romanFor(i, quality),
    };
  });
}

function keySignature(scale: ScaleNote[]): KeySignature {
  const sharps = scale.filter((n) => n.accidental > 0).map((n) => n.name);
  const flats = scale.filter((n) => n.accidental < 0).map((n) => n.name);
  const byOrder = (order: string[]) => (a: string, b: string) =>
    order.indexOf(a[0]) - order.indexOf(b[0]);
  if (flats.length > sharps.length) {
    return { flats: flats.sort(byOrder(FLAT_ORDER)) };
  }
  return { sharps: sharps.sort(byOrder(SHARP_ORDER)) };
}

// --- Public API -------------------------------------------------------------

/** Pitch class at each circle-of-fifths position (index 0 = C, +7 semitones per step). */
export const CIRCLE_PITCH_CLASSES = Array.from({ length: 12 }, (_, i) =>
  mod(i * 7, 12),
);

/** The single entry point: compute everything about a key from (tonic, mode). */
export function getKeyInfo(tonic: string, mode: Mode): KeyInfo {
  const scaleRaw = buildScale(tonic, mode);
  const chords = diatonicChords(scaleRaw);

  const byPitchClass = new Map<number, { scaleNote: ScaleNote; chord: DegreeChord }>();
  scaleRaw.forEach((scaleNote, i) => {
    byPitchClass.set(scaleNote.pitchClass, { scaleNote, chord: chords[i] });
  });

  const scale: NoteInfo[] = scaleRaw.map((n, i) => ({
    name: n.name,
    pitchClass: n.pitchClass,
    diatonic: true,
    scaleDegree: n.scaleDegree,
    romanNumeral: chords[i].roman,
    chordTones: chords[i].chordTones,
    chordQuality: chords[i].quality,
    circleIndex: CIRCLE_PITCH_CLASSES.indexOf(n.pitchClass),
  }));

  const notes: NoteInfo[] = CIRCLE_PITCH_CLASSES.map((pitchClass, circleIndex) => {
    const match = byPitchClass.get(pitchClass);
    if (match) {
      return {
        name: match.scaleNote.name,
        pitchClass,
        diatonic: true,
        scaleDegree: match.scaleNote.scaleDegree,
        romanNumeral: match.chord.roman,
        chordTones: match.chord.chordTones,
        chordQuality: match.chord.quality,
        circleIndex,
      };
    }
    return {
      name: DEFAULT_NOTE_NAMES[pitchClass],
      pitchClass,
      diatonic: false,
      scaleDegree: null,
      romanNumeral: null,
      chordTones: [],
      chordQuality: null,
      circleIndex,
    };
  });

  return {
    tonic: scaleRaw[0].name,
    mode,
    notes,
    scale,
    signature: keySignature(scaleRaw),
  };
}

/**
 * Relative major/minor switch (Phase 2).
 * - Ionian (major) → relative minor (aeolian on the 6th degree).
 * - Any other mode → its parent major (ionian).
 */
export function getRelative(key: KeyInfo): { tonic: string; mode: Mode } {
  if (key.mode === "ionian") {
    return { tonic: key.scale[5].name, mode: "aeolian" };
  }
  const degree = MODE_DEGREE[key.mode];
  return { tonic: key.scale[(7 - degree) % 7].name, mode: "ionian" };
}

/** Human label for the relative-switch button, given the current mode. */
export function relativeLabel(mode: Mode): string {
  return mode === "ionian" ? "Relative minor" : "Relative major";
}

export interface KeyChoice {
  tonic: string;
  mode: Mode;
  label: string;
}

/** Practical (clean-spelling) keys for a mode, one per circle position. */
export function practicalKeys(mode: Mode): KeyChoice[] {
  const degree = MODE_DEGREE[mode];
  const seen = new Set<string>();
  const result: KeyChoice[] = [];
  for (const parent of MAJOR_CIRCLE) {
    const parentScale = buildScale(parent, "ionian");
    const tonic = parentScale[degree].name;
    if (seen.has(tonic)) continue;
    seen.add(tonic);
    result.push({ tonic, mode, label: `${tonic} ${MODE_LABELS[mode]}` });
  }
  return result;
}

/** All practical keys across all modes, for the searchable key selector. */
export function allPracticalKeys(): Record<Mode, KeyChoice[]> {
  return Object.fromEntries(MODES.map((m) => [m, practicalKeys(m)])) as Record<
    Mode,
    KeyChoice[]
  >;
}

/** A short human description of a key signature, e.g. "2 sharps (F♯, C♯)". */
export function describeSignature(signature: KeySignature): string {
  if ("sharps" in signature) {
    const n = signature.sharps.length;
    if (n === 0) return "no sharps or flats";
    return `${n} sharp${n > 1 ? "s" : ""} (${signature.sharps.join(", ")})`;
  }
  const n = signature.flats.length;
  return `${n} flat${n > 1 ? "s" : ""} (${signature.flats.join(", ")})`;
}

/** Count of accidentals in a signature (for quizzes). */
export function signatureCount(signature: KeySignature): number {
  return "sharps" in signature ? signature.sharps.length : signature.flats.length;
}

/** The 12 major-key tonics in circle order (index 0 = C, clockwise by fifths). */
export const CIRCLE_MAJOR_KEYS = MAJOR_CIRCLE;

/** Describe the major key signature at a circle position, e.g. "2 sharps (F♯, C♯)". */
export function circleMajorSignatureLabel(circleIndex: number): string {
  return describeSignature(
    getKeyInfo(MAJOR_CIRCLE[circleIndex], "ionian").signature,
  );
}

// --- Phase 3: diatonic chords (chord wheel) --------------------------------

export interface DiatonicChord {
  degree: number; // 1–7
  root: string;
  roman: string; // e.g. "ii", "V7", "viiø7"
  symbol: string; // e.g. "Dm", "G7", "Bm7♭5"
  quality: string; // human label, e.g. "minor 7th"
  tones: string[]; // spelled chord tones
  pitchClasses: number[]; // for playback
  circleIndex: number; // root's position on the circle
}

function seventhRoman(
  triadRoman: string,
  triad: ChordQuality,
  seventhInterval: number,
): string {
  if (triad === "diminished") {
    return seventhInterval === 9
      ? `${triadRoman}7` // fully diminished: vii°7
      : triadRoman.replace("°", "ø7"); // half-diminished: viiø7
  }
  return `${triadRoman}${seventhInterval === 11 ? "maj7" : "7"}`;
}

function chordSymbol(
  root: string,
  triad: ChordQuality,
  sevenths: boolean,
  seventhInterval: number,
): { symbol: string; quality: string } {
  if (!sevenths) {
    switch (triad) {
      case "major":
        return { symbol: root, quality: "major" };
      case "minor":
        return { symbol: `${root}m`, quality: "minor" };
      case "diminished":
        return { symbol: `${root}dim`, quality: "diminished" };
      case "augmented":
        return { symbol: `${root}+`, quality: "augmented" };
    }
  }
  if (triad === "major") {
    return seventhInterval === 11
      ? { symbol: `${root}maj7`, quality: "major 7th" }
      : { symbol: `${root}7`, quality: "dominant 7th" };
  }
  if (triad === "minor") {
    return seventhInterval === 11
      ? { symbol: `${root}m(maj7)`, quality: "minor-major 7th" }
      : { symbol: `${root}m7`, quality: "minor 7th" };
  }
  if (triad === "diminished") {
    return seventhInterval === 9
      ? { symbol: `${root}°7`, quality: "diminished 7th" }
      : { symbol: `${root}m7♭5`, quality: "half-diminished 7th" };
  }
  return seventhInterval === 11
    ? { symbol: `${root}+maj7`, quality: "augmented-major 7th" }
    : { symbol: `${root}+7`, quality: "augmented 7th" };
}

/** The seven diatonic chords of a key, as triads or sevenths. */
export function getDiatonicChords(key: KeyInfo, sevenths = false): DiatonicChord[] {
  const scale = key.scale;
  return scale.map((root, i) => {
    const third = scale[(i + 2) % 7];
    const fifth = scale[(i + 4) % 7];
    const seventh = scale[(i + 6) % 7];
    const t3 = mod(third.pitchClass - root.pitchClass, 12);
    const t5 = mod(fifth.pitchClass - root.pitchClass, 12);
    const t7 = mod(seventh.pitchClass - root.pitchClass, 12);
    const triad = triadQuality(t3, t5);
    const triadRoman = root.romanNumeral ?? "";
    const { symbol, quality } = chordSymbol(root.name, triad, sevenths, t7);
    const members = sevenths
      ? [root, third, fifth, seventh]
      : [root, third, fifth];
    return {
      degree: i + 1,
      root: root.name,
      roman: sevenths ? seventhRoman(triadRoman, triad, t7) : triadRoman,
      symbol,
      quality,
      tones: members.map((n) => n.name),
      pitchClasses: members.map((n) => n.pitchClass),
      circleIndex: root.circleIndex,
    };
  });
}

// --- Phase 4: chord detection (Web MIDI input) ------------------------------

export interface DetectedChord {
  rootPitchClass: number;
  rootName: string; // context-free spelling (slash form for black keys)
  quality: string; // human label, e.g. "minor 7th"
  symbol: string; // e.g. "Dm7"
  pitchClasses: number[]; // root-first, normalized
}

/** Chord templates as interval sets from the root. Larger sets first so 7ths win. */
const CHORD_TEMPLATES: { intervals: number[]; quality: string; suffix: string }[] = [
  { intervals: [0, 4, 7, 11], quality: "major 7th", suffix: "maj7" },
  { intervals: [0, 4, 7, 10], quality: "dominant 7th", suffix: "7" },
  { intervals: [0, 3, 7, 10], quality: "minor 7th", suffix: "m7" },
  { intervals: [0, 3, 6, 10], quality: "half-diminished 7th", suffix: `m7${FLAT}5` },
  { intervals: [0, 3, 6, 9], quality: "diminished 7th", suffix: "°7" },
  { intervals: [0, 4, 7], quality: "major", suffix: "" },
  { intervals: [0, 3, 7], quality: "minor", suffix: "m" },
  { intervals: [0, 3, 6], quality: "diminished", suffix: "dim" },
  { intervals: [0, 4, 8], quality: "augmented", suffix: "+" },
];

/** Short root spelling for detected chords (prefer the sharp side of slash names). */
function detectedRootName(pc: number): string {
  return DEFAULT_NOTE_NAMES[pc].split("/")[0];
}

/** Display name for a raw MIDI note number, e.g. 61 → "C♯4". */
export function midiNoteName(midiNumber: number): string {
  const pc = mod(midiNumber, 12);
  const octave = Math.floor(midiNumber / 12) - 1;
  return `${detectedRootName(pc)}${octave}`;
}

/**
 * Identify a chord from a set of pitch classes (e.g. held MIDI notes).
 * Octaves and doublings are ignored; inversions are recognized by trying
 * every note as a candidate root. Returns null if nothing matches.
 */
export function detectChord(pitchClasses: number[]): DetectedChord | null {
  const unique = [...new Set(pitchClasses.map((pc) => mod(pc, 12)))];
  if (unique.length < 3) return null;
  for (const template of CHORD_TEMPLATES) {
    if (template.intervals.length !== unique.length) continue;
    for (const root of unique) {
      const intervals = unique.map((pc) => mod(pc - root, 12)).sort((a, b) => a - b);
      if (intervals.every((v, i) => v === template.intervals[i])) {
        const rootName = detectedRootName(root);
        return {
          rootPitchClass: root,
          rootName,
          quality: template.quality,
          symbol: `${rootName}${template.suffix}`,
          pitchClasses: template.intervals.map((iv) => mod(root + iv, 12)),
        };
      }
    }
  }
  return null;
}

export interface ChordKeyMatch {
  tonic: string;
  mode: Mode;
  roman: string;
  circleIndex: number;
}

/**
 * The major keys in which a detected chord is diatonic, with the degree it
 * occupies — used to highlight modulation candidates on the circle live.
 */
export function getChordMatches(chord: DetectedChord): ChordKeyMatch[] {
  const target = [...chord.pitchClasses].sort((a, b) => a - b).join(",");
  const isSeventh = chord.pitchClasses.length === 4;
  const matches: ChordKeyMatch[] = [];
  for (const tonic of MAJOR_CIRCLE) {
    const key = getKeyInfo(tonic, "ionian");
    for (const dc of getDiatonicChords(key, isSeventh)) {
      const set = [...dc.pitchClasses].sort((a, b) => a - b).join(",");
      if (set === target) {
        matches.push({
          tonic: key.tonic,
          mode: "ionian",
          roman: dc.roman,
          circleIndex: CIRCLE_PITCH_CLASSES.indexOf(noteNameToPitchClass(key.tonic)),
        });
      }
    }
  }
  return matches;
}

// --- Phase 4: secondary dominants & modal interchange ----------------------

export interface OverlayChord {
  /** Circle position where the chip renders (the chord root's position). */
  circleIndex: number;
  symbol: string; // e.g. "A7" or "Fm"
  label: string; // e.g. "V7/ii" or "iv"
  tones: string[];
  pitchClasses: number[];
  description: string;
}

/**
 * Secondary dominants: the V7 of each diatonic degree that can be tonicized
 * (ii, iii, IV, V, vi — I's dominant is already diatonic; vii° can't be
 * tonicized). Rendered at the dominant root's circle position.
 */
export function getSecondaryDominants(key: KeyInfo): OverlayChord[] {
  const result: OverlayChord[] = [];
  for (const degreeIndex of [1, 2, 3, 4, 5]) {
    const target = key.scale[degreeIndex];
    const { letterIndex: targetLetter } = parseNoteName(target.name);
    const rootLetter = (targetLetter + 4) % 7;
    const rootPC = mod(target.pitchClass + 7, 12);
    const rootName = spellNote(rootLetter, rootPC);
    // Dominant 7th: root, major 3rd, perfect 5th, minor 7th — spelled by
    // stacking letter thirds from the root.
    const tones = [0, 4, 7, 10].map((iv, i) =>
      spellNote((rootLetter + i * 2) % 7, mod(rootPC + iv, 12)),
    );
    result.push({
      circleIndex: CIRCLE_PITCH_CLASSES.indexOf(rootPC),
      symbol: `${rootName}7`,
      label: `V7/${target.romanNumeral}`,
      tones,
      pitchClasses: [0, 4, 7, 10].map((iv) => mod(rootPC + iv, 12)),
      description: `Dominant of ${target.name} (${target.romanNumeral})`,
    });
  }
  return result;
}

/** Roman numeral for a chord relative to a tonic, with ♭/♯ prefix vs. major. */
function relativeRoman(
  tonicPC: number,
  letterDistance: number,
  rootPC: number,
  quality: ChordQuality,
): string {
  const majorIntervals = MODE_INTERVALS.ionian;
  const expected = majorIntervals[letterDistance];
  let diff = mod(rootPC - tonicPC, 12) - expected;
  if (diff > 6) diff -= 12;
  if (diff < -6) diff += 12;
  const prefix = diff === 0 ? "" : diff > 0 ? SHARP.repeat(diff) : FLAT.repeat(-diff);
  return prefix + romanFor(letterDistance, quality);
}

/**
 * Modal interchange: chords borrowed from the parallel key (same tonic,
 * major↔minor). Only chords not already diatonic in the current key are
 * returned, labelled relative to the current tonic (iv, ♭VI, ♭VII, ...).
 */
export function getBorrowedChords(key: KeyInfo): OverlayChord[] {
  const parallelMode: Mode = key.mode === "ionian" ? "aeolian" : "ionian";
  const parallel = getKeyInfo(key.tonic, parallelMode);
  const tonicPC = key.scale[0].pitchClass;

  const ownSets = new Set(
    getDiatonicChords(key).map((c) =>
      [...c.pitchClasses].sort((a, b) => a - b).join(","),
    ),
  );

  const result: OverlayChord[] = [];
  parallel.scale.forEach((root, i) => {
    const third = parallel.scale[(i + 2) % 7];
    const fifth = parallel.scale[(i + 4) % 7];
    const pcs = [root.pitchClass, third.pitchClass, fifth.pitchClass];
    const setKey = [...pcs].sort((a, b) => a - b).join(",");
    if (ownSets.has(setKey)) return; // already diatonic — not borrowed
    const quality = root.chordQuality ?? "major";
    const { symbol } = (() => {
      switch (quality) {
        case "major":
          return { symbol: root.name };
        case "minor":
          return { symbol: `${root.name}m` };
        case "diminished":
          return { symbol: `${root.name}dim` };
        case "augmented":
          return { symbol: `${root.name}+` };
      }
    })();
    result.push({
      circleIndex: CIRCLE_PITCH_CLASSES.indexOf(root.pitchClass),
      symbol,
      label: relativeRoman(tonicPC, i, root.pitchClass, quality),
      tones: [root.name, third.name, fifth.name],
      pitchClasses: pcs,
      description: `Borrowed from ${parallel.tonic} ${MODE_LABELS[parallelMode]}`,
    });
  });
  return result;
}

// --- Phase 3: neighbor keys (modulation targets) ---------------------------

export interface NeighborKey {
  tonic: string;
  mode: Mode;
  circleIndex: number;
  relationship: string;
  short: string;
}

/**
 * The closely related keys one accidental away: the dominant (V), the
 * subdominant (IV) and the relative key. All three tonics are diatonic in the
 * current key, so their spellings come straight from the scale.
 */
export function getNeighborKeys(key: KeyInfo): NeighborKey[] {
  const dominant = key.scale[4]; // 5th degree
  const subdominant = key.scale[3]; // 4th degree
  const rel = getRelative(key);
  const relCircle = CIRCLE_PITCH_CLASSES.indexOf(noteNameToPitchClass(rel.tonic));
  return [
    {
      tonic: dominant.name,
      mode: key.mode,
      circleIndex: dominant.circleIndex,
      relationship: "Dominant",
      short: "V",
    },
    {
      tonic: subdominant.name,
      mode: key.mode,
      circleIndex: subdominant.circleIndex,
      relationship: "Subdominant",
      short: "IV",
    },
    {
      tonic: rel.tonic,
      mode: rel.mode,
      circleIndex: relCircle,
      relationship: key.mode === "ionian" ? "Relative minor" : "Relative major",
      short: "rel",
    },
  ];
}
