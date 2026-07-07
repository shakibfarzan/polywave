import { Flame, Music, Target, Timer, Trash2, Trophy } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { formatPracticeTime, quizAccuracy } from "@/lib/stats";
import { useT } from "@/hooks/useT";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function StatsDashboard() {
  const { t, n, digits } = useT();
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
      title: t("stats.accuracy"),
      value: accuracy === null ? "—" : digits(`${accuracy}%`),
      detail:
        stats.quizAnswered === 0
          ? t("stats.accuracyEmpty")
          : t("stats.accuracyDetail", {
              correct: n(stats.quizCorrect),
              total: n(stats.quizAnswered),
            }),
    },
    {
      icon: Trophy,
      title: t("stats.bestQuiz"),
      value: n(bestStreak),
      detail: t("stats.bestQuizDetail"),
    },
    {
      icon: Flame,
      title: t("stats.dayStreak"),
      value: n(stats.dayStreak),
      detail:
        stats.lastPracticeDay === null
          ? t("stats.dayStreakEmpty")
          : t("stats.lastPractice", { date: digits(stats.lastPracticeDay) }),
    },
    {
      icon: Timer,
      title: t("stats.practiceTime"),
      value: digits(formatPracticeTime(stats.practiceSeconds)),
      detail: t("stats.practiceDetail"),
    },
    {
      icon: Music,
      title: t("stats.sounds"),
      value: n(stats.notesPlayed + stats.chordsPlayed + stats.scalesPlayed),
      detail: t("stats.soundsDetail", {
        notes: n(stats.notesPlayed),
        chords: n(stats.chordsPlayed),
        scales: n(stats.scalesPlayed),
      }),
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
              <CardTitle className="font-display text-3xl tabular-nums">
                {c.value}
              </CardTitle>
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
          {t("stats.reset")}
        </Button>
      </div>
    </div>
  );
}
