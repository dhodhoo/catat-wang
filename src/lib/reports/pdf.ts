import PDFDocument from "pdfkit";
import type { MonthlyReport } from "@/types/domain";
import type { MonthlyReportTransactionRow } from "@/lib/reports/service";
import { formatCurrency } from "@/lib/utils/format";

export function getMonthPeriodFromMonthYear(monthYear: string) {
  const date = new Date(monthYear);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Format month_year tidak valid.");
  }

  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  const periodLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta"
  }).format(new Date(startDate));

  return { startDate, endDate, periodLabel };
}

export interface PdfTransactionRow {
  date: string;
  typeLabel: string;
  categoryName: string;
  amountLabel: string;
  note: string;
}

export function mapTransactionsToPdfRows(transactions: MonthlyReportTransactionRow[]): PdfTransactionRow[] {
  return transactions.map((tx) => {
    const date = new Date(tx.transaction_date);
    const dateLabel = Number.isNaN(date.getTime())
      ? tx.transaction_date
      : new Intl.DateTimeFormat("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Jakarta"
        }).format(date);

    return {
      date: dateLabel,
      typeLabel: tx.type === "income" ? "Pemasukan" : "Pengeluaran",
      categoryName: tx.categories?.name || "Lainnya",
      amountLabel: formatCurrency(Number(tx.amount || 0)),
      note: tx.note?.trim() || "-"
    };
  });
}

function drawKeyValue(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number) {
  doc.fontSize(9).fillColor("#64748B").text(label, x, y);
  doc.fontSize(14).fillColor("#0F172A").text(value, x, y + 14);
}

export async function renderMonthlyReportPdf(params: {
  report: MonthlyReport;
  userName?: string | null;
  periodLabel: string;
  transactions: MonthlyReportTransactionRow[];
}) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: Buffer[] = [];

  return await new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const { report, periodLabel, userName } = params;
    const rows = mapTransactionsToPdfRows(params.transactions);

    doc.fontSize(20).fillColor("#0F172A").text("Laporan Keuangan Bulanan", { align: "left" });
    doc.moveDown(0.4);
    doc.fontSize(11).fillColor("#334155").text(`Periode: ${periodLabel}`);
    doc.fontSize(11).fillColor("#334155").text(`Pengguna: ${userName || "Pengguna CatatWang"}`);
    doc.fontSize(10).fillColor("#64748B").text(`Diunduh: ${new Date().toLocaleString("id-ID")}`);

    doc.moveDown(1);
    const summaryTop = doc.y;
    drawKeyValue(doc, "Total Pemasukan", formatCurrency(report.total_income), 40, summaryTop);
    drawKeyValue(doc, "Total Pengeluaran", formatCurrency(report.total_expense), 220, summaryTop);
    drawKeyValue(doc, "Selisih Bersih", formatCurrency(report.net_cashflow), 400, summaryTop);

    doc.y = summaryTop + 48;
    drawKeyValue(doc, "Jumlah Transaksi", String(report.transaction_count), 40, doc.y);

    doc.moveDown(2);
    doc.fontSize(13).fillColor("#0F172A").text("Top Kategori Pengeluaran");
    if (report.top_categories.length === 0) {
      doc.moveDown(0.4);
      doc.fontSize(10).fillColor("#64748B").text("Tidak ada data kategori.");
    } else {
      doc.moveDown(0.4);
      for (const category of report.top_categories) {
        doc
          .fontSize(10)
          .fillColor("#334155")
          .text(
            `${category.name}: ${formatCurrency(category.amount)} (${category.percentage.toFixed(1)}%)`
          );
      }
    }

    doc.moveDown(1.2);
    doc.fontSize(13).fillColor("#0F172A").text("Daftar Transaksi");
    doc.moveDown(0.4);

    const tableHeaders = ["Tanggal", "Tipe", "Kategori", "Nominal", "Catatan"];
    const colX = [40, 120, 200, 320, 420];

    const drawHeader = () => {
      doc.fontSize(9).fillColor("#0F172A");
      tableHeaders.forEach((header, i) => doc.text(header, colX[i], doc.y));
      doc.moveDown(0.5);
      doc
        .moveTo(40, doc.y)
        .lineTo(555, doc.y)
        .strokeColor("#CBD5E1")
        .stroke();
      doc.moveDown(0.4);
    };

    drawHeader();

    for (const row of rows) {
      if (doc.y > 760) {
        doc.addPage();
        drawHeader();
      }

      const startY = doc.y;
      doc.fontSize(9).fillColor("#1E293B").text(row.date, colX[0], startY, { width: 75 });
      doc.text(row.typeLabel, colX[1], startY, { width: 75 });
      doc.text(row.categoryName, colX[2], startY, { width: 110 });
      doc.text(row.amountLabel, colX[3], startY, { width: 90 });
      doc.text(row.note, colX[4], startY, { width: 130 });

      const consumed = Math.max(
        doc.heightOfString(row.date, { width: 75 }),
        doc.heightOfString(row.typeLabel, { width: 75 }),
        doc.heightOfString(row.categoryName, { width: 110 }),
        doc.heightOfString(row.amountLabel, { width: 90 }),
        doc.heightOfString(row.note, { width: 130 })
      );
      doc.y = startY + consumed + 6;
    }

    doc.end();
  });
}
