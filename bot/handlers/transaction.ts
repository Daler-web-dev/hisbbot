import { Context } from "grammy";
import { parseTransactionText } from "@/lib/parse/transaction-text";
import { getOrCreateUser } from "@/lib/user";
import { getOrCreateCategory } from "@/lib/category";
import { prisma } from "@/lib/prisma";

const TYPE_LABEL = {
  INCOME: "Доход",
  EXPENSE: "Расход",
} as const;

export async function handleTransactionText(ctx: Context) {
  const text = ctx.message?.text?.trim();
  if (!text) return;

  const parsed = parseTransactionText(text);
  if (!parsed) {
    await ctx.reply("Не удалось определить сумму. Напишите, например: кофе 30000 или 50000 такси.");
    return;
  }

  const telegramId = ctx.from?.id;
  if (telegramId === undefined) return;

  const user = await getOrCreateUser(telegramId);
  const category = await getOrCreateCategory(
    user.id,
    parsed.categoryName,
    parsed.type
  );

  await prisma.transaction.create({
    data: {
      userId: user.id,
      amount: parsed.amount,
      type: parsed.type,
      categoryId: category.id,
      description: text.length > 200 ? text.slice(0, 200) : text,
    },
  });

  const label = TYPE_LABEL[parsed.type];
  await ctx.reply(
    `Записано: ${label} ${parsed.amount} сум — ${parsed.categoryName}`
  );
}
