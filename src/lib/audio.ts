/**
 * audio.ts — a thin Tone.js wrapper.
 *
 * The synth is created lazily on the first user gesture (browsers block audio
 * until then). Everything is addressed by pitch class (0–11) + octave, so the
 * theory layer never has to produce Tone-compatible note strings.
 */
// Type-only import is erased at build time, so Tone.js itself is loaded lazily
// via dynamic import() below — keeping it out of the initial bundle.
import type * as ToneNS from "tone";

type Duration = ToneNS.Unit.Time;

let Tone: typeof ToneNS | null = null;
let synth: ToneNS.PolySynth | null = null;

/** Selectable synth voices (Phase 5 settings). */
export type InstrumentId = "classic" | "soft" | "bright" | "retro" | "epiano";

export const INSTRUMENT_LABELS: Record<InstrumentId, string> = {
  classic: "Classic (triangle)",
  soft: "Soft (sine)",
  bright: "Bright (sawtooth)",
  retro: "Retro (square)",
  epiano: "E-piano (FM)",
};

let currentInstrument: InstrumentId = "classic";

const ENVELOPE = { attack: 0.01, decay: 0.2, sustain: 0.25, release: 0.8 };

function createSynth(tone: typeof ToneNS, instrument: InstrumentId): ToneNS.PolySynth {
  let s: ToneNS.PolySynth;
  if (instrument === "epiano") {
    s = new tone.PolySynth(tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 8,
      envelope: { ...ENVELOPE, release: 1.1 },
      modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.6 },
    });
  } else {
    const oscType = (
      { classic: "triangle", soft: "sine", bright: "sawtooth", retro: "square" } as const
    )[instrument];
    s = new tone.PolySynth(tone.Synth, {
      oscillator: { type: oscType },
      envelope: ENVELOPE,
    });
  }
  s.toDestination();
  // Sawtooth/square are much louder than sine/triangle; balance them.
  s.volume.value = instrument === "bright" || instrument === "retro" ? -14 : -8;
  return s;
}

/** Switch the synth voice. Takes effect immediately if audio is running. */
export function setInstrument(instrument: InstrumentId): void {
  if (instrument === currentInstrument) return;
  currentInstrument = instrument;
  if (Tone && synth) {
    synth.dispose();
    synth = createSynth(Tone, instrument);
  }
}

/**
 * Lazily load Tone.js, resume the audio context, and create the synth.
 * Must be called from (or awaited after) a user gesture.
 */
export async function ensureAudio(): Promise<void> {
  if (!Tone) {
    Tone = await import("tone");
  }
  await Tone.start();
  if (!synth) {
    synth = createSynth(Tone, currentInstrument);
  }
}

function getSynth(): ToneNS.PolySynth | null {
  return synth;
}

/** Equal-tempered frequency for a pitch class at a given octave. */
export function pitchToFrequency(pitchClass: number, octave: number): number {
  const midi = (octave + 1) * 12 + pitchClass;
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Play a single pitch. */
export function playNote(
  pitchClass: number,
  octave = 4,
  duration: Duration = "8n",
): void {
  getSynth()?.triggerAttackRelease(
    pitchToFrequency(pitchClass, octave),
    duration,
  );
}

/** Frequencies for a chord, kept rising so close pitch classes don't collide. */
function chordFrequencies(pitchClasses: number[], baseOctave: number): number[] {
  let octave = baseOctave;
  let prev = -Infinity;
  return pitchClasses.map((pc) => {
    if (pc < prev) octave += 1;
    prev = pc;
    return pitchToFrequency(pc, octave);
  });
}

/** Play several pitches together (used by the chord wheel). */
export function playChord(
  pitchClasses: number[],
  octave = 4,
  duration: Duration = "2n",
): void {
  getSynth()?.triggerAttackRelease(chordFrequencies(pitchClasses, octave), duration);
}

export type ScaleDirection = "up" | "down";

export interface ScaleNoteLike {
  pitchClass: number;
}

export interface PlayScaleOptions {
  tempo: number; // BPM, one scale step per beat
  direction?: ScaleDirection;
  baseOctave?: number;
  /** Called with the scale-degree index (0–6) as each note sounds. */
  onStep?: (scaleIndex: number) => void;
  onDone?: () => void;
}

export interface PlaybackHandle {
  stop: () => void;
}

interface Step {
  pitchClass: number;
  octave: number;
  scaleIndex: number;
}

function buildAscending(scale: ScaleNoteLike[], baseOctave: number): Step[] {
  const steps: Step[] = [];
  let octave = baseOctave;
  let prev = -Infinity;
  scale.forEach((n, i) => {
    if (n.pitchClass < prev) octave += 1;
    steps.push({ pitchClass: n.pitchClass, octave, scaleIndex: i });
    prev = n.pitchClass;
  });
  // Complete the octave with the tonic on top.
  const tonic = scale[0];
  if (tonic.pitchClass <= prev) octave += 1;
  steps.push({ pitchClass: tonic.pitchClass, octave, scaleIndex: 0 });
  return steps;
}

/**
 * Play a scale one note per beat, firing onStep so the UI can highlight the
 * current note. Returns a handle whose stop() halts playback immediately.
 */
export function playScale(
  scale: ScaleNoteLike[],
  options: PlayScaleOptions,
): PlaybackHandle {
  const { tempo, direction = "up", baseOctave = 4, onStep, onDone } = options;

  let steps = buildAscending(scale, baseOctave);
  if (direction === "down") steps = [...steps].reverse();

  const stepMs = (60 / tempo) * 1000;
  const noteDur = (60 / tempo) * 0.9;
  const s = getSynth();

  let idx = 0;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const tick = () => {
    if (stopped) return;
    const step = steps[idx];
    onStep?.(step.scaleIndex);
    s?.triggerAttackRelease(
      pitchToFrequency(step.pitchClass, step.octave),
      noteDur,
    );
    idx += 1;
    if (idx < steps.length) {
      timer = setTimeout(tick, stepMs);
    } else {
      timer = setTimeout(() => {
        if (!stopped) onDone?.();
      }, stepMs);
    }
  };

  tick();

  return {
    stop: () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      try {
        s?.releaseAll();
      } catch {
        // releaseAll may be unavailable on some Tone versions; ignore.
      }
    },
  };
}

// --- Generic sequence playback (progression builder) ------------------------

export interface SequenceStep {
  pitchClasses: number[];
  octave?: number;
}

export interface PlaySequenceOptions {
  tempo: number;
  /** Beats each step lasts (default 2 = half notes, a natural progression feel). */
  beatsPerStep?: number;
  onStep?: (index: number) => void;
  onDone?: () => void;
}

/** Play an arbitrary sequence of notes/chords, firing onStep per step. */
export function playSequence(
  steps: SequenceStep[],
  options: PlaySequenceOptions,
): PlaybackHandle {
  const { tempo, beatsPerStep = 2, onStep, onDone } = options;
  const stepMs = (60 / tempo) * 1000 * beatsPerStep;
  const noteDur = (60 / tempo) * beatsPerStep * 0.95;
  const s = getSynth();

  let idx = 0;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const tick = () => {
    if (stopped) return;
    const step = steps[idx];
    onStep?.(idx);
    s?.triggerAttackRelease(
      chordFrequencies(step.pitchClasses, step.octave ?? 4),
      noteDur,
    );
    idx += 1;
    if (idx < steps.length) {
      timer = setTimeout(tick, stepMs);
    } else {
      timer = setTimeout(() => {
        if (!stopped) onDone?.();
      }, stepMs);
    }
  };

  tick();

  return {
    stop: () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      try {
        s?.releaseAll();
      } catch {
        // ignore
      }
    },
  };
}

// --- Metronome (Tone.Transport) --------------------------------------------

let clickSynth: ToneNS.MembraneSynth | null = null;
let metronomeLoop: ToneNS.Loop | null = null;

export interface MetronomeHandle {
  stop: () => void;
}

/** Start an accented metronome locked to Tone's transport clock. */
export async function startMetronome(
  bpm: number,
  beatsPerBar = 4,
  onBeat?: (beat: number) => void,
): Promise<MetronomeHandle> {
  await ensureAudio();
  const tone = Tone;
  if (!tone) return { stop: () => {} };

  if (!clickSynth) {
    clickSynth = new tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
    }).toDestination();
  }

  tone.getTransport().bpm.value = bpm;
  let beat = 0;
  metronomeLoop?.dispose();
  metronomeLoop = new tone.Loop((time) => {
    const positionInBar = beat % beatsPerBar;
    const accent = positionInBar === 0;
    clickSynth?.triggerAttackRelease(accent ? "C3" : "C2", "16n", time);
    if (onBeat) tone.getDraw().schedule(() => onBeat(positionInBar), time);
    beat += 1;
  }, "4n").start(0);
  tone.getTransport().start();

  return {
    stop: () => {
      metronomeLoop?.stop();
      metronomeLoop?.dispose();
      metronomeLoop = null;
      tone.getTransport().stop();
    },
  };
}

/** Update the metronome tempo live, if running. */
export function setTransportTempo(bpm: number): void {
  if (Tone) Tone.getTransport().bpm.value = bpm;
}
