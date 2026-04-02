const slangMap: Record<string, number> = {
  ceban: 10000,
  gocap: 50000
};

function normalizeRawAmount(raw: string) {
  return raw
    .toLowerCase()
    .replace(/rp/gi, "")
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .replace(/,/g, "");
}

export function extractAmountFromText(text: string): number | null {
  const lower = text.toLowerCase();

  for (const [slang, value] of Object.entries(slangMap)) {
    if (lower.includes(slang)) {
      return value;
    }
  }

  const match = lower.match(/(\d+)\s*(rb|ribu|jt|juta)?/i);
  if (!match) {
    return null;
  }

  const numeric = Number(normalizeRawAmount(match[1]));
  const suffix = match[2]?.toLowerCase();

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  if (suffix === "rb" || suffix === "ribu") {
    return numeric * 1000;
  }

  if (suffix === "jt" || suffix === "juta") {
    return numeric * 1000000;
  }

  return numeric;
}
