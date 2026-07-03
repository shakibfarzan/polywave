import { usePolywaveStore, type OverlayMode } from "@/lib/store";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function OverlayToggles() {
  const overlay = usePolywaveStore((s) => s.overlay);
  const setOverlay = usePolywaveStore((s) => s.setOverlay);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        Note overlay
      </span>
      <ToggleGroup
        type="single"
        variant="outline"
        value={overlay}
        onValueChange={(v) => setOverlay((v || "none") as OverlayMode)}
        aria-label="Note overlay"
      >
        <ToggleGroupItem value="none">Off</ToggleGroupItem>
        <ToggleGroupItem value="degrees">Degrees</ToggleGroupItem>
        <ToggleGroupItem value="roman">Roman</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
