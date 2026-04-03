"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CashflowBucket } from "@/types/domain";
import { formatCurrency } from "@/lib/utils/format";

export function CashflowChart({ data }: { data: CashflowBucket[] }) {
  if (data.length === 0) {
    return (
      <div className="surface-muted flex min-h-[320px] items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <p className="eyebrow">Belum ada data</p>
          <h2 className="mt-3 text-2xl text-ink">Grafik akan muncul setelah transaksi mulai tercatat.</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Begitu ada pemasukan atau pengeluaran yang masuk, halaman ini akan membantu Anda membaca polanya dengan
            jauh lebih cepat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[320px] w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Arus kas 7 hari terakhir</p>
          <h2 className="mt-3 text-3xl text-ink">Pemasukan dan pengeluaran harian</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gunakan grafik ini untuk melihat ritme uang masuk dan uang keluar tanpa membaca transaksi satu per satu.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="status-chip">
            <span className="h-2.5 w-2.5 rounded-full bg-moss" />
            Pemasukan
          </div>
          <div className="status-chip">
            <span className="h-2.5 w-2.5 rounded-full bg-coral" />
            Pengeluaran
          </div>
        </div>
      </div>

      <ResponsiveContainer height={280} width="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#35594a" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#35594a" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#ef6f52" stopOpacity={0.24} />
              <stop offset="95%" stopColor="#ef6f52" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#e9e0d1" strokeDasharray="4 4" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="label"
            dy={12}
            tick={{ fill: "#667085", fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            tick={{ fill: "#667085", fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
            tickLine={false}
            width={54}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.96)",
              border: "1px solid #ddd4c5",
              borderRadius: "18px",
              boxShadow: "0 18px 40px rgba(16, 24, 40, 0.12)"
            }}
            formatter={(value: number, key: string) => [
              formatCurrency(value),
              key === "incomeTotal" ? "Pemasukan" : "Pengeluaran"
            ]}
            itemStyle={{ color: "#475467", fontSize: "12px" }}
            labelStyle={{ color: "#101828", fontWeight: 600, marginBottom: "6px" }}
          />
          <Area
            animationDuration={600}
            dataKey="incomeTotal"
            fill="url(#incomeFill)"
            stroke="#35594a"
            strokeWidth={2.5}
            type="monotone"
          />
          <Area
            animationDuration={600}
            dataKey="expenseTotal"
            fill="url(#expenseFill)"
            stroke="#ef6f52"
            strokeWidth={2.5}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
