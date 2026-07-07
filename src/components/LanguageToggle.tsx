import { usePolywaveStore } from "@/lib/store";
import type { Locale } from "@/lib/i18n";
import { useT } from "@/hooks/useT";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function LanguageToggle() {
  const { t } = useT();
  const locale = usePolywaveStore((s) => s.locale);
  const setLocale = usePolywaveStore((s) => s.setLocale);

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={locale}
      onValueChange={(v) => v && setLocale(v as Locale)}
      aria-label={t("header.language")}
    >
      <ToggleGroupItem value="en" className="px-2.5 font-semibold">
        EN
      </ToggleGroupItem>
      <ToggleGroupItem value="fa" className="px-2.5 font-semibold">
        فا
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
