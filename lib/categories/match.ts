import { TransactionType } from "@prisma/client";
import {
  CATEGORY_DICTIONARY,
  DEFAULT_CATEGORY_NAME,
  DEFAULT_TYPE,
} from "./dictionary";

export interface MatchedCategory {
  name: string;
  type: TransactionType;
}

/**
 * Определяет категорию и тип по тексту сообщения.
 * Первое совпадение по ключевым словам из словаря; иначе — "Прочее" и EXPENSE.
 */
export function matchCategory(text: string): MatchedCategory {
  const lower = text.toLowerCase().trim();
  for (const entry of CATEGORY_DICTIONARY) {
    const found = entry.keywords.some((kw) =>
      lower.includes(kw.toLowerCase())
    );
    if (found) {
      return { name: entry.name, type: entry.type };
    }
  }
  return { name: DEFAULT_CATEGORY_NAME, type: DEFAULT_TYPE };
}
