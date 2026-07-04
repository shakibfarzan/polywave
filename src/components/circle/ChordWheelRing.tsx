import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import {
  getBorrowedChords,
  getDiatonicChords,
  getSecondaryDominants,
} from "@/lib/theory";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/** Inner ring radius (between the center label and the note ring). */
const RING_RADIUS = 31;

interface RingChip {
  key: string;
  circleIndex: number;
  symbol: string;
  sub: string | null; // small label under the symbol in the tooltip
  tones: string[];
  pitchClasses: number[];
  detail: string;
  flavor: "diatonic" | "secondary" | "borrowed";
}

export function ChordWheelRing() {
  const {
    keyInfo,
    ringMode,
    chordSevenths,
    progressionMode,
    playChordNotes,
    addProgressionStep,
  } = usePolywaveStore(
    useShallow((s) => ({
      keyInfo: s.keyInfo,
      ringMode: s.ringMode,
      chordSevenths: s.chordSevenths,
      progressionMode: s.progressionMode,
      playChordNotes: s.playChordNotes,
      addProgressionStep: s.addProgressionStep,
    })),
  );

  if (ringMode === "off") return null;

  let chips: RingChip[];
  if (ringMode === "diatonic") {
    chips = getDiatonicChords(keyInfo, chordSevenths).map((c) => ({
      key: `d${c.degree}`,
      circleIndex: c.circleIndex,
      symbol: c.symbol,
      sub: c.roman,
      tones: c.tones,
      pitchClasses: c.pitchClasses,
      detail: c.quality,
      flavor: "diatonic",
    }));
  } else {
    const overlays =
      ringMode === "secondary"
        ? getSecondaryDominants(keyInfo)
        : getBorrowedChords(keyInfo);
    chips = overlays.map((c, i) => ({
      key: `${ringMode}${i}`,
      circleIndex: c.circleIndex,
      symbol: c.symbol,
      sub: c.label,
      tones: c.tones,
      pitchClasses: c.pitchClasses,
      detail: c.description,
      flavor: ringMode,
    }));
  }

  return (
    <>
      {chips.map((chip) => {
        const angle = (chip.circleIndex * 30 * Math.PI) / 180;
        const x = 50 + RING_RADIUS * Math.sin(angle);
        const y = 50 - RING_RADIUS * Math.cos(angle);
        return (
          <div
            key={chip.key}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`${chip.symbol} chord${chip.sub ? `, ${chip.sub}` : ""}`}
                  onClick={() => {
                    void playChordNotes(chip.pitchClasses);
                    if (progressionMode) {
                      addProgressionStep({
                        kind: "chord",
                        label: chip.symbol,
                        pitchClasses: chip.pitchClasses,
                        circleIndex: chip.circleIndex,
                      });
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center rounded-full border px-1.5 py-0.5 font-semibold shadow-sm transition-all outline-none",
                    "text-[clamp(0.5rem,1.7vw,0.72rem)] leading-tight hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring/60",
                    chip.flavor === "diatonic" &&
                      "border-border bg-secondary text-secondary-foreground hover:bg-accent",
                    chip.flavor === "secondary" &&
                      "border-playing bg-secondary text-secondary-foreground",
                    chip.flavor === "borrowed" &&
                      "border-dashed border-primary bg-secondary text-secondary-foreground",
                  )}
                >
                  {chip.symbol}
                  {chip.flavor !== "diatonic" && chip.sub && (
                    <span className="text-[0.8em] font-medium opacity-75">
                      {chip.sub}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-0.5 text-center">
                  <div className="font-semibold">
                    {chip.symbol}
                    {chip.sub ? ` · ${chip.sub}` : ""}
                  </div>
                  <div className="opacity-90">{chip.tones.join(" – ")}</div>
                  <div className="opacity-75">{chip.detail}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      })}
    </>
  );
}
