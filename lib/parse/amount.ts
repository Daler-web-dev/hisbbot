/**
 * Извлекает сумму из текста.
 * Поддерживает: "300", "5000", "300.50", "300,50", "1 000" (пробел как разделитель тысяч).
 * Вариант с пробелами проверяется первым, чтобы "5000" не обрезалось до "500".
 */
const AMOUNT_WITH_SPACES = /\d{1,3}(?:\s\d{3})+(?:[.,]\d{1,2})?/g;
const AMOUNT_PLAIN = /\d+(?:[.,]\d{1,2})?/g;

function normalizeAmount(s: string): number {
  const withoutSpaces = s.replace(/\s/g, "");
  const withDot = withoutSpaces.replace(",", ".");
  return parseFloat(withDot) || 0;
}

/**
 * Возвращает первую подходящую сумму из текста (> 0) или null.
 */
export function extractAmount(text: string): number | null {
  const withSpaces = text.match(AMOUNT_WITH_SPACES);
  if (withSpaces?.[0]) {
    const value = normalizeAmount(withSpaces[0]);
    if (value > 0) return value;
  }
  const plain = text.match(AMOUNT_PLAIN);
  if (!plain) return null;
  for (const m of plain) {
    const value = normalizeAmount(m);
    if (value > 0) return value;
  }
  return null;
}
