import { describe, expect, it } from "vitest";
import { getPhoneLookupVariants, normalizePhone } from "@/lib/whatsapp/client";

describe("normalizePhone", () => {
  it("normalizes Indonesian local numbers to +62", () => {
    expect(normalizePhone("08123456789")).toBe("+628123456789");
  });

  it("keeps international numbers with country code", () => {
    expect(normalizePhone("628123456789")).toBe("+628123456789");
  });
});

describe("getPhoneLookupVariants", () => {
  it("includes legacy and normalized variants for matching old profile rows", () => {
    expect(getPhoneLookupVariants("+628123456789")).toEqual(
      expect.arrayContaining(["+628123456789", "628123456789", "08123456789", "8123456789"])
    );
  });
});
