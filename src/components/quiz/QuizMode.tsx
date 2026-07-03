import { Check, Trophy, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export function QuizMode() {
  const {
    quiz,
    bestStreak,
    startQuiz,
    answerQuiz,
    nextQuestion,
    endQuiz,
  } = usePolywaveStore(
    useShallow((s) => ({
      quiz: s.quiz,
      bestStreak: s.bestStreak,
      startQuiz: s.startQuiz,
      answerQuiz: s.answerQuiz,
      nextQuestion: s.nextQuestion,
      endQuiz: s.endQuiz,
    })),
  );

  if (!quiz.active) {
    return (
      <div className="mx-auto max-w-md space-y-5 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Key-signature quiz</h2>
          <p className="text-sm text-muted-foreground">
            Drill key signatures both ways — pick a direction to begin.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => startQuiz("sigToKey")}>
            Signature → Key
          </Button>
          <Button variant="secondary" onClick={() => startQuiz("keyToCount")}>
            Key → Accidental count
          </Button>
        </div>
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Trophy className="size-4" />
          Best streak: {bestStreak}
        </p>
      </div>
    );
  }

  const answered = quiz.selected !== null;
  const accuracy = quiz.total ? Math.round((quiz.score / quiz.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="flex items-center justify-between text-sm">
        <span>
          Score: <b>{quiz.score}</b>/{quiz.total}
        </span>
        <span>
          Streak: <b>{quiz.streak}</b>
        </span>
        <span className="text-muted-foreground">Best: {bestStreak}</span>
      </div>
      <Progress value={accuracy} aria-label="Accuracy" />

      <div className="rounded-lg border bg-card p-5 text-card-foreground shadow-sm">
        <p className="mb-4 text-center text-lg font-medium">{quiz.prompt}</p>
        <RadioGroup
          value={quiz.selected ?? ""}
          onValueChange={(v) => !answered && answerQuiz(v)}
          className="gap-2"
        >
          {quiz.options.map((opt) => {
            const isCorrect = opt === quiz.correct;
            const isChosen = opt === quiz.selected;
            return (
              <label
                key={opt}
                className={cn(
                  "flex items-center gap-3 rounded-md border p-3 text-sm transition-colors",
                  !answered && "cursor-pointer hover:bg-accent",
                  answered &&
                    isCorrect &&
                    "border-green-500 bg-green-500/10",
                  answered &&
                    isChosen &&
                    !isCorrect &&
                    "border-destructive bg-destructive/10",
                )}
              >
                <RadioGroupItem value={opt} disabled={answered} />
                <span className="flex-1">{opt}</span>
                {answered && isCorrect && (
                  <Check className="size-4 text-green-600" />
                )}
                {answered && isChosen && !isCorrect && (
                  <X className="size-4 text-destructive" />
                )}
              </label>
            );
          })}
        </RadioGroup>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={endQuiz}>
          End quiz
        </Button>
        <Button onClick={nextQuestion} disabled={!answered}>
          Next question
        </Button>
      </div>
    </div>
  );
}
