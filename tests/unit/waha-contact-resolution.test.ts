import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("resolveWahaPhone", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.WAHA_BASE_URL = "http://localhost:3001";
    process.env.WAHA_API_KEY = "test-key";
    process.env.WAHA_SESSION_NAME = "default";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns normalized phone directly for c.us chat ids", async () => {
    const { resolveWahaPhone } = await import("@/lib/whatsapp/client");
    await expect(resolveWahaPhone("628123456789@c.us")).resolves.toBe("+628123456789");
  });

  it("resolves lid chat ids through WAHA contacts endpoint", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          id: "6287709206850@c.us",
          number: "6287709206850"
        })
      })
    );

    const { resolveWahaPhone } = await import("@/lib/whatsapp/client");
    await expect(resolveWahaPhone("149185772949671@lid")).resolves.toBe("+6287709206850");
  });
});
