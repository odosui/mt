import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { daysTillNextReview } from "./LocalEngine";

describe("daysTillNextReview", () => {
  it("should return 7 days for just created", () => {
    const today = dayjs().format("YYYY-MM-DD");
    const lastReviewedAt = null;
    expect(daysTillNextReview(0, lastReviewedAt, today)).toEqual(7);
  });

  it("should return 0 days when it's time for review", () => {
    const createdAt = dayjs().subtract(7, "day").format("YYYY-MM-DD");
    expect(daysTillNextReview(0, null, createdAt)).toEqual(0);
  });

  it("should return 1 day when it's time for review", () => {
    const createdAt = dayjs().subtract(8, "day").format("YYYY-MM-DD");
    expect(daysTillNextReview(0, null, createdAt)).toEqual(-1);
  });

  it("should return correct days on level 3", () => {
    const createdAt = dayjs().subtract(7, "day").format("YYYY-MM-DD");
    const lastReviewedAt = dayjs().subtract(25, "day").format("YYYY-MM-DD");
    expect(daysTillNextReview(2, lastReviewedAt, createdAt)).toEqual(5);
  });
});
