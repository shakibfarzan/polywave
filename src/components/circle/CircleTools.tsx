import { Layers, Share2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function CircleTools() {
  const {
    showChordWheel,
    chordSevenths,
    showNeighbors,
    toggleChordWheel,
    setChordSevenths,
    toggleNeighbors,
  } = usePolywaveStore(
    useShallow((s) => ({
      showChordWheel: s.showChordWheel,
      chordSevenths: s.chordSevenths,
      showNeighbors: s.showNeighbors,
      toggleChordWheel: s.toggleChordWheel,
      setChordSevenths: s.setChordSevenths,
      toggleNeighbors: s.toggleNeighbors,
    })),
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button
        variant={showChordWheel ? "default" : "outline"}
        size="sm"
        onClick={toggleChordWheel}
        aria-pressed={showChordWheel}
      >
        <Layers />
        Chord wheel
      </Button>
      {showChordWheel && (
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
  );
}
