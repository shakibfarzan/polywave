import { useState } from "react";
import { ArrowDownNarrowWide, ArrowUpNarrowWide, Play, Square } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function PlaybackControls() {
  const { t, digits, n } = useT();
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          onClick={() =>
            isPlaying ? stopPlayback() : void playCurrentScale(direction)
          }
          className="flex-1"
        >
          {isPlaying ? (
            <>
              <Square />
              {t("playback.stop")}
            </>
          ) : (
            <>
              <Play />
              {t("playback.play")}
            </>
          )}
        </Button>
        <ToggleGroup
          type="single"
          variant="outline"
          value={direction}
          onValueChange={(v) => v && setDirection(v as "up" | "down")}
          aria-label={t("playback.direction")}
        >
          <ToggleGroupItem value="up" aria-label={t("playback.asc")}>
            <ArrowUpNarrowWide />
          </ToggleGroupItem>
          <ToggleGroupItem value="down" aria-label={t("playback.desc")}>
            <ArrowDownNarrowWide />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-20 shrink-0 text-xs text-muted-foreground tabular-nums">
          {digits(t("playback.bpm", { bpm: n(tempo) }))}
        </span>
        <Slider
          min={40}
          max={208}
          step={1}
          value={[tempo]}
          onValueChange={([v]) => setTempo(v)}
          aria-label={t("playback.tempoAria")}
        />
      </div>
    </div>
  );
}
