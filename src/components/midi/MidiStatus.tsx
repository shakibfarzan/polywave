import { CircleOff, Piano, Unplug } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { midiNoteName } from "@/lib/theory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MidiStatus() {
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
        <CircleOff className="size-4" />
        Web MIDI isn't supported in this browser (try Chrome or Edge).
      </div>
    );
  }

  if (midiStatus !== "connected") {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void connectMidiInput()}
          disabled={midiStatus === "connecting"}
        >
          <Piano />
          {midiStatus === "connecting"
            ? "Connecting…"
            : "Connect a MIDI keyboard"}
        </Button>
        {midiStatus === "error" && (
          <p className="text-sm text-destructive">
            MIDI access failed — check the browser permission and try again.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-2 rounded-lg border bg-card p-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="secondary">
          <Piano className="size-3" />
          {midiDevices.length > 0
            ? midiDevices.join(", ")
            : "No device — plug one in"}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={disconnectMidiInput}
          aria-label="Disconnect MIDI"
        >
          <Unplug />
          Disconnect
        </Button>
      </div>

      <div className="flex min-h-6 flex-wrap items-center justify-center gap-1.5">
        {midiNotes.length === 0 ? (
          <span className="text-sm text-muted-foreground">
            Play some notes — held chords light up matching keys on the circle.
          </span>
        ) : (
          <>
            {midiNotes.map((n) => (
              <Badge key={n} variant="outline">
                {midiNoteName(n)}
              </Badge>
            ))}
            {detectedChord && (
              <Badge className="ml-1">{detectedChord.symbol}</Badge>
            )}
          </>
        )}
      </div>

      {detectedChord && chordMatches.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          {detectedChord.symbol} ({detectedChord.quality}) is diatonic in{" "}
          {chordMatches
            .map((m) => `${m.tonic} major (${m.roman})`)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
