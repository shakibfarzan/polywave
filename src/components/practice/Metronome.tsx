import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BEATS = [0, 1, 2, 3];

export function Metronome() {
  const { t } = useT();
  const { metronomeOn, metronomeBeat, toggleMetronome } = usePolywaveStore(
    useShallow((s) => ({
      metronomeOn: s.metronomeOn,
      metronomeBeat: s.metronomeBeat,
      toggleMetronome: s.toggleMetronome,
    })),
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2" aria-hidden="true">
        {BEATS.map((b) => (
          <span
            key={b}
            className={cn(
              "size-3 rounded-full border border-border transition-colors",
              metronomeOn && metronomeBeat === b
                ? b === 0
                  ? "bg-playing"
                  : "bg-primary"
                : "bg-muted",
            )}
          />
        ))}
      </div>
      <Button
        size="sm"
        variant={metronomeOn ? "default" : "outline"}
        onClick={() => void toggleMetronome()}
        aria-pressed={metronomeOn}
      >
        {metronomeOn ? t("metronome.stop") : t("metronome.start")}
      </Button>
    </div>
  );
}
