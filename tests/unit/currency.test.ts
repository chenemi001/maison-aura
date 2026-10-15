import { describe, expect, it } from "vitest";
import { formatPrice, fromMinorUnits, toDecimalString, toMinorUnits } from "@/app/lib/currency";

describe("formatPrice", () => {
  it("formats kobo as whole Naira by default", () => {
    expect(formatPrice(6_800_000)).toBe("₦68,000");
    expect(formatPrice(350_000)).toBe("₦3,500");
    expect(formatPrice(0)).toBe("₦0");
  });

  it("keeps kobo when an amount is not a whole Naira", () => {
    expect(formatPrice(123_456_789)).toBe("₦1,234,567.89");
  });

  it("supports other currencies (case-insensitive codes)", () => {
    expect(formatPrice(1050, "eur", "en-IE")).toBe("€10.50");
    expect(formatPrice(1000, "USD", "en-US")).toBe("$10");
  });

  it("rejects non-finite amounts", () => {
    expect(() => formatPrice(Number.NaN)).toThrow(RangeError);
    expect(() => formatPrice(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });
});

describe("minor unit conversion", () => {
  it("converts without floating point drift", () => {
    expect(toMinorUnits(0.1 + 0.2)).toBe(30);
    expect(toMinorUnits(19.99)).toBe(1999);
    expect(toMinorUnits(1.005)).toBe(100);
  });

  it("round-trips", () => {
    expect(fromMinorUnits(toMinorUnits(42.5))).toBe(42.5);
  });

  it("produces schema.org-friendly decimal strings", () => {
    expect(toDecimalString(6_800_000)).toBe("68000.00");
    expect(toDecimalString(5)).toBe("0.05");
  });
});
