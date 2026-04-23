import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("WhatsApp provider config", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...OLD_ENV,
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_INSFORGE_URL: "https://example.ap-southeast.insforge.app",
      INSFORGE_ANON_KEY: "dev-anon-key",
      WAHA_SESSION_NAME: "default"
    };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    vi.restoreAllMocks();
  });

  it("returns missing Baileys config when provider is baileys", async () => {
    process.env.WHATSAPP_PROVIDER = "baileys";
    delete process.env.BAILEYS_BOT_BASE_URL;
    delete process.env.BAILEYS_BOT_API_KEY;

    const { getMissingWhatsAppConfigFields, isWhatsAppConfigured } = await import("@/lib/whatsapp/client");

    expect(getMissingWhatsAppConfigFields()).toEqual([
      "BAILEYS_BOT_BASE_URL",
      "BAILEYS_BOT_API_KEY"
    ]);
    expect(isWhatsAppConfigured()).toBe(false);
  });

  it("returns missing WAHA config when provider is waha", async () => {
    process.env.WHATSAPP_PROVIDER = "waha";
    delete process.env.WAHA_BASE_URL;
    delete process.env.WAHA_API_KEY;

    const { getMissingWhatsAppConfigFields, isWhatsAppConfigured } = await import("@/lib/whatsapp/client");

    expect(getMissingWhatsAppConfigFields()).toEqual(["WAHA_BASE_URL", "WAHA_API_KEY"]);
    expect(isWhatsAppConfigured()).toBe(false);
  });
});
