import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { usePolywaveStore } from "@/lib/store";
import { allPracticalKeys, MODES, type Mode } from "@/lib/theory";
import { useT } from "@/hooks/useT";
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
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const tonic = usePolywaveStore((s) => s.keyInfo.tonic);
  const mode = usePolywaveStore((s) => s.keyInfo.mode);
  const setKey = usePolywaveStore((s) => s.setKey);

  const groups = useMemo(() => allPracticalKeys(), []);
  const currentLabel = `${tonic} ${t(`mode.${mode}`)}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={t("key.select")}
          className="w-full justify-between"
        >
          {currentLabel}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[16rem] p-0" align="start">
        <Command>
          <CommandInput placeholder={t("key.search")} />
          <CommandList>
            <CommandEmpty>{t("key.empty")}</CommandEmpty>
            {MODES.map((m: Mode) => (
              <CommandGroup key={m} heading={t(`mode.${m}`)}>
                {groups[m].map((choice) => {
                  const selected = choice.tonic === tonic && choice.mode === mode;
                  return (
                    <CommandItem
                      key={choice.label}
                      value={`${choice.tonic} ${t(`mode.${m}`)}`}
                      onSelect={() => {
                        setKey(choice.tonic, choice.mode);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(selected ? "opacity-100" : "opacity-0")}
                      />
                      {choice.tonic}
                      <span className="ms-auto text-xs text-muted-foreground">
                        {t(`mode.${m}`)}
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
