import { describe, expect, it } from "vitest";
import { extractLinkedNoteIds } from "./utils.ts";

describe("extractLinkedNoteIds", () => {
  it("finds note links", () => {
    expect(extractLinkedNoteIds("See [a](1) and [b](22).")).toEqual([
      "1",
      "22",
    ]);
  });

  it("ignores external links", () => {
    expect(extractLinkedNoteIds("[site](https://example.com/1)")).toEqual([]);
  });

  it("dedupes repeated links", () => {
    expect(extractLinkedNoteIds("[a](3) [again](3)")).toEqual(["3"]);
  });

  it("ignores links inside fenced code blocks", () => {
    const body = "```markdown\n[a](1)\n```\n[b](2)\n~~~\n[c](3)\n~~~";
    expect(extractLinkedNoteIds(body)).toEqual(["2"]);
  });

  it("ignores links inside an unclosed fenced code block", () => {
    expect(extractLinkedNoteIds("[a](1)\n```\n[b](2)")).toEqual(["1"]);
  });

  it("ignores links inside inline code", () => {
    expect(extractLinkedNoteIds("`[a](1)` but [b](2)")).toEqual(["2"]);
  });
});
