import type { PeriodKey } from "@/types/dashboard";

/**
 * Возвращает диапазон дат в UTC (YYYY-MM-DD).
 * todayStr — дата "сегодня" в формате YYYY-MM-DD (лучше передать с клиента для совпадения с устройством пользователя).
 */
export function getDateRange(
  period: PeriodKey,
  todayStr?: string
): { from: string; to: string } {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();

  const pad = (n: number) => String(n).padStart(2, "0");
  const today = todayStr ?? `${y}-${pad(m + 1)}-${pad(d)}`;
  const [tY, tM, tD] = today.split("-").map(Number);

  let from: string;
  let to: string;

  switch (period) {
    case "this_month":
      from = `${tY}-${pad(tM)}-01`;
      to = today;
      break;
    case "last_month": {
      const lastMonth = tM === 1 ? 12 : tM - 1;
      const lastMonthYear = tM === 1 ? tY - 1 : tY;
      const lastDay = new Date(lastMonthYear, lastMonth - 1, 0).getDate();
      from = `${lastMonthYear}-${pad(lastMonth)}-01`;
      to = `${lastMonthYear}-${pad(lastMonth)}-${pad(lastDay)}`;
      break;
    }
    case "last_7_days": {
      const toDateUtc = Date.UTC(tY, tM - 1, tD);
      const fromDateUtc = new Date(toDateUtc - 6 * 24 * 60 * 60 * 1000);
      from = fromDateUtc.toISOString().slice(0, 10);
      to = today;
      break;
    }
    default:
      from = `${tY}-${pad(tM)}-01`;
      to = today;
  }

  return { from, to };
}
