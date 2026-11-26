/**
 * Rs. 500 Milestone System Engine
 * Goal: PKR 100,000 divided into 200 progressive milestones of Rs. 500 each.
 */

export const MILESTONE_STEP = 500;
export const TOTAL_MILESTONES = 200;
export const FINAL_SAVINGS_GOAL = 100000;

export interface MilestoneItem {
  number: number; // 1 to 200
  threshold: number; // number * 500 (e.g. 500, 1000, 1500, ... 100,000)
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  progressInMilestone: number; // 0 to 500
  progressPercent: number; // 0 to 100
}

export interface MilestoneStats {
  totalSavings: number;
  completedCount: number; // 0 to 200
  totalCount: number; // 200
  currentMilestoneNumber: number; // 1 to 200
  progressInCurrent: number; // 0 to 500
  milestoneStep: number; // 500
  remainingForNext: number; // e.g. 250
  amountRemainingTo100k: number; // e.g. 74,250
  currentMilestonePercent: number; // 0 to 100
  overallPercent: number; // 0 to 100
  isAllCompleted: boolean;
}

/**
 * Dynamically computes all milestone statistics from actual cumulative savings balance.
 * Strictly non-negative; if penalties or withdrawals reduce balance, milestone status rolls back accurately.
 */
export function calculateMilestoneStats(balance: number): MilestoneStats {
  const safeBalance = Math.max(0, balance);
  const isAllCompleted = safeBalance >= FINAL_SAVINGS_GOAL;

  // Number of completed Rs. 500 steps
  const completedCount = Math.min(TOTAL_MILESTONES, Math.floor(safeBalance / MILESTONE_STEP));

  // Current milestone number (1 to 200)
  const currentMilestoneNumber = isAllCompleted
    ? TOTAL_MILESTONES
    : Math.min(TOTAL_MILESTONES, completedCount + 1);

  // Progress within the current milestone
  const progressInCurrent = isAllCompleted
    ? MILESTONE_STEP
    : safeBalance % MILESTONE_STEP;

  // Remaining cash to complete next milestone
  const remainingForNext = isAllCompleted
    ? 0
    : MILESTONE_STEP - progressInCurrent;

  // Remaining cash to reach PKR 100,000
  const amountRemainingTo100k = Math.max(0, FINAL_SAVINGS_GOAL - safeBalance);

  // Percentage within current milestone
  const currentMilestonePercent = isAllCompleted
    ? 100
    : Math.min(100, Math.round((progressInCurrent / MILESTONE_STEP) * 100));

  // Overall journey percentage
  const overallPercent = Math.min(
    100,
    parseFloat(((safeBalance / FINAL_SAVINGS_GOAL) * 100).toFixed(1))
  );

  return {
    totalSavings: safeBalance,
    completedCount,
    totalCount: TOTAL_MILESTONES,
    currentMilestoneNumber,
    progressInCurrent,
    milestoneStep: MILESTONE_STEP,
    remainingForNext,
    amountRemainingTo100k,
    currentMilestonePercent,
    overallPercent,
    isAllCompleted,
  };
}

/**
 * Returns an array of all 200 MilestoneItem objects
 */
export function generateMilestonesList(balance: number): MilestoneItem[] {
  const safeBalance = Math.max(0, balance);
  const completedCount = Math.min(TOTAL_MILESTONES, Math.floor(safeBalance / MILESTONE_STEP));
  const isAllCompleted = safeBalance >= FINAL_SAVINGS_GOAL;
  const currentNum = isAllCompleted ? TOTAL_MILESTONES : completedCount + 1;
  const progressInCurrent = isAllCompleted ? MILESTONE_STEP : safeBalance % MILESTONE_STEP;

  const list: MilestoneItem[] = [];
  for (let i = 1; i <= TOTAL_MILESTONES; i++) {
    const threshold = i * MILESTONE_STEP;
    const isCompleted = i <= completedCount;
    const isCurrent = !isAllCompleted && i === currentNum;
    const isLocked = i > currentNum;

    let progressInThis = 0;
    let progressPercent = 0;

    if (isCompleted) {
      progressInThis = MILESTONE_STEP;
      progressPercent = 100;
    } else if (isCurrent) {
      progressInThis = progressInCurrent;
      progressPercent = Math.round((progressInCurrent / MILESTONE_STEP) * 100);
    }

    list.push({
      number: i,
      threshold,
      isCompleted,
      isCurrent,
      isLocked,
      progressInMilestone: progressInThis,
      progressPercent,
    });
  }

  return list;
}

/**
 * Motivational message based on completed milestones
 */
export function getMilestoneMotivationalMessage(stats: MilestoneStats): string {
  if (stats.isAllCompleted) {
    return '🎉 Congratulations! All 200 Milestones Completed! You reached the pinnacle of PKR 100,000!';
  }
  if (stats.completedCount === 0) {
    return 'Save Rs. 500 to unlock your very first milestone card! Every rupee counts.';
  }
  if (stats.completedCount >= 190) {
    return `Final stretch! Only ${stats.totalCount - stats.completedCount} milestones remain until PKR 100,000 Conqueror status!`;
  }
  if (stats.completedCount >= 150) {
    return `Incredible fortitude! ${stats.completedCount} milestones conquered. You are unstoppable!`;
  }
  if (stats.completedCount >= 100) {
    return `Halfway titan! Over 100 milestones achieved. Your discipline is legendary!`;
  }
  if (stats.completedCount >= 50) {
    return `Quarter-century master! ${stats.completedCount} milestones in the bag. Keep advancing!`;
  }
  return `Milestone #${stats.completedCount} achieved! Rs. ${stats.remainingForNext} more to conquer Milestone #${stats.currentMilestoneNumber}.`;
}
