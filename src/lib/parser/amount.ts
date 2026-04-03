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

  const match = lower.match(/([\d.]+)\s*(rb|ribu|k|jt|juta|m|miliar|milyar|b|triliun|t)?(?:\b|$)/i);
  if (!match) {
    return null;
  }

  const numeric = Number(normalizeRawAmount(match[1]));
  const suffix = match[2]?.toLowerCase();

  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  if (suffix === "rb" || suffix === "ribu" || suffix === "k") {
    return Math.round(numeric * 1_000);
  }

  if (suffix === "jt" || suffix === "juta" || suffix === "m") {
    return Math.round(numeric * 1_000_000);
  }

  if (suffix === "miliar" || suffix === "milyar" || suffix === "b") {
    return Math.round(numeric * 1_000_000_000);
  }

  if (suffix === "triliun" || suffix === "t") {
    return Math.round(numeric * 1_000_000_000_000);
  }

  return Math.round(numeric);
}
