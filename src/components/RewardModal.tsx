import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DepositRewardLevel, formatRs } from '../utils/rewards';
import { Sparkles, X, CheckCircle2, TrendingUp } from 'lucide-react';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: DepositRewardLevel;
  amount: number;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  onClose,
  reward,
  amount,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Trigger subtle or festive confetti based on reward tier
    if (reward.confettiCount > 0) {
      const isTopTier = reward.id === 'exceptional' || reward.id === 'legendary';

      confetti({
        particleCount: reward.confettiCount,
        spread: isTopTier ? 90 : 60,
        origin: { y: 0.65 },
        colors:
          reward.id === 'legendary'
            ? ['#F43F5E', '#F59E0B', '#EAB308', '#8B5CF6']
            : reward.id === 'exceptional'
            ? ['#A855F7', '#EC4899', '#F59E0B']
            : reward.id === 'outstanding'
            ? ['#EAB308', '#F59E0B', '#FBBF24']
            : reward.id === 'brilliant'
            ? ['#06B6D4', '#38BDF8', '#E0F2FE']
            : ['#10B981', '#38BDF8', '#F59E0B'],
      });
    }
  }, [isOpen, reward]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      <div
        className={`relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 ${reward.badgeBorder} rounded-3xl p-6 sm:p-8 text-center shadow-2xl ${reward.glowColor} overflow-hidden`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close reward popup"
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Header Kicker */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-slate-300 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Cash Saving Reward</span>
        </div>

        {/* Large Animated Emoji (Chess.com Move Evaluation Style) */}
        <div className="my-4 flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full scale-125" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-950/90 border border-slate-800 flex items-center justify-center text-5xl sm:text-6xl shadow-inner transform transition-transform hover:scale-110 animate-bounce duration-700">
              {reward.emoji}
            </div>
          </div>
        </div>

        {/* Reward Title */}
        <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center justify-center gap-2">
          <span>{reward.title}!</span>
          <span>{reward.emoji}</span>
        </h2>

        {/* Amount Saved Badge */}
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/80 border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Saved:</span>
          <span className="font-mono text-lg sm:text-xl font-black text-amber-400">
            {formatRs(amount)}
          </span>
        </div>

        {/* Motivational Message */}
        <p className="mt-4 text-sm sm:text-base font-medium text-slate-200 max-w-xs mx-auto leading-relaxed">
          "{reward.message}"
        </p>

        {/* Status Pill */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Recorded & added to your lifetime savings</span>
        </div>

        {/* Awesome Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            autoFocus
            className="w-full min-h-[48px] py-3 px-6 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-base rounded-2xl shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Awesome!</span>
            <span>{reward.emoji}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
