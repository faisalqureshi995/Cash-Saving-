import { RankDefinition, RankTierId, Achievement } from '../types';

export const RANK_DEFINITIONS: RankDefinition[] = [
  {
    id: 'bronze',
    order: 1,
    name: 'Bronze',
    minAmount: 0,
    maxAmount: 4999,
    badgeTheme: 'Bronze / Warm Copper',
    themeColor: '#CD7F32',
    accentBg: 'bg-amber-950/40',
    accentBorder: 'border-amber-700/50',
    glowColor: 'shadow-amber-900/30',
    tagline: 'The Journey Begins',
    perks: ['Unlock Daily Savings Streak', 'Custom Note Tracking', 'Bronze Tier Badge'],
  },
  {
    id: 'silver',
    order: 2,
    name: 'Silver',
    minAmount: 5000,
    maxAmount: 9999,
    badgeTheme: 'Silver / Polished Steel',
    themeColor: '#C0C0C0',
    accentBg: 'bg-slate-800/60',
    accentBorder: 'border-slate-400/50',
    glowColor: 'shadow-slate-400/20',
    tagline: 'Building the Foundation',
    perks: ['Milestone Tracker Activated', 'Silver Tier Badge', 'Weekly Velocity Metric'],
  },
  {
    id: 'gold',
    order: 3,
    name: 'Gold',
    minAmount: 10000,
    maxAmount: 19999,
    badgeTheme: 'Gold / Radiant Amber',
    themeColor: '#F59E0B',
    accentBg: 'bg-amber-950/50',
    accentBorder: 'border-amber-500/60',
    glowColor: 'shadow-amber-500/30',
    tagline: 'Double-Digit Financial Force',
    perks: ['Five Figures Saver Club', 'Gold Radiant Aura', 'Monthly Comparison Charts'],
  },
  {
    id: 'platinum',
    order: 4,
    name: 'Platinum',
    minAmount: 20000,
    maxAmount: 34999,
    badgeTheme: 'Platinum / Cyan Glaze',
    themeColor: '#38BDF8',
    accentBg: 'bg-sky-950/50',
    accentBorder: 'border-sky-400/60',
    glowColor: 'shadow-sky-500/30',
    tagline: 'Elite Financial Discipline',
    perks: ['Platinum Prestige Crest', 'Quarter Milestone Sight', 'Custom Source Analytics'],
  },
  {
    id: 'diamond',
    order: 5,
    name: 'Diamond',
    minAmount: 35000,
    maxAmount: 49999,
    badgeTheme: 'Diamond / Crystalline Cyan',
    themeColor: '#06B6D4',
    accentBg: 'bg-cyan-950/50',
    accentBorder: 'border-cyan-400/60',
    glowColor: 'shadow-cyan-400/30',
    tagline: 'Unshakeable Wealth Momentum',
    perks: ['Diamond Prism Badge', 'Halfway Target Approach', 'Deep Growth Projection'],
  },
  {
    id: 'crown',
    order: 6,
    name: 'Crown',
    minAmount: 50000,
    maxAmount: 69999,
    badgeTheme: 'Crown / Royal Purple & Gold',
    themeColor: '#A855F7',
    accentBg: 'bg-purple-950/50',
    accentBorder: 'border-purple-500/60',
    glowColor: 'shadow-purple-500/30',
    tagline: 'The Halfway Sovereign',
    perks: ['Over 50% Goal Conquered', 'Crown Insignia Badge', 'Senior Saver Privileges'],
  },
  {
    id: 'ace',
    order: 7,
    name: 'Ace',
    minAmount: 70000,
    maxAmount: 89999,
    badgeTheme: 'Ace / Crimson Blaze',
    themeColor: '#EF4444',
    accentBg: 'bg-rose-950/50',
    accentBorder: 'border-rose-500/60',
    glowColor: 'shadow-rose-500/30',
    tagline: 'Strike of Financial Mastery',
    perks: ['Ace Crimson Crest', 'Final Lap Countdown', 'Top 5% Discipline Tier'],
  },
  {
    id: 'master',
    order: 8,
    name: 'Master',
    minAmount: 90000,
    maxAmount: 99999,
    badgeTheme: 'Master / Mystic Amethyst',
    themeColor: '#D946EF',
    accentBg: 'bg-fuchsia-950/50',
    accentBorder: 'border-fuchsia-500/60',
    glowColor: 'shadow-fuchsia-500/30',
    tagline: 'On the Threshold of 100k',
    perks: ['Master Purple Star', 'Within Striking Distance', 'Conqueror Target Lock'],
  },
  {
    id: 'conqueror',
    order: 9,
    name: 'Conqueror',
    minAmount: 100000,
    maxAmount: Infinity,
    badgeTheme: 'Conqueror / Legendary Gold',
    themeColor: '#EAB308',
    accentBg: 'bg-amber-900/40',
    accentBorder: 'border-yellow-400/80',
    glowColor: 'shadow-yellow-400/50',
    tagline: 'Legendary PKR 100,000 Master',
    perks: ['100,000 PKR Goal Conquered', 'Legendary Conqueror Crest', 'Hall of Fame Status', 'Eternal Financial Legacy'],
  },
];

export function calculateRank(currentSavings: number): RankDefinition {
  // Ensure we find the highest rank threshold satisfied
  const effectiveSavings = Math.max(0, currentSavings);
  for (let i = RANK_DEFINITIONS.length - 1; i >= 0; i--) {
    if (effectiveSavings >= RANK_DEFINITIONS[i].minAmount) {
      return RANK_DEFINITIONS[i];
    }
  }
  return RANK_DEFINITIONS[0];
}

export function getNextRank(currentRankId: RankTierId): RankDefinition | null {
  const currentIndex = RANK_DEFINITIONS.findIndex((r) => r.id === currentRankId);
  if (currentIndex >= 0 && currentIndex < RANK_DEFINITIONS.length - 1) {
    return RANK_DEFINITIONS[currentIndex + 1];
  }
  return null;
}

export function getRankProgress(
  currentSavings: number,
  currentRank: RankDefinition,
  nextRank: RankDefinition | null
): { percent: number; needed: number; savedInTier: number; tierSpan: number } {
  if (!nextRank) {
    return {
      percent: 100,
      needed: 0,
      savedInTier: currentSavings - currentRank.minAmount,
      tierSpan: 0,
    };
  }

  const tierSpan = nextRank.minAmount - currentRank.minAmount;
  const savedInTier = Math.max(0, currentSavings - currentRank.minAmount);
  const needed = Math.max(0, nextRank.minAmount - currentSavings);
  const percent = Math.min(100, Math.max(0, Math.round((savedInTier / tierSpan) * 100)));

  return {
    percent,
    needed,
    savedInTier,
    tierSpan,
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    title: 'First Step',
    description: 'Saved your first PKR 1,000',
    thresholdAmount: 1000,
    category: 'savings',
  },
  {
    id: 'consistent_saver',
    title: 'Consistent Saver',
    description: 'Accumulated PKR 5,000 in total savings',
    thresholdAmount: 5000,
    category: 'savings',
  },
  {
    id: 'gold_collector',
    title: 'Gold Collector',
    description: 'Reached PKR 10,000 and unlocked Gold Rank',
    thresholdAmount: 10000,
    category: 'savings',
  },
  {
    id: 'quarter_way',
    title: 'Quarter Way',
    description: 'Crossed the 25% goal marker with PKR 25,000',
    thresholdAmount: 25000,
    category: 'savings',
  },
  {
    id: 'halfway_hero',
    title: 'Halfway Hero',
    description: 'Reached PKR 50,000 — 50% of your 100k dream reached!',
    thresholdAmount: 50000,
    category: 'savings',
  },
  {
    id: 'high_roller',
    title: 'High Caliber',
    description: 'Amassed PKR 75,000 in disciplined personal savings',
    thresholdAmount: 75000,
    category: 'savings',
  },
  {
    id: 'almost_there',
    title: 'Almost There',
    description: 'Crossed PKR 90,000! Conqueror is in plain sight',
    thresholdAmount: 90000,
    category: 'savings',
  },
  {
    id: 'savings_champion',
    title: 'Savings Champion',
    description: 'Conquered the entire PKR 100,000 target!',
    thresholdAmount: 100000,
    category: 'savings',
  },
  {
    id: 'streak_3',
    title: 'Momentum Builder',
    description: 'Saved money for 3 consecutive days',
    thresholdStreak: 3,
    category: 'streak',
  },
  {
    id: 'streak_7',
    title: 'Weekly Warrior',
    description: 'Maintained a solid 7-day savings streak',
    thresholdStreak: 7,
    category: 'streak',
  },
  {
    id: 'streak_14',
    title: 'Fortitude Master',
    description: 'Hit a 14-day unbreakable savings habit',
    thresholdStreak: 14,
    category: 'streak',
  },
  {
    id: 'streak_30',
    title: 'Discipline Deity',
    description: '30 consecutive days of recording positive savings',
    thresholdStreak: 30,
    category: 'streak',
  },
];

export const MOTIVATIONAL_QUOTES = [
  'Every rupee brings you closer to your goal.',
  'Consistency beats perfection every single time.',
  'Your next gaming rank is within arm’s reach.',
  'You are building an unshakeable financial fortress.',
  'One hundred thousand rupees starts with one disciplined saving.',
  'Small daily deposits compound into legendary achievements.',
  'Discipline is choosing what you want most over what you want now.',
  'Level up your bankroll like you level up your rank in combat.',
  'Master the game of cash: save first, conquer later.',
  'Every positive entry is proof of your unstoppable momentum.',
];

export function getMotivationalMessage(progressPercent: number, rank: RankDefinition): string {
  if (progressPercent >= 100) {
    return 'MISSION ACCOMPLISHED! You are a legendary Conqueror with PKR 100,000 saved!';
  }
  if (progressPercent >= 90) {
    return 'The final stretch! Just a few more pushes to claim the Conqueror title.';
  }
  if (progressPercent >= 75) {
    return 'Over three quarters complete! Keep the fire burning through Ace tier.';
  }
  if (progressPercent >= 50) {
    return 'Halfway mark conquered! You have royal Crown authority over your savings.';
  }
  if (progressPercent >= 25) {
    return 'Quarter goal crushed! Platinum saver with relentless upward momentum.';
  }
  if (progressPercent >= 10) {
    return 'Double digits achieved! Gold rank is glowing on your profile.';
  }
  if (progressPercent >= 5) {
    return 'Silver milestone unlocked! The savings habit is setting in firmly.';
  }
  return 'Every single rupee saved is an XP point toward financial freedom. Begin today!';
}

export function formatPKR(amount: number): string {
  const rounded = Math.round(amount);
  return `PKR ${rounded.toLocaleString('en-PK')}`;
}

export function formatShortPKR(amount: number): string {
  if (amount >= 100000) return `PKR ${(amount / 1000).toFixed(0)}k`;
  if (amount >= 1000) return `PKR ${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k`;
  return `PKR ${amount}`;
}
