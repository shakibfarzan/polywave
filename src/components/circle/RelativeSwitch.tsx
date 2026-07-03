import { Repeat } from "lucide-react";

import { usePolywaveStore } from "@/lib/store";
import { relativeLabel } from "@/lib/theory";
import { Button } from "@/components/ui/button";

export function RelativeSwitch() {
  const mode = usePolywaveStore((s) => s.keyInfo.mode);
  const switchRelative = usePolywaveStore((s) => s.switchRelative);

  return (
    <Button variant="secondary" onClick={switchRelative}>
      <Repeat />
      {relativeLabel(mode)}
    </Button>
  );
}
