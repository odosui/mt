import dayjs from "dayjs";

// # in SM-2 they had 1.3 for the hardest, and 2.5 for the easiest
const REVIEW_COEFF = 1.5;
export const MAX_LEVEL = 15;

const MINUTES_PER_DAY = 60 * 24;

function minutesForLevel(nextLevel: number): number {
  if (nextLevel <= 0) return 0;
  if (nextLevel === 1) return 1;
  if (nextLevel === 2) return 10;
  if (nextLevel === 3) return 1 * MINUTES_PER_DAY;
  if (nextLevel === 4) return 2 * MINUTES_PER_DAY;
  if (nextLevel === 5) return 3 * MINUTES_PER_DAY;
  return Math.floor(REVIEW_COEFF * minutesForLevel(nextLevel - 1));
}

export function minutesTillReviewAfterCurrent(currentLevel: number) {
  return minutesForLevel(currentLevel + 2);
}

export function minutesTillNextReview(
  level: number,
  lastReviewed: string | null,
) {
  if (!lastReviewed) {
    return 0;
  }
  const minutesPassed = dayjs().diff(dayjs(lastReviewed), "minute");
  const period = minutesForLevel(level + 1);
  return period - minutesPassed;
}

export function isReviewable(level: number, lastReviewed: string | null) {
  return level < MAX_LEVEL && minutesTillNextReview(level, lastReviewed) <= 0;
}
