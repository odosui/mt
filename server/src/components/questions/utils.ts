import dayjs from "dayjs";

// # in SM-2 they had 1.3 for the hardest, and 2.5 for the easiest
const REVIEW_COEFF = 1.5;
const MAX_LEVEL = 15;

function daysForLevel(nextLevel: number): number {
  if (nextLevel === 1) {
    return 0;
  } else if (nextLevel === 2) {
    return 1;
  } else if (nextLevel === 3) {
    return 2;
  } else {
    const o = daysForLevel(nextLevel - 1);
    return Math.floor(REVIEW_COEFF * o);
  }
}

export function daysTillReviewAfterCurrent(currentLevel: number) {
  return daysForLevel(currentLevel + 2);
}

export function daysTillNextReview(level: number, lastReviewed: string | null) {
  if (!lastReviewed) {
    return 0;
  }
  const daysPassed = dayjs().diff(dayjs(lastReviewed), "day");
  const period = daysForLevel(level + 1);
  return period - daysPassed;
}

export function isReviewable(level: number, lastReviewed: string | null) {
  return level < MAX_LEVEL && daysTillNextReview(level, lastReviewed) <= 0;
}

// def review_good!
//   if !self.reviewable?
//     raise "Question is non-reviable"
//   end
//   last_log = self.last_review_log
//   new_level = if last_log.present?
//                 last_log.new_level + 1
//               else
//                 1
//               end
//   self.question_review_logs.create!(new_level: new_level)
// end

// def review_bad!
//   if !self.reviewable?
//     raise "Question is non-reviable"
//   end
//   self.question_review_logs.create!(new_level: 0)
// end
