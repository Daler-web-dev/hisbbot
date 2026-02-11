"use client";

import type { PeriodKey } from "@/types/dashboard";

const LABELS: Record<PeriodKey, string> = {
  this_month: "Этот месяц",
  last_month: "Прошлый месяц",
  last_7_days: "7 дней",
};

interface DateFilterProps {
  value: PeriodKey;
  onChange: (period: PeriodKey) => void;
}

export function DateFilter({ value, onChange }: DateFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {(Object.keys(LABELS) as PeriodKey[]).map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={
            "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors " +
            (value === key
              ? "bg-foreground text-background"
              : "bg-muted text-foreground/80 hover:bg-muted/80")
          }
        >
          {LABELS[key]}
        </button>
      ))}
    </div>
  );
}
