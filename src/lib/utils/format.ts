export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  const absoluteAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const compactNumber = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2
  });

  if (absoluteAmount >= 1_000_000_000) {
    return `${sign}Rp${compactNumber.format(absoluteAmount / 1_000_000_000)} M`;
  }

  if (absoluteAmount >= 1_000_000) {
    return `${sign}Rp${compactNumber.format(absoluteAmount / 1_000_000)} Jt`;
  }

  if (absoluteAmount >= 1_000) {
    return `${sign}Rp${compactNumber.format(absoluteAmount / 1_000)} K`;
  }

  const integerFormatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0
  });
  return `${sign}Rp${integerFormatter.format(absoluteAmount)}`;
}

export function formatDateLabel(date: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function formatTimeLabel(dateTime: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(dateTime));
}
