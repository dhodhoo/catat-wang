import { describe, expect, it } from "vitest";
import { formatCurrencyCompact } from "@/lib/utils/format";

describe("formatCurrencyCompact", () => {
  it("formats zero and small values without suffix", () => {
    expect(formatCurrencyCompact(0)).toBe("Rp0");
    expect(formatCurrencyCompact(999)).toBe("Rp999");
  });

  it("formats thousands, millions, and billions with compact suffix", () => {
    expect(formatCurrencyCompact(1250)).toBe("Rp1,25 K");
    expect(formatCurrencyCompact(1250000)).toBe("Rp1,25 Jt");
    expect(formatCurrencyCompact(1250000000)).toBe("Rp1,25 M");
  });

  it("keeps minus sign for negative values", () => {
    expect(formatCurrencyCompact(-1250000000)).toBe("-Rp1,25 M");
    expect(formatCurrencyCompact(-2500000)).toBe("-Rp2,5 Jt");
  });
});
