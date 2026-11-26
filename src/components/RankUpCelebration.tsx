import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RankDefinition } from '../types';
import { RankBadge } from './RankBadge';
import { formatPKR } from '../utils/ranks';
import { Sparkles, Trophy, ArrowRight, X } from 'lucide-react';

interface RankUpCelebrationProps {
  rank: RankDefinition;
  nextRank: RankDefinition | null;
  currentBalance: number;
  onClose: () => void;
  onViewJourney: () => void;
}

export const RankUpCelebration: React.FC<RankUpCelebrationProps> = ({
  rank,
  nextRank,
  currentBalance,
  onClose,
  onViewJourney,
}) => {
  useEffect(() => {
    // Fire festive esports-style confetti burst
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#F59E0B', '#FBBF24', '#FEF08A'],
    });
    fire(0.2, {
      spread: 60,
      colors: ['#38BDF8', '#818CF8', '#C084FC'],
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      colors: ['#10B981', '#34D399'],
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, [rank.id]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close rank up modal"
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Header Kicker */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Rank Up Achieved!</span>
        </div>

        {/* Giant Animated Badge */}
        <div className="my-4 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full scale-125" />
            <RankBadge rankId={rank.id} size="xl" isCurrent className="relative z-10" />
          </div>
        </div>

        {/* Rank Title & Tagline */}
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white mb-1">
          {rank.name.toUpperCase()} UNLOCKED
        </h2>
        <p className="text-amber-400 font-medium text-sm mb-4">{rank.tagline}</p>

        {/* Saved Milestone Info Box */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left space-y-2 mb-6">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Total Cash Saved</span>
            <span className="font-mono text-sm font-bold text-amber-400">
              {formatPKR(currentBalance)}
            </span>
          </div>

          {nextRank ? (
            <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
              <span className="text-slate-400">Next Target: {nextRank.name}</span>
              <span className="font-mono text-slate-200">
                {formatPKR(nextRank.minAmount)}
              </span>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-800/80 text-center text-xs font-semibold text-amber-300">
              Maximum Tier Reached! You are a Conqueror.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              onClose();
              onViewJourney();
            }}
            className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <span>View Rank Journey</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Continue Saving
          </button>
        </div>
      </div>
    </div>
  );
};
