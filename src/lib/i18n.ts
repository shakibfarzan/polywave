/**
 * i18n.ts — lightweight typed internationalization (English + Persian).
 *
 * No library: two flat dictionaries, a typed t() with {param} interpolation,
 * and locale-aware number/digit helpers. Persian is RTL — the store applies
 * dir/lang on <html> when the locale changes.
 */

export type Locale = "en" | "fa";

export const LOCALES: Locale[] = ["en", "fa"];

const en = {
  // App shell
  "app.tagline": "Circle-of-fifths practice tool",
  "footer.text": "Polywave · Web App for music learners",
  "tab.explore": "Explore",
  "tab.practice": "Practice",
  "tab.build": "Build",
  "tab.quiz": "Quiz",
  "tab.stats": "Stats",
  "header.settings": "Open settings",
  "header.theme": "Toggle dark mode",
  "header.language": "Language",

  // Modes
  "mode.ionian": "Ionian (Major)",
  "mode.dorian": "Dorian",
  "mode.phrygian": "Phrygian",
  "mode.lydian": "Lydian",
  "mode.mixolydian": "Mixolydian",
  "mode.aeolian": "Aeolian (Minor)",
  "mode.locrian": "Locrian",

  // Key & signature
  "key.select": "Select key and mode",
  "key.search": "Search key or mode…",
  "key.empty": "No key found.",
  "key.relativeMinor": "Relative minor",
  "key.relativeMajor": "Relative major",
  "key.keyOf": "Key of",
  "sig.none": "no sharps or flats",
  "sig.sharpOne": "1 sharp",
  "sig.sharpMany": "{count} sharps",
  "sig.flatOne": "1 flat",
  "sig.flatMany": "{count} flats",
  "sig.shortNone": "None",

  // Circle
  "circle.aria": "Circle of fifths, key of {key}",
  "circle.hint":
    "Click any note to hear it. Tab to the circle and use the arrow keys to move between notes.",
  "note.notInKey": "Not in key",
  "note.degreeRoman": "Degree {degree} · {roman}",
  "note.asMajor": "As major key: {sig}",
  "aria.noteOut": "{note}, not in the current key. Press Enter to play.",
  "aria.noteIn": "{note}, {role}, {quality} chord {roman}. Press Enter to play.",
  "aria.tonic": "tonic",
  "aria.degree": "scale degree {degree}",

  // Overlays & tools
  "overlay.title": "Note labels",
  "overlay.off": "Off",
  "overlay.degrees": "Degrees",
  "overlay.roman": "Roman",
  "ring.title": "Chord ring",
  "ring.off": "Off",
  "ring.diatonic": "Diatonic",
  "ring.secondary": "Sec. dom.",
  "ring.borrowed": "Borrowed",
  "ring.triads": "Triads",
  "ring.sevenths": "7ths",
  "neighbors.button": "Neighbor keys",
  "rel.dominant": "Dominant",
  "rel.subdominant": "Subdominant",
  "rel.relativeMinor": "Relative minor",
  "rel.relativeMajor": "Relative major",
  "rel.key": "{rel} key",
  "chord.borrowedFrom": "Borrowed from {key}",
  "chord.dominantOf": "Dominant of {target} ({roman})",
  "chord.aria": "{symbol} chord, {label}",

  // Playback
  "playback.play": "Play scale",
  "playback.stop": "Stop",
  "playback.direction": "Scale direction",
  "playback.asc": "Ascending",
  "playback.desc": "Descending",
  "playback.tempoAria": "Tempo in beats per minute",
  "playback.bpm": "{bpm} BPM",

  // Metronome & timer
  "metronome.title": "Metronome",
  "metronome.start": "Start metronome",
  "metronome.stop": "Stop metronome",
  "timer.title": "Practice timer",
  "timer.aria": "Practice time",
  "timer.start": "Start timer",
  "timer.pause": "Pause timer",
  "timer.reset": "Reset timer",

  // Progression builder
  "prog.add": "Add steps",
  "prog.recording": "Recording…",
  "prog.play": "Play",
  "prog.stop": "Stop",
  "prog.clear": "Clear",
  "prog.midi": "MIDI",
  "prog.exportAria": "Export progression as a MIDI file",
  "prog.hintOn": "Tap notes or chord-ring chords on the circle to add them.",
  "prog.hintOff": "Turn on “Add steps”, then tap the circle to build a progression.",
  "prog.empty": "No steps yet.",
  "prog.remove": "Remove {label}",

  // Quiz
  "quiz.title": "Key-signature quiz",
  "quiz.subtitle": "Drill key signatures both ways — pick a direction to begin.",
  "quiz.sigToKey": "Signature → Key",
  "quiz.keyToCount": "Key → Accidental count",
  "quiz.bestStreak": "Best streak: {count}",
  "quiz.score": "Score:",
  "quiz.streak": "Streak:",
  "quiz.best": "Best: {count}",
  "quiz.promptSig": "Which major key has {sig}?",
  "quiz.promptCount": "How many sharps or flats does {key} have?",
  "quiz.accuracyAria": "Accuracy",
  "quiz.end": "End quiz",
  "quiz.next": "Next question",

  // MIDI
  "midi.unsupported": "Web MIDI isn't supported in this browser (try Chrome or Edge).",
  "midi.connect": "Connect a MIDI keyboard",
  "midi.connecting": "Connecting…",
  "midi.error": "MIDI access failed — check the browser permission and try again.",
  "midi.disconnect": "Disconnect",
  "midi.disconnectAria": "Disconnect MIDI",
  "midi.noDevice": "No device — plug one in",
  "midi.hint": "Play some notes — held chords light up matching keys on the circle.",
  "midi.diatonicIn": "{chord} ({quality}) is diatonic in {list}",
  "midi.matchItem": "{tonic} major ({roman})",

  // Chord qualities
  "quality.major": "major",
  "quality.minor": "minor",
  "quality.diminished": "diminished",
  "quality.augmented": "augmented",
  "quality.major 7th": "major 7th",
  "quality.dominant 7th": "dominant 7th",
  "quality.minor 7th": "minor 7th",
  "quality.half-diminished 7th": "half-diminished 7th",
  "quality.diminished 7th": "diminished 7th",
  "quality.minor-major 7th": "minor-major 7th",
  "quality.augmented 7th": "augmented 7th",
  "quality.augmented-major 7th": "augmented-major 7th",

  // Settings
  "settings.title": "Settings",
  "settings.note": "Preferences are saved on this device.",
  "settings.dark": "Dark mode",
  "settings.darkHint": "Follow the switch, not the sun.",
  "settings.language": "Language",
  "settings.notation": "Accidental notation",
  "settings.notationHint":
    "How out-of-key notes are written (in-key spelling always follows the key).",
  "settings.notationBoth": "Both",
  "settings.notationSharps": "♯ Sharps",
  "settings.notationFlats": "♭ Flats",
  "settings.instrument": "Instrument",
  "instrument.classic": "Classic (triangle)",
  "instrument.soft": "Soft (sine)",
  "instrument.bright": "Bright (sawtooth)",
  "instrument.retro": "Retro (square)",
  "instrument.epiano": "E-piano (FM)",

  // Stats
  "stats.accuracy": "Quiz accuracy",
  "stats.accuracyEmpty": "No questions answered yet",
  "stats.accuracyDetail": "{correct} of {total} correct",
  "stats.bestQuiz": "Best quiz streak",
  "stats.bestQuizDetail": "Right answers in a row",
  "stats.dayStreak": "Day streak",
  "stats.dayStreakEmpty": "Practice to start a streak",
  "stats.lastPractice": "Last practice: {date}",
  "stats.practiceTime": "Practice time",
  "stats.practiceDetail": "Tracked by the practice timer",
  "stats.sounds": "Sounds played",
  "stats.soundsDetail": "{notes} notes · {chords} chords · {scales} scales",
  "stats.reset": "Reset stats",

  // Panels
  "panel.key": "Key",
  "panel.display": "Display",
  "panel.sound": "Sound",
  "panel.progression": "Progression",
  "panel.midi": "MIDI input",
};

export type TranslationKey = keyof typeof en;

const fa: Record<TranslationKey, string> = {
  "app.tagline": "ابزار تمرین دایرهٔ پنجم‌ها",
  "footer.text": "پلی‌ویو · وب‌اپ برای موسیقی‌آموزان",
  "tab.explore": "کاوش",
  "tab.practice": "تمرین",
  "tab.build": "ساخت",
  "tab.quiz": "آزمون",
  "tab.stats": "آمار",
  "header.settings": "بازکردن تنظیمات",
  "header.theme": "تغییر حالت تاریک",
  "header.language": "زبان",

  "mode.ionian": "ایونین (ماژور)",
  "mode.dorian": "دورین",
  "mode.phrygian": "فریژین",
  "mode.lydian": "لیدین",
  "mode.mixolydian": "میکسولیدین",
  "mode.aeolian": "ائولین (مینور)",
  "mode.locrian": "لوکرین",

  "key.select": "انتخاب گام و مُد",
  "key.search": "جست‌وجوی گام یا مُد…",
  "key.empty": "گامی پیدا نشد.",
  "key.relativeMinor": "مینورِ نسبی",
  "key.relativeMajor": "ماژورِ نسبی",
  "key.keyOf": "گامِ",
  "sig.none": "بدون دیز و بمل",
  "sig.sharpOne": "۱ دیز",
  "sig.sharpMany": "{count} دیز",
  "sig.flatOne": "۱ بمل",
  "sig.flatMany": "{count} بمل",
  "sig.shortNone": "هیچ",

  "circle.aria": "دایرهٔ پنجم‌ها، گام {key}",
  "circle.hint":
    "روی هر نت بزنید تا صدایش را بشنوید. با Tab به دایره بروید و با کلیدهای جهت‌دار بین نت‌ها حرکت کنید.",
  "note.notInKey": "خارج از گام",
  "note.degreeRoman": "درجهٔ {degree} · {roman}",
  "note.asMajor": "به‌عنوان گام ماژور: {sig}",
  "aria.noteOut": "{note}، خارج از گام فعلی. برای پخش Enter را بزنید.",
  "aria.noteIn": "{note}، {role}، آکورد {quality} {roman}. برای پخش Enter را بزنید.",
  "aria.tonic": "تونیک",
  "aria.degree": "درجهٔ {degree} گام",

  "overlay.title": "برچسب نت‌ها",
  "overlay.off": "خاموش",
  "overlay.degrees": "درجه‌ها",
  "overlay.roman": "رومی",
  "ring.title": "حلقهٔ آکورد",
  "ring.off": "خاموش",
  "ring.diatonic": "دیاتونیک",
  "ring.secondary": "دومینانت ثانویه",
  "ring.borrowed": "قرضی",
  "ring.triads": "سه‌صدایی",
  "ring.sevenths": "هفتم",
  "neighbors.button": "گام‌های همسایه",
  "rel.dominant": "دومینانت",
  "rel.subdominant": "سابدومینانت",
  "rel.relativeMinor": "مینورِ نسبی",
  "rel.relativeMajor": "ماژورِ نسبی",
  "rel.key": "گام {rel}",
  "chord.borrowedFrom": "قرضی از {key}",
  "chord.dominantOf": "دومینانتِ {target} ({roman})",
  "chord.aria": "آکورد {symbol}، {label}",

  "playback.play": "پخش گام",
  "playback.stop": "توقف",
  "playback.direction": "جهت گام",
  "playback.asc": "بالارونده",
  "playback.desc": "پایین‌رونده",
  "playback.tempoAria": "سرعت بر حسب ضرب در دقیقه",
  "playback.bpm": "{bpm} ضرب/دقیقه",

  "metronome.title": "مترونوم",
  "metronome.start": "شروع مترونوم",
  "metronome.stop": "توقف مترونوم",
  "timer.title": "زمان‌سنج تمرین",
  "timer.aria": "زمان تمرین",
  "timer.start": "شروع زمان‌سنج",
  "timer.pause": "توقف موقت",
  "timer.reset": "صفر کردن",

  "prog.add": "افزودن گام‌ها",
  "prog.recording": "در حال ضبط…",
  "prog.play": "پخش",
  "prog.stop": "توقف",
  "prog.clear": "پاک کردن",
  "prog.midi": "MIDI",
  "prog.exportAria": "خروجی گرفتن از پیشرفت به‌صورت فایل MIDI",
  "prog.hintOn": "برای افزودن، روی نت‌ها یا آکوردهای حلقه بزنید.",
  "prog.hintOff": "«افزودن گام‌ها» را روشن کنید و بعد روی دایره بزنید تا توالی بسازید.",
  "prog.empty": "هنوز مرحله‌ای نیست.",
  "prog.remove": "حذف {label}",

  "quiz.title": "آزمون سرکلید",
  "quiz.subtitle": "سرکلیدها را از هر دو سو تمرین کنید — یک جهت را انتخاب کنید.",
  "quiz.sigToKey": "سرکلید ← گام",
  "quiz.keyToCount": "گام ← تعداد علامت‌ها",
  "quiz.bestStreak": "بهترین زنجیره: {count}",
  "quiz.score": "امتیاز:",
  "quiz.streak": "زنجیره:",
  "quiz.best": "بهترین: {count}",
  "quiz.promptSig": "کدام گام ماژور {sig} دارد؟",
  "quiz.promptCount": "گام {key} چند دیز یا بمل دارد؟",
  "quiz.accuracyAria": "دقت",
  "quiz.end": "پایان آزمون",
  "quiz.next": "سؤال بعدی",

  "midi.unsupported": "این مرورگر از Web MIDI پشتیبانی نمی‌کند (Chrome یا Edge را امتحان کنید).",
  "midi.connect": "اتصال کیبورد MIDI",
  "midi.connecting": "در حال اتصال…",
  "midi.error": "دسترسی MIDI ناموفق بود — مجوز مرورگر را بررسی و دوباره تلاش کنید.",
  "midi.disconnect": "قطع اتصال",
  "midi.disconnectAria": "قطع اتصال MIDI",
  "midi.noDevice": "دستگاهی نیست — یکی وصل کنید",
  "midi.hint": "چند نت بزنید — آکوردهای نگه‌داشته، گام‌های هم‌خوان را روی دایره روشن می‌کنند.",
  "midi.diatonicIn": "{chord} ({quality}) در {list} دیاتونیک است",
  "midi.matchItem": "{tonic} ماژور ({roman})",

  "quality.major": "ماژور",
  "quality.minor": "مینور",
  "quality.diminished": "کاسته",
  "quality.augmented": "افزوده",
  "quality.major 7th": "هفتمِ ماژور",
  "quality.dominant 7th": "هفتمِ دومینانت",
  "quality.minor 7th": "هفتمِ مینور",
  "quality.half-diminished 7th": "هفتمِ نیم‌کاسته",
  "quality.diminished 7th": "هفتمِ کاسته",
  "quality.minor-major 7th": "هفتمِ مینور-ماژور",
  "quality.augmented 7th": "هفتمِ افزوده",
  "quality.augmented-major 7th": "هفتمِ افزوده-ماژور",

  "settings.title": "تنظیمات",
  "settings.note": "ترجیح‌ها روی همین دستگاه ذخیره می‌شوند.",
  "settings.dark": "حالت تاریک",
  "settings.darkHint": "شب و روزش با این کلید است.",
  "settings.language": "زبان",
  "settings.notation": "نگارش علامت‌ها",
  "settings.notationHint":
    "شیوهٔ نمایش نت‌های خارج از گام (نت‌های داخل گام همیشه مطابق گام نوشته می‌شوند).",
  "settings.notationBoth": "هر دو",
  "settings.notationSharps": "♯ دیز",
  "settings.notationFlats": "♭ بمل",
  "settings.instrument": "ساز",
  "instrument.classic": "کلاسیک (مثلثی)",
  "instrument.soft": "نرم (سینوسی)",
  "instrument.bright": "درخشان (اره‌ای)",
  "instrument.retro": "رترو (مربعی)",
  "instrument.epiano": "پیانو الکتریک (FM)",

  "stats.accuracy": "دقت آزمون",
  "stats.accuracyEmpty": "هنوز به سؤالی پاسخ نداده‌اید",
  "stats.accuracyDetail": "{correct} از {total} درست",
  "stats.bestQuiz": "بهترین زنجیرهٔ آزمون",
  "stats.bestQuizDetail": "پاسخ‌های درستِ پشت‌سرهم",
  "stats.dayStreak": "روزهای پیاپی",
  "stats.dayStreakEmpty": "برای شروعِ زنجیره تمرین کنید",
  "stats.lastPractice": "آخرین تمرین: {date}",
  "stats.practiceTime": "زمان تمرین",
  "stats.practiceDetail": "با زمان‌سنج تمرین ثبت می‌شود",
  "stats.sounds": "صداهای پخش‌شده",
  "stats.soundsDetail": "{notes} نت · {chords} آکورد · {scales} گام",
  "stats.reset": "صفر کردن آمار",

  "panel.key": "گام",
  "panel.display": "نمایش",
  "panel.sound": "صدا",
  "panel.progression": "توالی آکورد",
  "panel.midi": "ورودی MIDI",
};

const DICTIONARIES: Record<Locale, Record<TranslationKey, string>> = { en, fa };

export type TParams = Record<string, string | number>;

/** Translate a key in the given locale, interpolating {param} placeholders. */
export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: TParams,
): string {
  let text = DICTIONARIES[locale][key] ?? en[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

export type Translator = (key: TranslationKey, params?: TParams) => string;

export function getTranslator(locale: Locale): Translator {
  return (key, params) => translate(locale, key, params);
}

// --- Numbers & digits --------------------------------------------------------

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Replace ASCII digits with Persian digits when the locale is fa. */
export function localizeDigits(text: string, locale: Locale): string {
  if (locale !== "fa") return text;
  return text.replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

/** Locale-aware plain number formatting. */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US").format(value);
}

/** Join a list with the locale's comma. */
export function listJoin(items: string[], locale: Locale): string {
  return items.join(locale === "fa" ? "، " : ", ");
}

// --- Music-label helpers -------------------------------------------------------

import type { KeySignature } from "./theory";

/** Localized full signature description, e.g. "2 sharps (F♯, C♯)" / "۲ دیز (F♯, C♯)". */
export function signatureLabel(
  signature: KeySignature,
  locale: Locale,
): string {
  const t = getTranslator(locale);
  const isSharps = "sharps" in signature;
  const list = isSharps ? signature.sharps : signature.flats;
  if (list.length === 0) return t("sig.none");
  const countText =
    list.length === 1
      ? t(isSharps ? "sig.sharpOne" : "sig.flatOne")
      : t(isSharps ? "sig.sharpMany" : "sig.flatMany", {
          count: formatNumber(list.length, locale),
        });
  return `${countText} (${list.join(locale === "fa" ? "، " : ", ")})`;
}

/** Short signature label for quiz options, e.g. "3 flats" / "۳ بمل" / "None". */
export function signatureShort(
  count: number,
  acc: "sharps" | "flats" | "none",
  locale: Locale,
): string {
  const t = getTranslator(locale);
  if (acc === "none" || count === 0) return t("sig.shortNone");
  if (count === 1) return t(acc === "sharps" ? "sig.sharpOne" : "sig.flatOne");
  return t(acc === "sharps" ? "sig.sharpMany" : "sig.flatMany", {
    count: formatNumber(count, locale),
  });
}
