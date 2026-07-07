/**
 * store.ts — the single Zustand store backing every view.
 *
 * Persists the user's key, overlay/tempo preferences, theme and best quiz
 * streak to localStorage. Derived data (keyInfo) and transient playback state
 * are kept in memory and recomputed on rehydrate.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  detectChord,
  getChordMatches,
  getKeyInfo,
  getRelative,
  practicalKeys,
  signatureCount,
  type ChordKeyMatch,
  type DetectedChord,
  type KeyInfo,
  type KeySignature,
  type Mode,
  type NotationPref,
} from "./theory";
import {
  emptyStats,
  recordActivity,
  recordPracticeTime,
  recordQuizAnswer,
  type PracticeStats,
} from "./stats";
import type { Locale } from "./i18n";
import {
  connectMidi as midiConnect,
  disconnectMidi as midiDisconnect,
  isMidiSupported,
} from "./midi";
import { encodeProgressionToMidi, downloadMidi } from "./midiFile";
import {
  ensureAudio,
  playNote,
  playChord,
  playScale,
  playSequence,
  setInstrument as audioSetInstrument,
  startMetronome,
  setTransportTempo,
  type InstrumentId,
  type MetronomeHandle,
  type PlaybackHandle,
} from "./audio";

export type Theme = "light" | "dark";
export type QuizType = "sigToKey" | "keyToCount";
export type OverlayMode = "none" | "degrees" | "roman";
/** What the inner chord ring displays. */
export type RingMode = "off" | "diatonic" | "secondary" | "borrowed";
export type MidiStatus =
  | "unsupported"
  | "idle"
  | "connecting"
  | "connected"
  | "error";

export interface ProgressionStep {
  id: string;
  kind: "note" | "chord";
  label: string;
  pitchClasses: number[];
  circleIndex: number;
}

/** Structured (language-neutral) quiz data — components render the labels. */
export type QuizOption =
  | { kind: "key"; tonic: string; mode: Mode }
  | { kind: "count"; count: number; acc: "sharps" | "flats" | "none" };

export type QuizPrompt =
  | { kind: "sig"; count: number; acc: "sharps" | "flats" | "none" }
  | { kind: "key"; tonic: string; mode: Mode };

interface QuizSession {
  active: boolean;
  type: QuizType;
  prompt: QuizPrompt;
  options: QuizOption[];
  correctIndex: number;
  selectedIndex: number | null;
  score: number;
  total: number;
  streak: number;
}

interface PolywaveState {
  // Active key
  tonic: string;
  mode: Mode;
  keyInfo: KeyInfo;

  // Overlays
  overlay: OverlayMode;
  ringMode: RingMode;
  chordSevenths: boolean;
  showNeighbors: boolean;

  // MIDI input (Phase 4)
  midiStatus: MidiStatus;
  midiDevices: string[];
  midiNotes: number[];
  detectedChord: DetectedChord | null;
  chordMatches: ChordKeyMatch[];

  // Playback
  tempo: number;
  isPlaying: boolean;
  currentStepIndex: number | null;

  // Progression builder
  progression: ProgressionStep[];
  progressionMode: boolean;
  progressionPlayingIndex: number | null;

  // Metronome
  metronomeOn: boolean;
  metronomeBeat: number | null;

  // Appearance & sound settings (Phase 5)
  theme: Theme;
  notation: NotationPref;
  instrument: InstrumentId;
  locale: Locale;

  // Quiz
  quiz: QuizSession;
  bestStreak: number;

  // Practice stats (Phase 5)
  stats: PracticeStats;

  // Actions
  setKey: (tonic: string, mode: Mode) => void;
  switchRelative: () => void;
  setOverlay: (overlay: OverlayMode) => void;
  setRingMode: (mode: RingMode) => void;
  setChordSevenths: (sevenths: boolean) => void;
  toggleNeighbors: () => void;
  connectMidiInput: () => Promise<void>;
  disconnectMidiInput: () => void;
  setMidiNotes: (notes: number[]) => void;
  exportProgressionMidi: () => void;
  setTempo: (tempo: number) => void;
  playSingleNote: (pitchClass: number) => Promise<void>;
  playChordNotes: (pitchClasses: number[]) => Promise<void>;
  playCurrentScale: (direction?: "up" | "down") => Promise<void>;
  stopPlayback: () => void;
  toggleProgressionMode: () => void;
  addProgressionStep: (step: Omit<ProgressionStep, "id">) => void;
  removeProgressionStep: (id: string) => void;
  clearProgression: () => void;
  playProgression: () => Promise<void>;
  stopProgression: () => void;
  toggleMetronome: () => Promise<void>;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setNotation: (notation: NotationPref) => void;
  setInstrument: (instrument: InstrumentId) => void;
  setLocale: (locale: Locale) => void;
  addPracticeTime: (seconds: number) => void;
  resetStats: () => void;
  startQuiz: (type?: QuizType) => void;
  answerQuiz: (index: number) => void;
  nextQuestion: () => void;
  endQuiz: () => void;
  recomputeKeyInfo: () => void;
}

// Module-scoped handles — kept out of the store so they never serialize.
let currentPlayer: PlaybackHandle | null = null;
let progressionPlayer: PlaybackHandle | null = null;
let metronome: MetronomeHandle | null = null;

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyLocale(locale: Locale): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
}

function getInitialLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  return navigator.language?.toLowerCase().startsWith("fa") ? "fa" : "en";
}

// --- Quiz helpers -----------------------------------------------------------

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface PoolKey {
  tonic: string;
  mode: Mode;
  sig: KeySignature;
}

function buildPool(mode: Mode): PoolKey[] {
  return practicalKeys(mode).map((k) => {
    const info = getKeyInfo(k.tonic, k.mode);
    return { tonic: k.tonic, mode: k.mode, sig: info.signature };
  });
}

function sigDescriptor(sig: KeySignature): {
  count: number;
  acc: "sharps" | "flats" | "none";
} {
  const count = signatureCount(sig);
  if (count === 0) return { count: 0, acc: "none" };
  return { count, acc: "sharps" in sig ? "sharps" : "flats" };
}

function sameSig(a: KeySignature, b: KeySignature): boolean {
  const da = sigDescriptor(a);
  const db = sigDescriptor(b);
  return da.count === db.count && da.acc === db.acc;
}

const ALL_COUNT_OPTIONS: QuizOption[] = [
  { kind: "count", count: 0, acc: "none" },
  ...[1, 2, 3, 4, 5, 6, 7].map(
    (n): QuizOption => ({ kind: "count", count: n, acc: "sharps" }),
  ),
  ...[1, 2, 3, 4, 5, 6, 7].map(
    (n): QuizOption => ({ kind: "count", count: n, acc: "flats" }),
  ),
];

function makeQuestion(
  type: QuizType,
): Pick<QuizSession, "type" | "prompt" | "options" | "correctIndex" | "selectedIndex"> {
  const majors = buildPool("ionian");

  if (type === "sigToKey") {
    const correct = sample(majors);
    const distractors = shuffle(
      majors.filter((k) => k.tonic !== correct.tonic && !sameSig(k.sig, correct.sig)),
    ).slice(0, 3);
    const options: QuizOption[] = shuffle([correct, ...distractors]).map((k) => ({
      kind: "key",
      tonic: k.tonic,
      mode: k.mode,
    }));
    const { count, acc } = sigDescriptor(correct.sig);
    return {
      type,
      prompt: { kind: "sig", count, acc },
      options,
      correctIndex: options.findIndex(
        (o) => o.kind === "key" && o.tonic === correct.tonic,
      ),
      selectedIndex: null,
    };
  }

  // keyToCount — use majors and minors for variety.
  const pool = [...majors, ...buildPool("aeolian")];
  const correct = sample(pool);
  const correctDesc = sigDescriptor(correct.sig);
  const distractors = shuffle(
    ALL_COUNT_OPTIONS.filter(
      (o) =>
        o.kind === "count" &&
        !(o.count === correctDesc.count && o.acc === correctDesc.acc),
    ),
  ).slice(0, 3);
  const options = shuffle<QuizOption>([
    { kind: "count", ...correctDesc },
    ...distractors,
  ]);
  return {
    type,
    prompt: { kind: "key", tonic: correct.tonic, mode: correct.mode },
    options,
    correctIndex: options.findIndex(
      (o) =>
        o.kind === "count" &&
        o.count === correctDesc.count &&
        o.acc === correctDesc.acc,
    ),
    selectedIndex: null,
  };
}

// --- Store ------------------------------------------------------------------

const DEFAULT_TONIC = "C";
const DEFAULT_MODE: Mode = "ionian";

export const usePolywaveStore = create<PolywaveState>()(
  persist(
    (set, get) => ({
      tonic: DEFAULT_TONIC,
      mode: DEFAULT_MODE,
      keyInfo: getKeyInfo(DEFAULT_TONIC, DEFAULT_MODE),

      overlay: "none",
      ringMode: "off",
      chordSevenths: false,
      showNeighbors: false,

      midiStatus: isMidiSupported() ? "idle" : "unsupported",
      midiDevices: [],
      midiNotes: [],
      detectedChord: null,
      chordMatches: [],

      tempo: 100,
      isPlaying: false,
      currentStepIndex: null,

      progression: [],
      progressionMode: false,
      progressionPlayingIndex: null,

      metronomeOn: false,
      metronomeBeat: null,

      theme: getInitialTheme(),
      notation: "auto",
      instrument: "classic",
      locale: getInitialLocale(),

      stats: emptyStats(),

      quiz: {
        active: false,
        type: "sigToKey",
        prompt: { kind: "sig", count: 0, acc: "none" },
        options: [],
        correctIndex: 0,
        selectedIndex: null,
        score: 0,
        total: 0,
        streak: 0,
      },
      bestStreak: 0,

      setKey: (tonic, mode) => {
        get().stopPlayback();
        get().stopProgression();
        set({ tonic, mode, keyInfo: getKeyInfo(tonic, mode) });
      },

      switchRelative: () => {
        const { keyInfo } = get();
        const rel = getRelative(keyInfo);
        get().setKey(rel.tonic, rel.mode);
      },

      setOverlay: (overlay) => set({ overlay }),

      setRingMode: (mode) => set({ ringMode: mode }),

      setChordSevenths: (sevenths) => set({ chordSevenths: sevenths }),

      toggleNeighbors: () => set((s) => ({ showNeighbors: !s.showNeighbors })),

      connectMidiInput: async () => {
        if (get().midiStatus === "unsupported") return;
        set({ midiStatus: "connecting" });
        try {
          const devices = await midiConnect({
            onNotesChange: (notes) => get().setMidiNotes(notes),
            onDevicesChange: (midiDevices) => set({ midiDevices }),
          });
          set({ midiStatus: "connected", midiDevices: devices });
        } catch {
          set({ midiStatus: "error" });
        }
      },

      disconnectMidiInput: () => {
        midiDisconnect();
        set({
          midiStatus: isMidiSupported() ? "idle" : "unsupported",
          midiDevices: [],
          midiNotes: [],
          detectedChord: null,
          chordMatches: [],
        });
      },

      setMidiNotes: (notes) => {
        const chord = detectChord(notes.map((n) => n % 12));
        set({
          midiNotes: notes,
          detectedChord: chord,
          chordMatches: chord ? getChordMatches(chord) : [],
        });
      },

      exportProgressionMidi: () => {
        const { progression, tempo } = get();
        if (progression.length === 0) return;
        const bytes = encodeProgressionToMidi(
          progression.map((p) => ({ pitchClasses: p.pitchClasses })),
          tempo,
        );
        downloadMidi(bytes);
      },

      setTempo: (tempo) => {
        setTransportTempo(tempo);
        set({ tempo });
      },

      playSingleNote: async (pitchClass) => {
        await ensureAudio();
        playNote(pitchClass);
        set((s) => ({ stats: recordActivity(s.stats, "note") }));
      },

      playChordNotes: async (pitchClasses) => {
        await ensureAudio();
        playChord(pitchClasses);
        set((s) => ({ stats: recordActivity(s.stats, "chord") }));
      },

      playCurrentScale: async (direction = "up") => {
        await ensureAudio();
        get().stopPlayback();
        const { keyInfo, tempo } = get();
        set((s) => ({
          isPlaying: true,
          currentStepIndex: null,
          stats: recordActivity(s.stats, "scale"),
        }));
        currentPlayer = playScale(keyInfo.scale, {
          tempo,
          direction,
          onStep: (scaleIndex) => set({ currentStepIndex: scaleIndex }),
          onDone: () => set({ isPlaying: false, currentStepIndex: null }),
        });
      },

      stopPlayback: () => {
        currentPlayer?.stop();
        currentPlayer = null;
        set({ isPlaying: false, currentStepIndex: null });
      },

      toggleProgressionMode: () =>
        set((s) => ({ progressionMode: !s.progressionMode })),

      addProgressionStep: (step) =>
        set((s) => ({
          progression: [...s.progression, { ...step, id: makeId() }],
        })),

      removeProgressionStep: (id) =>
        set((s) => ({
          progression: s.progression.filter((p) => p.id !== id),
        })),

      clearProgression: () => {
        get().stopProgression();
        set({ progression: [] });
      },

      playProgression: async () => {
        const { progression, tempo } = get();
        if (progression.length === 0) return;
        await ensureAudio();
        get().stopProgression();
        set({ progressionPlayingIndex: null });
        progressionPlayer = playSequence(
          progression.map((p) => ({ pitchClasses: p.pitchClasses })),
          {
            tempo,
            onStep: (index) => set({ progressionPlayingIndex: index }),
            onDone: () => set({ progressionPlayingIndex: null }),
          },
        );
      },

      stopProgression: () => {
        progressionPlayer?.stop();
        progressionPlayer = null;
        set({ progressionPlayingIndex: null });
      },

      toggleMetronome: async () => {
        if (get().metronomeOn) {
          metronome?.stop();
          metronome = null;
          set({ metronomeOn: false, metronomeBeat: null });
          return;
        }
        set({ metronomeOn: true });
        metronome = await startMetronome(get().tempo, 4, (beat) =>
          set({ metronomeBeat: beat }),
        );
      },

      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },

      toggleTheme: () => {
        const next: Theme = get().theme === "dark" ? "light" : "dark";
        get().setTheme(next);
      },

      setNotation: (notation) => set({ notation }),

      setLocale: (locale) => {
        applyLocale(locale);
        set({ locale });
      },

      setInstrument: (instrument) => {
        audioSetInstrument(instrument);
        set({ instrument });
      },

      addPracticeTime: (seconds) =>
        set((s) => ({ stats: recordPracticeTime(s.stats, seconds) })),

      resetStats: () => set({ stats: emptyStats(), bestStreak: 0 }),

      startQuiz: (type) => {
        const quizType = type ?? get().quiz.type;
        const q = makeQuestion(quizType);
        set({
          quiz: {
            ...q,
            active: true,
            score: 0,
            total: 0,
            streak: 0,
          },
        });
      },

      answerQuiz: (index) => {
        const { quiz, bestStreak, stats } = get();
        if (quiz.selectedIndex !== null) return; // already answered
        const correct = index === quiz.correctIndex;
        const streak = correct ? quiz.streak + 1 : 0;
        set({
          quiz: {
            ...quiz,
            selectedIndex: index,
            score: quiz.score + (correct ? 1 : 0),
            total: quiz.total + 1,
            streak,
          },
          bestStreak: Math.max(bestStreak, streak),
          stats: recordQuizAnswer(stats, correct),
        });
      },

      nextQuestion: () => {
        const { quiz } = get();
        const q = makeQuestion(quiz.type);
        set({ quiz: { ...quiz, ...q } });
      },

      endQuiz: () => set((s) => ({ quiz: { ...s.quiz, active: false } })),

      recomputeKeyInfo: () => {
        const { tonic, mode } = get();
        set({ keyInfo: getKeyInfo(tonic, mode) });
      },
    }),
    {
      name: "polywave-store",
      partialize: (s) => ({
        tonic: s.tonic,
        mode: s.mode,
        overlay: s.overlay,
        ringMode: s.ringMode,
        chordSevenths: s.chordSevenths,
        showNeighbors: s.showNeighbors,
        tempo: s.tempo,
        theme: s.theme,
        notation: s.notation,
        instrument: s.instrument,
        locale: s.locale,
        bestStreak: s.bestStreak,
        stats: s.stats,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyTheme(state.theme);
        applyLocale(state.locale);
        audioSetInstrument(state.instrument);
        state.recomputeKeyInfo();
      },
    },
  ),
);
