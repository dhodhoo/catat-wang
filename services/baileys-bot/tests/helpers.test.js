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

  it("maps LID sender to phone-number JID when senderPn exists", () => {
    const payload = mapBaileysMessageToWahaEvent({
      key: {
        id: "wamid-test-lid",
        remoteJid: "1837291029384756@lid",
        senderPn: "628111222333@s.whatsapp.net",
        fromMe: false
      },
      messageTimestamp: 1775130000,
      message: {
        conversation: "belanja 10k"
      }
    });

    expect(payload.payload.from).toBe("628111222333@c.us");
    expect(payload.payload.chatId).toBe("628111222333@c.us");
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

  it("passes through LID jid for reply targets", () => {
    expect(toWhatsAppJid("1837291029384756@lid")).toBe("1837291029384756@lid");
  });
});
