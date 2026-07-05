import { Settings } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import { INSTRUMENT_LABELS, type InstrumentId } from "@/lib/audio";
import type { NotationPref } from "@/lib/theory";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const INSTRUMENTS = Object.keys(INSTRUMENT_LABELS) as InstrumentId[];

export function SettingsPanel() {
  const { theme, notation, instrument, toggleTheme, setNotation, setInstrument } =
    usePolywaveStore(
      useShallow((s) => ({
        theme: s.theme,
        notation: s.notation,
        instrument: s.instrument,
        toggleTheme: s.toggleTheme,
        setNotation: s.setNotation,
        setInstrument: s.setInstrument,
      })),
    );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open settings">
          <Settings />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Preferences are saved on this device.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark mode</p>
              <p className="text-xs text-muted-foreground">
                Follow the switch, not the sun.
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Accidental notation</p>
            <p className="text-xs text-muted-foreground">
              How out-of-key notes are written (in-key spelling always follows
              the key).
            </p>
            <ToggleGroup
              type="single"
              variant="outline"
              value={notation}
              onValueChange={(v) => v && setNotation(v as NotationPref)}
              aria-label="Accidental notation"
            >
              <ToggleGroupItem value="auto">Both</ToggleGroupItem>
              <ToggleGroupItem value="sharps">♯ Sharps</ToggleGroupItem>
              <ToggleGroupItem value="flats">♭ Flats</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Instrument</p>
            <ToggleGroup
              type="single"
              variant="outline"
              value={instrument}
              onValueChange={(v) => v && setInstrument(v as InstrumentId)}
              aria-label="Instrument"
              className="grid w-full grid-cols-1"
            >
              {INSTRUMENTS.map((id) => (
                <ToggleGroupItem
                  key={id}
                  value={id}
                  className="justify-start rounded-md border first:rounded-md last:rounded-md"
                >
                  {INSTRUMENT_LABELS[id]}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
