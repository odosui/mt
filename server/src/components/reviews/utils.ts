import dayjs from "dayjs";
import { Note } from "../notes/NotesStore";

// in days
const LEVEL_PERIODS = [
  7, // level 1 review
  15, // level 2 review
  30, // level 3 review
  30, // level 4 review
  45, // ...
  45,
  60,
  60,
  90,
  180, // level 10 review (the max level)
];

export function daysTillNextReview(
  currentLevel: number,
  last_reviewed_at: string | null,
  created_at: string,
) {
  const sinceData = last_reviewed_at || created_at;

  const daysSinceLastReview = dayjs().diff(sinceData, "day");
  const period = LEVEL_PERIODS[currentLevel] as number;

  return period - daysSinceLastReview;
}

export function nextReviewPoints(n: Note) {
  let res = [] as { level: number; days_left: number }[];

  res.push({
    level: n.level + 1,
    days_left: daysTillNextReview(n.level, n.last_reviewed_at, n.created_at),
  });

  for (let l = n.level + 2; l <= 10; l++) {
    res.push({
      level: l,
      days_left: LEVEL_PERIODS[l - 1] as number,
    });
  }

  return res;
}

export function requresReview(n: Note) {
  const days = daysTillNextReview(n.level, n.last_reviewed_at, n.created_at);

  return days <= 0;
}
