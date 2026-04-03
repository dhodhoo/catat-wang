"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CashflowBucket } from "@/types/domain";
import { formatCurrency } from "@/lib/utils/format";

export function CashflowChart({ data }: { data: CashflowBucket[] }) {
  return (
    <div className="h-80 w-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-slate-500">Arus Kas / 7 Hari Terakhir</h2>
          <p className="text-sm font-medium text-slate-300">Perbandingan pemasukan dan pengeluaran Anda.</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono text-slate-400">MASUK</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-[10px] font-mono text-slate-400">KELUAR</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2dd4bf" strokeOpacity={0.05} vertical={false} />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }}
            tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
            itemStyle={{ fontSize: '12px', fontFamily: 'monospace' }}
            formatter={(value: number) => [formatCurrency(value), ""]}
          />
          <Area 
            type="monotone" 
            dataKey="incomeTotal" 
            stroke="#10b981" 
            strokeWidth={2}
            fill="url(#incomeFill)" 
            animationDuration={500}
          />
          <Area 
            type="monotone" 
            dataKey="expenseTotal" 
            stroke="#f43f5e" 
            strokeWidth={2}
            fill="url(#expenseFill)" 
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
