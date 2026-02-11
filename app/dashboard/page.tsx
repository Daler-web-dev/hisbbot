"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { AnalyticsCharts } from "@/components/dashboard/AnalyticsCharts";
import { TransactionsSection } from "@/components/dashboard/TransactionsSection";
import { getDashboardData } from "./actions";
import type { DashboardData, PeriodKey } from "@/types/dashboard";

function getTelegramUser(): { id: number; firstName: string } | null {
	if (typeof window === "undefined") return null;
	const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
	if (!user?.id) return null;
	return {
		id: user.id,
		firstName: user.first_name?.trim() || "Пользователь",
	};
}

const TELEGRAM_CHECK_DELAYS = [0, 50, 150, 350, 700];

function LoadingScreen() {
	return (
		<main
			className="min-h-screen bg-[#0a0a0c] text-[#f2f2f7] p-4 flex items-center justify-center safe-top"
		>
			<p className="text-white/50 text-center text-sm">Загрузка...</p>
		</main>
	);
}

function DashboardContent() {
	const searchParams = useSearchParams();
	const [mounted, setMounted] = useState(false);
	const [telegramChecked, setTelegramChecked] = useState(false);
	const [period, setPeriod] = useState<PeriodKey>("this_month");
	const [telegramId, setTelegramId] = useState<string | null>(null);
	const [userName, setUserName] = useState<string | null>(null);
	const [data, setData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async (tid: string, p: PeriodKey) => {
		setLoading(true);
		setError(null);
		const today = new Date().toISOString().slice(0, 10);
		const result = await getDashboardData(tid, p, today);
		if (result.ok) {
			setData(result.data);
		} else {
			setError(result.error);
			setData(null);
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		const devId = searchParams.get("telegramId");
		if (devId) {
			setTelegramId(devId);
			setTelegramChecked(true);
			return;
		}
		let cancelled = false;
		const trySet = () => {
			if (cancelled) return;
			const tgUser = getTelegramUser();
			if (tgUser) {
				setTelegramId(String(tgUser.id));
				setUserName(tgUser.firstName);
				setTelegramChecked(true);
			}
		};
		TELEGRAM_CHECK_DELAYS.forEach((ms, i) => {
			setTimeout(() => {
				if (cancelled) return;
				trySet();
				if (i === TELEGRAM_CHECK_DELAYS.length - 1)
					setTelegramChecked(true);
			}, ms);
		});
		return () => {
			cancelled = true;
		};
	}, [mounted, searchParams]);

	useEffect(() => {
		if (mounted && telegramId) load(telegramId, period);
	}, [mounted, telegramId, period, load]);

	useEffect(() => {
		if (!mounted) return;
		if (typeof window !== "undefined" && window.Telegram?.WebApp) {
			const tg = window.Telegram.WebApp;
			tg.ready();
			tg.expand();
			tg.setHeaderColor?.("#000000");
			tg.setBackgroundColor?.("#0a0a0c");
			tg.disableVerticalSwipes?.();
			if (tg.themeParams?.bg_color) {
				document.documentElement.style.setProperty(
					"--background",
					tg.themeParams.bg_color,
				);
			}
			if (tg.themeParams?.text_color) {
				document.documentElement.style.setProperty(
					"--foreground",
					tg.themeParams.text_color,
				);
			}
		}
	}, [mounted]);

	if (!mounted) {
		return <LoadingScreen />;
	}

	if (!telegramChecked) {
		return <LoadingScreen />;
	}

	if (!telegramId) {
		return (
			<main className="min-h-screen bg-[#0a0a0c] text-[#f2f2f7] p-4 flex items-center justify-center safe-top">
				<p className="text-white/50 text-center text-sm">
					Откройте приложение из Telegram или укажите telegramId в адресе.
				</p>
			</main>
		);
	}

	return (
		<div className="min-h-screen text-[#f2f2f7] selection:bg-blue-500/30">
			{/* Background blurs */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#0a0a0c]">
				<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
				<div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-green-600/5 blur-[120px] rounded-full" />
			</div>

			<main
				className="relative z-10 max-w-md mx-auto px-6 pt-10 pb-12 safe-top"
				style={{
					paddingBottom: "calc(3rem + env(safe-area-inset-bottom, 0px))",
				}}
			>
				{/* Greeting */}
				<div className="flex items-center gap-3 mb-10 group">
					<div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 shadow-inner group-active:scale-95 transition-transform shrink-0">
						<span className="text-xl font-black text-white">
							{userName ? userName[0].toUpperCase() : "?"}
						</span>
					</div>
					<div className="min-w-0">
						<p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">
							Личный кабинет
						</p>
						<h2 className="text-lg font-black tracking-tight truncate">
							{userName || "Пользователь"}
						</h2>
					</div>
				</div>

				{error && (
					<p className="text-red-400 text-sm mb-4">{error}</p>
				)}

				{loading && !data && (
					<p className="text-white/50 text-sm mb-4">Загрузка...</p>
				)}

				{data && (
					<div className={loading ? "opacity-70 pointer-events-none transition-opacity duration-200" : ""}>
						<SummaryCard data={data.summary} />
						<PeriodSelector selected={period} onChange={setPeriod} />
						<AnalyticsCharts
							categories={data.byCategory}
							dailyTrends={data.byDay}
						/>
					</div>
				)}

				<TransactionsSection telegramId={telegramId} />

				{!loading &&
					data &&
					data.summary.balance === 0 &&
					data.summary.totalIncome === 0 &&
					data.summary.totalExpense === 0 && (
						<p className="text-white/50 text-sm">
							Нет данных за выбранный период.
						</p>
					)}

				<p className="text-center text-[10px] font-bold text-white/10 uppercase tracking-[0.3em] mt-4">
					FinGram Pro &bull; {new Date().getFullYear()}
				</p>
			</main>

			<div className="fixed bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/10 rounded-full blur-[1px] pointer-events-none" />
		</div>
	);
}

export default function DashboardPage() {
	return (
		<Suspense fallback={<LoadingScreen />}>
			<DashboardContent />
		</Suspense>
	);
}
