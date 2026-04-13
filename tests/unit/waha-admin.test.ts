import { describe, expect, it } from "vitest";
import { isWahaInternalAdminEmail, parseWahaInternalAdminEmails } from "@/lib/whatsapp/admin";

describe("parseWahaInternalAdminEmails", () => {
  it("normalizes comma-separated emails", () => {
    expect(parseWahaInternalAdminEmails(" Admin@Example.com, second@example.com , ,third@example.com ")).toEqual([
      "admin@example.com",
      "second@example.com",
      "third@example.com"
    ]);
  });
});

describe("isWahaInternalAdminEmail", () => {
  it("matches emails case-insensitively", () => {
    expect(isWahaInternalAdminEmail("ADMIN@example.com", "admin@example.com,owner@example.com")).toBe(true);
  });

  it("rejects emails that are not allowlisted", () => {
    expect(isWahaInternalAdminEmail("user@example.com", "admin@example.com,owner@example.com")).toBe(false);
  });

  it("rejects empty email values", () => {
    expect(isWahaInternalAdminEmail(undefined, "admin@example.com")).toBe(false);
  });
});
