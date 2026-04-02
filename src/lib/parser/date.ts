import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export function resolveTransactionDate(rawText: string, receivedAt: Date, timezone: string) {
  const lower = rawText.toLowerCase();
  const base = fromZonedTime(receivedAt, timezone);

  if (lower.includes("kemarin")) {
    const yesterday = new Date(base);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return formatInTimeZone(yesterday, timezone, "yyyy-MM-dd");
  }

  return formatInTimeZone(base, timezone, "yyyy-MM-dd");
}
