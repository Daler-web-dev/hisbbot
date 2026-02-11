"use client";

import type { Summary } from "@/types/dashboard";
import { formatSum } from "@/lib/format";

interface SummaryCardProps {
  data: Summary;
}

export function SummaryCard({ data }: SummaryCardProps) {
  const balanceFormatted = formatSum(data.balance);
  return (
    <div className="space-y-4 mb-8">
      {/* Hero Balance Card */}
      <div className="relative overflow-hidden mesh-gradient rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-500/20">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-2">
            Ваш баланс
          </span>
          <h1 className="text-4xl font-black tabular-nums tracking-tight">
            {balanceFormatted}
            <span className="text-2xl font-medium opacity-70 ml-2 italic">
              UZS
            </span>
          </h1>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-green-500/10 rounded-full -mr-4 -mt-4 blur-xl" />
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Доходы
            </span>
          </div>
          <p className="text-lg font-bold tabular-nums text-green-400">
            +{new Intl.NumberFormat("ru-RU").format(data.totalIncome)}
          </p>
        </div>

        <div className="glass rounded-3xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-red-500/10 rounded-full -mr-4 -mt-4 blur-xl" />
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              Расходы
            </span>
          </div>
          <p className="text-lg font-bold tabular-nums text-red-400">
            -{new Intl.NumberFormat("ru-RU").format(data.totalExpense)}
          </p>
        </div>
      </div>
    </div>
  );
}
