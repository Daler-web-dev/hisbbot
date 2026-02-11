import { getUserByTelegramId, getOrCreateUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { toEndOfDayUTC } from "@/lib/date-utils";
import { TransactionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const VALID_TYPES = ["INCOME", "EXPENSE"] as const;

function parseTelegramId(searchParams: URLSearchParams): string | null {
  return searchParams.get("telegramId");
}

function parseBodyTelegramId(body: unknown): string | null {
  if (body && typeof body === "object" && "telegramId" in body) {
    const v = (body as { telegramId: unknown }).telegramId;
    return typeof v === "string" ? v : v != null ? String(v) : null;
  }
  return null;
}

export async function GET(req: NextRequest) {
  const telegramId = parseTelegramId(req.nextUrl.searchParams);
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

  const { searchParams } = req.nextUrl;
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const type = searchParams.get("type")?.toUpperCase();
  const categoryId = searchParams.get("categoryId");
  const limit = Math.min(Number(searchParams.get("limit")) || 100, 500);

  const where: { userId: string; type?: TransactionType; categoryId?: string; createdAt?: { gte?: Date; lte?: Date } } = {
    userId: user.id,
  };
  if (type && VALID_TYPES.includes(type as (typeof VALID_TYPES)[number])) {
    where.type = type as TransactionType;
  }
  if (categoryId) where.categoryId = categoryId;
  if (fromStr || toStr) {
    where.createdAt = {};
    if (fromStr) where.createdAt.gte = new Date(fromStr + "T00:00:00.000Z");
    if (toStr) where.createdAt.lte = toEndOfDayUTC(toStr);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: { select: { id: true, name: true, type: true } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const list = transactions.map((t) => ({
    id: t.id,
    amount: Number(t.amount),
    type: t.type,
    categoryId: t.categoryId,
    categoryName: t.category.name,
    description: t.description,
    createdAt: t.createdAt.toISOString(),
  }));

  return NextResponse.json({ transactions: list });
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const telegramId = parseBodyTelegramId(body);
  if (!telegramId) {
    return NextResponse.json(
      { error: "telegramId is required" },
      { status: 400 }
    );
  }

  const b = body as Record<string, unknown>;
  const amount = Number(b.amount);
  const typeRaw = typeof b.type === "string" ? b.type.toUpperCase() : null;
  const categoryId = typeof b.categoryId === "string" ? b.categoryId : null;
  const description = typeof b.description === "string" ? b.description : undefined;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number" },
      { status: 400 }
    );
  }
  if (!typeRaw || !VALID_TYPES.includes(typeRaw as (typeof VALID_TYPES)[number])) {
    return NextResponse.json(
      { error: "type must be INCOME or EXPENSE" },
      { status: 400 }
    );
  }
  if (!categoryId) {
    return NextResponse.json(
      { error: "categoryId is required" },
      { status: 400 }
    );
  }

  const user = await getOrCreateUser(telegramId);

  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId: user.id },
  });
  if (!category) {
    return NextResponse.json(
      { error: "Category not found or does not belong to user" },
      { status: 404 }
    );
  }
  if (category.type !== typeRaw) {
    return NextResponse.json(
      { error: "Category type does not match transaction type" },
      { status: 400 }
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      amount,
      type: typeRaw as TransactionType,
      categoryId,
      description: description ?? null,
    },
    include: { category: { select: { id: true, name: true, type: true } } },
  });

  return NextResponse.json({
    id: transaction.id,
    amount: Number(transaction.amount),
    type: transaction.type,
    categoryId: transaction.categoryId,
    categoryName: transaction.category.name,
    description: transaction.description,
    createdAt: transaction.createdAt.toISOString(),
  });
}
