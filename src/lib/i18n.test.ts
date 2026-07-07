import { describe, it, expect } from "vitest";
import {
  translate,
  localizeDigits,
  signatureShort,
  signatureLabel,
} from "./i18n";
import { getKeyInfo } from "./theory";

describe("translation", () => {
  it("interpolates params", () => {
    expect(translate("en", "quiz.bestStreak", { count: 4 })).toBe(
      "Best streak: 4",
    );
  });

  it("renders Persian strings", () => {
    expect(translate("fa", "tab.explore")).toBe("کاوش");
    expect(translate("fa", "mode.aeolian")).toContain("مینور");
  });
});

describe("digits and signatures", () => {
  it("localizes digits only for fa", () => {
    expect(localizeDigits("03:25", "fa")).toBe("۰۳:۲۵");
    expect(localizeDigits("03:25", "en")).toBe("03:25");
  });

  it("builds short signature labels in both locales", () => {
    expect(signatureShort(0, "none", "en")).toBe("None");
    expect(signatureShort(1, "sharps", "en")).toBe("1 sharp");
    expect(signatureShort(3, "flats", "en")).toBe("3 flats");
    expect(signatureShort(3, "flats", "fa")).toBe("۳ بمل");
  });

  it("builds full signature labels from KeyInfo", () => {
    const g = getKeyInfo("G", "ionian");
    expect(signatureLabel(g.signature, "en")).toBe("1 sharp (F♯)");
    expect(signatureLabel(g.signature, "fa")).toBe("۱ دیز (F♯)");
    const c = getKeyInfo("C", "ionian");
    expect(signatureLabel(c.signature, "fa")).toBe("بدون دیز و بمل");
  });
});
