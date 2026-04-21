import { formatInTimeZone } from "date-fns-tz";

function shiftDateString(baseDate: string, days: number) {
  const utcMidnight = new Date(`${baseDate}T00:00:00Z`);
  utcMidnight.setUTCDate(utcMidnight.getUTCDate() + days);
  return utcMidnight.toISOString().slice(0, 10);
}

export function resolveTransactionDate(rawText: string, receivedAt: Date, timezone: string) {
  const lower = rawText.toLowerCase();
  const baseDate = formatInTimeZone(receivedAt, timezone, "yyyy-MM-dd");

  if (lower.includes("kemarin")) {
    return shiftDateString(baseDate, -1);
  }

  return baseDate;
}
