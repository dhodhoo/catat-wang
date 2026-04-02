import { describe, expect, it } from "vitest";
import { computeDedupeHash, normalizeWhatsappPayload } from "@/lib/whatsapp/webhook";

describe("normalizeWhatsappPayload", () => {
  it("normalizes WAHA text messages", () => {
    const result = normalizeWhatsappPayload({
      event: "message",
      payload: {
        id: "wamid.1",
        from: "628123@c.us",
        body: "jajan 25rb",
        timestamp: 1775130000,
        fromMe: false
      }
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.type).toBe("text");
    expect(result[0]?.text).toBe("jajan 25rb");
    expect(result[0]?.from).toBe("+628123");
  });

  it("ignores outbound self messages", () => {
    const result = normalizeWhatsappPayload({
      event: "message.any",
      payload: {
        id: "wamid.2",
        from: "628123@c.us",
        body: "Tercatat",
        timestamp: 1775130000,
        fromMe: true
      }
    });

    expect(result).toHaveLength(0);
  });

  it("creates deterministic dedupe hash", () => {
    expect(computeDedupeHash({ from: "628123", text: "jajan 25rb" })).toBe(
      computeDedupeHash({ from: "628123", text: "jajan 25rb" })
    );
  });
});
