export type PeriodKey = "this_month" | "last_month" | "last_7_days";

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  type: "INCOME" | "EXPENSE";
  total: number;
}

export interface DayTotal {
  date: string;
  total: number;
}

export interface DashboardData {
  summary: Summary;
  byCategory: CategoryTotal[];
  byDay: DayTotal[];
}

export const MOCK_DASHBOARD: DashboardData = {
  summary: {
    totalIncome: 15_000_000,
    totalExpense: 8_750_000,
    balance: 6_250_000,
  },
  byCategory: [
    { categoryId: "1", categoryName: "Еда вне дома", type: "EXPENSE", total: 2_100_000 },
    { categoryId: "2", categoryName: "Продукты", type: "EXPENSE", total: 1_850_000 },
    { categoryId: "3", categoryName: "Транспорт", type: "EXPENSE", total: 1_200_000 },
    { categoryId: "4", categoryName: "Подписки и связь", type: "EXPENSE", total: 450_000 },
    { categoryId: "5", categoryName: "Жильё", type: "EXPENSE", total: 2_500_000 },
    { categoryId: "6", categoryName: "Развлечения", type: "EXPENSE", total: 650_000 },
  ],
  byDay: [
    { date: "2025-02-01", total: 320_000 },
    { date: "2025-02-02", total: 180_000 },
    { date: "2025-02-03", total: 410_000 },
    { date: "2025-02-04", total: 0 },
    { date: "2025-02-05", total: 550_000 },
    { date: "2025-02-06", total: 290_000 },
    { date: "2025-02-07", total: 720_000 },
    { date: "2025-02-08", total: 450_000 },
    { date: "2025-02-09", total: 380_000 },
    { date: "2025-02-10", total: 210_000 },
    { date: "2025-02-11", total: 0 },
  ],
};
