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
  getKeyInfo,
  getRelative,
  practicalKeys,
  signatureCount,
  type KeyInfo,
  type KeySignature,
  type Mode,
} from "./theory";
import {
  ensureAudio,
  playNote,
  playChord,
  playScale,
  playSequence,
  startMetronome,
  setTransportTempo,
  type MetronomeHandle,
  type PlaybackHandle,
} from "./audio";

export type Theme = "light" | "dark";
export type QuizType = "sigToKey" | "keyToCount";
export type OverlayMode = "none" | "degrees" | "roman";

export interface ProgressionStep {
  id: string;
  kind: "note" | "chord";
  label: string;
  pitchClasses: number[];
  circleIndex: number;
}

interface QuizSession {
  active: boolean;
  type: QuizType;
  prompt: string;
  options: string[];
  correct: string;
  selected: string | null;
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
  showChordWheel: boolean;
  chordSevenths: boolean;
  showNeighbors: boolean;

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

  // Appearance
  theme: Theme;

  // Quiz
  quiz: QuizSession;
  bestStreak: number;

  // Actions
  setKey: (tonic: string, mode: Mode) => void;
  switchRelative: () => void;
  setOverlay: (overlay: OverlayMode) => void;
  toggleChordWheel: () => void;
  setChordSevenths: (sevenths: boolean) => void;
  toggleNeighbors: () => void;
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
  startQuiz: (type?: QuizType) => void;
  answerQuiz: (choice: string) => void;
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

function signatureShortLabel(sig: KeySignature): string {
  const count = signatureCount(sig);
  if (count === 0) return "None";
  const type = "sharps" in sig ? "sharp" : "flat";
  return `${count} ${type}${count > 1 ? "s" : ""}`;
}

const ALL_SIGNATURE_LABELS = [
  "None",
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => `${n} sharp${n > 1 ? "s" : ""}`),
  ...[1, 2, 3, 4, 5, 6, 7].map((n) => `${n} flat${n > 1 ? "s" : ""}`),
];

interface PoolKey {
  label: string;
  tonic: string;
  mode: Mode;
  sig: KeySignature;
}

function buildPool(mode: Mode): PoolKey[] {
  return practicalKeys(mode).map((k) => {
    const info = getKeyInfo(k.tonic, k.mode);
    return { label: k.label, tonic: k.tonic, mode: k.mode, sig: info.signature };
  });
}

function makeQuestion(type: QuizType): Omit<QuizSession, "score" | "total" | "streak" | "active"> {
  const majors = buildPool("ionian");

  if (type === "sigToKey") {
    const correct = sample(majors);
    const distractors = shuffle(
      majors.filter(
        (k) =>
          k.label !== correct.label &&
          signatureShortLabel(k.sig) !== signatureShortLabel(correct.sig),
      ),
    ).slice(0, 3);
    const options = shuffle([correct, ...distractors]).map((k) => k.label);
    return {
      type,
      prompt: `Which major key has ${signatureShortLabel(correct.sig)}?`,
      options,
      correct: correct.label,
      selected: null,
    };
  }

  // keyToCount — use majors and minors for variety.
  const pool = [...majors, ...buildPool("aeolian")];
  const correct = sample(pool);
  const correctLabel = signatureShortLabel(correct.sig);
  const distractors = shuffle(
    ALL_SIGNATURE_LABELS.filter((l) => l !== correctLabel),
  ).slice(0, 3);
  const options = shuffle([correctLabel, ...distractors]);
  return {
    type,
    prompt: `How many sharps or flats does ${correct.label} have?`,
    options,
    correct: correctLabel,
    selected: null,
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
      showChordWheel: false,
      chordSevenths: false,
      showNeighbors: false,

      tempo: 100,
      isPlaying: false,
      currentStepIndex: null,

      progression: [],
      progressionMode: false,
      progressionPlayingIndex: null,

      metronomeOn: false,
      metronomeBeat: null,

      theme: getInitialTheme(),

      quiz: {
        active: false,
        type: "sigToKey",
        prompt: "",
        options: [],
        correct: "",
        selected: null,
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

      toggleChordWheel: () =>
        set((s) => ({ showChordWheel: !s.showChordWheel })),

      setChordSevenths: (sevenths) => set({ chordSevenths: sevenths }),

      toggleNeighbors: () => set((s) => ({ showNeighbors: !s.showNeighbors })),

      setTempo: (tempo) => {
        setTransportTempo(tempo);
        set({ tempo });
      },

      playSingleNote: async (pitchClass) => {
        await ensureAudio();
        playNote(pitchClass);
      },

      playChordNotes: async (pitchClasses) => {
        await ensureAudio();
        playChord(pitchClasses);
      },

      playCurrentScale: async (direction = "up") => {
        await ensureAudio();
        get().stopPlayback();
        const { keyInfo, tempo } = get();
        set({ isPlaying: true, currentStepIndex: null });
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

      answerQuiz: (choice) => {
        const { quiz, bestStreak } = get();
        if (quiz.selected !== null) return; // already answered
        const correct = choice === quiz.correct;
        const streak = correct ? quiz.streak + 1 : 0;
        set({
          quiz: {
            ...quiz,
            selected: choice,
            score: quiz.score + (correct ? 1 : 0),
            total: quiz.total + 1,
            streak,
          },
          bestStreak: Math.max(bestStreak, streak),
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
        showChordWheel: s.showChordWheel,
        chordSevenths: s.chordSevenths,
        showNeighbors: s.showNeighbors,
        tempo: s.tempo,
        theme: s.theme,
        bestStreak: s.bestStreak,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyTheme(state.theme);
        state.recomputeKeyInfo();
      },
    },
  ),
);
