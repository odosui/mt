import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { daysTillNextReview, nextReviewPoints, requresReview } from "./utils";
import { Note } from "../notes/NotesStore";

describe("daysTillNextReview", () => {
  describe("Level 0 (7 days period)", () => {
    it("should return 0 days when it's exactly time for review", () => {
      const createdAt = dayjs().subtract(7, "day").format("YYYY-MM-DD");
      expect(daysTillNextReview(0, null, createdAt)).toEqual(0);
    });

    it("should return -1 day when 1 day overdue", () => {
      const createdAt = dayjs().subtract(8, "day").format("YYYY-MM-DD");
      expect(daysTillNextReview(0, null, createdAt)).toEqual(-1);
    });
  });

  describe("Level 2 (30 days period)", () => {
    it("should return negative when overdue by 10 days", () => {
      const lastReviewedAt = dayjs().subtract(40, "day").format("YYYY-MM-DD");
      const createdAt = dayjs().subtract(50, "day").format("YYYY-MM-DD");
      expect(daysTillNextReview(2, lastReviewedAt, createdAt)).toEqual(-10);
    });

    it("should use created_at when last_reviewed_at is null", () => {
      const createdAt = dayjs().subtract(10, "day").format("YYYY-MM-DD");
      expect(daysTillNextReview(2, null, createdAt)).toEqual(20);
    });
  });

  describe("Level 9 (180 days period - max level)", () => {
    it("should return 0 days when exactly 180 days", () => {
      const lastReviewedAt = dayjs().subtract(180, "day").format("YYYY-MM-DD");
      const createdAt = dayjs().subtract(200, "day").format("YYYY-MM-DD");
      expect(daysTillNextReview(9, lastReviewedAt, createdAt)).toEqual(0);
    });
  });
});

describe("nextReviewPoints", () => {
  const createNote = (
    level: number,
    lastReviewedAt: string | null,
    createdAt: string,
  ): Note => ({
    id: "test-id",
    body: "test body",
    tags: [],
    level,
    last_reviewed_at: lastReviewedAt || createdAt,
    created_at: createdAt,
    updated_at: createdAt,
  });

  it("should return array with levels 1 through 10 for level 0", () => {
    const note = createNote(0, null, dayjs().format("YYYY-MM-DD"));
    const result = nextReviewPoints(note);

    expect(result).toHaveLength(10);
    expect(result[0]?.level).toBe(1);
    expect(result[9]?.level).toBe(10);
  });

  it("should return empty array when at max level", () => {
    const note = createNote(10, null, dayjs().format("YYYY-MM-DD"));
    const result = nextReviewPoints(note);

    expect(result).toHaveLength(0);
  });

  it("should show negative days_left for overdue next review", () => {
    const createdAt = dayjs().subtract(10, "day").format("YYYY-MM-DD");
    const note = createNote(0, null, createdAt);
    const result = nextReviewPoints(note);

    // Level 0 period is 7 days, 10 days have passed, so -3 days (overdue)
    expect(result[0]?.level).toBe(1);
    expect(result[0]?.days_left).toBe(-3);
  });
});

describe("requresReview", () => {
  const createNote = (
    level: number,
    lastReviewedAt: string | null,
    createdAt: string,
  ): Note => ({
    id: "test-id",
    body: "test body",
    tags: [],
    level,
    last_reviewed_at: lastReviewedAt || createdAt,
    created_at: createdAt,
    updated_at: createdAt,
  });

  it("should return true when exactly at review time", () => {
    const createdAt = dayjs().subtract(7, "day").format("YYYY-MM-DD");
    const note = createNote(0, null, createdAt);
    expect(requresReview(note)).toBe(true);
  });

  it("should return true when overdue", () => {
    const createdAt = dayjs().subtract(8, "day").format("YYYY-MM-DD");
    const note = createNote(0, null, createdAt);
    expect(requresReview(note)).toBe(true);
  });

  it("should return false when not yet time for review", () => {
    const createdAt = dayjs().subtract(6, "day").format("YYYY-MM-DD");
    const note = createNote(0, null, createdAt);
    expect(requresReview(note)).toBe(false);
  });

  it("should use created_at when last_reviewed_at is null", () => {
    const createdAt = dayjs().subtract(10, "day").format("YYYY-MM-DD");
    const note = createNote(1, null, createdAt);
    // Level 1 period is 15 days, only 10 have passed
    expect(requresReview(note)).toBe(false);
  });
});
