import React, { useState, useMemo } from 'react';
import { ActiveTab, GoalConfig, RankDefinition, SavingEntry } from '../types';
import { RankBadge } from './RankBadge';
import { TradingChart } from './TradingChart';
import { MilestoneTracker } from './MilestoneTracker';
import { formatPKR, getMotivationalMessage, getNextRank, getRankProgress } from '../utils/ranks';
import { StreakStats } from '../utils/streaks';
import { calculateTodayDisciplineStatus, DAILY_TARGET_PKR } from '../utils/penalties';
import {
  calculateRewardsStats,
  getDepositReward,
  formatRs,
  REWARD_LEVELS,
  DepositRewardLevel,
} from '../utils/rewards';
import {
  PlusCircle,
  History,
  Award,
  BarChart3,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
  Target,
  Trophy,
  Zap,
  CheckCircle2,
  AlertCircle,
  Info,
  ShieldAlert,
  AlertOctagon,
} from 'lucide-react';

interface DashboardProps {
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalPenalties?: number;
  totalPenaltyCount?: number;
  outstandingPenaltyTotal?: number;
  currentRank: RankDefinition;
  goal: GoalConfig;
  streakStats: StreakStats;
  recentEntries: SavingEntry[];
  allEntries: SavingEntry[];
  onOpenAddModal: () => void;
  onOpenWithdrawModal: () => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onEditEntry: (entry: SavingEntry) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentBalance,
  totalDeposited,
  totalWithdrawn,
  totalPenalties = 0,
  totalPenaltyCount = 0,
  outstandingPenaltyTotal = 0,
  currentRank,
  goal,
  streakStats,
  recentEntries,
  allEntries,
  onOpenAddModal,
  onOpenWithdrawModal,
  onNavigateTab,
  onEditEntry,
}) => {
  const [selectedRewardInfo, setSelectedRewardInfo] = useState<DepositRewardLevel | null>(null);

  const target = goal.targetAmount || 100000;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentBalance / target) * 100)));
  const remainingAmount = Math.max(0, target - currentBalance);
  const nextRank = getNextRank(currentRank.id);
  const rankProg = getRankProgress(currentBalance, currentRank, nextRank);
  const motivationalMessage = getMotivationalMessage(progressPercent, currentRank);

  // Today's Daily Target Discipline calculation (Asia/Karachi)
  const todayDiscipline = useMemo(() => {
    return calculateTodayDisciplineStatus(allEntries);
  }, [allEntries]);

  // Rewards statistics calculated from all user deposit records
  const rewardsStats = useMemo(() => {
    return calculateRewardsStats(allEntries);
  }, [allEntries]);

  // Daily amounts saved map for Day-by-Day streak progression
  const dailySavingsMap = useMemo(() => {
    const map = new Map<string, number>();
    allEntries.forEach((e) => {
      if (e.type === 'saving') {
        map.set(e.date, (map.get(e.date) || 0) + e.amount);
      }
    });
    return map;
  }, [allEntries]);

  // Daily penalties map
  const dailyPenaltiesMap = useMemo(() => {
    const map = new Map<string, number>();
    allEntries.forEach((e) => {
      if (e.type === 'penalty') {
        map.set(e.date, (map.get(e.date) || 0) + (e.actualDeducted ?? e.amount));
      }
    });
    return map;
  }, [allEntries]);

  // Rolling 14-Day Day-by-Day Streak Progression
  const dayByDayStreak = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const isToday = i === 13;
      const isYesterday = i === 12;
      const dayName = isToday ? 'Today' : isYesterday ? 'Yest' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = d.getDate();
      const amountSaved = dailySavingsMap.get(dateStr) || 0;
      const penaltyAmount = dailyPenaltiesMap.get(dateStr) || 0;
      const isActive = streakStats.activeDatesSet.has(dateStr);

      return {
        dateStr,
        dayName,
        dayNumber,
        isToday,
        isYesterday,
        isActive,
        amountSaved,
        penaltyAmount,
      };
    });
  }, [dailySavingsMap, dailyPenaltiesMap, streakStats]);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* SECTION 1: Total Savings Hero Card & Progress Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                Total Cash Savings
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Target: {formatPKR(target)}</span>
            </div>

            {/* Prominent Amount */}
            <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white tabular-nums">
                {formatPKR(currentBalance)}
              </h1>
              <span className="text-lg sm:text-2xl font-bold text-slate-500 tabular-nums">
                / {formatPKR(target)}
              </span>
            </div>

            {/* Left to goal & stats */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
              <span>
                {remainingAmount === 0 ? (
                  <span className="text-emerald-400 font-semibold">100% Complete! Goal Achieved</span>
                ) : (
                  <span>
                    <strong className="text-slate-200 font-semibold">{formatPKR(remainingAmount)}</strong> remaining
                  </span>
                )}
              </span>
              <span className="text-slate-600">·</span>
              <span>Total Deposited: {formatPKR(totalDeposited)}</span>
              {totalPenalties > 0 && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-rose-400 font-semibold">
                    Penalties Deducted: −{formatPKR(totalPenalties)} 🔴
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Quick Primary Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenAddModal}
              className="min-h-[48px] px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Add Cash</span>
            </button>
            <button
              onClick={onOpenWithdrawModal}
              className="min-h-[48px] px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-sm rounded-xl border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Withdraw or correct cash amount"
            >
              <ArrowUpRight className="w-4 h-4 text-rose-400" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Main Goal Progress Bar */}
        <div className="mt-8 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              PKR 100,000 Milestone Path
            </span>
            <span className="font-mono text-sm font-bold text-amber-400">{progressPercent}%</span>
          </div>

          <div className="w-full h-3.5 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-700 relative shadow-[0_0_12px_rgba(234,179,8,0.5)]"
              style={{ width: `${Math.max(2, progressPercent)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 pt-0.5 font-mono">
            <span>PKR 0 (Bronze)</span>
            <span>PKR 50,000 (Crown)</span>
            <span>PKR 100,000 (Conqueror)</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: DAILY TARGET DISCIPLINE & PENALTY CARD */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Target className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                Daily Saving Discipline
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Target: Rs. 200 / Day (PKT)
              </span>
            </div>

            <div className="flex items-baseline gap-2.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                {formatRs(todayDiscipline.depositedToday)}
              </span>
              <span className="text-slate-400 text-base font-bold font-mono">
                / {formatRs(DAILY_TARGET_PKR)}
              </span>
              {todayDiscipline.isAchieved ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-4 h-4" />
                  Target Achieved Today! Penalty: Rs. 0
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <Clock className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
                  Pending: Save Rs. {todayDiscipline.remainingToSave} more
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300">
              {todayDiscipline.isAchieved ? (
                <span className="text-emerald-400 font-medium">
                  ✅ Excellent discipline! You met today's Rs. 200 quota. No penalty will be deducted.
                </span>
              ) : (
                <span className="text-slate-400">
                  Save at least <strong className="text-white">Rs. 200</strong> each calendar day before midnight Pakistan time. If missed or less than Rs. 200 saved, a fixed <strong className="text-rose-400">Rs. 200 penalty</strong> is automatically deducted.
                </span>
              )}
            </p>
          </div>

          {/* Quick Action Button for Daily Target */}
          <div className="shrink-0 flex items-center gap-3">
            {!todayDiscipline.isAchieved && (
              <button
                onClick={onOpenAddModal}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Deposit Rs. 200 (Avoid Penalty)</span>
              </button>
            )}
          </div>
        </div>

        {/* Today's Discipline Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Today's Progress</span>
            <span className={todayDiscipline.isAchieved ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {todayDiscipline.percent}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                todayDiscipline.isAchieved
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-amber-400'
              }`}
              style={{ width: `${Math.max(2, todayDiscipline.percent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECTION 2.5: RS. 500 SAVING MILESTONES (200 STEPS TO 100K) */}
      <MilestoneTracker
        currentBalance={currentBalance}
        onOpenAddModal={onOpenAddModal}
      />

      {/* SECTION 3: TRADING MARKET TREND GRAPH (Stock Trading Style with Green Pumps & Red Penalty Dips) */}
      <TradingChart
        entries={allEntries}
        currentBalance={currentBalance}
        totalDeposited={totalDeposited}
        totalPenalties={totalPenalties}
        totalPenaltyCount={totalPenaltyCount}
        outstandingPenaltyTotal={outstandingPenaltyTotal}
        targetAmount={target}
        currentRank={currentRank}
        compact={false}
      />

      {/* SECTION 4: DAY-BY-DAY SAVINGS STREAK TRACKER */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 shrink-0">
              <Flame className="w-8 h-8 fill-amber-500 text-amber-500 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                  Daily Savings Streak
                </span>
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                  Day-by-Day Tracking
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black font-display text-white tabular-nums">
                  {streakStats.currentStreak}
                </span>
                <span className="text-sm font-semibold text-slate-300">
                  {streakStats.currentStreak === 1 ? 'Day Consecutive Streak' : 'Days Consecutive Streak'}
                </span>
                <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
                  (Best: <strong className="text-slate-200">{streakStats.longestStreak} days</strong>)
                </span>
              </div>
            </div>
          </div>

          {/* Today's Streak Status */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-3 rounded-2xl self-start lg:self-auto">
            {streakStats.hasSavedToday > 0 ? (
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-emerald-400 block">Today's Streak Active!</span>
                  <span className="text-[11px] text-slate-300">
                    +{formatRs(streakStats.hasSavedToday)} saved today
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-full bg-amber-500/20 text-amber-400">
                  <Clock className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-400 block">Save Today to Extend!</span>
                  <span className="text-[11px] text-slate-400">
                    Deposit to preserve your flame
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 14-Day Day-by-Day Interactive Progression Strip */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Day-by-Day Savings History (Last 14 Days)
            </span>
            <span className="text-[11px] text-slate-400">
              {streakStats.totalActiveDays} Total Active Saving Days
            </span>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 overflow-x-auto pb-1 pt-1">
            {dayByDayStreak.map((day) => {
              const hadPenalty = day.penaltyAmount > 0;

              return (
                <div
                  key={day.dateStr}
                  className={`relative flex flex-col items-center justify-between p-2 rounded-2xl border text-center transition-all group ${
                    hadPenalty
                      ? 'bg-rose-950/20 border-rose-500/60 text-rose-300'
                      : day.isActive
                      ? 'bg-gradient-to-b from-amber-500/20 to-amber-950/40 border-amber-500/60 text-white shadow-md shadow-amber-500/10'
                      : day.isToday
                      ? 'bg-amber-950/20 border-amber-400/80 text-amber-300 ring-2 ring-amber-400/40 animate-pulse'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                  title={`${day.dateStr}: ${
                    hadPenalty
                      ? `Penalized −Rs. ${day.penaltyAmount}`
                      : day.isActive
                      ? `Saved ${formatRs(day.amountSaved)}`
                      : day.isToday
                      ? 'Pending Today'
                      : 'No Deposit'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-tight">
                    {day.dayName}
                  </span>

                  <span className="text-sm font-black font-mono my-1">
                    {day.dayNumber}
                  </span>

                  <div className="text-sm">
                    {hadPenalty ? (
                      <span className="text-rose-400 text-xs font-bold">🔴</span>
                    ) : day.isActive ? (
                      <span className="text-amber-400 inline-block transform group-hover:scale-125 transition-transform">
                        🔥
                      </span>
                    ) : day.isToday ? (
                      <span className="text-amber-300 text-xs">⏳</span>
                    ) : (
                      <span className="text-slate-600 text-xs">·</span>
                    )}
                  </div>

                  {day.amountSaved > 0 ? (
                    <span className="text-[9px] font-mono font-bold text-emerald-400 truncate max-w-full mt-0.5">
                      {formatRs(day.amountSaved)}
                    </span>
                  ) : hadPenalty ? (
                    <span className="text-[9px] font-mono font-bold text-rose-400 truncate max-w-full mt-0.5">
                      -Rs. {day.penaltyAmount}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 5: Current Rank Card + Rewards Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Rank Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-amber-400 block mb-0.5">
                  Current Gaming Rank
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display flex items-center gap-2">
                  <span>{currentRank.name} Tier</span>
                  <span className="text-xs font-normal text-slate-400 font-sans">
                    ({currentRank.badgeTheme})
                  </span>
                </h2>
              </div>
              <RankBadge rankId={currentRank.id} size="lg" isCurrent />
            </div>

            <p className="text-xs text-slate-300 italic mb-5">
              "{currentRank.tagline}"
            </p>

            {nextRank ? (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">
                    Next Rank: <strong className="text-amber-400">{nextRank.name}</strong>
                  </span>
                  <span className="font-mono text-slate-400">
                    Need <strong className="text-white font-bold">{formatPKR(rankProg.needed)}</strong> more
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(3, rankProg.percent)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{formatPKR(currentRank.minAmount)}</span>
                  <span className="font-semibold text-amber-400/90">{rankProg.percent}% to {nextRank.name}</span>
                  <span>{formatPKR(nextRank.minAmount)}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-yellow-950/30 border border-yellow-500/40 text-center space-y-1">
                <span className="text-xs font-bold text-yellow-300 uppercase tracking-wider block">
                  Conqueror Achieved
                </span>
                <p className="text-xs text-yellow-200/80">
                  You have unlocked the highest achievable rank with PKR 100,000+ saved!
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">9 Tier Progression System</span>
            <button
              onClick={() => onNavigateTab('journey')}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 min-h-[44px] cursor-pointer"
            >
              <span>Explore Rank Journey</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cash Saving Rewards Showcase */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-amber-400 block">
                  Saving Rewards
                </span>
                <h3 className="text-base font-bold text-white font-display">Deposit Awards</h3>
              </div>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Trophy className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Highest Single Deposit
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-xl font-black text-amber-400">
                    {rewardsStats.highestDeposit > 0 ? formatRs(rewardsStats.highestDeposit) : 'Rs. 0'}
                  </span>
                  {rewardsStats.highestDepositReward && (
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${rewardsStats.highestDepositReward.badgeBg} ${rewardsStats.highestDepositReward.textColor} border ${rewardsStats.highestDepositReward.badgeBorder}`}
                    >
                      <span>{rewardsStats.highestDepositReward.emoji}</span>
                      <span>{rewardsStats.highestDepositReward.title}</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Best Reward Earned
                </span>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">
                      {rewardsStats.bestRewardEarned ? rewardsStats.bestRewardEarned.emoji : '🌱'}
                    </span>
                    <span className="font-display font-bold text-sm text-white">
                      {rewardsStats.bestRewardEarned
                        ? `${rewardsStats.bestRewardEarned.title}!`
                        : 'First Deposit Awaited'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {rewardsStats.totalRewardsCount} Awards Earned
                  </span>
                </div>
              </div>
            </div>

            {/* Award Levels Collection Grid */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-semibold text-slate-300">
                  Award Levels Collection
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {rewardsStats.totalDepositsCount} Deposits
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {REWARD_LEVELS.filter((r) => r.id !== 'below_100').map((lvl) => {
                  const count = rewardsStats.breakdown[lvl.id] || 0;
                  const isEarned = count > 0;
                  return (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedRewardInfo(lvl)}
                      className={`p-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isEarned
                          ? `${lvl.badgeBg} ${lvl.badgeBorder} text-white`
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-500 opacity-60'
                      }`}
                      title={`${lvl.title}: Rs. ${lvl.minAmount.toLocaleString()}+ (Unlocked ${count}x)`}
                    >
                      <span className="text-sm">{lvl.emoji}</span>
                      <span className="text-[9px] font-bold mt-0.5 truncate max-w-full">
                        {lvl.title}
                      </span>
                      <span className="text-[8px] font-mono opacity-80">
                        {isEarned ? `×${count}` : '0'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Tap any award to view criteria</span>
            <Info className="w-3.5 h-3.5 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Award detail modal */}
      {selectedRewardInfo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="text-5xl">{selectedRewardInfo.emoji}</div>
            <h4 className="text-xl font-black font-display text-white">
              {selectedRewardInfo.title} Award
            </h4>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Deposit Criteria:</span>
                <span className="font-mono font-bold text-amber-400">
                  {selectedRewardInfo.maxAmount === Infinity
                    ? `Rs. ${selectedRewardInfo.minAmount.toLocaleString()}+`
                    : `Rs. ${selectedRewardInfo.minAmount.toLocaleString()} – ${selectedRewardInfo.maxAmount.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Unlocked:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {rewardsStats.breakdown[selectedRewardInfo.id] || 0} times
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 italic">"{selectedRewardInfo.message}"</p>
            <button
              onClick={() => setSelectedRewardInfo(null)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Motivation Quote */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/30 p-4 sm:p-5 flex items-center gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-400 block">
            Tactical Motivation
          </span>
          <p className="text-xs sm:text-sm text-slate-200 font-medium mt-0.5">
            "{motivationalMessage}"
          </p>
        </div>
      </div>

      {/* Quick Navigation Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <button
          onClick={onOpenAddModal}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all text-left group flex flex-col justify-between min-h-[90px] cursor-pointer"
        >
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <ArrowDownRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Add Cash</span>
            <span className="text-[11px] text-slate-400">Earn deposit rewards</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('milestones')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all text-left group flex flex-col justify-between min-h-[90px] cursor-pointer"
        >
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <Trophy className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">200 Milestones</span>
            <span className="text-[11px] text-slate-400">Rs. 500 Steps Matrix</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('journey')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all text-left group flex flex-col justify-between min-h-[90px] cursor-pointer"
        >
          <div className="flex items-center justify-between text-yellow-400 mb-2">
            <Award className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Rank Journey</span>
            <span className="text-[11px] text-slate-400">9 Tier Progression</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('history')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all text-left group flex flex-col justify-between min-h-[90px] cursor-pointer"
        >
          <div className="flex items-center justify-between text-sky-400 mb-2">
            <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">History & Penalties</span>
            <span className="text-[11px] text-slate-400">Audited cash records</span>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('analytics')}
          className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition-all text-left group flex flex-col justify-between min-h-[90px] cursor-pointer"
        >
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Analytics</span>
            <span className="text-[11px] text-slate-400">Trading charts & trends</span>
          </div>
        </button>
      </div>

      {/* Recent Activity List with Rewards & Penalty Badges */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white font-display">Recent Activity & Events</h3>
            <p className="text-xs text-slate-400">Chronological history of deposits, penalties, and rewards</p>
          </div>
          <button
            onClick={() => onNavigateTab('history')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 min-h-[44px] flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentEntries.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-300 font-medium">No savings entries recorded yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tap "Add Cash" above to record your first saving and earn your first reward badge!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {recentEntries.slice(0, 6).map((entry) => {
              const isPenalty = entry.type === 'penalty';
              const isSaving = entry.type === 'saving';

              return (
                <div
                  key={entry.id}
                  onClick={() => onEditEntry(entry)}
                  className={`py-3.5 flex items-center justify-between gap-4 -mx-2 px-2 rounded-xl transition-colors cursor-pointer group ${
                    isPenalty ? 'hover:bg-rose-950/20' : 'hover:bg-slate-850/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPenalty
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : isSaving
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isPenalty ? (
                        <AlertOctagon className="w-5 h-5 text-rose-400" />
                      ) : isSaving ? (
                        <ArrowDownRight className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white block truncate">
                          {isPenalty
                            ? 'Daily saving target missed'
                            : entry.note || (isSaving ? 'Cash Saved' : 'Cash Withdrawal')}
                        </span>

                        {isPenalty ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            Target Missed ❌
                          </span>
                        ) : isSaving && entry.amount >= 200 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Target Achieved ✅
                          </span>
                        ) : null}

                        {isSaving && (() => {
                          const reward = getDepositReward(entry.amount);
                          return (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${reward.badgeBg} ${reward.textColor} border ${reward.badgeBorder}`}
                              title={reward.message}
                            >
                              <span>{reward.emoji}</span>
                              <span>{reward.title}</span>
                            </span>
                          );
                        })()}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 font-mono">
                        <span>{entry.date}</span>
                        <span>·</span>
                        <span className="capitalize">{entry.source.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    {isPenalty ? (
                      <span className="text-sm font-black text-rose-400 block">
                        −Rs. {(entry.actualDeducted ?? entry.amount).toLocaleString()} 🔴
                      </span>
                    ) : (
                      <span
                        className={`text-sm font-bold block ${
                          isSaving ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isSaving ? '+' : '-'}
                        {formatRs(entry.amount)}
                      </span>
                    )}

                    {entry.runningBalance !== undefined && (
                      <span className="text-[11px] text-slate-400 block">
                        Bal: {formatRs(entry.runningBalance)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
