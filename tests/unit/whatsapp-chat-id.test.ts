import { describe, expect, it } from "vitest";
import { fromWahaChatId } from "@/lib/whatsapp/client";

describe("fromWahaChatId", () => {
  it("strips device suffix from Baileys me.id format", () => {
    expect(fromWahaChatId("6285861533710:8@s.whatsapp.net")).toBe("+6285861533710");
  });

  it("keeps normal chat id conversion working", () => {
    expect(fromWahaChatId("6285861533710@c.us")).toBe("+6285861533710");
  });
});
