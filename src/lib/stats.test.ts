import { describe, it, expect } from "vitest";
import {
  emptyStats,
  recordActivity,
  recordQuizAnswer,
  recordPracticeTime,
  quizAccuracy,
  formatPracticeTime,
} from "./stats";

describe("activity counters", () => {
  it("counts notes, chords and scales independently", () => {
    let s = emptyStats();
    s = recordActivity(s, "note", "2026-07-04");
    s = recordActivity(s, "note", "2026-07-04");
    s = recordActivity(s, "chord", "2026-07-04");
    s = recordActivity(s, "scale", "2026-07-04");
    expect(s.notesPlayed).toBe(2);
    expect(s.chordsPlayed).toBe(1);
    expect(s.scalesPlayed).toBe(1);
  });

  it("tracks quiz accuracy", () => {
    let s = emptyStats();
    expect(quizAccuracy(s)).toBeNull();
    s = recordQuizAnswer(s, true, "2026-07-04");
    s = recordQuizAnswer(s, true, "2026-07-04");
    s = recordQuizAnswer(s, false, "2026-07-04");
    expect(s.quizAnswered).toBe(3);
    expect(s.quizCorrect).toBe(2);
    expect(quizAccuracy(s)).toBe(67);
  });

  it("accumulates practice time and ignores non-positive deltas", () => {
    let s = emptyStats();
    s = recordPracticeTime(s, 90, "2026-07-04");
    s = recordPracticeTime(s, 0, "2026-07-04");
    expect(s.practiceSeconds).toBe(90);
  });
});

describe("day streak", () => {
  it("starts at 1, holds within a day, grows on consecutive days", () => {
    let s = emptyStats();
    s = recordActivity(s, "note", "2026-07-04");
    expect(s.dayStreak).toBe(1);
    s = recordActivity(s, "note", "2026-07-04");
    expect(s.dayStreak).toBe(1);
    s = recordActivity(s, "note", "2026-07-05");
    expect(s.dayStreak).toBe(2);
    s = recordActivity(s, "note", "2026-07-06");
    expect(s.dayStreak).toBe(3);
  });

  it("resets after a missed day", () => {
    let s = emptyStats();
    s = recordActivity(s, "note", "2026-07-04");
    s = recordActivity(s, "note", "2026-07-06");
    expect(s.dayStreak).toBe(1);
  });

  it("handles month boundaries", () => {
    let s = emptyStats();
    s = recordActivity(s, "note", "2026-06-30");
    s = recordActivity(s, "note", "2026-07-01");
    expect(s.dayStreak).toBe(2);
  });
});

describe("time formatting", () => {
  it("formats seconds, minutes and hours", () => {
    expect(formatPracticeTime(45)).toBe("45s");
    expect(formatPracticeTime(150)).toBe("2m 30s");
    expect(formatPracticeTime(7500)).toBe("2h 05m");
  });
});
