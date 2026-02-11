import { getUserByTelegramId } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { toEndOfDayUTC } from "@/lib/date-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const telegramId = req.nextUrl.searchParams.get("telegramId");
  if (!telegramId) {
    return NextResponse.json(
      { error: "telegramId is required" },
      { status: 400 }
    );
  }

  const user = await getUserByTelegramId(telegramId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const fromStr = req.nextUrl.searchParams.get("from");
  const toStr = req.nextUrl.searchParams.get("to");
  const dateWhere: { gte?: Date; lte?: Date } = {};
  if (fromStr) dateWhere.gte = new Date(fromStr + "T00:00:00.000Z");
  if (toStr) dateWhere.lte = toEndOfDayUTC(toStr);
  const baseWhere = {
    userId: user.id,
    ...(Object.keys(dateWhere).length ? { createdAt: dateWhere } : {}),
  };

  const [totals, byCategoryRows] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type"],
      where: baseWhere,
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where: baseWhere,
      _sum: { amount: true },
    }),
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  for (const row of totals) {
    const sum = Number(row._sum.amount ?? 0);
    if (row.type === "INCOME") totalIncome = sum;
    else totalExpense = sum;
  }

  const categoryIds = [...new Set(byCategoryRows.map((r) => r.categoryId))];
  const categories =
    categoryIds.length > 0
      ? await prisma.category.findMany({
          where: { id: { in: categoryIds } },
          select: { id: true, name: true },
        })
      : [];
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const byCategory = byCategoryRows.map((row) => ({
    categoryId: row.categoryId,
    categoryName: catMap[row.categoryId] ?? null,
    type: row.type,
    total: Number(row._sum.amount ?? 0),
  }));

  return NextResponse.json({
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    byCategory,
  });
}
