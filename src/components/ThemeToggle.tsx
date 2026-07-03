import { Moon, Sun } from "lucide-react";

import { usePolywaveStore } from "@/lib/store";
import { Switch } from "@/components/ui/switch";

export function ThemeToggle() {
  const theme = usePolywaveStore((s) => s.theme);
  const toggleTheme = usePolywaveStore((s) => s.toggleTheme);

  return (
    <div className="flex items-center gap-2">
      <Sun className="size-4 text-muted-foreground" />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        aria-label="Toggle dark mode"
      />
      <Moon className="size-4 text-muted-foreground" />
    </div>
  );
}
