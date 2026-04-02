"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CashflowBucket } from "@/types/domain";
import { formatCurrency } from "@/lib/utils/format";

export function CashflowChart({ data }: { data: CashflowBucket[] }) {
  return (
    <div className="h-80 rounded-[1.75rem] bg-white p-6 shadow-card">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Cashflow 7 hari terakhir</h2>
        <p className="text-sm text-slate-500">Ringkasan pemasukan, pengeluaran, dan selisih.</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#35594a" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#35594a" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#ef6f52" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#ef6f52" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="label" />
          <YAxis tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Area type="monotone" dataKey="incomeTotal" stroke="#35594a" fill="url(#incomeFill)" />
          <Area type="monotone" dataKey="expenseTotal" stroke="#ef6f52" fill="url(#expenseFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
