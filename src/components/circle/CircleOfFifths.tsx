import { useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { usePolywaveStore } from "@/lib/store";
import {
  circleMajorSignatureLabel,
  describeSignature,
  getNeighborKeys,
  MODE_LABELS,
  type NeighborKey,
} from "@/lib/theory";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NoteSegment } from "./NoteSegment";
import { ChordWheelRing } from "./ChordWheelRing";

/** Radius of the note ring as a percentage of the container. */
const RING_RADIUS = 41;

/** Center coordinates (in 0–100 space) for a circle position. */
function positionFor(circleIndex: number, radius = RING_RADIUS) {
  const angle = (circleIndex * 30 * Math.PI) / 180;
  return {
    x: 50 + radius * Math.sin(angle),
    y: 50 - radius * Math.cos(angle),
  };
}

export function CircleOfFifths() {
  const {
    keyInfo,
    overlay,
    showNeighbors,
    detectedChord,
    chordMatches,
    currentStepIndex,
    progressionMode,
    progression,
    progressionPlayingIndex,
    playSingleNote,
    addProgressionStep,
  } = usePolywaveStore(
    useShallow((s) => ({
      keyInfo: s.keyInfo,
      overlay: s.overlay,
      showNeighbors: s.showNeighbors,
      detectedChord: s.detectedChord,
      chordMatches: s.chordMatches,
      currentStepIndex: s.currentStepIndex,
      progressionMode: s.progressionMode,
      progression: s.progression,
      progressionPlayingIndex: s.progressionPlayingIndex,
      playSingleNote: s.playSingleNote,
      addProgressionStep: s.addProgressionStep,
    })),
  );

  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const tonicCircleIndex =
    keyInfo.notes.find((n) => n.scaleDegree === 1)?.circleIndex ?? 0;
  const [focusedIndex, setFocusedIndex] = useState(tonicCircleIndex);

  const playingCircleIndex =
    currentStepIndex != null
      ? keyInfo.scale[currentStepIndex]?.circleIndex
      : null;

  const neighborByCircle = new Map<number, NeighborKey>();
  if (showNeighbors) {
    for (const n of getNeighborKeys(keyInfo)) neighborByCircle.set(n.circleIndex, n);
  }
  // Live MIDI: highlight the keys containing the detected chord (wins over
  // the neighbor badges while a chord is held).
  if (detectedChord) {
    for (const m of chordMatches) {
      neighborByCircle.set(m.circleIndex, {
        tonic: m.tonic,
        mode: m.mode,
        circleIndex: m.circleIndex,
        relationship: `${detectedChord.symbol} is ${m.roman} in ${m.tonic} major`,
        short: m.roman,
      });
    }
  }

  const focusButton = (index: number) => {
    const i = ((index % 12) + 12) % 12;
    setFocusedIndex(i);
    buttonsRef.current[i]?.focus();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusButton(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusButton(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusButton(tonicCircleIndex);
        break;
    }
  };

  const activateNote = (note: (typeof keyInfo.notes)[number]) => {
    void playSingleNote(note.pitchClass);
    if (progressionMode) {
      addProgressionStep({
        kind: "note",
        label: note.name.split("/")[0],
        pitchClasses: [note.pitchClass],
        circleIndex: note.circleIndex,
      });
    }
  };

  const linePoints = progression
    .map((step) => {
      const { x, y } = positionFor(step.circleIndex);
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className="relative mx-auto aspect-square w-full max-w-[min(86vw,520px)]"
        role="group"
        aria-label={`Circle of fifths, key of ${keyInfo.tonic} ${MODE_LABELS[keyInfo.mode]}`}
      >
        {/* Decorative rings */}
        <div className="pointer-events-none absolute inset-[12%] rounded-full border border-border" />
        <div className="pointer-events-none absolute inset-[26%] rounded-full border border-border" />

        {/* Progression connecting lines */}
        {progression.length > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 100 100"
            aria-hidden="true"
          >
            {progression.length > 1 && (
              <polyline
                points={linePoints}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth={0.8}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={0.55}
              />
            )}
            {progression.map((step, i) => {
              const { x, y } = positionFor(step.circleIndex);
              const active = progressionPlayingIndex === i;
              return (
                <circle
                  key={step.id}
                  cx={x}
                  cy={y}
                  r={active ? 2.4 : 1.4}
                  fill={
                    active ? "var(--color-playing)" : "var(--color-primary)"
                  }
                />
              );
            })}
          </svg>
        )}

        {/* Center label */}
        <div className="pointer-events-none absolute inset-[28%] flex flex-col items-center justify-center rounded-full bg-accent/40 text-center">
          <span className="text-xs tracking-wide text-muted-foreground uppercase">
            Key of
          </span>
          <span className="text-2xl font-bold text-foreground sm:text-3xl">
            {keyInfo.tonic}
          </span>
          <span className="px-2 text-[0.7rem] leading-tight text-muted-foreground">
            {MODE_LABELS[keyInfo.mode]}
          </span>
          <span className="mt-1 text-[0.65rem] text-muted-foreground">
            {describeSignature(keyInfo.signature)}
          </span>
        </div>

        {/* Inner chord ring (diatonic / secondary dominants / borrowed) */}
        <ChordWheelRing />

        {/* The 12 note segments */}
        {keyInfo.notes.map((note, i) => {
          const { x, y } = positionFor(i);
          return (
            <div
              key={note.circleIndex}
              className="absolute w-[15%] -translate-x-1/2 -translate-y-1/2 text-[clamp(0.7rem,2.6vw,1rem)]"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <NoteSegment
                note={note}
                isTonic={note.scaleDegree === 1}
                isPlaying={playingCircleIndex === note.circleIndex}
                overlay={overlay}
                neighbor={neighborByCircle.get(note.circleIndex) ?? null}
                signatureLabel={circleMajorSignatureLabel(note.circleIndex)}
                tabIndex={focusedIndex === i ? 0 : -1}
                onActivate={() => activateNote(note)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                onFocus={() => setFocusedIndex(i)}
                buttonRef={(el) => {
                  buttonsRef.current[i] = el;
                }}
              />
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
