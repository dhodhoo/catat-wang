import { describe, expect, it } from "vitest";

import { createWebhookSignature, mapBaileysMessageToWahaEvent, toWhatsAppJid } from "../src/helpers.js";

describe("mapBaileysMessageToWahaEvent", () => {
  it("maps incoming text message to WAHA-compatible payload", () => {
    const payload = mapBaileysMessageToWahaEvent({
      key: {
        id: "wamid-test-1",
        remoteJid: "628123456789@s.whatsapp.net",
        fromMe: false
      },
      messageTimestamp: 1775130000,
      message: {
        conversation: "jajan 25rb"
      }
    });

    expect(payload.event).toBe("message");
    expect(payload.payload.from).toBe("628123456789@c.us");
    expect(payload.payload.body).toBe("jajan 25rb");
    expect(payload.payload.id).toBe("wamid-test-1");
  });
});

describe("createWebhookSignature", () => {
  it("produces deterministic sha512 signature", () => {
    const body = JSON.stringify({ event: "message" });
    expect(createWebhookSignature(body, "secret")).toBe(createWebhookSignature(body, "secret"));
  });
});

describe("toWhatsAppJid", () => {
  it("normalizes +62 or 0-prefix phone to s.whatsapp.net jid", () => {
    expect(toWhatsAppJid("08123456789")).toBe("628123456789@s.whatsapp.net");
    expect(toWhatsAppJid("+628123456789")).toBe("628123456789@s.whatsapp.net");
    expect(toWhatsAppJid("628123456789@c.us")).toBe("628123456789@s.whatsapp.net");
  });
});
