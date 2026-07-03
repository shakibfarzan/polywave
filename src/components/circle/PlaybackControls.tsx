import { useState } from "react";
import { ArrowDownNarrowWide, ArrowUpNarrowWide, Play, Square } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function PlaybackControls() {
  const { isPlaying, tempo, setTempo, playCurrentScale, stopPlayback } =
    usePolywaveStore(
      useShallow((s) => ({
        isPlaying: s.isPlaying,
        tempo: s.tempo,
        setTempo: s.setTempo,
        playCurrentScale: s.playCurrentScale,
        stopPlayback: s.stopPlayback,
      })),
    );
  const [direction, setDirection] = useState<"up" | "down">("up");

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={() =>
            isPlaying ? stopPlayback() : void playCurrentScale(direction)
          }
          className="min-w-36"
        >
          {isPlaying ? (
            <>
              <Square />
              Stop
            </>
          ) : (
            <>
              <Play />
              Play scale
            </>
          )}
        </Button>
        <ToggleGroup
          type="single"
          variant="outline"
          value={direction}
          onValueChange={(v) => v && setDirection(v as "up" | "down")}
          aria-label="Scale direction"
        >
          <ToggleGroupItem value="up" aria-label="Ascending">
            <ArrowUpNarrowWide />
          </ToggleGroupItem>
          <ToggleGroupItem value="down" aria-label="Descending">
            <ArrowDownNarrowWide />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex w-full max-w-xs items-center gap-3">
        <span className="w-16 text-xs text-muted-foreground tabular-nums">
          {tempo} BPM
        </span>
        <Slider
          min={40}
          max={208}
          step={1}
          value={[tempo]}
          onValueChange={([v]) => setTempo(v)}
          aria-label="Tempo in beats per minute"
        />
      </div>
    </div>
  );
}
