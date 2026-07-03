import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { usePolywaveStore } from "@/lib/store";
import {
  allPracticalKeys,
  MODES,
  MODE_LABELS,
  type Mode,
} from "@/lib/theory";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function KeySelector() {
  const [open, setOpen] = useState(false);
  const tonic = usePolywaveStore((s) => s.keyInfo.tonic);
  const mode = usePolywaveStore((s) => s.keyInfo.mode);
  const setKey = usePolywaveStore((s) => s.setKey);

  const groups = useMemo(() => allPracticalKeys(), []);
  const currentLabel = `${tonic} ${MODE_LABELS[mode]}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select key and mode"
          className="w-[16rem] justify-between"
        >
          {currentLabel}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[16rem] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search key or mode…" />
          <CommandList>
            <CommandEmpty>No key found.</CommandEmpty>
            {MODES.map((m: Mode) => (
              <CommandGroup key={m} heading={MODE_LABELS[m]}>
                {groups[m].map((choice) => {
                  const selected = choice.tonic === tonic && choice.mode === mode;
                  return (
                    <CommandItem
                      key={choice.label}
                      value={choice.label}
                      onSelect={() => {
                        setKey(choice.tonic, choice.mode);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(selected ? "opacity-100" : "opacity-0")}
                      />
                      {choice.tonic}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {MODE_LABELS[m]}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
