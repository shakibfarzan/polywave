import { Repeat } from "lucide-react";

import { usePolywaveStore } from "@/lib/store";
import { useT } from "@/hooks/useT";
import { Button } from "@/components/ui/button";

export function RelativeSwitch() {
  const { t } = useT();
  const mode = usePolywaveStore((s) => s.keyInfo.mode);
  const switchRelative = usePolywaveStore((s) => s.switchRelative);

  return (
    <Button variant="secondary" size="sm" onClick={switchRelative}>
      <Repeat />
      {mode === "ionian" ? t("key.relativeMinor") : t("key.relativeMajor")}
    </Button>
  );
}
