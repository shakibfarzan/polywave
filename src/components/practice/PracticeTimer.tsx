import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PracticeTimer() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

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
        onClick={() => setRunning((r) => !r)}
        aria-label={running ? "Pause timer" : "Start timer"}
      >
        {running ? <Pause /> : <Play />}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => {
          setRunning(false);
          setSeconds(0);
        }}
        aria-label="Reset timer"
      >
        <RotateCcw />
      </Button>
    </div>
  );
}
