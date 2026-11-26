import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RankBadge } from './RankBadge';
import { formatPKR } from '../utils/ranks';
import { Trophy, CheckCircle2, RotateCcw, X, Target, Calendar, Award } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalSaved: number;
  totalEntries: number;
  activeDays: number;
  longestStreak: number;
  onSetNewGoal: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  totalSaved,
  totalEntries,
  activeDays,
  longestStreak,
  onSetNewGoal,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Continuous majestic victory confetti cannon
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#EAB308', '#F59E0B', '#FDE047', '#38BDF8', '#10B981', '#EC4899'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  }, [isOpen]);

  if (!isOpen) return null;

  const todayFormatted = new Date().toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-yellow-400 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(234,179,8,0.35)] my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close victory screen"
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Halo */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-60 bg-yellow-500/20 blur-3xl rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-400/40 text-yellow-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span>Ultimate Achievement Unlocked</span>
        </div>

        {/* Badge */}
        <div className="my-3 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500/25 blur-3xl rounded-full scale-150 animate-pulse" />
            <RankBadge rankId="conqueror" size="xl" isCurrent className="relative z-10" />
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight">
          PKR 100,000 CONQUERED!
        </h1>
        <p className="text-yellow-400 font-medium text-sm mt-1">
          You have reached the legendary Conqueror Rank
        </p>

        {/* Highlight Stats Card */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3.5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-yellow-400" />
              Final Goal Conquered
            </span>
            <span className="font-mono text-base font-extrabold text-yellow-400">
              {formatPKR(totalSaved)} (100%)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Active Days
              </span>
              <span className="font-mono text-sm font-bold text-white mt-0.5 block">
                {activeDays} Days
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Top Streak
              </span>
              <span className="font-mono text-sm font-bold text-amber-400 mt-0.5 block">
                {longestStreak} Days
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Deposits
              </span>
              <span className="font-mono text-sm font-bold text-emerald-400 mt-0.5 block">
                {totalEntries}
              </span>
            </div>
          </div>

          <div className="pt-2 text-xs text-slate-400 flex items-center justify-between border-t border-slate-800/80">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Conquered on
            </span>
            <span className="font-medium text-slate-200">{todayFormatted}</span>
          </div>
        </div>

        {/* Motivational victory quote */}
        <p className="text-xs text-slate-300 italic mt-4 max-w-sm mx-auto">
          "One hundred thousand rupees in real savings proves you possess elite financial discipline. You have mastered the game of cash."
        </p>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={onSetNewGoal}
            className="w-full min-h-[48px] py-3 px-4 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 hover:from-yellow-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-yellow-500/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Set New Target (Preserve History)</span>
          </button>

          <button
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Admire My Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
