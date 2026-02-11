export function formatSum(value: number): string {
  return new Intl.NumberFormat("uz-UZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Приводит значение из recharts (number | string | undefined) к number для форматтеров */
export function toChartNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Короткий формат для сумов: 1.2M, 50K */
export function formatShortUZS(value: number): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(0) + "K";
  }
  return String(value);
}
