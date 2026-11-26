import { AppState, GoalConfig, SavingEntry } from '../types';

const STORAGE_KEY = 'cash_saving_data_v1';

export const DEFAULT_GOAL: GoalConfig = {
  id: 'goal_default_100k',
  title: 'PKR 100,000 Goal',
  targetAmount: 100000,
  currency: 'PKR',
  startDate: new Date().toISOString().split('T')[0],
  isCompleted: false,
};

export const DEFAULT_STATE: AppState = {
  entries: [],
  goal: DEFAULT_GOAL,
  theme: 'dark',
  soundEnabled: true,
  unlockedMilestones: [],
  disciplineStartDate: new Date().toISOString().split('T')[0],
  dailyTargetAmount: 200,
};

export function loadAppState(): AppState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      goal: parsed.goal && parsed.goal.targetAmount ? parsed.goal : DEFAULT_GOAL,
      theme: parsed.theme === 'light' ? 'light' : 'dark',
      soundEnabled: parsed.soundEnabled !== false,
      unlockedMilestones: Array.isArray(parsed.unlockedMilestones) ? parsed.unlockedMilestones : [],
      disciplineStartDate: parsed.disciplineStartDate || DEFAULT_STATE.disciplineStartDate,
      dailyTargetAmount: typeof parsed.dailyTargetAmount === 'number' ? parsed.dailyTargetAmount : 200,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveAppState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function calculateProcessedEntries(entries: SavingEntry[]): {
  processedEntries: SavingEntry[];
  currentBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalPenalties: number;
  totalPenaltyCount: number;
  outstandingPenaltyTotal: number;
} {
  // Sort entries chronologically: date ASC, then time ASC, then type precedence (saving first), then createdAt ASC
  const sorted = [...entries].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    if (a.time && b.time && a.time !== b.time) return a.time.localeCompare(b.time);
    if (a.type !== b.type) {
      if (a.type === 'saving') return -1;
      if (b.type === 'saving') return 1;
    }
    return a.createdAt.localeCompare(b.createdAt);
  });

  let running = 0;
  let totalDeposited = 0;
  let totalWithdrawn = 0;
  let totalPenalties = 0;
  let totalPenaltyCount = 0;
  let outstandingPenaltyTotal = 0;

  const processed = sorted.map((entry) => {
    const balanceBefore = running;
    let actualDeducted = entry.amount;
    let unpaid = 0;

    if (entry.type === 'saving') {
      running += entry.amount;
      totalDeposited += entry.amount;
    } else if (entry.type === 'withdrawal') {
      actualDeducted = Math.min(running, entry.amount);
      running = Math.max(0, running - actualDeducted);
      totalWithdrawn += actualDeducted;
    } else if (entry.type === 'penalty') {
      // Penalty of fixed Rs. 200 per missed day
      actualDeducted = Math.min(running, entry.amount);
      unpaid = Math.max(0, entry.amount - actualDeducted);
      running = Math.max(0, running - actualDeducted);
      totalPenalties += actualDeducted;
      totalPenaltyCount++;
      outstandingPenaltyTotal += unpaid;
    }

    return {
      ...entry,
      balanceBefore: entry.balanceBefore ?? balanceBefore,
      balanceAfter: entry.balanceAfter ?? running,
      actualDeducted: entry.actualDeducted ?? actualDeducted,
      unpaidPenalty: entry.unpaidPenalty ?? unpaid,
      runningBalance: running,
    };
  });

  return {
    processedEntries: processed,
    currentBalance: running,
    totalDeposited,
    totalWithdrawn,
    totalPenalties,
    totalPenaltyCount,
    outstandingPenaltyTotal,
  };
}

export function exportBackup(state: AppState): void {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cash-saving-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateSampleDemoData(): SavingEntry[] {
  const today = new Date();
  const formatDay = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'demo_1',
      type: 'saving',
      amount: 5000,
      date: formatDay(18),
      time: '09:30:00',
      createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
      note: 'Opening monthly savings from salary',
      source: 'salary',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 5000,
      targetStatus: 'achieved',
    },
    {
      id: 'demo_2',
      type: 'saving',
      amount: 2500,
      date: formatDay(16),
      time: '14:15:00',
      createdAt: new Date(Date.now() - 16 * 86400000).toISOString(),
      note: 'Freelance graphic design gig payment',
      source: 'side_hustle',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 2500,
      targetStatus: 'achieved',
    },
    {
      id: 'demo_3',
      type: 'saving',
      amount: 3000,
      date: formatDay(14),
      time: '11:00:00',
      createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      note: 'Cash gift from uncle for Eid',
      source: 'gift',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 3000,
      targetStatus: 'achieved',
    },
    {
      id: 'demo_4',
      type: 'saving',
      amount: 4500,
      date: formatDay(10),
      time: '18:45:00',
      createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      note: 'Profit from online thrift sale',
      source: 'business',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 4500,
      targetStatus: 'achieved',
    },
    {
      id: 'demo_5',
      type: 'saving',
      amount: 1500,
      date: formatDay(8),
      time: '10:20:00',
      createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      note: 'Weekly grocery change leftover',
      source: 'daily_change',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 1500,
      targetStatus: 'achieved',
    },
    {
      id: 'demo_penalty_7',
      type: 'penalty',
      amount: 200,
      date: formatDay(7),
      time: '23:59:59',
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
      note: 'Daily saving target missed (< Rs. 200 saved)',
      source: 'other',
      reason: 'Daily saving target missed',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 0,
      targetStatus: 'missed',
      penaltyDeducted: 200,
      actualDeducted: 200,
      unpaidPenalty: 0,
    },
    {
      id: 'demo_6',
      type: 'withdrawal',
      amount: 1500,
      date: formatDay(6),
      time: '16:00:00',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      note: 'Emergency bike tire replacement',
      source: 'other',
    },
    {
      id: 'demo_7',
      type: 'saving',
      amount: 6000,
      date: formatDay(4),
      time: '13:00:00',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      note: 'Consulting bonus',
      source: 'salary',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 6000,
      targetStatus: 'achieved',
    },
    {
      id: 'demo_penalty_3',
      type: 'penalty',
      amount: 200,
      date: formatDay(3),
      time: '23:59:59',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      note: 'Daily saving target missed (< Rs. 200 saved)',
      source: 'other',
      reason: 'Daily saving target missed',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 0,
      targetStatus: 'missed',
      penaltyDeducted: 200,
      actualDeducted: 200,
      unpaidPenalty: 0,
    },
    {
      id: 'demo_8',
      type: 'saving',
      amount: 3500,
      date: formatDay(2),
      time: '20:10:00',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      note: 'Weekend market stall profit',
      source: 'business',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 3500,
      targetStatus: 'achieved',
    },
    {
      id: 'demo_9',
      type: 'saving',
      amount: 2500,
      date: formatDay(1),
      time: '19:00:00',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      note: 'Cash saved from pocket allowance',
      source: 'pocket_money',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 2500,
      targetStatus: 'achieved',
    },
    {
      id: 'demo_10',
      type: 'saving',
      amount: 1000,
      date: formatDay(0),
      time: '12:00:00',
      createdAt: new Date().toISOString(),
      note: 'Daily goal discipline deposit',
      source: 'daily_change',
      dailyTargetAmount: 200,
      dailyDepositedAmount: 1000,
      targetStatus: 'achieved',
    },
  ];
}
