import { usePolywaveStore } from "@/lib/store";
import {
  formatNumber,
  getTranslator,
  listJoin,
  localizeDigits,
  signatureLabel,
  signatureShort,
  type Locale,
  type Translator,
} from "@/lib/i18n";
import type { KeySignature } from "@/lib/theory";

export interface I18nApi {
  t: Translator;
  locale: Locale;
  isRtl: boolean;
  /** Locale-aware number. */
  n: (value: number) => string;
  /** Persian digits in composed strings (timers, "3/5", …). */
  digits: (text: string) => string;
  join: (items: string[]) => string;
  sig: (signature: KeySignature) => string;
  sigShort: (count: number, acc: "sharps" | "flats" | "none") => string;
}

/** One hook returning the translator plus the locale-aware format helpers. */
export function useT(): I18nApi {
  const locale = usePolywaveStore((s) => s.locale);
  return {
    t: getTranslator(locale),
    locale,
    isRtl: locale === "fa",
    n: (value) => formatNumber(value, locale),
    digits: (text) => localizeDigits(text, locale),
    join: (items) => listJoin(items, locale),
    sig: (signature) => signatureLabel(signature, locale),
    sigShort: (count, acc) => signatureShort(count, acc, locale),
  };
}
