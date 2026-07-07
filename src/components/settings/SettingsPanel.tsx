import { Settings } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import type { InstrumentId } from "@/lib/audio";
import type { NotationPref } from "@/lib/theory";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { useT } from "@/hooks/useT";
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

const INSTRUMENTS: InstrumentId[] = ["classic", "soft", "bright", "retro", "epiano"];

export function SettingsPanel() {
  const i18n = useT();
  const { t } = i18n;
  const {
    theme,
    notation,
    instrument,
    locale,
    toggleTheme,
    setNotation,
    setInstrument,
    setLocale,
  } = usePolywaveStore(
    useShallow((s) => ({
      theme: s.theme,
      notation: s.notation,
      instrument: s.instrument,
      locale: s.locale,
      toggleTheme: s.toggleTheme,
      setNotation: s.setNotation,
      setInstrument: s.setInstrument,
      setLocale: s.setLocale,
    })),
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("header.settings")}>
          <Settings />
        </Button>
      </SheetTrigger>
      <SheetContent side={i18n.isRtl ? "left" : "right"}>
        <SheetHeader>
          <SheetTitle className="font-display text-xl">
            {t("settings.title")}
          </SheetTitle>
          <SheetDescription>{t("settings.note")}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{t("settings.dark")}</p>
              <p className="text-xs text-muted-foreground">
                {t("settings.darkHint")}
              </p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              aria-label={t("settings.dark")}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t("settings.language")}</p>
            <ToggleGroup
              type="single"
              variant="outline"
              value={locale}
              onValueChange={(v) => v && setLocale(v as Locale)}
              aria-label={t("settings.language")}
            >
              <ToggleGroupItem value="en">English</ToggleGroupItem>
              <ToggleGroupItem value="fa">فارسی</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t("settings.notation")}</p>
            <p className="text-xs text-muted-foreground">
              {t("settings.notationHint")}
            </p>
            <ToggleGroup
              type="single"
              variant="outline"
              value={notation}
              onValueChange={(v) => v && setNotation(v as NotationPref)}
              aria-label={t("settings.notation")}
            >
              <ToggleGroupItem value="auto">
                {t("settings.notationBoth")}
              </ToggleGroupItem>
              <ToggleGroupItem value="sharps">
                {t("settings.notationSharps")}
              </ToggleGroupItem>
              <ToggleGroupItem value="flats">
                {t("settings.notationFlats")}
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t("settings.instrument")}</p>
            <ToggleGroup
              type="single"
              variant="outline"
              value={instrument}
              onValueChange={(v) => v && setInstrument(v as InstrumentId)}
              aria-label={t("settings.instrument")}
              className="grid w-full grid-cols-1"
            >
              {INSTRUMENTS.map((id) => (
                <ToggleGroupItem
                  key={id}
                  value={id}
                  className="justify-start rounded-md border first:rounded-md last:rounded-md"
                >
                  {t(`instrument.${id}` as TranslationKey)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
