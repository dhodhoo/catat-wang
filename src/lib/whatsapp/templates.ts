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

export function buildMixedBatchInstructionMessage(message?: string) {
  return message ?? "Format pesan campuran tidak didukung. Pisahkan command dan transaksi ke pesan terpisah.";
}

export function buildBatchTransactionSummaryMessage(params: {
  successes: Array<{
    raw: string;
    amount: number;
    categoryName: string;
    type: "income" | "expense";
  }>;
  failures: Array<{ raw: string; reason: string }>;
}) {
  const lines: string[] = [];
  lines.push("Ringkasan pencatatan transaksi:");
  lines.push(`Berhasil: ${params.successes.length}`);
  lines.push(`Gagal: ${params.failures.length}`);

  if (params.successes.length > 0) {
    lines.push("");
    lines.push("Transaksi berhasil:");
    for (const item of params.successes.slice(0, 5)) {
      lines.push(
        `- ${item.type === "income" ? "Pemasukan" : "Pengeluaran"} ${formatCurrency(item.amount)} (${item.categoryName})`
      );
    }
  }

  if (params.failures.length > 0) {
    lines.push("");
    lines.push("Transaksi gagal:");
    for (const item of params.failures.slice(0, 5)) {
      lines.push(`- "${item.raw}" -> ${item.reason}`);
    }
  }

  return lines.join("\n");
}
