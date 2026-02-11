import { TransactionType } from "@prisma/client";
import { extractAmount } from "./amount";
import { matchCategory } from "@/lib/categories/match";

export interface ParsedTransaction {
  amount: number;
  type: TransactionType;
  categoryName: string;
}

/**
 * Парсит текст сообщения: сумма (regex) + тип и категория (словарь).
 * Возвращает null, если сумму извлечь не удалось.
 */
export function parseTransactionText(text: string): ParsedTransaction | null {
  const amount = extractAmount(text);
  if (amount === null || amount <= 0) return null;

  const { name: categoryName, type } = matchCategory(text);
  return { amount, type, categoryName };
}
