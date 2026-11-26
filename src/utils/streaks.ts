import { SavingEntry } from '../types';

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  hasSavedToday: number; // PKR saved today
  totalActiveDays: number;
  activeDatesSet: Set<string>;
}

export function toLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateStreaks(entries: SavingEntry[]): StreakStats {
  if (!entries || entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasSavedToday: 0,
      totalActiveDays: 0,
      activeDatesSet: new Set(),
    };
  }

  // Aggregate net savings per date
  const dailyTotals = new Map<string, number>();

  entries.forEach((e) => {
    const prev = dailyTotals.get(e.date) || 0;
    const delta = e.type === 'saving' ? e.amount : -e.amount;
    dailyTotals.set(e.date, prev + delta);
  });

  // Filter to days with strictly positive net savings
  const activeDates: string[] = [];
  dailyTotals.forEach((net, date) => {
    if (net > 0) {
      activeDates.push(date);
    }
  });

  activeDates.sort(); // Lexicographical sort works for YYYY-MM-DD
  const activeDatesSet = new Set(activeDates);

  const todayStr = toLocalDateString(new Date());
  const todaySaved = dailyTotals.get(todayStr) || 0;

  if (activeDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      hasSavedToday: Math.max(0, todaySaved),
      totalActiveDays: 0,
      activeDatesSet,
    };
  }

  // Calculate streaks in chronological order
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of activeDates) {
    const parts = dateStr.split('-').map(Number);
    const currentDate = new Date(parts[0], parts[1] - 1, parts[2]);

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currentDate;
  }

  // Calculate current streak
  // Check if today or yesterday is active
  const todayParts = todayStr.split('-').map(Number);
  const today = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = toLocalDateString(yesterday);

  let currentStreak = 0;
  let checkDate = activeDatesSet.has(todayStr) ? today : (activeDatesSet.has(yesterdayStr) ? yesterday : null);

  if (checkDate) {
    let curr = new Date(checkDate);
    while (true) {
      const s = toLocalDateString(curr);
      if (activeDatesSet.has(s)) {
        currentStreak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    hasSavedToday: Math.max(0, todaySaved),
    totalActiveDays: activeDates.length,
    activeDatesSet,
  };
}
