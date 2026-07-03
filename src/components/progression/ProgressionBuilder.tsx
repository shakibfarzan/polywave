import { Play, Plus, Square, Trash2, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProgressionBuilder() {
  const {
    progression,
    progressionMode,
    progressionPlayingIndex,
    toggleProgressionMode,
    removeProgressionStep,
    clearProgression,
    playProgression,
    stopProgression,
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
    })),
  );

  const isPlaying = progressionPlayingIndex !== null;
  const empty = progression.length === 0;

  return (
    <div className="w-full max-w-lg space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          variant={progressionMode ? "default" : "outline"}
          size="sm"
          onClick={toggleProgressionMode}
          aria-pressed={progressionMode}
        >
          <Plus />
          {progressionMode ? "Recording…" : "Add steps"}
        </Button>
        <Button
          size="sm"
          onClick={() => (isPlaying ? stopProgression() : void playProgression())}
          disabled={empty}
        >
          {isPlaying ? (
            <>
              <Square />
              Stop
            </>
          ) : (
            <>
              <Play />
              Play
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearProgression}
          disabled={empty}
        >
          <Trash2 />
          Clear
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        {progressionMode
          ? "Tap notes or chord-wheel chords on the circle to add them."
          : "Turn on “Add steps”, then tap the circle to build a progression."}
      </p>

      <div className="flex min-h-9 flex-wrap items-center justify-center gap-2">
        {empty ? (
          <span className="text-sm text-muted-foreground">No steps yet.</span>
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
                aria-label={`Remove ${step.label}`}
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
