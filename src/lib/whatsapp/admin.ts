import { env } from "@/lib/utils/env";

export class WahaAdminAccessError extends Error {
  constructor() {
    super("Anda tidak memiliki akses ke panel WAHA.");
    this.name = "WahaAdminAccessError";
  }
}

export function parseWahaInternalAdminEmails(raw: string) {
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isWahaInternalAdminEmail(email?: string | null, raw = env.WAHA_INTERNAL_ADMIN_EMAILS) {
  if (!email) {
    return false;
  }

  const allowedEmails = parseWahaInternalAdminEmails(raw);
  return allowedEmails.includes(email.trim().toLowerCase());
}

export function requireWahaInternalAdminEmail(email?: string | null) {
  if (!isWahaInternalAdminEmail(email)) {
    throw new WahaAdminAccessError();
  }
}
