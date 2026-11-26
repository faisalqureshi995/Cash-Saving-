import { SavingEntry } from '../types';

export const DAILY_TARGET_PKR = 200;
export const DAILY_PENALTY_PKR = 200;
export const TIMEZONE_PK = 'Asia/Karachi';

/**
 * Returns YYYY-MM-DD string according to Pakistan Standard Time (Asia/Karachi)
 */
export function getKarachiDate(d: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE_PK,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(d);
  } catch {
    // Fallback if environment lacks timezone data
    const offset = 5 * 60; // UTC+5 in minutes
    const local = new Date(d.getTime() + offset * 60 * 1000);
    return local.toISOString().split('T')[0];
  }
}

/**
 * Returns HH:mm:ss string according to Pakistan Standard Time (Asia/Karachi)
 */
export function getKarachiTime(d: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE_PK,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    return formatter.format(d);
  } catch {
    return d.toTimeString().split(' ')[0];
  }
}

/**
 * Returns yesterday's YYYY-MM-DD string in Asia/Karachi
 */
export function getYesterdayKarachi(d: Date = new Date()): string {
  const parts = getKarachiDate(d).split('-').map(Number);
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  dateObj.setDate(dateObj.getDate() - 1);
  return getKarachiDate(dateObj);
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string
 */
export function addDaysToDateStr(dateStr: string, days: number): string {
  const parts = dateStr.split('-').map(Number);
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  dateObj.setDate(dateObj.getDate() + days);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface TodayDisciplineStatus {
  todayDateStr: string;
  depositedToday: number;
  dailyTarget: number;
  remainingToSave: number;
  isAchieved: boolean;
  percent: number;
  penaltyIfMissed: number;
}

/**
 * Computes today's real-time target status in Asia/Karachi
 */
export function calculateTodayDisciplineStatus(
  entries: SavingEntry[],
  dailyTarget: number = DAILY_TARGET_PKR
): TodayDisciplineStatus {
  const todayDateStr = getKarachiDate();
  let depositedToday = 0;

  entries.forEach((e) => {
    if (e.date === todayDateStr && e.type === 'saving') {
      depositedToday += e.amount;
    }
  });

  const isAchieved = depositedToday >= dailyTarget;
  const remainingToSave = Math.max(0, dailyTarget - depositedToday);
  const percent = Math.min(100, Math.round((depositedToday / dailyTarget) * 100));

  return {
    todayDateStr,
    depositedToday,
    dailyTarget,
    remainingToSave,
    isAchieved,
    percent,
    penaltyIfMissed: isAchieved ? 0 : DAILY_PENALTY_PKR,
  };
}

export interface MissedDayEvaluationResult {
  newPenalties: SavingEntry[];
  hasChanges: boolean;
  missedDaysCount: number;
  penalizedDates: string[];
}

/**
 * Evaluates past calendar days (from disciplineStartDate up to yesterday in Asia/Karachi)
 * and generates penalties for days where deposits were < Rs. 200.
 *
 * Invariants:
 * 1. Today is NEVER penalized because the day is still active.
 * 2. Each calendar date is penalized AT MOST ONCE (idempotent / non-duplicate).
 * 3. The penalty is a fixed Rs. 200 (not the difference).
 * 4. Balance deductions cannot drop total balance below 0.
 */
export function evaluateMissedDayPenalties(
  entries: SavingEntry[],
  disciplineStartDate?: string,
  dailyTarget: number = DAILY_TARGET_PKR
): MissedDayEvaluationResult {
  const todayStr = getKarachiDate();
  const yesterdayStr = getYesterdayKarachi();

  // If no discipline start date is provided, find earliest entry or start from today
  let effectiveStartDate = disciplineStartDate;
  if (!effectiveStartDate) {
    if (entries.length > 0) {
      const dates = entries.map((e) => e.date).sort();
      effectiveStartDate = dates[0];
    } else {
      // Nothing to penalize if brand new
      return {
        newPenalties: [],
        hasChanges: false,
        missedDaysCount: 0,
        penalizedDates: [],
      };
    }
  }

  // Cap start date to no earlier than 60 days ago to prevent runaway demo dates
  const maxLookback = addDaysToDateStr(todayStr, -60);
  if (effectiveStartDate < maxLookback) {
    effectiveStartDate = maxLookback;
  }

  // If effectiveStartDate is today or in the future, yesterday is not reached
  if (effectiveStartDate > yesterdayStr) {
    return {
      newPenalties: [],
      hasChanges: false,
      missedDaysCount: 0,
      penalizedDates: [],
    };
  }

  // Sum deposits per date and index existing penalties
  const dailyDeposits = new Map<string, number>();
  const existingPenaltiesSet = new Set<string>();

  entries.forEach((e) => {
    if (e.type === 'saving') {
      dailyDeposits.set(e.date, (dailyDeposits.get(e.date) || 0) + e.amount);
    } else if (e.type === 'penalty') {
      existingPenaltiesSet.add(e.date);
    }
  });

  const newPenalties: SavingEntry[] = [];
  const penalizedDates: string[] = [];

  // Iterate day-by-day from effectiveStartDate to yesterdayStr
  let curr = effectiveStartDate;
  while (curr <= yesterdayStr) {
    // If a penalty was already applied for this date, skip
    if (!existingPenaltiesSet.has(curr)) {
      const savedOnDay = dailyDeposits.get(curr) || 0;
      if (savedOnDay < dailyTarget) {
        // Daily target was missed!
        const penaltyEntry: SavingEntry = {
          id: `penalty_${curr}`,
          type: 'penalty',
          amount: DAILY_PENALTY_PKR, // Fixed Rs. 200
          date: curr,
          time: '23:59:59',
          createdAt: new Date().toISOString(),
          note: 'Daily saving target missed (< Rs. 200 saved)',
          source: 'other',
          dailyTargetAmount: dailyTarget,
          dailyDepositedAmount: savedOnDay,
          targetStatus: 'missed',
          penaltyDeducted: DAILY_PENALTY_PKR,
          reason: 'Daily saving target missed',
        };
        newPenalties.push(penaltyEntry);
        penalizedDates.push(curr);
      }
    }

    curr = addDaysToDateStr(curr, 1);
  }

  return {
    newPenalties,
    hasChanges: newPenalties.length > 0,
    missedDaysCount: newPenalties.length,
    penalizedDates,
  };
}
