"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { CategoryTotal } from "@/types/dashboard";
import { formatSum, toChartNumber } from "@/lib/format";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

interface ExpensePieChartProps {
  data: CategoryTotal[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const expenseOnly = data.filter((d) => d.type === "EXPENSE");
  const chartData = expenseOnly.map((d) => ({
    name: d.categoryName,
    value: d.total,
  }));

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border p-4 h-[240px] flex items-center justify-center text-muted-foreground text-sm">
        Нет расходов за период
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-4">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
        Расходы по категориям
      </p>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={1}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatSum(toChartNumber(value)) + " сум", ""]}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid var(--border)",
                fontSize: "12px",
              }}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              formatter={(name, entry) => (
                <span className="text-xs text-foreground">{name}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
