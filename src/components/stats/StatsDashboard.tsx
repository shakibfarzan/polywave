import { Flame, Music, Target, Timer, Trash2, Trophy } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { formatPracticeTime, quizAccuracy } from "@/lib/stats";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StatsDashboard() {
  const { stats, bestStreak, resetStats } = usePolywaveStore(
    useShallow((s) => ({
      stats: s.stats,
      bestStreak: s.bestStreak,
      resetStats: s.resetStats,
    })),
  );

  const accuracy = quizAccuracy(stats);

  const cards = [
    {
      icon: Target,
      title: "Quiz accuracy",
      value: accuracy === null ? "—" : `${accuracy}%`,
      detail:
        stats.quizAnswered === 0
          ? "No questions answered yet"
          : `${stats.quizCorrect} of ${stats.quizAnswered} correct`,
    },
    {
      icon: Trophy,
      title: "Best quiz streak",
      value: String(bestStreak),
      detail: "Right answers in a row",
    },
    {
      icon: Flame,
      title: "Day streak",
      value: String(stats.dayStreak),
      detail:
        stats.lastPracticeDay === null
          ? "Practice to start a streak"
          : `Last practice: ${stats.lastPracticeDay}`,
    },
    {
      icon: Timer,
      title: "Practice time",
      value: formatPracticeTime(stats.practiceSeconds),
      detail: "Tracked by the practice timer",
    },
    {
      icon: Music,
      title: "Sounds played",
      value: String(stats.notesPlayed + stats.chordsPlayed + stats.scalesPlayed),
      detail: `${stats.notesPlayed} notes · ${stats.chordsPlayed} chords · ${stats.scalesPlayed} scales`,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.title} className="gap-2">
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <c.icon className="size-3.5" />
                {c.title}
              </CardDescription>
              <CardTitle className="text-3xl tabular-nums">{c.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {c.detail}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={resetStats}>
          <Trash2 />
          Reset stats
        </Button>
      </div>
    </div>
  );
}
