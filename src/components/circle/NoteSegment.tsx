import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { formatNoteName, type NoteInfo, type NeighborKey } from "@/lib/theory";
import { usePolywaveStore, type OverlayMode } from "@/lib/store";
import { useT, type I18nApi } from "@/hooks/useT";

interface NoteSegmentProps {
  note: NoteInfo;
  isTonic: boolean;
  isPlaying: boolean;
  overlay: OverlayMode;
  /** Set when this position is a highlighted related key; `relationship` is pre-localized. */
  neighbor: NeighborKey | null;
  /** Localized major-key signature label for this circle position (tooltip). */
  signatureLabel: string;
  tabIndex: number;
  onActivate: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onFocus: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

function overlayText(note: NoteInfo, overlay: OverlayMode, i18n: I18nApi): string | null {
  if (!note.diatonic) return null;
  if (overlay === "roman") return note.romanNumeral;
  if (overlay === "degrees")
    return note.scaleDegree != null ? i18n.n(note.scaleDegree) : null;
  return null;
}

function ariaLabel(note: NoteInfo, isTonic: boolean, i18n: I18nApi): string {
  const { t } = i18n;
  const spoken = note.name.replace(/♯/g, " sharp").replace(/♭/g, " flat");
  if (!note.diatonic) return t("aria.noteOut", { note: spoken });
  const role = isTonic
    ? t("aria.tonic")
    : t("aria.degree", { degree: i18n.n(note.scaleDegree ?? 0) });
  return t("aria.noteIn", {
    note: spoken,
    role,
    quality: note.chordQuality ? t(`quality.${note.chordQuality}`) : "",
    roman: note.romanNumeral ?? "",
  });
}

export function NoteSegment({
  note,
  isTonic,
  isPlaying,
  overlay,
  neighbor,
  signatureLabel,
  tabIndex,
  onActivate,
  onKeyDown,
  onFocus,
  buttonRef,
}: NoteSegmentProps) {
  const i18n = useT();
  const { t } = i18n;
  const notation = usePolywaveStore((s) => s.notation);
  const sub = overlayText(note, overlay, i18n);
  const displayName = formatNoteName(note.name, notation);
  const nameParts = displayName.split("/");

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={buttonRef}
          type="button"
          tabIndex={tabIndex}
          onClick={onActivate}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          aria-label={ariaLabel(note, isTonic, i18n)}
          aria-pressed={isPlaying}
          className={cn(
            "relative flex aspect-square w-full flex-col items-center justify-center rounded-full border-2 text-center transition-all duration-200 outline-none select-none",
            "focus-visible:ring-[3px] focus-visible:ring-ring/60 hover:scale-110",
            isTonic
              ? "border-transparent bg-tonic text-tonic-foreground font-bold shadow-lg"
              : note.diatonic
                ? "border-diatonic bg-card text-card-foreground font-semibold"
                : "border-transparent bg-muted text-muted-foreground opacity-70",
            neighbor &&
              !isTonic &&
              "shadow-[0_0_0_3px_var(--color-playing)] opacity-100",
            isPlaying &&
              "scale-110 border-transparent bg-playing text-tonic-foreground shadow-[0_0_0_4px_var(--color-playing)] ring-0",
          )}
        >
          {neighbor && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-playing px-1 text-[0.55rem] leading-none font-bold text-tonic-foreground shadow">
              {neighbor.short}
            </span>
          )}
          <span className="font-display leading-tight">
            {nameParts.length > 1 ? (
              <span className="flex flex-col text-[0.7em] leading-none">
                <span>{nameParts[0]}</span>
                <span>{nameParts[1]}</span>
              </span>
            ) : (
              <span className="text-[1.08em]">{displayName}</span>
            )}
          </span>
          {sub && (
            <span className="mt-0.5 text-[0.62em] leading-none font-medium opacity-90">
              {sub}
            </span>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-0.5 text-center">
          <div className="font-semibold">{note.name}</div>
          {note.diatonic ? (
            <>
              <div>
                {t("note.degreeRoman", {
                  degree: i18n.n(note.scaleDegree ?? 0),
                  roman: note.romanNumeral ?? "",
                })}
              </div>
              <div className="opacity-90">
                {note.chordTones.join(" – ")} (
                {note.chordQuality ? t(`quality.${note.chordQuality}`) : ""})
              </div>
            </>
          ) : (
            <div className="opacity-90">{t("note.notInKey")}</div>
          )}
          {neighbor && (
            <div className="font-medium text-playing">
              {t("rel.key", { rel: neighbor.relationship })}
            </div>
          )}
          <div className="opacity-75">
            {t("note.asMajor", { sig: signatureLabel })}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
