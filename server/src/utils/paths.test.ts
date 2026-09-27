import path from "path";
import { describe, expect, it } from "vitest";
import { childPath } from "./paths.ts";

describe("childPath", () => {
  it("resolves a plain file name inside the directory", () => {
    expect(childPath("/data/media", "1__a.png")).toBe(
      path.resolve("/data/media/1__a.png"),
    );
  });

  it.each(["../../escaped__img.png", "a/b.png", "/etc/passwd", "..", "."])(
    "rejects %j",
    (name) => {
      expect(() => childPath("/data/media", name)).toThrow();
    },
  );
});
