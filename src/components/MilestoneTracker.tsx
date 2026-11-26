import React, { useState, useMemo, useRef, useEffect } from 'react';
import { formatPKR } from '../utils/ranks';
import {
  calculateMilestoneStats,
  generateMilestonesList,
  getMilestoneMotivationalMessage,
  MilestoneStats,
  MILESTONE_STEP,
  TOTAL_MILESTONES,
  FINAL_SAVINGS_GOAL,
} from '../utils/milestones';
import {
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  ChevronRight,
  Target,
  ArrowRight,
  TrendingUp,
  Layers,
  Search,
  Zap,
} from 'lucide-react';

interface MilestoneTrackerProps {
  currentBalance: number;
  onOpenAddModal?: () => void;
  compact?: boolean;
}

type FilterView = 'nearby' | 'all' | 'completed' | 'upcoming' | 'tier1' | 'tier2' | 'tier3' | 'tier4';

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  currentBalance,
  onOpenAddModal,
  compact = false,
}) => {
  const [filterView, setFilterView] = useState<FilterView>('nearby');
  const [searchQuery, setSearchQuery] = useState('');
  const activeMilestoneRef = useRef<HTMLDivElement | null>(null);

  // Compute stats dynamically from actual savings balance
  const stats: MilestoneStats = useMemo(() => {
    return calculateMilestoneStats(currentBalance);
  }, [currentBalance]);

  // Generate all 200 milestone objects
  const allMilestones = useMemo(() => {
    return generateMilestonesList(currentBalance);
  }, [currentBalance]);

  const motivationalMessage = useMemo(() => {
    return getMilestoneMotivationalMessage(stats);
  }, [stats]);

  // Filtered subset of milestones for display
  const displayedMilestones = useMemo(() => {
    let list = allMilestones;

    if (filterView === 'nearby') {
      const current = stats.currentMilestoneNumber;
      // Show ~12 milestones around current
      const start = Math.max(1, current - 4);
      const end = Math.min(TOTAL_MILESTONES, current + 11);
      list = allMilestones.filter((m) => m.number >= start && m.number <= end);
    } else if (filterView === 'completed') {
      list = allMilestones.filter((m) => m.isCompleted);
    } else if (filterView === 'upcoming') {
      list = allMilestones.filter((m) => !m.isCompleted);
    } else if (filterView === 'tier1') {
      list = allMilestones.filter((m) => m.number <= 50);
    } else if (filterView === 'tier2') {
      list = allMilestones.filter((m) => m.number > 50 && m.number <= 100);
    } else if (filterView === 'tier3') {
      list = allMilestones.filter((m) => m.number > 100 && m.number <= 150);
    } else if (filterView === 'tier4') {
      list = allMilestones.filter((m) => m.number > 150);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.number.toString().includes(q) ||
          m.threshold.toString().includes(q) ||
          `milestone ${m.number}`.includes(q)
      );
    }

    return list;
  }, [allMilestones, filterView, stats.currentMilestoneNumber, searchQuery]);

  const handleJumpToCurrent = () => {
    setFilterView('nearby');
    setSearchQuery('');
    setTimeout(() => {
      activeMilestoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 relative overflow-hidden space-y-6">
      {/* Background ambient gold/emerald glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* 1. HEADER & OVERVIEW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/10 to-emerald-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 shrink-0">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                Rs. 500 Saving Milestones
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                200 Steps to 100K
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight mt-0.5">
              Micro-Milestone Progress Matrix
            </h2>
          </div>
        </div>

        {/* Jump to Active Milestone Button */}
        <button
          onClick={handleJumpToCurrent}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-amber-400 hover:text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
          title="Scroll straight to your active milestone"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Jump to Current #{stats.currentMilestoneNumber}</span>
        </button>
      </div>

      {/* 2. DYNAMIC MILESTONE DASHBOARD STATS (6 KEY STATS) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Stat 1: Total Savings */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Total Savings
          </span>
          <span className="font-mono text-lg sm:text-xl font-black text-white block mt-1">
            {formatPKR(stats.totalSavings)}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            {stats.overallPercent}% of Goal
          </span>
        </div>

        {/* Stat 2: Completed Milestones */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">
              Completed Milestones
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-mono text-lg sm:text-xl font-black text-emerald-400 block mt-1">
            {stats.completedCount} / {TOTAL_MILESTONES}
          </span>
          <span className="text-[10px] text-emerald-300/80 block font-mono">
            {formatPKR(stats.completedCount * MILESTONE_STEP)} saved
          </span>
        </div>

        {/* Stat 3: Current Milestone */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-semibold">
              Current Milestone
            </span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          </div>
          <span className="font-mono text-lg sm:text-xl font-black text-amber-400 block mt-1">
            #{stats.currentMilestoneNumber}
          </span>
          <span className="text-[10px] text-slate-300 block font-mono">
            Target: {formatPKR(stats.currentMilestoneNumber * MILESTONE_STEP)}
          </span>
        </div>

        {/* Stat 4: Progress in Current Milestone */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            In Current Milestone
          </span>
          <span className="font-mono text-lg sm:text-xl font-black text-white block mt-1">
            {formatPKR(stats.progressInCurrent)} / {formatPKR(MILESTONE_STEP)}
          </span>
          <span className="text-[10px] text-amber-400 block font-mono font-bold">
            {stats.currentMilestonePercent}% completed
          </span>
        </div>

        {/* Stat 5: Remaining for Next Milestone */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Next Milestone In
          </span>
          <span className="font-mono text-lg sm:text-xl font-black text-amber-300 block mt-1">
            {stats.isAllCompleted ? 'Rs. 0' : formatPKR(stats.remainingForNext)}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            {stats.isAllCompleted ? 'All Achieved' : 'To complete card'}
          </span>
        </div>

        {/* Stat 6: Amount Remaining to Reach Rs. 100,000 */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
            Remaining to 100K
          </span>
          <span className="font-mono text-lg sm:text-xl font-black text-slate-200 block mt-1">
            {formatPKR(stats.amountRemainingTo100k)}
          </span>
          <span className="text-[10px] text-slate-400 block font-mono">
            Final Target
          </span>
        </div>
      </div>

      {/* 3. CURRENT RS. 500 MILESTONE PROGRESS BAR (PROMINENT ACTIVE HUD) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-amber-500/30 shadow-lg space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white font-display flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              {stats.isAllCompleted
                ? '🎉 All 200 Milestones Completed!'
                : `Active Milestone #${stats.currentMilestoneNumber}: Target ${formatPKR(
                    stats.currentMilestoneNumber * MILESTONE_STEP
                  )}`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-semibold">
            <span className="text-white font-bold">
              {formatPKR(stats.progressInCurrent)}
            </span>
            <span className="text-slate-400">/ {formatPKR(MILESTONE_STEP)}</span>
            <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
              {stats.currentMilestonePercent}%
            </span>
          </div>
        </div>

        {/* Glowing Progress Track */}
        <div className="w-full h-3.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 rounded-full transition-all duration-500 relative shadow-[0_0_12px_rgba(234,179,8,0.5)]"
            style={{ width: `${Math.max(2, stats.currentMilestonePercent)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-shimmer" />
          </div>
        </div>

        {/* Progress Subtext & Motivational Quote */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-300 gap-1 pt-0.5">
          <span>
            {stats.isAllCompleted ? (
              <strong className="text-emerald-400">Pinnacle Achieved! PKR 100,000 Saved!</strong>
            ) : (
              <>
                Save <strong className="text-amber-400">{formatPKR(stats.remainingForNext)}</strong> more to unlock Milestone #{stats.currentMilestoneNumber} ✅
              </>
            )}
          </span>

          <span className="text-slate-400 text-[11px] italic">
            "{motivationalMessage}"
          </span>
        </div>
      </div>

      {/* 4. FILTER TABS & SEARCH BAR FOR 200 MILESTONES GRID */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* View Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterView('nearby')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer min-h-[36px] ${
                filterView === 'nearby'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Current & Nearby (±12)
            </button>
            <button
              onClick={() => setFilterView('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer min-h-[36px] ${
                filterView === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All 200 Milestones
            </button>
            <button
              onClick={() => setFilterView('completed')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer min-h-[36px] ${
                filterView === 'completed'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Completed ({stats.completedCount})
            </button>
            <button
              onClick={() => setFilterView('upcoming')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer min-h-[36px] ${
                filterView === 'upcoming'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Upcoming ({TOTAL_MILESTONES - stats.completedCount})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search # or Rs..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tier Range Quick Shortcuts */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-slate-400">
          <span className="font-sans text-slate-500 mr-1">Tiers:</span>
          {(
            [
              { id: 'tier1', label: '1–50 (0–25k)' },
              { id: 'tier2', label: '51–100 (25k–50k)' },
              { id: 'tier3', label: '101–150 (50k–75k)' },
              { id: 'tier4', label: '151–200 (75k–100k)' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterView(t.id)}
              className={`px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                filterView === t.id
                  ? 'bg-slate-800 border-amber-500/60 text-amber-300 font-bold'
                  : 'bg-slate-950/40 border-slate-800 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
          <span className="ml-auto text-slate-500">
            Showing {displayedMilestones.length} of {TOTAL_MILESTONES}
          </span>
        </div>
      </div>

      {/* 5. GRID OF MILESTONE CARDS (Showing Completed, Current Glowing 🌟, Upcoming Locked 🔒) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[500px] overflow-y-auto pr-1">
        {displayedMilestones.map((m) => {
          if (m.isCompleted) {
            // COMPLETED MILESTONE CARD: Green checkmark ✅, emerald background
            return (
              <div
                key={m.number}
                className="p-3 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-slate-950/80 border border-emerald-500/40 shadow-sm relative group hover:border-emerald-400 transition-all flex flex-col justify-between min-h-[96px]"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-black text-emerald-400">
                    #{m.number}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-2">
                  <span className="font-mono text-sm font-extrabold text-white block">
                    {formatPKR(m.threshold)}
                  </span>
                  <span className="text-[10px] text-emerald-300/80 font-bold block flex items-center gap-1">
                    Completed ✅
                  </span>
                </div>
              </div>
            );
          }

          if (m.isCurrent) {
            // CURRENT ACTIVE MILESTONE CARD: Glowing gold border 🌟
            return (
              <div
                key={m.number}
                ref={activeMilestoneRef}
                className="p-3.5 rounded-2xl bg-gradient-to-b from-amber-500/20 via-slate-900 to-amber-950/40 border-2 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] relative animate-pulse flex flex-col justify-between min-h-[105px] ring-2 ring-amber-400/40"
              >
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-black text-amber-300">
                    #{m.number}
                  </span>
                  <span className="text-base" title="Current Active Milestone">
                    🌟
                  </span>
                </div>

                <div className="mt-1 space-y-1">
                  <span className="font-mono text-sm font-black text-white block">
                    {formatPKR(m.threshold)}
                  </span>

                  {/* Mini Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 rounded-full"
                      style={{ width: `${Math.max(5, m.progressPercent)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] font-mono text-amber-300">
                    <span>Rs. {m.progressInMilestone}</span>
                    <span>Rs. 500</span>
                  </div>
                </div>
              </div>
            );
          }

          // UPCOMING LOCKED MILESTONE CARD: Muted style with lock icon 🔒
          return (
            <div
              key={m.number}
              className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-slate-500 flex flex-col justify-between min-h-[96px] hover:border-slate-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <span className="font-mono text-xs font-semibold text-slate-500">
                  #{m.number}
                </span>
                <Lock className="w-3.5 h-3.5 text-slate-600" />
              </div>

              <div className="mt-2">
                <span className="font-mono text-sm font-bold text-slate-400 block">
                  {formatPKR(m.threshold)}
                </span>
                <span className="text-[10px] text-slate-600 block">
                  Locked 🔒
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. FOOTER WITH QUICK ACTION */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Green = Completed ✅</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span>🌟 Gold = Current Active Target</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Muted = Upcoming 🔒</span>
          </span>
        </div>

        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Add Cash to Advance Milestone</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
