import { formatCurrency } from "@/lib/utils/format";

export function buildTransactionSavedMessage(params: {
  amount: number;
  categoryName: string;
  type: "income" | "expense";
}) {
  return `Tercatat: ${params.type === "income" ? "Pemasukan" : "Pengeluaran"} ${formatCurrency(params.amount)}, kategori ${params.categoryName}. Balas UBAH atau HAPUS bila perlu.`;
}

export function buildLinkSuccessMessage() {
  return "Nomor WhatsApp berhasil terhubung ke akun Anda. Sekarang Anda bisa langsung kirim transaksi di chat ini.";
}

export function buildLinkInstructionMessage() {
  return 'Nomor ini belum terhubung ke akun. Buka web lalu hubungkan WhatsApp dan kirim kode LINK yang diberikan.';
}
