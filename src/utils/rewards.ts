import { SavingEntry } from '../types';

export type RewardTierId =
  | 'below_100'
  | 'good'
  | 'best'
  | 'excellent'
  | 'brilliant'
  | 'outstanding'
  | 'exceptional'
  | 'legendary';

export interface DepositRewardLevel {
  id: RewardTierId;
  order: number;
  title: string;
  emoji: string;
  minAmount: number;
  maxAmount: number;
  message: string;
  colorName: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  glowColor: string;
  confettiCount: number;
}

export const REWARD_LEVELS: DepositRewardLevel[] = [
  {
    id: 'below_100',
    order: 0,
    title: 'Every Rupee Counts',
    emoji: '💚',
    minAmount: 0,
    maxAmount: 99,
    message: 'Every single rupee counts towards your future!',
    colorName: 'emerald',
    textColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10',
    badgeBorder: 'border-emerald-500/30',
    glowColor: 'shadow-emerald-500/20',
    confettiCount: 0,
  },
  {
    id: 'good',
    order: 1,
    title: 'Good',
    emoji: '👍',
    minAmount: 100,
    maxAmount: 299,
    message: 'Every small step matters!',
    colorName: 'blue',
    textColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/15',
    badgeBorder: 'border-sky-500/40',
    glowColor: 'shadow-sky-500/25',
    confettiCount: 25,
  },
  {
    id: 'best',
    order: 2,
    title: 'Best',
    emoji: '🌟',
    minAmount: 300,
    maxAmount: 499,
    message: "You're building a great saving habit!",
    colorName: 'amber',
    textColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/15',
    badgeBorder: 'border-amber-500/40',
    glowColor: 'shadow-amber-500/25',
    confettiCount: 40,
  },
  {
    id: 'excellent',
    order: 3,
    title: 'Excellent',
    emoji: '🔥',
    minAmount: 500,
    maxAmount: 999,
    message: 'Amazing effort! Keep it up!',
    colorName: 'orange',
    textColor: 'text-orange-400',
    badgeBg: 'bg-orange-500/15',
    badgeBorder: 'border-orange-500/40',
    glowColor: 'shadow-orange-500/30',
    confettiCount: 60,
  },
  {
    id: 'brilliant',
    order: 4,
    title: 'Brilliant',
    emoji: '💎',
    minAmount: 1000,
    maxAmount: 1999,
    message: 'Your discipline is paying off!',
    colorName: 'cyan',
    textColor: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/15',
    badgeBorder: 'border-cyan-400/50',
    glowColor: 'shadow-cyan-400/35',
    confettiCount: 90,
  },
  {
    id: 'outstanding',
    order: 5,
    title: 'Outstanding',
    emoji: '🏆',
    minAmount: 2000,
    maxAmount: 4999,
    message: "You're becoming a saving champion!",
    colorName: 'yellow',
    textColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-500/20',
    badgeBorder: 'border-yellow-400/60',
    glowColor: 'shadow-yellow-400/40',
    confettiCount: 130,
  },
  {
    id: 'exceptional',
    order: 6,
    title: 'Exceptional',
    emoji: '👑',
    minAmount: 5000,
    maxAmount: 9999,
    message: 'Your dedication is impressive!',
    colorName: 'purple',
    textColor: 'text-purple-300',
    badgeBg: 'bg-purple-500/20',
    badgeBorder: 'border-purple-400/60',
    glowColor: 'shadow-purple-400/45',
    confettiCount: 180,
  },
  {
    id: 'legendary',
    order: 7,
    title: 'Legendary',
    emoji: '🚀',
    minAmount: 10000,
    maxAmount: Infinity,
    message: 'One step closer to your financial goal!',
    colorName: 'rose',
    textColor: 'text-rose-400',
    badgeBg: 'bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-yellow-500/20',
    badgeBorder: 'border-amber-400',
    glowColor: 'shadow-[0_0_35px_rgba(245,158,11,0.45)]',
    confettiCount: 250,
  },
];

/**
 * Given an individual deposit amount, return its exact Chess.com-style award
 */
export function getDepositReward(amount: number): DepositRewardLevel {
  const deposit = Math.max(0, amount);
  if (deposit < 100) {
    return REWARD_LEVELS[0];
  }
  for (let i = REWARD_LEVELS.length - 1; i >= 1; i--) {
    if (deposit >= REWARD_LEVELS[i].minAmount) {
      return REWARD_LEVELS[i];
    }
  }
  return REWARD_LEVELS[0];
}

export interface RewardsStats {
  highestDeposit: number;
  highestDepositReward: DepositRewardLevel | null;
  bestRewardEarned: DepositRewardLevel | null;
  totalDepositsCount: number;
  totalRewardsCount: number;
  breakdown: Record<RewardTierId, number>;
}

export function calculateRewardsStats(entries: SavingEntry[]): RewardsStats {
  const deposits = entries.filter((e) => e.type === 'saving');
  let highestDeposit = 0;
  let highestDepositReward: DepositRewardLevel | null = null;
  let bestOrder = -1;
  let bestRewardEarned: DepositRewardLevel | null = null;

  const breakdown: Record<RewardTierId, number> = {
    below_100: 0,
    good: 0,
    best: 0,
    excellent: 0,
    brilliant: 0,
    outstanding: 0,
    exceptional: 0,
    legendary: 0,
  };

  deposits.forEach((dep) => {
    const reward = getDepositReward(dep.amount);
    breakdown[reward.id] = (breakdown[reward.id] || 0) + 1;

    if (dep.amount > highestDeposit) {
      highestDeposit = dep.amount;
      highestDepositReward = reward;
    }

    if (reward.order > bestOrder) {
      bestOrder = reward.order;
      bestRewardEarned = reward;
    }
  });

  return {
    highestDeposit,
    highestDepositReward,
    bestRewardEarned,
    totalDepositsCount: deposits.length,
    totalRewardsCount: deposits.length,
    breakdown,
  };
}

export function formatRs(amount: number): string {
  const rounded = Math.round(amount);
  return `Rs. ${rounded.toLocaleString('en-PK')}`;
}
