import { Download, Play, Plus, Square, Trash2, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProgressionBuilder() {
  const { t } = useT();
  const {
    progression,
    progressionMode,
    progressionPlayingIndex,
    toggleProgressionMode,
    removeProgressionStep,
    clearProgression,
    playProgression,
    stopProgression,
    exportProgressionMidi,
  } = usePolywaveStore(
    useShallow((s) => ({
      progression: s.progression,
      progressionMode: s.progressionMode,
      progressionPlayingIndex: s.progressionPlayingIndex,
      toggleProgressionMode: s.toggleProgressionMode,
      removeProgressionStep: s.removeProgressionStep,
      clearProgression: s.clearProgression,
      playProgression: s.playProgression,
      stopProgression: s.stopProgression,
      exportProgressionMidi: s.exportProgressionMidi,
    })),
  );

  const isPlaying = progressionPlayingIndex !== null;
  const empty = progression.length === 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={progressionMode ? "default" : "outline"}
          size="sm"
          onClick={toggleProgressionMode}
          aria-pressed={progressionMode}
        >
          <Plus />
          {progressionMode ? t("prog.recording") : t("prog.add")}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => (isPlaying ? stopProgression() : void playProgression())}
          disabled={empty}
        >
          {isPlaying ? (
            <>
              <Square />
              {t("prog.stop")}
            </>
          ) : (
            <>
              <Play />
              {t("prog.play")}
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={exportProgressionMidi}
          disabled={empty}
          aria-label={t("prog.exportAria")}
        >
          <Download />
          {t("prog.midi")}
        </Button>
        <Button variant="ghost" size="sm" onClick={clearProgression} disabled={empty}>
          <Trash2 />
          {t("prog.clear")}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {progressionMode ? t("prog.hintOn") : t("prog.hintOff")}
      </p>

      <div className="flex min-h-9 flex-wrap items-center gap-2" dir="ltr">
        {empty ? (
          <span className="text-sm text-muted-foreground">{t("prog.empty")}</span>
        ) : (
          progression.map((step, i) => (
            <Badge
              key={step.id}
              variant={progressionPlayingIndex === i ? "default" : "secondary"}
              asChild
            >
              <button
                type="button"
                onClick={() => removeProgressionStep(step.id)}
                aria-label={t("prog.remove", { label: step.label })}
                className={cn(
                  "cursor-pointer gap-1 py-1 text-sm",
                  progressionPlayingIndex === i &&
                    "bg-playing text-tonic-foreground",
                )}
              >
                {step.label}
                <X className="size-3 opacity-70" />
              </button>
            </Badge>
          ))
        )}
      </div>
    </div>
  );
}
