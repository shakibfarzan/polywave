import { describe, it, expect } from "vitest";
import { encodeProgressionToMidi, encodeVLQ } from "./midiFile";

describe("VLQ encoding", () => {
  it("encodes single-byte values directly", () => {
    expect(encodeVLQ(0)).toEqual([0x00]);
    expect(encodeVLQ(127)).toEqual([0x7f]);
  });

  it("encodes multi-byte values with continuation bits", () => {
    expect(encodeVLQ(128)).toEqual([0x81, 0x00]);
    expect(encodeVLQ(960)).toEqual([0x87, 0x40]);
    expect(encodeVLQ(0x0fffffff)).toEqual([0xff, 0xff, 0xff, 0x7f]);
  });
});

describe("MIDI file encoding", () => {
  const cMajor = { pitchClasses: [0, 4, 7] }; // C E G
  const gMajor = { pitchClasses: [7, 11, 2] }; // G B D (D wraps an octave up)

  it("produces a valid SMF type-0 header", () => {
    const bytes = encodeProgressionToMidi([cMajor], 120);
    // "MThd", length 6, format 0, 1 track, 480 PPQ
    expect([...bytes.slice(0, 14)]).toEqual([
      0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0,
    ]);
    // Track chunk follows
    expect([...bytes.slice(14, 18)]).toEqual([0x4d, 0x54, 0x72, 0x6b]);
    const trackLen =
      (bytes[18] << 24) | (bytes[19] << 16) | (bytes[20] << 8) | bytes[21];
    expect(trackLen).toBe(bytes.length - 22);
  });

  it("writes the tempo meta event from the BPM", () => {
    const bytes = encodeProgressionToMidi([cMajor], 120);
    // First track event: delta 0, FF 51 03, then 500000 µs/quarter (0x07A120)
    expect([...bytes.slice(22, 29)]).toEqual([0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20]);
  });

  it("voices chords with rising octaves and note-on/off pairs", () => {
    const bytes = encodeProgressionToMidi([gMajor], 120);
    const events = [...bytes.slice(29)];
    // Note-ons: G4=67, B4=71, D5=74 (D wraps above B)
    expect(events.slice(0, 12)).toEqual([
      0x00, 0x90, 67, 90,
      0x00, 0x90, 71, 90,
      0x00, 0x90, 74, 90,
    ]);
    // First note-off arrives after 960 ticks (2 beats @ 480 PPQ) = VLQ 87 40
    expect(events.slice(12, 17)).toEqual([0x87, 0x40, 0x80, 67, 0]);
    // Ends with end-of-track
    expect(events.slice(-4)).toEqual([0x00, 0xff, 0x2f, 0x00]);
  });
});
