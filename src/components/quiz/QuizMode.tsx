import { Check, Trophy, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore, type QuizOption, type QuizPrompt } from "@/lib/store";
import { useT, type I18nApi } from "@/hooks/useT";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

function optionLabel(option: QuizOption, i18n: I18nApi): string {
  if (option.kind === "key") {
    return `${option.tonic} ${i18n.t(`mode.${option.mode}`)}`;
  }
  return i18n.sigShort(option.count, option.acc);
}

function promptText(prompt: QuizPrompt, i18n: I18nApi): string {
  if (prompt.kind === "sig") {
    return i18n.t("quiz.promptSig", {
      sig: i18n.sigShort(prompt.count, prompt.acc),
    });
  }
  return i18n.t("quiz.promptCount", {
    key: `${prompt.tonic} ${i18n.t(`mode.${prompt.mode}`)}`,
  });
}

export function QuizMode() {
  const i18n = useT();
  const { t, n } = i18n;
  const { quiz, bestStreak, startQuiz, answerQuiz, nextQuestion, endQuiz } =
    usePolywaveStore(
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
          <h2 className="font-display text-2xl font-bold">{t("quiz.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("quiz.subtitle")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button onClick={() => startQuiz("sigToKey")}>
            {t("quiz.sigToKey")}
          </Button>
          <Button variant="secondary" onClick={() => startQuiz("keyToCount")}>
            {t("quiz.keyToCount")}
          </Button>
        </div>
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Trophy className="size-4" />
          {t("quiz.bestStreak", { count: n(bestStreak) })}
        </p>
      </div>
    );
  }

  const answered = quiz.selectedIndex !== null;
  const accuracy = quiz.total ? Math.round((quiz.score / quiz.total) * 100) : 0;

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="flex items-center justify-between text-sm">
        <span>
          {t("quiz.score")} <b>{n(quiz.score)}</b>/{n(quiz.total)}
        </span>
        <span>
          {t("quiz.streak")} <b>{n(quiz.streak)}</b>
        </span>
        <span className="text-muted-foreground">
          {t("quiz.best", { count: n(bestStreak) })}
        </span>
      </div>
      <Progress value={accuracy} aria-label={t("quiz.accuracyAria")} />

      <div className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
        <p className="mb-4 text-center text-lg font-medium">
          {promptText(quiz.prompt, i18n)}
        </p>
        <RadioGroup
          value={quiz.selectedIndex != null ? String(quiz.selectedIndex) : ""}
          onValueChange={(v) => !answered && answerQuiz(Number(v))}
          className="gap-2"
        >
          {quiz.options.map((opt, i) => {
            const isCorrect = i === quiz.correctIndex;
            const isChosen = i === quiz.selectedIndex;
            return (
              <label
                key={i}
                className={cn(
                  "flex items-center gap-3 rounded-md border p-3 text-sm transition-colors",
                  !answered && "cursor-pointer hover:bg-accent",
                  answered && isCorrect && "border-green-500 bg-green-500/10",
                  answered &&
                    isChosen &&
                    !isCorrect &&
                    "border-destructive bg-destructive/10",
                )}
              >
                <RadioGroupItem value={String(i)} disabled={answered} />
                <span className="flex-1">{optionLabel(opt, i18n)}</span>
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
          {t("quiz.end")}
        </Button>
        <Button onClick={nextQuestion} disabled={!answered}>
          {t("quiz.next")}
        </Button>
      </div>
    </div>
  );
}
