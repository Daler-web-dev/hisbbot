"use client";

import type { PeriodKey } from "@/types/dashboard";

const OPTIONS: { label: string; value: PeriodKey }[] = [
  { label: "Неделя", value: "last_7_days" },
  { label: "Этот месяц", value: "this_month" },
  { label: "Прошлый", value: "last_month" },
];

interface PeriodSelectorProps {
  selected: PeriodKey;
  onChange: (period: PeriodKey) => void;
}

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex justify-center mb-10">
      <div className="inline-flex glass rounded-full p-1.5">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-5 py-2 text-[11px] font-bold rounded-full transition-all duration-300 uppercase tracking-wider ${
              selected === opt.value
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
