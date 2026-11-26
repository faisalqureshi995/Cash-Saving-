import React, { useEffect, useState } from 'react';
import { formatPKR } from '../utils/ranks';
import { Trophy, Sparkles, CheckCircle2, ChevronRight, Target } from 'lucide-react';

interface MilestoneCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedMilestoneNum: number;
  unlockedCount: number; // usually 1, or more if a big deposit crossed multiple
  currentBalance: number;
  nextMilestoneNum: number;
  isAllCompleted: boolean;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  isOpen,
  onClose,
  completedMilestoneNum,
  unlockedCount,
  currentBalance,
  nextMilestoneNum,
  isAllCompleted,
}) => {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; color: string; delay: number; duration: number }[]
  >([]);

  useEffect(() => {
    if (isOpen) {
      const colors = ['#F59E0B', '#10B981', '#EAB308', '#38BDF8', '#EC4899', '#A855F7', '#FFFFFF'];
      const pts = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // 0 - 100vw %
        y: Math.random() * 20 - 10, // top spawn
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        duration: Math.random() * 2 + 1.5,
      }));
      setParticles(pts);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const milestoneValue = completedMilestoneNum * 500;
  const remainingTo100k = Math.max(0, 100000 - currentBalance);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
    >
      {/* Floating Confetti Layer */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-fall opacity-90 shadow-sm"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Main Celebration Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/50 p-6 sm:p-7 shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center space-y-5 animate-scale-up">
        {/* Glow behind badge */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

        {/* Top Celebration Icon / Badge */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-400 p-0.5 shadow-xl shadow-amber-500/30 animate-bounce">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-3xl">
              {isAllCompleted ? '👑' : '🏆'}
            </div>
          </div>
          <span className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black tracking-wider uppercase shadow-md">
            {isAllCompleted ? 'ALL 200 COMPLETE' : `MILESTONE #${completedMilestoneNum}`}
          </span>
        </div>

        {/* Main Heading & Motivational Message */}
        <div className="space-y-1.5 pt-1">
          <h3 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
            {isAllCompleted ? (
              <span className="text-amber-400">All 200 Milestones Completed!</span>
            ) : (
              <span>Milestone Completed! 🏆</span>
            )}
          </h3>

          <p className="text-sm font-semibold text-emerald-400">
            {isAllCompleted
              ? '🎉 Congratulations! You reached the pinnacle of PKR 100,000!'
              : unlockedCount > 1
              ? `Incredible! ${unlockedCount} Milestones (${formatPKR(unlockedCount * 500)}) Conquered at once!`
              : 'Rs. 500 saved. Your next target has started!'}
          </p>

          <p className="text-xs text-slate-300">
            {isAllCompleted
              ? 'You have completed every single one of the 200 Rs. 500 milestones.'
              : `Cumulative savings threshold of ${formatPKR(milestoneValue)} successfully unlocked.`}
          </p>
        </div>

        {/* Stats Summary Strip */}
        <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              Completed Milestones
            </span>
            <span className="text-base font-black text-amber-400 font-display">
              {completedMilestoneNum} / 200
            </span>
            <span className="text-[10px] text-slate-400 block font-sans">
              {((completedMilestoneNum / 200) * 100).toFixed(1)}% of 100K Goal
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
              Next Target
            </span>
            <span className="text-base font-black text-white font-display">
              {isAllCompleted ? 'Goal Achieved 🌟' : `Milestone #${nextMilestoneNum}`}
            </span>
            <span className="text-[10px] text-emerald-400 block font-sans">
              {isAllCompleted ? '100% Unlocked' : `${formatPKR(nextMilestoneNum * 500)}`}
            </span>
          </div>
        </div>

        {/* Amount Remaining Strip */}
        {!isAllCompleted && remainingTo100k > 0 && (
          <div className="flex justify-between items-center px-4 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <span className="text-slate-400">Remaining to PKR 100,000:</span>
            <span className="font-mono font-bold text-amber-400">
              {formatPKR(remainingTo100k)}
            </span>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          onClick={onClose}
          className="w-full min-h-[48px] py-3 px-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{isAllCompleted ? 'Celebrate Victory 🎉' : 'Awesome! Next Target Started 🚀'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
