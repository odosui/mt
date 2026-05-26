import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { isReviewable, minutesTillNextReview } from "./utils";

const MIN_PER_DAY = 60 * 24;

describe("minutesTillNextReview", () => {
  describe("when lastReviewed is null", () => {
    it("returns 0 for any level", () => {
      expect(minutesTillNextReview(0, null)).toBe(0);
      expect(minutesTillNextReview(5, null)).toBe(0);
      expect(minutesTillNextReview(10, null)).toBe(0);
    });
  });

  describe("learning steps (low levels)", () => {
    it("level 0 -> 1: 1 minute after current review", () => {
      expect(minutesTillNextReview(0, dayjs().toISOString())).toBe(1);
    });

    it("level 1 -> 2: 10 minutes after current review", () => {
      expect(minutesTillNextReview(1, dayjs().toISOString())).toBe(10);
    });

    it("level 1 is due ~10 minutes after lastReviewed", () => {
      const elevenMinAgo = dayjs().subtract(11, "minute").toISOString();
      expect(minutesTillNextReview(1, elevenMinAgo)).toBeLessThanOrEqual(0);
    });

    it("level 1 not yet due 5 minutes after review", () => {
      const fiveMinAgo = dayjs().subtract(5, "minute").toISOString();
      expect(minutesTillNextReview(1, fiveMinAgo)).toBeGreaterThan(0);
    });
  });

  describe("graduated intervals (days)", () => {
    it("level 2 -> 3: 1 day", () => {
      expect(minutesTillNextReview(2, dayjs().toISOString())).toBe(MIN_PER_DAY);
    });

    it("level 3 -> 4: 2 days", () => {
      expect(minutesTillNextReview(3, dayjs().toISOString())).toBe(2 * MIN_PER_DAY);
    });

    it("level 4 -> 5: 3 days", () => {
      expect(minutesTillNextReview(4, dayjs().toISOString())).toBe(3 * MIN_PER_DAY);
    });

    it("level 5 -> 6: 4.5 days (3d * 1.5)", () => {
      expect(minutesTillNextReview(5, dayjs().toISOString())).toBe(
        Math.round(1.5 * 3 * MIN_PER_DAY),
      );
    });
  });

  describe("overdue", () => {
    it("returns negative when graduated card is past due", () => {
      const tenDaysAgo = dayjs().subtract(10, "day").toISOString();
      expect(minutesTillNextReview(3, tenDaysAgo)).toBeLessThan(0);
    });
  });
});

describe("isReviewable", () => {
  it("brand-new card is reviewable", () => {
    expect(isReviewable(0, null)).toBe(true);
  });

  it("just-reviewed learning card is not reviewable yet", () => {
    expect(isReviewable(1, dayjs().toISOString())).toBe(false);
  });

  it("learning card is reviewable after 10 minutes", () => {
    const elevenMinAgo = dayjs().subtract(11, "minute").toISOString();
    expect(isReviewable(1, elevenMinAgo)).toBe(true);
  });

  it("MAX_LEVEL card is never reviewable", () => {
    const longAgo = dayjs().subtract(1000, "day").toISOString();
    expect(isReviewable(15, longAgo)).toBe(false);
  });
});
