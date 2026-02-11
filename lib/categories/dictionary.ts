import { TransactionType } from "@prisma/client";

export interface CategoryEntry {
  keywords: string[];
  name: string;
  type: TransactionType;
}

/**
 * Словарь: ключевые слова в сообщении → категория и тип.
 * Порядок записей важен: первое совпадение по ключевым словам.
 */
export const CATEGORY_DICTIONARY: CategoryEntry[] = [
  // Доходы
  { keywords: ["зарплата", "зп", "salary", "оклад"], name: "Зарплата", type: "INCOME" },
  { keywords: ["доход", "прибыль", "выручка"], name: "Доход", type: "INCOME" },
  { keywords: ["перевод", "получил", "получено"], name: "Перевод", type: "INCOME" },
  { keywords: ["подарок", "бонус", "кешбэк", "cashback"], name: "Бонус", type: "INCOME" },
  // Расходы
  { keywords: ["еда", "продукты", "магазин", "пятерочка", "перекресток", "ашан", "лента"], name: "Продукты", type: "EXPENSE" },
  { keywords: ["кофе", "кафе", "ресторан", "обед", "ужин", "завтрак", "столовая"], name: "Еда вне дома", type: "EXPENSE" },
  { keywords: ["такси", "uber", "яндекс", "бензин", "заправка", "транспорт", "метро", "автобус"], name: "Транспорт", type: "EXPENSE" },
  { keywords: ["подписка", "нетфликс", "spotify", "яндекс плюс", "мегафон", "мтс", "билайн", "связь", "интернет"], name: "Подписки и связь", type: "EXPENSE" },
  { keywords: ["аренда", "квартира", "коммуналка", "жкх", "электричество"], name: "Жильё", type: "EXPENSE" },
  { keywords: ["здоровье", "аптека", "врач", "медицина", "лекарств"], name: "Здоровье", type: "EXPENSE" },
  { keywords: ["одежда", "одежду", "обувь", "магазин одежды"], name: "Одежда", type: "EXPENSE" },
  { keywords: ["развлечен", "кино", "игр", "игры", "хобби"], name: "Развлечения", type: "EXPENSE" },
];

export const DEFAULT_CATEGORY_NAME = "Прочее";
export const DEFAULT_TYPE: TransactionType = "EXPENSE";
