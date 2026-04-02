import type { TransactionType } from "@/types/domain";

const expenseKeywords: Record<string, string> = {
  jajan: "Makan & Minum",
  makan: "Makan & Minum",
  kopi: "Makan & Minum",
  parkir: "Transportasi",
  bensin: "Transportasi",
  listrik: "Tagihan",
  pulsa: "Tagihan",
  belanja: "Belanja",
  dokter: "Kesehatan",
  sekolah: "Pendidikan"
};

const incomeKeywords: Record<string, string> = {
  gaji: "Gaji",
  bonus: "Bonus",
  freelance: "Bonus",
  komisi: "Bonus"
};

export function inferTransactionType(text: string): TransactionType {
  const lower = text.toLowerCase();
  if (/(gaji|bonus|masuk|diterima|pendapatan)/i.test(lower)) {
    return "income";
  }
  return "expense";
}

export function inferCategoryName(text: string, type: TransactionType) {
  const lower = text.toLowerCase();
  const source = type === "income" ? incomeKeywords : expenseKeywords;

  for (const [keyword, category] of Object.entries(source)) {
    if (lower.includes(keyword)) {
      return {
        categoryName: category,
        isConfident: true
      };
    }
  }

  return {
    categoryName: "Lainnya",
    isConfident: false
  };
}
