import { describe, it, expect } from "vitest";
import {
  getKeyInfo,
  getRelative,
  getDiatonicChords,
  getNeighborKeys,
  detectChord,
  getChordMatches,
  getSecondaryDominants,
  getBorrowedChords,
  formatNoteName,
  parseNoteName,
  noteNameToPitchClass,
  practicalKeys,
  signatureCount,
  CIRCLE_PITCH_CLASSES,
  type KeySignature,
} from "./theory";

const names = (notes: { name: string }[]) => notes.map((n) => n.name);
const sig = (s: KeySignature) => ("sharps" in s ? s.sharps : s.flats);

describe("note parsing", () => {
  it("parses naturals, sharps and flats", () => {
    expect(noteNameToPitchClass("C")).toBe(0);
    expect(noteNameToPitchClass("F♯")).toBe(6);
    expect(noteNameToPitchClass("B♭")).toBe(10);
    expect(noteNameToPitchClass("E♯")).toBe(5);
    expect(noteNameToPitchClass("C♭")).toBe(11);
  });

  it("accepts ASCII accidentals", () => {
    expect(parseNoteName("F#").pitchClass).toBe(6);
    expect(parseNoteName("Bb").pitchClass).toBe(10);
  });
});

describe("major scales (ionian)", () => {
  it("C major: correct notes and no accidentals", () => {
    const key = getKeyInfo("C", "ionian");
    expect(names(key.scale)).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
    expect(sig(key.signature)).toEqual([]);
  });

  it("G major: one sharp (F♯)", () => {
    const key = getKeyInfo("G", "ionian");
    expect(names(key.scale)).toEqual(["G", "A", "B", "C", "D", "E", "F♯"]);
    expect(key.signature).toEqual({ sharps: ["F♯"] });
  });

  it("F major: one flat (B♭)", () => {
    const key = getKeyInfo("F", "ionian");
    expect(key.signature).toEqual({ flats: ["B♭"] });
  });

  it("E♭ major: three flats in order", () => {
    const key = getKeyInfo("E♭", "ionian");
    expect(key.signature).toEqual({ flats: ["B♭", "E♭", "A♭"] });
  });

  it("F♯ major: six sharps including E♯", () => {
    const key = getKeyInfo("F♯", "ionian");
    expect(signatureCount(key.signature)).toBe(6);
    expect(sig(key.signature)).toContain("E♯");
  });
});

describe("Roman numerals and triads", () => {
  it("major key roman numerals follow I ii iii IV V vi vii°", () => {
    const key = getKeyInfo("C", "ionian");
    expect(key.scale.map((n) => n.romanNumeral)).toEqual([
      "I",
      "ii",
      "iii",
      "IV",
      "V",
      "vi",
      "vii°",
    ]);
  });

  it("D major diatonic triads are spelled correctly", () => {
    const key = getKeyInfo("D", "ionian");
    const byDegree = (d: number) => key.scale[d - 1];
    expect(byDegree(1).chordTones).toEqual(["D", "F♯", "A"]); // I
    expect(byDegree(2).chordTones).toEqual(["E", "G", "B"]); // ii (E minor)
    expect(byDegree(5).chordTones).toEqual(["A", "C♯", "E"]); // V (A major)
    expect(byDegree(7).romanNumeral).toBe("vii°"); // C♯ diminished
    expect(byDegree(7).chordTones).toEqual(["C♯", "E", "G"]);
  });
});

describe("modes", () => {
  it("D dorian uses no accidentals (relative of C major)", () => {
    const key = getKeyInfo("D", "dorian");
    expect(names(key.scale)).toEqual(["D", "E", "F", "G", "A", "B", "C"]);
    expect(sig(key.signature)).toEqual([]);
  });

  it("A aeolian uses no accidentals", () => {
    const key = getKeyInfo("A", "aeolian");
    expect(names(key.scale)).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
    expect(sig(key.signature)).toEqual([]);
  });

  it("C lydian raises the 4th (F♯)", () => {
    const key = getKeyInfo("C", "lydian");
    expect(names(key.scale)).toEqual(["C", "D", "E", "F♯", "G", "A", "B"]);
  });
});

describe("relative key switching", () => {
  it("C major → A minor", () => {
    expect(getRelative(getKeyInfo("C", "ionian"))).toEqual({
      tonic: "A",
      mode: "aeolian",
    });
  });

  it("A minor → C major", () => {
    expect(getRelative(getKeyInfo("A", "aeolian"))).toEqual({
      tonic: "C",
      mode: "ionian",
    });
  });
});

describe("circle of fifths layout", () => {
  it("orders pitch classes by perfect fifths starting at C", () => {
    expect(CIRCLE_PITCH_CLASSES).toEqual([0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]);
  });

  it("produces 12 circle positions with 7 diatonic", () => {
    const key = getKeyInfo("C", "ionian");
    expect(key.notes).toHaveLength(12);
    expect(key.notes.filter((n) => n.diatonic)).toHaveLength(7);
    expect(key.notes[0].scaleDegree).toBe(1); // C is tonic at index 0
  });
});

describe("diatonic chords (chord wheel)", () => {
  it("C major triads have correct symbols and tones", () => {
    const chords = getDiatonicChords(getKeyInfo("C", "ionian"));
    expect(chords.map((c) => c.symbol)).toEqual([
      "C",
      "Dm",
      "Em",
      "F",
      "G",
      "Am",
      "Bdim",
    ]);
    expect(chords[0].pitchClasses).toEqual([0, 4, 7]); // C E G
    expect(chords[4].pitchClasses).toEqual([7, 11, 2]); // G B D
  });

  it("C major sevenths produce maj7 / 7 / ø7 chords", () => {
    const chords = getDiatonicChords(getKeyInfo("C", "ionian"), true);
    expect(chords.map((c) => c.symbol)).toEqual([
      "Cmaj7",
      "Dm7",
      "Em7",
      "Fmaj7",
      "G7",
      "Am7",
      "Bm7♭5",
    ]);
    expect(chords[0].roman).toBe("Imaj7");
    expect(chords[4].roman).toBe("V7");
    expect(chords[6].roman).toBe("viiø7");
    expect(chords[4].pitchClasses).toEqual([7, 11, 2, 5]); // G B D F
  });
});

describe("neighbor keys", () => {
  it("C major neighbors are G (V), F (IV) and A minor (relative)", () => {
    const neighbors = getNeighborKeys(getKeyInfo("C", "ionian"));
    expect(neighbors.map((n) => `${n.tonic} ${n.short}`)).toEqual([
      "G V",
      "F IV",
      "A rel",
    ]);
    const relative = neighbors[2];
    expect(relative.mode).toBe("aeolian");
    expect(relative.circleIndex).toBe(3); // A sits at circle index 3
  });
});

describe("chord detection (MIDI input)", () => {
  it("detects major and minor triads in any inversion", () => {
    expect(detectChord([0, 4, 7])?.symbol).toBe("C");
    expect(detectChord([4, 7, 12])?.symbol).toBe("C"); // first inversion, octave dup
    expect(detectChord([9, 0, 4])?.symbol).toBe("Am");
  });

  it("detects seventh chords", () => {
    expect(detectChord([7, 11, 2, 5])?.symbol).toBe("G7");
    expect(detectChord([0, 4, 7, 11])?.symbol).toBe("Cmaj7");
    expect(detectChord([11, 2, 5, 9])?.symbol).toBe("Bm7♭5");
  });

  it("returns null for non-chords", () => {
    expect(detectChord([0, 1])).toBeNull();
    expect(detectChord([0, 1, 2])).toBeNull();
  });

  it("finds the keys where a chord is diatonic", () => {
    const dm = detectChord([2, 5, 9])!; // D minor
    const matches = getChordMatches(dm);
    const byTonic = Object.fromEntries(matches.map((m) => [m.tonic, m.roman]));
    expect(byTonic["C"]).toBe("ii");
    expect(byTonic["F"]).toBe("vi");
    expect(byTonic["B♭"]).toBe("iii");
    expect(matches).toHaveLength(3);
  });
});

describe("secondary dominants", () => {
  it("C major: V7 of each tonicizable degree", () => {
    const secondaries = getSecondaryDominants(getKeyInfo("C", "ionian"));
    expect(secondaries.map((s) => `${s.label}=${s.symbol}`)).toEqual([
      "V7/ii=A7",
      "V7/iii=B7",
      "V7/IV=C7",
      "V7/V=D7",
      "V7/vi=E7",
    ]);
    const v7ofV = secondaries[3];
    expect(v7ofV.tones).toEqual(["D", "F♯", "A", "C"]);
  });
});

describe("borrowed chords (modal interchange)", () => {
  it("C major borrows from C minor", () => {
    const borrowed = getBorrowedChords(getKeyInfo("C", "ionian"));
    const byLabel = Object.fromEntries(borrowed.map((b) => [b.label, b.symbol]));
    expect(byLabel["iv"]).toBe("Fm");
    expect(byLabel["♭VI"]).toBe("A♭");
    expect(byLabel["♭VII"]).toBe("B♭");
    expect(byLabel["♭III"]).toBe("E♭");
    expect(byLabel["i"]).toBe("Cm");
    // Nothing already diatonic in C major sneaks in
    expect(Object.values(byLabel)).not.toContain("C");
    expect(Object.values(byLabel)).not.toContain("F");
  });

  it("A minor borrows from A major", () => {
    const borrowed = getBorrowedChords(getKeyInfo("A", "aeolian"));
    const labels = borrowed.map((b) => b.label);
    expect(labels).toContain("IV"); // D major borrowed into A minor
    expect(labels).toContain("I");
  });
});

describe("notation preference", () => {
  it("picks the requested side of slash names", () => {
    expect(formatNoteName("C♯/D♭", "sharps")).toBe("C♯");
    expect(formatNoteName("C♯/D♭", "flats")).toBe("D♭");
    expect(formatNoteName("F♯/G♭", "flats")).toBe("G♭");
  });

  it("leaves plain names and auto mode untouched", () => {
    expect(formatNoteName("C♯/D♭", "auto")).toBe("C♯/D♭");
    expect(formatNoteName("G", "sharps")).toBe("G");
    expect(formatNoteName("E♭", "sharps")).toBe("E♭"); // key-correct spelling wins
  });
});

describe("practical key enumeration", () => {
  it("lists 12 clean major keys", () => {
    const majors = practicalKeys("ionian");
    expect(majors).toHaveLength(12);
    expect(majors.map((k) => k.tonic)).toContain("C");
    expect(majors.map((k) => k.tonic)).toContain("F♯");
  });
});
