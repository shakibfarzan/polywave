import { CircleOff, Piano, Unplug } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { midiNoteName } from "@/lib/theory";
import type { TranslationKey } from "@/lib/i18n";
import { useT } from "@/hooks/useT";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MidiStatus() {
  const i18n = useT();
  const { t } = i18n;
  const {
    midiStatus,
    midiDevices,
    midiNotes,
    detectedChord,
    chordMatches,
    connectMidiInput,
    disconnectMidiInput,
  } = usePolywaveStore(
    useShallow((s) => ({
      midiStatus: s.midiStatus,
      midiDevices: s.midiDevices,
      midiNotes: s.midiNotes,
      detectedChord: s.detectedChord,
      chordMatches: s.chordMatches,
      connectMidiInput: s.connectMidiInput,
      disconnectMidiInput: s.disconnectMidiInput,
    })),
  );

  if (midiStatus === "unsupported") {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CircleOff className="size-4 shrink-0" />
        {t("midi.unsupported")}
      </div>
    );
  }

  if (midiStatus !== "connected") {
    return (
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void connectMidiInput()}
          disabled={midiStatus === "connecting"}
        >
          <Piano />
          {midiStatus === "connecting" ? t("midi.connecting") : t("midi.connect")}
        </Button>
        {midiStatus === "error" && (
          <p className="text-sm text-destructive">{t("midi.error")}</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">
          <Piano className="size-3" />
          {midiDevices.length > 0 ? midiDevices.join(", ") : t("midi.noDevice")}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnectMidiInput}
          aria-label={t("midi.disconnectAria")}
        >
          <Unplug />
          {t("midi.disconnect")}
        </Button>
      </div>

      <div className="flex min-h-6 flex-wrap items-center gap-1.5" dir="ltr">
        {midiNotes.length === 0 ? (
          <span className="text-sm text-muted-foreground" dir="auto">
            {t("midi.hint")}
          </span>
        ) : (
          <>
            {midiNotes.map((note) => (
              <Badge key={note} variant="outline">
                {midiNoteName(note)}
              </Badge>
            ))}
            {detectedChord && (
              <Badge className="ms-1">{detectedChord.symbol}</Badge>
            )}
          </>
        )}
      </div>

      {detectedChord && chordMatches.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {t("midi.diatonicIn", {
            chord: detectedChord.symbol,
            quality: t(`quality.${detectedChord.quality}` as TranslationKey),
            list: i18n.join(
              chordMatches.map((m) =>
                t("midi.matchItem", { tonic: m.tonic, roman: m.roman }),
              ),
            ),
          })}
        </p>
      )}
    </div>
  );
}
