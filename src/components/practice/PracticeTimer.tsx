import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { usePolywaveStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function PracticeTimer() {
  const addPracticeTime = usePolywaveStore((s) => s.addPracticeTime);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );
  // Seconds already credited to the persistent stats.
  const flushedRef = useRef(0);
  const secondsRef = useRef(0);
  secondsRef.current = seconds;

  const flush = () => {
    const unflushed = secondsRef.current - flushedRef.current;
    if (unflushed > 0) {
      addPracticeTime(unflushed);
      flushedRef.current = secondsRef.current;
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  // Credit any remaining time when the timer unmounts (e.g. tab switch).
  useEffect(() => flush, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-3">
      <span
        className="font-mono text-2xl tabular-nums"
        role="timer"
        aria-label="Practice time"
      >
        {mm}:{ss}
      </span>
      <Button
        size="icon"
        variant="outline"
        onClick={() => {
          if (running) flush();
          setRunning((r) => !r);
        }}
        aria-label={running ? "Pause timer" : "Start timer"}
      >
        {running ? <Pause /> : <Play />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          flush();
          setRunning(false);
          setSeconds(0);
          flushedRef.current = 0;
        }}
        aria-label="Reset timer"
      >
        <RotateCcw />
      </Button>
    </div>
  );
}
