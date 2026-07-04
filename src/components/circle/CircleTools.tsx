import { Share2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore, type RingMode } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function CircleTools() {
  const {
    ringMode,
    chordSevenths,
    showNeighbors,
    setRingMode,
    setChordSevenths,
    toggleNeighbors,
  } = usePolywaveStore(
    useShallow((s) => ({
      ringMode: s.ringMode,
      chordSevenths: s.chordSevenths,
      showNeighbors: s.showNeighbors,
      setRingMode: s.setRingMode,
      setChordSevenths: s.setChordSevenths,
      toggleNeighbors: s.toggleNeighbors,
    })),
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Chord ring
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={ringMode}
          onValueChange={(v) => setRingMode((v || "off") as RingMode)}
          aria-label="Chord ring mode"
        >
          <ToggleGroupItem value="off">Off</ToggleGroupItem>
          <ToggleGroupItem value="diatonic">Diatonic</ToggleGroupItem>
          <ToggleGroupItem value="secondary">Sec. dom.</ToggleGroupItem>
          <ToggleGroupItem value="borrowed">Borrowed</ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {ringMode === "diatonic" && (
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={chordSevenths ? "7" : "triad"}
            onValueChange={(v) => v && setChordSevenths(v === "7")}
            aria-label="Chord type"
          >
            <ToggleGroupItem value="triad">Triads</ToggleGroupItem>
            <ToggleGroupItem value="7">7ths</ToggleGroupItem>
          </ToggleGroup>
        )}
        <Button
          variant={showNeighbors ? "default" : "outline"}
          size="sm"
          onClick={toggleNeighbors}
          aria-pressed={showNeighbors}
        >
          <Share2 />
          Neighbor keys
        </Button>
      </div>
    </div>
  );
}
