import { parseArgs } from "./cmd";
import { describe, it, expect } from "vitest";

describe("parseArgs", () => {
  it("parses an empty argument list", () => {
    const args: string[] = [];
    const parsed = parseArgs(args);
    expect(parsed).toEqual({ _: [] });
  });

  it("parses config path", () => {
    const args = ["--mtdir", "~/mydir"];
    const parsed = parseArgs(args);
    expect(parsed.mtdir).toBe("~/mydir");
  });

  it("parses static site", () => {
    const parsed = parseArgs(["--build-static-site"]);
    expect(parsed["build-static-site"]).toBe(true);
  });
});
