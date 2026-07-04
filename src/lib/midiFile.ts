/**
 * midiFile.ts — minimal Standard MIDI File (type 0) encoder for exporting a
 * built progression. No dependencies; produces a Blob-ready Uint8Array.
 */

const PPQ = 480; // ticks per quarter note
const BEATS_PER_STEP = 2; // matches playSequence's default feel
const VELOCITY = 90;
const CHANNEL = 0;

export interface MidiExportStep {
  pitchClasses: number[];
  octave?: number;
}

/** Variable-length quantity encoding (SMF delta times). */
export function encodeVLQ(value: number): number[] {
  if (value < 0) throw new Error("VLQ value must be non-negative");
  const bytes = [value & 0x7f];
  let v = value >> 7;
  while (v > 0) {
    bytes.unshift((v & 0x7f) | 0x80);
    v >>= 7;
  }
  return bytes;
}

/** MIDI note numbers for a step, rising like the in-app chord voicing. */
function stepNotes(step: MidiExportStep): number[] {
  const baseOctave = step.octave ?? 4;
  let octave = baseOctave;
  let prev = -Infinity;
  return step.pitchClasses.map((pc) => {
    if (pc < prev) octave += 1;
    prev = pc;
    return (octave + 1) * 12 + pc;
  });
}

/**
 * Encode a progression as a type-0 SMF: one track containing a tempo event
 * followed by each step as a block chord lasting two beats.
 */
export function encodeProgressionToMidi(
  steps: MidiExportStep[],
  bpm: number,
): Uint8Array {
  const track: number[] = [];

  // Tempo meta event (microseconds per quarter note).
  const mpq = Math.round(60_000_000 / bpm);
  track.push(0x00, 0xff, 0x51, 0x03, (mpq >> 16) & 0xff, (mpq >> 8) & 0xff, mpq & 0xff);

  const stepTicks = PPQ * BEATS_PER_STEP;
  for (const step of steps) {
    const notes = stepNotes(step);
    for (const note of notes) {
      track.push(...encodeVLQ(0), 0x90 | CHANNEL, note & 0x7f, VELOCITY);
    }
    notes.forEach((note, i) => {
      track.push(...encodeVLQ(i === 0 ? stepTicks : 0), 0x80 | CHANNEL, note & 0x7f, 0);
    });
  }

  // End of track.
  track.push(0x00, 0xff, 0x2f, 0x00);

  const header = [
    0x4d, 0x54, 0x68, 0x64, // "MThd"
    0x00, 0x00, 0x00, 0x06, // header length
    0x00, 0x00, // format 0
    0x00, 0x01, // one track
    (PPQ >> 8) & 0xff, PPQ & 0xff,
  ];
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b, // "MTrk"
    (track.length >> 24) & 0xff,
    (track.length >> 16) & 0xff,
    (track.length >> 8) & 0xff,
    track.length & 0xff,
  ];

  return new Uint8Array([...header, ...trackHeader, ...track]);
}

/** Trigger a browser download of the encoded MIDI file. */
export function downloadMidi(bytes: Uint8Array, filename = "polywave-progression.mid"): void {
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  const blob = new Blob([buffer], { type: "audio/midi" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
