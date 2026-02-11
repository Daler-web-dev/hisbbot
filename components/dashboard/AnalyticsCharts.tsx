"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import type { CategoryTotal, DayTotal } from "@/types/dashboard";
import { formatShortUZS, toChartNumber } from "@/lib/format";

const CATEGORY_COLORS = [
  "#0088CC",
  "#34C759",
  "#FF9500",
  "#AF52DE",
  "#FF3B30",
  "#5AC8FA",
  "#FF6482",
  "#8E8E93",
];

interface AnalyticsChartsProps {
  categories: CategoryTotal[];
  dailyTrends: DayTotal[];
}

function mapCategoriesToChart(categories: CategoryTotal[]) {
  const expenseOnly = categories.filter((c) => c.type === "EXPENSE");
  return expenseOnly.map((c, i) => ({
    name: c.categoryName || "Прочее",
    value: c.total,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
}

function mapDailyToChart(dailyTrends: DayTotal[]) {
  return dailyTrends.map((d) => ({
    day: new Date(d.date).getDate().toString(),
    amount: d.total,
  }));
}

export function AnalyticsCharts({ categories, dailyTrends }: AnalyticsChartsProps) {
  const chartCategories = mapCategoriesToChart(categories);
  const dailyData = mapDailyToChart(dailyTrends);
  const categoriesTotal = chartCategories.reduce((a, b) => a + b.value, 0);

  return (
    <div className="space-y-4 pb-16">
      <div className="grid grid-cols-1 gap-4">
        {/* Category Pie + List */}
        <section className="glass rounded-[2rem] p-6">
          <div className="flex justify-between items-center mb-4 px-2">
            <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest">
              Категории
            </h2>
            <div className="bg-white/5 px-2 py-1 rounded-lg text-[10px] text-white/40 font-mono">
              Top spend
            </div>
          </div>

          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartCategories}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={chartCategories.length > 0 ? 8 : 0}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  {chartCategories.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1c1c1e",
                    borderRadius: "16px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                  }}
                  itemStyle={{
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                  formatter={(value) => formatShortUZS(toChartNumber(value))}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-white/30 uppercase">
                Всего
              </span>
              <span className="text-lg font-black text-white tabular-nums">
                {formatShortUZS(categoriesTotal)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 mt-4">
            {chartCategories.slice(0, 4).map((cat, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-white/[0.03] p-3 rounded-2xl border border-white/[0.05]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-xs font-semibold text-white/80 truncate">
                    {cat.name}
                  </span>
                </div>
                <span className="text-xs font-bold tabular-nums text-white shrink-0 ml-2">
                  {formatShortUZS(cat.value)}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Area Chart */}
        <section className="glass rounded-[2rem] overflow-hidden pt-6">
          <div className="px-6 mb-2 flex justify-between items-end">
            <div>
              <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest">
                Активность
              </h2>
              <p className="text-[10px] text-white/30">
                Сумма трат по дням
              </p>
            </div>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dailyData}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="gradientLine"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#0088CC"
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="100%"
                      stopColor="#0088CC"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  cursor={{
                    stroke: "rgba(255,255,255,0.1)",
                    strokeWidth: 1,
                  }}
                  contentStyle={{
                    backgroundColor: "#1c1c1e",
                    borderRadius: "12px",
                    border: "none",
                  }}
                  formatter={(value) => formatShortUZS(toChartNumber(value))}
                />
                <Area
                  type="stepAfter"
                  dataKey="amount"
                  stroke="#0088CC"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#gradientLine)"
                  animationDuration={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
