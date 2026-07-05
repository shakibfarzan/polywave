import { useEffect } from "react";
import { Music4 } from "lucide-react";

import { usePolywaveStore } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleOfFifths } from "@/components/circle/CircleOfFifths";
import { CircleTools } from "@/components/circle/CircleTools";
import { KeySelector } from "@/components/circle/KeySelector";
import { OverlayToggles } from "@/components/circle/OverlayToggles";
import { PlaybackControls } from "@/components/circle/PlaybackControls";
import { RelativeSwitch } from "@/components/circle/RelativeSwitch";
import { ProgressionBuilder } from "@/components/progression/ProgressionBuilder";
import { MidiStatus } from "@/components/midi/MidiStatus";
import { Metronome } from "@/components/practice/Metronome";
import { PracticeTimer } from "@/components/practice/PracticeTimer";
import { QuizMode } from "@/components/quiz/QuizMode";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { StatsDashboard } from "@/components/stats/StatsDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function App() {
  const theme = usePolywaveStore((s) => s.theme);

  // Keep the <html> class in sync with the persisted theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <div className="min-h-dvh">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Music4 className="size-5" />
            </span>
            <div>
              <h1 className="text-xl leading-none font-bold">Polywave</h1>
              <p className="text-xs text-muted-foreground">
                Circle-of-fifths practice tool
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <SettingsPanel />
          </div>
        </header>

        <Tabs defaultValue="explore" className="gap-6">
          <TabsList className="w-full">
            <TabsTrigger value="explore">Explore</TabsTrigger>
            <TabsTrigger value="practice">Practice</TabsTrigger>
            <TabsTrigger value="build">Build</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent
            value="explore"
            className="flex flex-col items-center gap-4"
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              <KeySelector />
              <RelativeSwitch />
            </div>
            <OverlayToggles />
            <CircleTools />
            <CircleOfFifths />
            <MidiStatus />
            <p className="max-w-md text-center text-sm text-muted-foreground">
              Click any note to hear it. Tab to the circle and use the arrow
              keys to move between notes.
            </p>
          </TabsContent>

          <TabsContent
            value="practice"
            className="flex flex-col items-center gap-5"
          >
            <KeySelector />
            <CircleOfFifths />
            <PlaybackControls />
            <div className="flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-lg border bg-card p-4">
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Metronome
                </span>
                <Metronome />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Practice timer
                </span>
                <PracticeTimer />
              </div>
            </div>
            <CircleTools />
            <OverlayToggles />
          </TabsContent>

          <TabsContent
            value="build"
            className="flex flex-col items-center gap-4"
          >
            <KeySelector />
            <ProgressionBuilder />
            <CircleTools />
            <CircleOfFifths />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizMode />
          </TabsContent>

          <TabsContent value="stats">
            <StatsDashboard />
          </TabsContent>
        </Tabs>

        <footer className="pt-2 text-center text-xs text-muted-foreground">
          Polywave · Web App for music learners
        </footer>
      </div>
    </div>
  );
}
