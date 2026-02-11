import type { PeriodKey } from "@/types/dashboard";
import { getDateRange } from "./date-range";

export interface StatsResponse {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  byCategory: { categoryId: string; categoryName: string | null; type: string; total: number }[];
}

export interface TransactionItem {
  id: string;
  amount: number;
  type: string;
  categoryId: string;
  categoryName: string;
  description: string | null;
  createdAt: string;
}

export async function fetchStats(
  telegramId: string,
  period: PeriodKey
): Promise<StatsResponse> {
  const { from, to } = getDateRange(period);
  const params = new URLSearchParams({ telegramId, from, to });
  const res = await fetch(`/api/transactions/stats?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Ошибка загрузки статистики");
  }
  return res.json();
}

export async function fetchTransactions(
  telegramId: string,
  period: PeriodKey
): Promise<TransactionItem[]> {
  const { from, to } = getDateRange(period);
  const params = new URLSearchParams({
    telegramId,
    from,
    to,
    type: "EXPENSE",
    limit: "500",
  });
  const res = await fetch(`/api/transactions?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Ошибка загрузки транзакций");
  }
  const data = (await res.json()) as { transactions: TransactionItem[] };
  return data.transactions;
}

export function aggregateExpensesByDay(
  transactions: TransactionItem[],
  from: string,
  to: string
): { date: string; total: number }[] {
  const map = new Map<string, number>();
  const fromDate = new Date(from);
  const toDate = new Date(to);
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    map.set(key, 0);
  }
  for (const t of transactions) {
    const key = t.createdAt.slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
