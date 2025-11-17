import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { daysTillNextReview } from "./utils";

describe("daysTillNextReview", () => {
  describe("when lastReviewed is null", () => {
    it("should return 0 for any level", () => {
      expect(daysTillNextReview(0, null)).toBe(0);
      expect(daysTillNextReview(5, null)).toBe(0);
      expect(daysTillNextReview(10, null)).toBe(0);
    });
  });

  describe("level 0 (first review)", () => {
    it("should return 0 when reviewed today", () => {
      expect(daysTillNextReview(0, new Date().toISOString())).toBe(0);
    });

    it("should return negative days when overdue", () => {
      const threeDaysAgo = dayjs().subtract(3, "day").toISOString();
      expect(daysTillNextReview(0, threeDaysAgo)).toBe(-3);
    });
  });

  describe("level 1", () => {
    it("should return 1 when reviewed today", () => {
      expect(daysTillNextReview(1, new Date().toISOString())).toBe(1);
    });

    it("should return 0 when reviewed yesterday", () => {
      const yesterday = dayjs().subtract(1, "day").toISOString();
      expect(daysTillNextReview(1, yesterday)).toBe(0);
    });

    it("should return negative when overdue", () => {
      const twoDaysAgo = dayjs().subtract(2, "day").toISOString();
      expect(daysTillNextReview(1, twoDaysAgo)).toBe(-1);
    });
  });

  describe("level 2", () => {
    it("should return 2 when reviewed today", () => {
      expect(daysTillNextReview(2, new Date().toISOString())).toBe(2);
    });

    it("should return 1 when reviewed 1 day ago", () => {
      const oneDayAgo = dayjs().subtract(1, "day").toISOString();
      expect(daysTillNextReview(2, oneDayAgo)).toBe(1);
    });

    it("should return -1 when reviewed 3 days ago", () => {
      const threeDaysAgo = dayjs().subtract(3, "day").toISOString();
      expect(daysTillNextReview(2, threeDaysAgo)).toBe(-1);
    });
  });

  describe("spaced repetition progression", () => {
    it("should follow increasing intervals at higher levels", () => {
      const today = new Date().toISOString();

      // Level 3: should be 3 days (floor(1.5 * 2))
      expect(daysTillNextReview(3, today)).toBe(3);

      // Level 4: should be 4 days (floor(1.5 * 3))
      expect(daysTillNextReview(4, today)).toBe(4);

      // Level 5: should be 6 days (floor(1.5 * 4))
      expect(daysTillNextReview(5, today)).toBe(6);

      // Level 6: should be 9 days (floor(1.5 * 6))
      expect(daysTillNextReview(6, today)).toBe(9);
    });

    it("should handle high levels correctly", () => {
      const today = new Date().toISOString();
      expect(daysTillNextReview(10, today)).toBe(42);
      expect(daysTillNextReview(15, today)).toBe(316);
    });
  });

  describe("edge cases with time", () => {
    it("should handle reviews from far in the past", () => {
      const sixMonthsAgo = dayjs().subtract(180, "day").toISOString();
      expect(daysTillNextReview(3, sixMonthsAgo)).toBeLessThan(0);
      expect(daysTillNextReview(3, sixMonthsAgo)).toBe(-177);
    });

    it("should handle partial day differences", () => {
      // dayjs().diff() returns whole days, so partial days should round down
      const almostOneDayAgo = dayjs().subtract(23, "hour").toISOString();
      expect(daysTillNextReview(1, almostOneDayAgo)).toBe(1);
    });

    it("should return correct values for recently reviewed items", () => {
      const oneHourAgo = dayjs().subtract(1, "hour").toISOString();
      expect(daysTillNextReview(5, oneHourAgo)).toBe(6);
    });
  });
});
