"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DayTotal } from "@/types/dashboard";
import { formatSum, toChartNumber } from "@/lib/format";

interface ExpenseLineChartProps {
  data: DayTotal[];
}

function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.getDate().toString();
}

export function ExpenseLineChart({ data }: ExpenseLineChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-4 h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        Нет данных за период
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
        Расходы по дням
      </p>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDayLabel}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => {
                const n = toChartNumber(v);
                return n >= 1e6 ? `${n / 1e6}M` : `${n / 1e3}k`;
              }}
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              formatter={(value) => [formatSum(toChartNumber(value)) + " сум", ""]}
              labelFormatter={(label) => new Date(String(label ?? "")).toLocaleDateString("ru-RU")}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="var(--chart-line)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--chart-line)" }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
