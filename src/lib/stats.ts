/**
 * stats.ts — pure practice-stats logic (Phase 5).
 *
 * The store persists a PracticeStats object; these helpers keep the update
 * rules (including the day-streak calendar math) pure and testable.
 */

export interface PracticeStats {
  notesPlayed: number;
  chordsPlayed: number;
  scalesPlayed: number;
  quizAnswered: number;
  quizCorrect: number;
  practiceSeconds: number;
  /** Local calendar day (YYYY-MM-DD) of the last recorded activity. */
  lastPracticeDay: string | null;
  /** Consecutive days with at least one activity. */
  dayStreak: number;
}

export type ActivityKind = "note" | "chord" | "scale";

export function emptyStats(): PracticeStats {
  return {
    notesPlayed: 0,
    chordsPlayed: 0,
    scalesPlayed: 0,
    quizAnswered: 0,
    quizCorrect: 0,
    practiceSeconds: 0,
    lastPracticeDay: null,
    dayStreak: 0,
  };
}

/** Local calendar day as YYYY-MM-DD. */
export function localDay(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function previousDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return localDay(date);
}

/** Advance the day streak for an activity happening on `today`. */
export function bumpDayStreak(stats: PracticeStats, today: string): PracticeStats {
  if (stats.lastPracticeDay === today) return stats;
  const dayStreak =
    stats.lastPracticeDay === previousDay(today) ? stats.dayStreak + 1 : 1;
  return { ...stats, lastPracticeDay: today, dayStreak };
}

/** Record a played note / chord / scale. */
export function recordActivity(
  stats: PracticeStats,
  kind: ActivityKind,
  today: string = localDay(),
): PracticeStats {
  const next = bumpDayStreak(stats, today);
  switch (kind) {
    case "note":
      return { ...next, notesPlayed: next.notesPlayed + 1 };
    case "chord":
      return { ...next, chordsPlayed: next.chordsPlayed + 1 };
    case "scale":
      return { ...next, scalesPlayed: next.scalesPlayed + 1 };
  }
}

/** Record a quiz answer. */
export function recordQuizAnswer(
  stats: PracticeStats,
  correct: boolean,
  today: string = localDay(),
): PracticeStats {
  const next = bumpDayStreak(stats, today);
  return {
    ...next,
    quizAnswered: next.quizAnswered + 1,
    quizCorrect: next.quizCorrect + (correct ? 1 : 0),
  };
}

/** Add practice-timer seconds. */
export function recordPracticeTime(
  stats: PracticeStats,
  seconds: number,
  today: string = localDay(),
): PracticeStats {
  if (seconds <= 0) return stats;
  const next = bumpDayStreak(stats, today);
  return { ...next, practiceSeconds: next.practiceSeconds + seconds };
}

/** Quiz accuracy 0–100, or null before any answers. */
export function quizAccuracy(stats: PracticeStats): number | null {
  if (stats.quizAnswered === 0) return null;
  return Math.round((stats.quizCorrect / stats.quizAnswered) * 100);
}

/** "2h 05m" / "12m 30s" style label for accumulated practice time. */
export function formatPracticeTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}
