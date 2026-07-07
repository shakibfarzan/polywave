import { Moon, Sun } from "lucide-react";

import { usePolywaveStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { t } = useT();
  const theme = usePolywaveStore((s) => s.theme);
  const toggleTheme = usePolywaveStore((s) => s.toggleTheme);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t("header.theme")}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
