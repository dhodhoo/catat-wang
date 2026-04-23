import crypto from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function sign(secret: string, payload: string) {
  return crypto.createHmac("sha512", secret).update(payload).digest("hex");
}

describe("verifyWhatsAppSignature", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = {
      ...OLD_ENV,
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      NEXT_PUBLIC_INSFORGE_URL: "https://example.ap-southeast.insforge.app",
      INSFORGE_ANON_KEY: "dev-anon-key",
      WAHA_WEBHOOK_SECRET: "current-secret",
      WAHA_WEBHOOK_SECRET_PREVIOUS: "old-secret"
    };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    vi.restoreAllMocks();
  });

  it("accepts signature with current secret", async () => {
    const payload = JSON.stringify({ event: "message" });
    const { verifyWhatsAppSignature } = await import("@/lib/whatsapp/client");
    expect(verifyWhatsAppSignature(payload, sign("current-secret", payload))).toBe(true);
  });

  it("accepts signature with previous secret during rotation window", async () => {
    const payload = JSON.stringify({ event: "message" });
    const { verifyWhatsAppSignature } = await import("@/lib/whatsapp/client");
    expect(verifyWhatsAppSignature(payload, sign("old-secret", payload))).toBe(true);
  });

  it("rejects invalid signature", async () => {
    const payload = JSON.stringify({ event: "message" });
    const { verifyWhatsAppSignature } = await import("@/lib/whatsapp/client");
    expect(verifyWhatsAppSignature(payload, sign("wrong-secret", payload))).toBe(false);
    expect(verifyWhatsAppSignature(payload, null)).toBe(false);
  });
});
