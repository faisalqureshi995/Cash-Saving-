import React from 'react';
import { RankDefinition, RankTierId } from '../types';
import { RANK_DEFINITIONS, formatPKR, getRankProgress, getNextRank } from '../utils/ranks';
import { RankBadge } from './RankBadge';
import { CheckCircle2, Lock, Sparkles, Trophy, ArrowRight, ShieldCheck } from 'lucide-react';

interface RankJourneyProps {
  currentSavings: number;
  currentRank: RankDefinition;
  onOpenAddModal: () => void;
}

export const RankJourney: React.FC<RankJourneyProps> = ({
  currentSavings,
  currentRank,
  onOpenAddModal,
}) => {
  const currentRankIndex = RANK_DEFINITIONS.findIndex((r) => r.id === currentRank.id);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                Rank Progression Path
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              The Path to Conqueror
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Nine prestigious ranks awarded strictly by your accumulated cash savings. Save daily, level up your badge, and conquer the PKR 100,000 summit.
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0">
            <RankBadge rankId={currentRank.id} size="md" isCurrent />
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Current Standing
              </span>
              <span className="text-base font-bold text-white font-display block">
                {currentRank.name} Tier
              </span>
              <span className="text-xs font-mono text-amber-400">
                {formatPKR(currentSavings)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progression Path - Timeline / Milestones */}
      <div className="relative space-y-4">
        {/* Vertical connector line on desktop */}
        <div className="hidden sm:block absolute left-12 top-8 bottom-8 w-1 bg-gradient-to-b from-amber-600 via-purple-600 to-yellow-400 rounded-full opacity-30 pointer-events-none" />

        {RANK_DEFINITIONS.map((rank, index) => {
          const isCompleted = currentSavings > rank.maxAmount;
          const isCurrent = rank.id === currentRank.id;
          const isLocked = currentSavings < rank.minAmount;
          const nextRank = getNextRank(rank.id);
          const prog = isCurrent ? getRankProgress(currentSavings, rank, nextRank) : null;

          return (
            <div
              key={rank.id}
              className={`relative rounded-3xl p-5 sm:p-6 transition-all border ${
                isCurrent
                  ? 'bg-slate-900/90 border-amber-500/80 shadow-[0_0_30px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                  : isCompleted
                  ? 'bg-slate-900/50 border-slate-800'
                  : 'bg-slate-950/40 border-slate-800/60 opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                {/* Left: Badge & Rank Overview */}
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <RankBadge
                      rankId={rank.id}
                      size="lg"
                      isLocked={isLocked}
                      isCurrent={isCurrent}
                    />
                    {isCompleted && (
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-800 text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-extrabold text-white font-display">
                        Tier {rank.order}: {rank.name}
                      </h2>
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                          Active Rank
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-medium text-emerald-400">
                          Completed
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-[10px] text-slate-400">
                          Locked
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 font-medium">
                      {rank.tagline}
                    </p>

                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>Requirement:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {rank.maxAmount === Infinity
                          ? `${formatPKR(rank.minAmount)}+`
                          : `${formatPKR(rank.minAmount)} – ${formatPKR(rank.maxAmount)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status / Progress / Action */}
                <div className="w-full sm:w-64 shrink-0 text-left sm:text-right">
                  {isCurrent ? (
                    <div className="space-y-2">
                      <div className="flex justify-between sm:justify-end gap-2 text-xs">
                        <span className="text-slate-400">Progress to Next Tier:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {prog ? `${prog.percent}%` : '100%'}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                          style={{ width: `${prog ? prog.percent : 100}%` }}
                        />
                      </div>
                      {prog && prog.needed > 0 && (
                        <span className="text-[11px] text-slate-400 block">
                          Save <strong className="text-white font-mono">{formatPKR(prog.needed)}</strong> more to unlock
                        </span>
                      )}
                    </div>
                  ) : isCompleted ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Unlocked & Conquered</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="text-xs text-slate-400 block">
                        Requires {formatPKR(rank.minAmount)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Need {formatPKR(rank.minAmount - currentSavings)} more
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tier Perks Checklist */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
                <span className="text-slate-400 font-semibold">Tier Perks:</span>
                {rank.perks.map((perk, pIdx) => (
                  <span key={pIdx} className="flex items-center gap-1 text-slate-300">
                    <span className="text-amber-400">✓</span> {perk}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating CTA footer banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 p-6 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-amber-500/20">
        <div>
          <h3 className="text-lg font-black font-display">Ready to rank up right now?</h3>
          <p className="text-xs font-medium text-slate-900 mt-0.5">
            Every positive cash deposit advances you through the 9 competitive tiers.
          </p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="min-h-[44px] px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm rounded-xl active:scale-95 transition-all shadow-md shrink-0"
        >
          Add Cash Now
        </button>
      </div>
    </div>
  );
};
