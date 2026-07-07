import { Share2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore, type OverlayMode, type RingMode } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/** Consolidated circle-display controls (overlay, chord ring, neighbors). */
export function DisplayOptions() {
  const { t } = useT();
  const {
    overlay,
    ringMode,
    chordSevenths,
    showNeighbors,
    setOverlay,
    setRingMode,
    setChordSevenths,
    toggleNeighbors,
  } = usePolywaveStore(
    useShallow((s) => ({
      overlay: s.overlay,
      ringMode: s.ringMode,
      chordSevenths: s.chordSevenths,
      showNeighbors: s.showNeighbors,
      setOverlay: s.setOverlay,
      setRingMode: s.setRingMode,
      setChordSevenths: s.setChordSevenths,
      toggleNeighbors: s.toggleNeighbors,
    })),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {t("overlay.title")}
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          className="w-full"
          value={overlay}
          onValueChange={(v) => setOverlay((v || "none") as OverlayMode)}
          aria-label={t("overlay.title")}
        >
          <ToggleGroupItem value="none">{t("overlay.off")}</ToggleGroupItem>
          <ToggleGroupItem value="degrees">{t("overlay.degrees")}</ToggleGroupItem>
          <ToggleGroupItem value="roman">{t("overlay.roman")}</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">
          {t("ring.title")}
        </span>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          className="grid w-full grid-cols-2 gap-1"
          value={ringMode}
          onValueChange={(v) => setRingMode((v || "off") as RingMode)}
          aria-label={t("ring.title")}
        >
          {(["off", "diatonic", "secondary", "borrowed"] as const).map((m) => (
            <ToggleGroupItem
              key={m}
              value={m}
              className="rounded-md first:rounded-md last:rounded-md data-[variant=outline]:border-s"
            >
              {t(`ring.${m}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {ringMode === "diatonic" && (
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            className="w-full"
            value={chordSevenths ? "7" : "triad"}
            onValueChange={(v) => v && setChordSevenths(v === "7")}
            aria-label={t("ring.title")}
          >
            <ToggleGroupItem value="triad">{t("ring.triads")}</ToggleGroupItem>
            <ToggleGroupItem value="7">{t("ring.sevenths")}</ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>

      <Button
        variant={showNeighbors ? "default" : "outline"}
        size="sm"
        onClick={toggleNeighbors}
        aria-pressed={showNeighbors}
      >
        <Share2 />
        {t("neighbors.button")}
      </Button>
    </div>
  );
}
