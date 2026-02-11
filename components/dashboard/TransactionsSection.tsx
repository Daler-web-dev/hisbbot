"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getTransactionsList,
  deleteTransaction,
  type TransactionListItem,
  type CategoryOption,
} from "@/app/dashboard/actions";
import { formatSum } from "@/lib/format";

interface TransactionsSectionProps {
  telegramId: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function TransactionsSection({ telegramId }: TransactionsSectionProps) {
  const [transactions, setTransactions] = useState<TransactionListItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (id: string) => {
      setDeletingId(id);
      setError(null);
      const result = await deleteTransaction(telegramId, id);
      if (result.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } else {
        setError(result.error);
      }
      setDeletingId(null);
    },
    [telegramId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getTransactionsList(telegramId, {
      categoryId: categoryId || undefined,
      search: search || undefined,
      limit: 100,
    });
    if (result.ok) {
      setTransactions(result.transactions);
      setCategories(result.categories);
    } else {
      setError(result.error);
      setTransactions([]);
    }
    setLoading(false);
  }, [telegramId, categoryId, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <section className="glass rounded-[2rem] p-6 mb-8">
      <h2 className="text-sm font-bold text-white/90 uppercase tracking-widest mb-4">
        Все транзакции
      </h2>

      <div className="flex flex-col gap-3 mb-4">
        <input
          type="search"
          placeholder="Поиск по описанию..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 text-base focus:outline-none focus:border-white/20"
          style={{ fontSize: "16px" }}
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-base focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
          style={{
            fontSize: "16px",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='rgba(255,255,255,0.5)' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 1rem center",
            paddingRight: "2.5rem",
          }}
        >
          <option value="">Все категории</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {loading ? (
        <p className="text-white/50 text-sm py-6 text-center">Загрузка...</p>
      ) : transactions.length === 0 ? (
        <p className="text-white/50 text-sm py-6 text-center">
          Нет транзакций
        </p>
      ) : (
        <ul className="space-y-2 max-h-[320px] overflow-y-auto -mr-1 pr-1">
          {transactions.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-2 py-3 px-4 rounded-2xl bg-white/[0.03] border border-white/[0.05]"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white/80 truncate">
                  {t.categoryName || "—"}
                </p>
                <p className="text-[10px] text-white/40 mt-0.5 truncate">
                  {formatDate(t.createdAt)}
                  {t.description ? ` · ${t.description}` : ""}
                </p>
              </div>
              <span
                className={`text-sm font-bold tabular-nums shrink-0 ${
                  t.type === "INCOME" ? "text-green-400" : "text-red-400"
                }`}
              >
                {t.type === "INCOME" ? "+" : "−"}
                {formatSum(t.amount)}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(t.id)}
                disabled={deletingId === t.id}
                className="shrink-0 p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors"
                title="Удалить"
                aria-label="Удалить транзакцию"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
