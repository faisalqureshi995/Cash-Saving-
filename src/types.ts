export type TransactionType = 'saving' | 'withdrawal' | 'penalty';

export type SavingSource =
  | 'salary'
  | 'business'
  | 'pocket_money'
  | 'gift'
  | 'side_hustle'
  | 'daily_change'
  | 'other';

export interface SavingEntry {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD in Asia/Karachi
  time: string; // HH:mm:ss in Asia/Karachi
  createdAt: string; // ISO
  updatedAt?: string;
  note?: string;
  source: SavingSource;
  runningBalance?: number;
  rewardTitle?: string;
  rewardEmoji?: string;

  // Daily Saving Discipline & Penalty Fields
  dailyTargetAmount?: number; // E.g. 200
  dailyDepositedAmount?: number; // Total cash deposited on this date
  targetStatus?: 'achieved' | 'missed' | 'pending';
  penaltyDeducted?: number; // Penalty amount assessed (Rs. 200)
  actualDeducted?: number; // Actual amount subtracted from balance (guarded >= 0)
  unpaidPenalty?: number; // Tracked if balance was insufficient (< 200)
  balanceBefore?: number;
  balanceAfter?: number;
  reason?: string; // Reason e.g. "Daily saving target missed"
}

export type RankTierId =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'crown'
  | 'ace'
  | 'master'
  | 'conqueror';

export interface RankDefinition {
  id: RankTierId;
  order: number;
  name: string;
  minAmount: number;
  maxAmount: number;
  badgeTheme: string;
  themeColor: string;
  accentBg: string;
  accentBorder: string;
  glowColor: string;
  tagline: string;
  perks: string[];
}

export interface GoalConfig {
  id: string;
  title: string;
  targetAmount: number;
  currency: string;
  startDate: string;
  targetDate?: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  thresholdAmount?: number;
  thresholdStreak?: number;
  category: 'savings' | 'streak' | 'discipline';
  unlockedAt?: string;
}

export interface AppState {
  entries: SavingEntry[];
  goal: GoalConfig;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  unlockedMilestones: string[];
  disciplineStartDate?: string;
  dailyTargetAmount?: number; // Defaults to 200
}

export type ActiveTab = 'dashboard' | 'journey' | 'milestones' | 'history' | 'analytics' | 'achievements';
