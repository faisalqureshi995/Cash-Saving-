import React from 'react';
import { ACHIEVEMENTS, formatPKR } from '../utils/ranks';
import { StreakStats } from '../utils/streaks';
import { Trophy, Award, Lock, CheckCircle2, Flame, Star, Sparkles } from 'lucide-react';

interface AchievementsViewProps {
  currentSavings: number;
  streakStats: StreakStats;
  unlockedMilestones: string[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  currentSavings,
  streakStats,
}) => {
  // Determine earned achievements dynamically
  const computedAchievements = ACHIEVEMENTS.map((ach) => {
    let isUnlocked = false;
    let progress = 0;

    if (ach.thresholdAmount) {
      isUnlocked = currentSavings >= ach.thresholdAmount;
      progress = Math.min(100, Math.round((currentSavings / ach.thresholdAmount) * 100));
    } else if (ach.thresholdStreak) {
      const maxStreak = Math.max(streakStats.currentStreak, streakStats.longestStreak);
      isUnlocked = maxStreak >= ach.thresholdStreak;
      progress = Math.min(100, Math.round((maxStreak / ach.thresholdStreak) * 100));
    }

    return {
      ...ach,
      isUnlocked,
      progress,
    };
  });

  const totalUnlocked = computedAchievements.filter((a) => a.isUnlocked).length;
  const completionPercent = Math.round((totalUnlocked / computedAchievements.length) * 100);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                Trophy Room
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Milestones & Achievements
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Permanent gaming medals awarded for hitting monetary targets, building unbreakable streaks, and mastering personal savings discipline.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shrink-0 text-center sm:text-right space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Unlocked Medals
            </span>
            <span className="font-mono text-2xl font-black text-amber-400 block">
              {totalUnlocked} / {computedAchievements.length}
            </span>
            <span className="text-[11px] text-slate-400 block">
              {completionPercent}% Showcase Complete
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {computedAchievements.map((ach) => {
          return (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all ${
                ach.isUnlocked
                  ? 'bg-slate-900/90 border-amber-500/50 shadow-md shadow-amber-500/5'
                  : 'bg-slate-950/50 border-slate-800/80 opacity-70'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Medal Icon Container */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    ach.isUnlocked
                      ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border-amber-400/40 text-amber-400 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  {ach.category === 'streak' ? (
                    <Flame
                      className={`w-6 h-6 ${
                        ach.isUnlocked ? 'text-amber-400 fill-amber-400/30' : 'text-slate-600'
                      }`}
                    />
                  ) : (
                    <Trophy className="w-6 h-6" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-white font-display flex items-center gap-1.5 truncate">
                      <span>{ach.title}</span>
                    </h2>
                    {ach.isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Unlocked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                        <Lock className="w-3 h-3" />
                        <span>{ach.progress}%</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300">{ach.description}</p>

                  {/* Progress Bar for Locked */}
                  {!ach.isUnlocked && (
                    <div className="pt-2 space-y-1">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${ach.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>
                          {ach.thresholdAmount
                            ? `Current: ${formatPKR(currentSavings)}`
                            : `Streak: ${streakStats.currentStreak}d`}
                        </span>
                        <span>
                          {ach.thresholdAmount
                            ? `Goal: ${formatPKR(ach.thresholdAmount)}`
                            : `Goal: ${ach.thresholdStreak}d`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
