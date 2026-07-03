import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { getDiatonicChords } from "@/lib/theory";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Inner ring radius (between the center label and the note ring). */
const RING_RADIUS = 31;

export function ChordWheelRing() {
  const {
    keyInfo,
    chordSevenths,
    progressionMode,
    playChordNotes,
    addProgressionStep,
  } = usePolywaveStore(
    useShallow((s) => ({
      keyInfo: s.keyInfo,
      chordSevenths: s.chordSevenths,
      progressionMode: s.progressionMode,
      playChordNotes: s.playChordNotes,
      addProgressionStep: s.addProgressionStep,
    })),
  );

  const chords = getDiatonicChords(keyInfo, chordSevenths);

  return (
    <>
      {chords.map((chord) => {
        const angle = (chord.circleIndex * 30 * Math.PI) / 180;
        const x = 50 + RING_RADIUS * Math.sin(angle);
        const y = 50 - RING_RADIUS * Math.cos(angle);
        return (
          <div
            key={chord.degree}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${chord.symbol} chord, ${chord.roman}`}
                  onClick={() => {
                    void playChordNotes(chord.pitchClasses);
                    if (progressionMode) {
                      addProgressionStep({
                        kind: "chord",
                        label: chord.symbol,
                        pitchClasses: chord.pitchClasses,
                        circleIndex: chord.circleIndex,
                      });
                    }
                  }}
                  className={cn(
                    "rounded-full border border-border bg-secondary px-1.5 py-0.5 font-semibold text-secondary-foreground shadow-sm transition-all outline-none",
                    "text-[clamp(0.5rem,1.7vw,0.72rem)] hover:scale-110 hover:bg-accent focus-visible:ring-[3px] focus-visible:ring-ring/60",
                  )}
                >
                  {chord.symbol}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-0.5 text-center">
                  <div className="font-semibold">
                    {chord.symbol} · {chord.roman}
                  </div>
                  <div className="opacity-90">{chord.tones.join(" – ")}</div>
                  <div className="opacity-75">{chord.quality}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </>
  );
}
