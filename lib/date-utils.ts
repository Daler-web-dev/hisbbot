/**
 * Парсит дату "YYYY-MM-DD" как конец дня в UTC (23:59:59.999).
 * Нужно, чтобы транзакции за весь день "to" попадали в выборку.
 */
export function toEndOfDayUTC(dateStr: string): Date {
  const d = new Date(dateStr + "T23:59:59.999Z");
  return isNaN(d.getTime()) ? new Date(dateStr) : d;
}
