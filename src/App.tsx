import { useEffect, type ReactNode } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import {
  Blocks,
  ChartColumn,
  Compass,
  GraduationCap,
  Music4,
  Timer,
} from "lucide-react";

import { usePolywaveStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleOfFifths } from "@/components/circle/CircleOfFifths";
import { DisplayOptions } from "@/components/circle/DisplayOptions";
import { KeySelector } from "@/components/circle/KeySelector";
import { PlaybackControls } from "@/components/circle/PlaybackControls";
import { RelativeSwitch } from "@/components/circle/RelativeSwitch";
import { ProgressionBuilder } from "@/components/progression/ProgressionBuilder";
import { MidiStatus } from "@/components/midi/MidiStatus";
import { Metronome } from "@/components/practice/Metronome";
import { PracticeTimer } from "@/components/practice/PracticeTimer";
import { QuizMode } from "@/components/quiz/QuizMode";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { StatsDashboard } from "@/components/stats/StatsDashboard";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidePanel, PanelSection } from "@/components/Panel";

/** Circle-plus-side-panel layout used by Explore / Practice / Build. */
function CircleLayout({ panel }: { panel: ReactNode }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
      <CircleOfFifths />
      <SidePanel>{panel}</SidePanel>
    </div>
  );
}

const TAB_TRIGGER_CLASS =
  "h-auto flex-none gap-1.5 rounded-none border-0 border-b-2 border-transparent px-3 py-2.5 text-muted-foreground shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none";

export default function App() {
  const { t, isRtl } = useT();
  const theme = usePolywaveStore((s) => s.theme);

  // Keep the <html> class in sync with the persisted theme.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <DirectionProvider dir={isRtl ? "rtl" : "ltr"}>
      <div className="min-h-dvh">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Music4 className="size-5" />
            </span>
            <div>
              <h1 className="font-display text-2xl leading-none font-black tracking-tight">
                Polywave
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("app.tagline")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <LanguageToggle />
            <ThemeToggle />
            <SettingsPanel />
          </div>
        </header>

        <Tabs defaultValue="explore" className="gap-6">
          <TabsList className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none border-b bg-transparent p-0 sm:justify-center">
            <TabsTrigger value="explore" className={TAB_TRIGGER_CLASS}>
              <Compass />
              {t("tab.explore")}
            </TabsTrigger>
            <TabsTrigger value="practice" className={TAB_TRIGGER_CLASS}>
              <Timer />
              {t("tab.practice")}
            </TabsTrigger>
            <TabsTrigger value="build" className={TAB_TRIGGER_CLASS}>
              <Blocks />
              {t("tab.build")}
            </TabsTrigger>
            <TabsTrigger value="quiz" className={TAB_TRIGGER_CLASS}>
              <GraduationCap />
              {t("tab.quiz")}
            </TabsTrigger>
            <TabsTrigger value="stats" className={TAB_TRIGGER_CLASS}>
              <ChartColumn />
              {t("tab.stats")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explore">
            <CircleLayout
              panel={
                <>
                  <PanelSection label={t("panel.key")}>
                    <KeySelector />
                    <RelativeSwitch />
                  </PanelSection>
                  <PanelSection label={t("panel.display")}>
                    <DisplayOptions />
                  </PanelSection>
                  <PanelSection label={t("panel.midi")}>
                    <MidiStatus />
                  </PanelSection>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {t("circle.hint")}
                  </p>
                </>
              }
            />
          </TabsContent>

          <TabsContent value="practice">
            <CircleLayout
              panel={
                <>
                  <PanelSection label={t("panel.key")}>
                    <KeySelector />
                  </PanelSection>
                  <PanelSection label={t("panel.sound")}>
                    <PlaybackControls />
                  </PanelSection>
                  <PanelSection label={t("metronome.title")}>
                    <Metronome />
                  </PanelSection>
                  <PanelSection label={t("timer.title")}>
                    <PracticeTimer />
                  </PanelSection>
                  <PanelSection label={t("panel.display")}>
                    <DisplayOptions />
                  </PanelSection>
                </>
              }
            />
          </TabsContent>

          <TabsContent value="build">
            <CircleLayout
              panel={
                <>
                  <PanelSection label={t("panel.key")}>
                    <KeySelector />
                  </PanelSection>
                  <PanelSection label={t("panel.progression")}>
                    <ProgressionBuilder />
                  </PanelSection>
                  <PanelSection label={t("panel.display")}>
                    <DisplayOptions />
                  </PanelSection>
                </>
              }
            />
          </TabsContent>

          <TabsContent value="quiz">
            <QuizMode />
          </TabsContent>

          <TabsContent value="stats">
            <StatsDashboard />
          </TabsContent>
        </Tabs>

          <footer className="pt-2 text-center text-xs text-muted-foreground">
            {t("footer.text")}
          </footer>
        </div>
      </div>
    </DirectionProvider>
  );
}
