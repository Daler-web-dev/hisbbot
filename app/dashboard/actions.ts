"use server";

import { getUserByTelegramId } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { toEndOfDayUTC } from "@/lib/date-utils";
import { getDateRange } from "@/lib/date-range";
import type { DashboardData, PeriodKey } from "@/types/dashboard";

function aggregateByDay(
  from: string,
  to: string,
  transactions: { dateStr: string; amount: number }[]
): { date: string; total: number }[] {
  const map = new Map<string, number>();
  const fromDate = new Date(from);
  const toDate = new Date(to);
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const t of transactions) {
    if (map.has(t.dateStr)) map.set(t.dateStr, (map.get(t.dateStr) ?? 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getDashboardData(
  telegramId: string,
  period: PeriodKey,
  todayStr?: string
): Promise<{ ok: true; data: DashboardData } | { ok: false; error: string }> {
  const user = await getUserByTelegramId(telegramId);
  if (!user) return { ok: false, error: "User not found" };

  const { from, to } = getDateRange(period, todayStr);
  const fromDate = new Date(from + "T00:00:00.000Z");
  const toDate = toEndOfDayUTC(to);
  const baseWhere = {
    userId: user.id,
    createdAt: { gte: fromDate, lte: toDate },
  };

  const transactions = await prisma.transaction.findMany({
    where: baseWhere,
    select: {
      type: true,
      amount: true,
      createdAt: true,
      categoryId: true,
      category: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categorySum = new Map<string, { name: string; type: string; total: number }>();
  const expenseByDay: { dateStr: string; amount: number }[] = [];

  for (const t of transactions) {
    const amount = Number(t.amount);
    if (t.type === "INCOME") totalIncome += amount;
    else totalExpense += amount;

    if (t.type === "EXPENSE") {
      expenseByDay.push({
        dateStr: t.createdAt.toISOString().slice(0, 10),
        amount,
      });
      if (t.categoryId && t.category) {
        const cur = categorySum.get(t.categoryId);
        const name = t.category.name ?? "";
        if (cur) {
          cur.total += amount;
        } else {
          categorySum.set(t.categoryId, { name, type: t.type, total: amount });
        }
      }
    }
  }

  const byCategory = Array.from(categorySum.entries()).map(([categoryId, v]) => ({
    categoryId,
    categoryName: v.name,
    type: v.type as "INCOME" | "EXPENSE",
    total: v.total,
  }));

  const byDay = aggregateByDay(from, to, expenseByDay);

  return {
    ok: true,
    data: {
      summary: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      },
      byCategory,
      byDay,
    },
  };
}

export interface TransactionListItem {
  id: string;
  amount: number;
  type: string;
  categoryId: string;
  categoryName: string;
  description: string | null;
  createdAt: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  type: string;
}

export async function getTransactionsList(
  telegramId: string,
  filters: { categoryId?: string; search?: string; limit?: number }
): Promise<
  | { ok: true; transactions: TransactionListItem[]; categories: CategoryOption[] }
  | { ok: false; error: string }
> {
  const user = await getUserByTelegramId(telegramId);
  if (!user) return { ok: false, error: "User not found" };

  const limit = Math.min(filters.limit ?? 100, 200);
  const searchTrim = filters.search?.trim();
  const where: {
    userId: string;
    categoryId?: string;
    description?: { contains: string; mode: "insensitive" };
  } = { userId: user.id };
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (searchTrim)
    where.description = { contains: searchTrim, mode: "insensitive" };

  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.category.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const list: TransactionListItem[] = transactions.map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    type: t.type,
    categoryId: t.categoryId,
    categoryName: t.category?.name ?? "",
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  }));

  return {
    ok: true,
    transactions: list,
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
    })),
  };
}

export async function deleteTransaction(
  telegramId: string,
  transactionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const user = await getUserByTelegramId(telegramId);
  if (!user) return { ok: false, error: "User not found" };

  const tx = await prisma.transaction.findFirst({
    where: { id: transactionId, userId: user.id },
  });
  if (!tx) return { ok: false, error: "Транзакция не найдена" };

  await prisma.transaction.delete({ where: { id: transactionId } });
  return { ok: true };
}
