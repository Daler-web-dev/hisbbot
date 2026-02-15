/**
 * Извлекает сумму из текста.
 * Поддерживает: "300", "5000", "300.50", "300,50",
 * "50 000", "50,000", "50.000" (разделители тысяч).
 */
/** Пробелы как разделитель тысяч: 50 000, 1 000 000 */
const AMOUNT_SPACE_THOUSANDS = /\d{1,3}(?:\s\d{3})+(?:[.,]\d{1,2})?/;
/** Запятая как разделитель тысяч: 50,000 или 50,000.50 */
const AMOUNT_COMMA_THOUSANDS = /\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?/;
/** Точка как разделитель тысяч (EU): 50.000 или 50.000,50 */
const AMOUNT_DOT_THOUSANDS = /\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?/;
/** Просто число, опционально десятичная часть: 50.50 или 300 */
const AMOUNT_PLAIN = /\d+(?:[.,]\d{1,2})?/;

function normalizeInput(text: string): string {
  return text.replace(/\u00A0/g, " ").trim();
}

function parseSpaceThousands(s: string): number {
  const numStr = s.replace(/\s/g, "").replace(",", ".");
  return parseFloat(numStr) || 0;
}

function parseCommaThousands(s: string): number {
  const numStr = s.replace(/,/g, "");
  return parseFloat(numStr) || 0;
}

function parseDotThousands(s: string): number {
  const numStr = s.replace(/\./g, "").replace(",", ".");
  return parseFloat(numStr) || 0;
}

function parsePlain(s: string): number {
  const numStr = s.replace(",", ".");
  return parseFloat(numStr) || 0;
}

function findFirst(
  text: string,
  pattern: RegExp,
  parse: (s: string) => number
): number | null {
  const m = pattern.exec(text);
  if (!m?.[0]) return null;
  const value = parse(m[0]);
  return value > 0 ? value : null;
}

/**
 * Возвращает первую подходящую сумму из текста (> 0) или null.
 * Сначала проверяются форматы с разделителями тысяч, затем просто число.
 */
export function extractAmount(text: string): number | null {
  const normalized = normalizeInput(text);

  const withSpace = findFirst(normalized, AMOUNT_SPACE_THOUSANDS, parseSpaceThousands);
  if (withSpace !== null) return withSpace;

  const withComma = findFirst(normalized, AMOUNT_COMMA_THOUSANDS, parseCommaThousands);
  if (withComma !== null) return withComma;

  const withDot = findFirst(normalized, AMOUNT_DOT_THOUSANDS, parseDotThousands);
  if (withDot !== null) return withDot;

  const plain = findFirst(normalized, AMOUNT_PLAIN, parsePlain);
  if (plain !== null) return plain;

  return null;
}
