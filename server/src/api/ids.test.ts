import { describe, expect, it } from "vitest";
import { isImageId, isNoteId, isQuizId } from "./ids.ts";

describe("isNoteId", () => {
  it("accepts numeric ids", () => {
    expect(isNoteId("42")).toBe(true);
  });

  it.each([undefined, 42, "", "4a", "../1", "1/..", ".*", "1 "])(
    "rejects %j",
    (value) => {
      expect(isNoteId(value)).toBe(false);
    },
  );
});

describe("isQuizId", () => {
  it("accepts numeric ids", () => {
    expect(isQuizId("3")).toBe(true);
  });

  it("rejects paths", () => {
    expect(isQuizId("../3")).toBe(false);
  });
});

describe("isImageId", () => {
  it("accepts media file names", () => {
    expect(isImageId("12__photo_1.png")).toBe(true);
  });

  it.each([
    undefined,
    "photo.png",
    "../../escaped__img.png",
    "12__../x.png",
    "12__a/b.png",
    "12__a\\b.png",
  ])("rejects %j", (value) => {
    expect(isImageId(value)).toBe(false);
  });
});
