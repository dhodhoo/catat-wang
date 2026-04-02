import { formatCurrency } from "@/lib/utils/format";

export function buildTransactionSavedMessage(params: {
  amount: number;
  categoryName: string;
  type: "income" | "expense";
  source?: "receipt" | "text";
  merchantName?: string | null;
}) {
  if (params.source === "receipt") {
    return `Tercatat dari struk: ${params.type === "income" ? "Pemasukan" : "Pengeluaran"} ${formatCurrency(params.amount)}${params.merchantName ? ` di ${params.merchantName}` : ""}. Balas UBAH atau HAPUS bila perlu.`;
  }

  return `Tercatat: ${params.type === "income" ? "Pemasukan" : "Pengeluaran"} ${formatCurrency(params.amount)}, kategori ${params.categoryName}. Balas UBAH atau HAPUS bila perlu.`;
}

export function buildNeedManualAmountMessage() {
  return "Total pada struk belum terbaca. Balas lagi dengan nominal, misalnya: belanja 72500.";
}

export function buildLinkSuccessMessage() {
  return "Nomor WhatsApp berhasil terhubung ke akun Anda. Sekarang Anda bisa langsung kirim transaksi di chat ini.";
}

export function buildLinkInstructionMessage() {
  return 'Nomor ini belum terhubung ke akun. Buka web lalu hubungkan WhatsApp dan kirim kode LINK yang diberikan.';
}
