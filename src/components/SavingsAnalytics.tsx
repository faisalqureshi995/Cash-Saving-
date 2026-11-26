import React, { useState, useMemo } from 'react';
import { SavingEntry, GoalConfig, RankDefinition } from '../types';
import { formatPKR, formatShortPKR, RANK_DEFINITIONS } from '../utils/ranks';
import { StreakStats } from '../utils/streaks';
import { TradingChart } from './TradingChart';
import {
  TrendingUp,
  BarChart2,
  PieChart,
  Calendar,
  Target,
  Award,
  Zap,
  ArrowUpRight,
  Activity,
} from 'lucide-react';

interface SavingsAnalyticsProps {
  entries: SavingEntry[];
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  goal: GoalConfig;
  currentRank: RankDefinition;
  streakStats: StreakStats;
}

export const SavingsAnalytics: React.FC<SavingsAnalyticsProps> = ({
  entries,
  currentBalance,
  totalDeposited,
  totalWithdrawn,
  goal,
  currentRank,
  streakStats,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'trading' | 'daily' | 'monthly'>('trading');

  const target = goal.targetAmount || 100000;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentBalance / target) * 100)));
  const remaining = Math.max(0, target - currentBalance);

  // Derived metrics
  const activeDaysCount = streakStats.totalActiveDays || 1;
  const averagePerActiveDay = Math.round(totalDeposited / activeDaysCount);

  // Projected days to reach target based on average per active day
  const projectedDaysToGoal =
    averagePerActiveDay > 0 && remaining > 0
      ? Math.ceil(remaining / averagePerActiveDay)
      : null;

  // Breakdown by source
  const sourceBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => {
      if (e.type === 'saving') {
        map.set(e.source, (map.get(e.source) || 0) + e.amount);
      }
    });

    const list = Array.from(map.entries())
      .map(([source, amount]) => ({
        source,
        label: source.replace('_', ' '),
        amount,
        percentage: totalDeposited > 0 ? Math.round((amount / totalDeposited) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return list;
  }, [entries, totalDeposited]);

  // Chronological cumulative growth points
  const growthData = useMemo(() => {
    const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    let cum = 0;
    const points: { date: string; amount: number; balance: number }[] = [];

    sorted.forEach((e) => {
      if (e.type === 'saving') cum += e.amount;
      else cum -= e.amount;
      points.push({
        date: e.date,
        amount: e.amount,
        balance: Math.max(0, cum),
      });
    });

    return points;
  }, [entries]);

  // Last 14 days activity bars
  const dailyBars = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => {
      const prev = map.get(e.date) || 0;
      map.set(e.date, prev + (e.type === 'saving' ? e.amount : -e.amount));
    });

    const days: { date: string; displayDate: string; amount: number }[] = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const s = d.toISOString().split('T')[0];
      const display = `${d.getDate()}/${d.getMonth() + 1}`;
      days.push({
        date: s,
        displayDate: display,
        amount: Math.max(0, map.get(s) || 0),
      });
    }
    return days;
  }, [entries]);

  // Monthly totals
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => {
      const ym = e.date.substring(0, 7);
      const delta = e.type === 'saving' ? e.amount : -e.amount;
      map.set(ym, (map.get(ym) || 0) + delta);
    });

    return Array.from(map.entries())
      .map(([ym, amount]) => {
        const [y, m] = ym.split('-');
        const label = new Date(Number(y), Number(m) - 1).toLocaleString('en-US', {
          month: 'short',
        });
        return { ym, label, amount: Math.max(0, amount) };
      })
      .sort((a, b) => a.ym.localeCompare(b.ym))
      .slice(-6);
  }, [entries]);

  // Max value for daily bars scaling
  const maxDaily = Math.max(...dailyBars.map((d) => d.amount), 5000);
  const maxMonthly = Math.max(...monthlyData.map((d) => d.amount), 10000);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Savings Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Visual metrics, cumulative growth curves, and goal achievement velocity
        </p>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Net Savings
          </span>
          <span className="font-mono text-xl sm:text-2xl font-black text-amber-400 block tabular-nums">
            {formatPKR(currentBalance)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {progressPercent}% of PKR 100k
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Avg / Active Day
          </span>
          <span className="font-mono text-xl sm:text-2xl font-black text-emerald-400 block tabular-nums">
            {formatPKR(averagePerActiveDay)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            Across {activeDaysCount} saving days
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Total Deposited
          </span>
          <span className="font-mono text-xl sm:text-2xl font-black text-sky-400 block tabular-nums">
            {formatPKR(totalDeposited)}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {totalWithdrawn > 0 ? `-${formatPKR(totalWithdrawn)} withdrawn` : 'Zero withdrawals'}
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
            Target Pace
          </span>
          <span className="font-mono text-xl sm:text-2xl font-black text-purple-400 block tabular-nums">
            {projectedDaysToGoal !== null ? `~${projectedDaysToGoal} Days` : 'Goal Done!'}
          </span>
          <span className="text-[10px] text-slate-400 block">
            {remaining > 0 ? `${formatPKR(remaining)} left` : '100% Reached'}
          </span>
        </div>
      </div>

      {/* Main Interactive Charts Card */}
      <div className="space-y-4">
        {/* Chart Selector Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-white font-display">
                {activeChartTab === 'trading' && 'Live Trading Terminal (Candlesticks & Trend)'}
                {activeChartTab === 'daily' && 'Daily Savings (Last 14 Days)'}
                {activeChartTab === 'monthly' && 'Monthly Savings Totals'}
              </h2>
              <p className="text-xs text-slate-400">
                {activeChartTab === 'trading'
                  ? 'Real-time financial exchange candlestick & laser indicator view'
                  : 'Historical cash flow distribution'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveChartTab('trading')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] flex items-center gap-1.5 ${
                activeChartTab === 'trading'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Trading Terminal</span>
            </button>
            <button
              onClick={() => setActiveChartTab('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
                activeChartTab === 'daily'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily Bars
            </button>
            <button
              onClick={() => setActiveChartTab('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors min-h-[36px] ${
                activeChartTab === 'monthly'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* 1. Trading Terminal View */}
        {activeChartTab === 'trading' && (
          <TradingChart
            entries={entries}
            currentBalance={currentBalance}
            totalDeposited={totalDeposited}
            targetAmount={target}
            currentRank={currentRank}
            compact={false}
          />
        )}

        {/* Other Chart Views in Card */}
        {activeChartTab !== 'trading' && (
          <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">

            {/* 2. Daily Savings Bar View */}
            {activeChartTab === 'daily' && (
              <div className="space-y-4">
                <div className="h-64 sm:h-72 flex items-end justify-between gap-1 sm:gap-2 px-2 pt-6">
                  {dailyBars.map((d) => {
                    const heightPercent = maxDaily > 0 ? (d.amount / maxDaily) * 100 : 0;
                    return (
                      <div
                        key={d.date}
                        className="flex-1 flex flex-col items-center justify-end h-full group"
                      >
                        <div className="w-full relative flex flex-col items-center justify-end h-4/5">
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-[10px] text-white font-mono px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity whitespace-nowrap z-20">
                            {formatShortPKR(d.amount)}
                          </div>
                          <div
                            className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
                              d.amount > 0
                                ? 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:brightness-125'
                                : 'bg-slate-800/40'
                            }`}
                            style={{ height: `${Math.max(4, heightPercent)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-2 truncate max-w-full">
                          {d.displayDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Daily deposits recorded in the past 14 days</span>
                  <span className="font-mono text-slate-300">Peak: {formatPKR(maxDaily)}</span>
                </div>
              </div>
            )}

            {/* 3. Monthly Bar View */}
            {activeChartTab === 'monthly' && (
              <div className="space-y-4">
                <div className="h-64 sm:h-72 flex items-end justify-around gap-4 px-4 pt-6">
                  {monthlyData.map((m) => {
                    const heightPercent = maxMonthly > 0 ? (m.amount / maxMonthly) * 100 : 0;
                    return (
                      <div
                        key={m.ym}
                        className="flex-1 max-w-[80px] flex flex-col items-center justify-end h-full group"
                      >
                        <div className="w-full relative flex flex-col items-center justify-end h-4/5">
                          <span className="text-[11px] font-mono text-amber-400 font-bold mb-1.5">
                            {formatShortPKR(m.amount)}
                          </span>
                          <div
                            className="w-full rounded-t-xl bg-gradient-to-t from-purple-700 via-purple-500 to-pink-500 transition-all duration-300 group-hover:brightness-125"
                            style={{ height: `${Math.max(6, heightPercent)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-300 font-semibold mt-2">
                          {m.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span>Monthly accumulated net savings</span>
                  <span className="font-mono text-slate-300">Record: {formatPKR(maxMonthly)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Breakdown Grid: Source Distribution & Goal Completion Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white font-display">
              Savings by Income Source
            </h3>
          </div>

          {sourceBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No deposits categorized yet.</p>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.map((item) => (
                <div key={item.source} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 capitalize font-medium">{item.label}</span>
                    <span className="font-mono text-slate-200">
                      {formatPKR(item.amount)}{' '}
                      <span className="text-slate-400 font-normal">({item.percentage}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goal Completion Donut / Summary */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white font-display">
                PKR 100,000 Target Breakdown
              </h3>
            </div>

            <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                {/* SVG Circular Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#1E293B"
                    strokeWidth="14"
                    fill="transparent"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#F59E0B"
                    strokeWidth="14"
                    fill="transparent"
                    strokeDasharray={427.26}
                    strokeDashoffset={427.26 - (427.26 * progressPercent) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-3xl font-black text-white">{progressPercent}%</span>
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">
                    Completed
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Net Saved</span>
              <span className="font-mono text-sm font-bold text-emerald-400 block mt-0.5">
                {formatPKR(currentBalance)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Remaining</span>
              <span className="font-mono text-sm font-bold text-amber-400 block mt-0.5">
                {formatPKR(remaining)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
