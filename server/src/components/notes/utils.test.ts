import { describe, expect, it } from "vitest";
import { extractTitle, snakeCased } from "./utils";

describe("extractTitle", () => {
  it("should extract the first non-empty line", () => {
    const body = "\n\nHello World\nSome other text";
    expect(extractTitle(body)).toBe("Hello World");
  });

  it("should remove markdown heading prefix", () => {
    const body = "# My Title\nContent here";
    expect(extractTitle(body)).toBe("My Title");
  });

  it("should handle multiple heading levels", () => {
    expect(extractTitle("## Second Level")).toBe("Second Level");
    expect(extractTitle("### Third Level")).toBe("Third Level");
    expect(extractTitle("#### Fourth Level")).toBe("Fourth Level");
  });

  it("should return 'Untitled' for empty body", () => {
    expect(extractTitle("")).toBe("Untitled");
    expect(extractTitle("\n\n\n")).toBe("Untitled");
  });

  it("should handle body with only whitespace", () => {
    expect(extractTitle("   ")).toBe("Untitled");
  });
});

describe("snakeCased", () => {
  it("should convert basic strings to snake_case", () => {
    expect(snakeCased("Hello World")).toBe("hello_world");
    expect(snakeCased("My Title Here")).toBe("my_title_here");
  });

  it("should handle hyphens", () => {
    expect(snakeCased("hello-world")).toBe("hello_world");
    expect(snakeCased("my-great-title")).toBe("my_great_title");
  });

  it("should handle mixed separators", () => {
    expect(snakeCased("Hello World-Test Case")).toBe("hello_world_test_case");
  });

  it("should remove special characters", () => {
    expect(snakeCased("Hello! World?")).toBe("hello_world");
    expect(snakeCased("Test@#$%Title")).toBe("test_title");
  });

  it("should preserve numbers", () => {
    expect(snakeCased("Version 2.0")).toBe("version_2_0");
    expect(snakeCased("Test123")).toBe("test123");
  });

  it("should collapse multiple underscores", () => {
    expect(snakeCased("Hello___World")).toBe("hello_world");
    expect(snakeCased("Test  Multiple   Spaces")).toBe("test_multiple_spaces");
  });

  it("should remove leading and trailing underscores", () => {
    expect(snakeCased("_Hello World_")).toBe("hello_world");
    expect(snakeCased("!!!Test!!!")).toBe("test");
  });

  it("should handle empty and null strings", () => {
    expect(snakeCased("")).toBe("");
    expect(snakeCased(null as any)).toBe(null);
    expect(snakeCased(undefined as any)).toBe(undefined);
  });

  it("should handle already snake_cased strings", () => {
    expect(snakeCased("already_snake_case")).toBe("already_snake_case");
  });

  // International language tests
  describe("international language support", () => {
    it("should preserve Chinese characters", () => {
      expect(snakeCased("你好世界")).toBe("你好世界");
      expect(snakeCased("Hello 你好 World")).toBe("hello_你好_world");
    });

    it("should preserve Arabic characters", () => {
      expect(snakeCased("مرحبا")).toBe("مرحبا");
      expect(snakeCased("Hello مرحبا")).toBe("hello_مرحبا");
    });

    it("should preserve Russian characters", () => {
      expect(snakeCased("Привет мир")).toBe("привет_мир");
      expect(snakeCased("Test Тест")).toBe("test_тест");
    });

    it("should preserve Japanese characters", () => {
      expect(snakeCased("こんにちは")).toBe("こんにちは");
      expect(snakeCased("Hello こんにちは")).toBe("hello_こんにちは");
    });

    it("should preserve Korean characters", () => {
      expect(snakeCased("안녕하세요")).toBe("안녕하세요");
      expect(snakeCased("Hello 안녕")).toBe("hello_안녕");
    });

    it("should preserve French accented characters", () => {
      expect(snakeCased("Café")).toBe("café");
      expect(snakeCased("Résumé")).toBe("résumé");
    });

    it("should preserve German special characters", () => {
      expect(snakeCased("Über")).toBe("über");
      expect(snakeCased("Schön")).toBe("schön");
    });

    it("should preserve Spanish characters", () => {
      expect(snakeCased("Mañana")).toBe("mañana");
      expect(snakeCased("Niño")).toBe("niño");
    });

    it("should handle mixed language strings", () => {
      expect(snakeCased("Test 测试 тест")).toBe("test_测试_тест");
      expect(snakeCased("Hello世界Мир")).toBe("hello世界мир");
    });
  });
});
