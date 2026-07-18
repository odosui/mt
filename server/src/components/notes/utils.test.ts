import { describe, expect, it } from "vitest";
import { extractSnippetWithContext, extractTitle, snakeCased } from "./utils.ts";

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

describe("extractSnippetWithContext", () => {
  describe("without query", () => {
    it("should return first 3 lines when no query is provided", () => {
      const body = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5";
      expect(extractSnippetWithContext(body)).toBe("Line 1\nLine 2\nLine 3");
    });

    it("should return first 3 lines when query is empty string", () => {
      const body = "Line 1\nLine 2\nLine 3\nLine 4";
      expect(extractSnippetWithContext(body, "")).toBe(
        "Line 1\nLine 2\nLine 3",
      );
    });

    it("should return first 3 lines when query is whitespace", () => {
      const body = "Line 1\nLine 2\nLine 3\nLine 4";
      expect(extractSnippetWithContext(body, "   ")).toBe(
        "Line 1\nLine 2\nLine 3",
      );
    });

    it("should handle body with fewer than 3 lines", () => {
      const body = "Line 1\nLine 2";
      expect(extractSnippetWithContext(body)).toBe("Line 1\nLine 2");
    });

    it("should handle empty body", () => {
      expect(extractSnippetWithContext("")).toBe("");
    });
  });

  describe("with query - basic matching", () => {
    it("should highlight matched text with <mark> tags", () => {
      const body = "This is a simple test with some text.";
      const result = extractSnippetWithContext(body, "test");
      expect(result).toContain("<mark>test</mark>");
    });

    it("should be case-insensitive when matching", () => {
      const body = "This is a TEST with different cases.";
      const result = extractSnippetWithContext(body, "test");
      expect(result).toContain("<mark>TEST</mark>");
    });

    it("should preserve original case in result", () => {
      const body = "This is a MixedCase word in the text.";
      const result = extractSnippetWithContext(body, "mixedcase");
      expect(result).toContain("<mark>MixedCase</mark>");
    });

    it("should handle query with leading/trailing whitespace", () => {
      const body = "This is a test with some text.";
      const result = extractSnippetWithContext(body, "  test  ");
      expect(result).toContain("<mark>test</mark>");
    });
  });

  describe("with query - no match", () => {
    it("should return first 3 lines when query is not found", () => {
      const body = "Line 1\nLine 2\nLine 3\nLine 4";
      const result = extractSnippetWithContext(body, "notfound");
      expect(result).toBe("Line 1\nLine 2\nLine 3");
    });
  });

  describe("with query - context extraction", () => {
    it("should extract context around the match", () => {
      const body =
        "This is a long text with many words before the target word and many words after it.";
      const result = extractSnippetWithContext(body, "target");
      expect(result).toContain("before");
      expect(result).toContain("<mark>target</mark>");
      expect(result).toContain("after");
    });

    it("should add ellipsis at the start when match is not at the beginning", () => {
      const longPrefix = "a".repeat(150);
      const body = `${longPrefix} this is the target word here`;
      const result = extractSnippetWithContext(body, "target");
      expect(result).toMatch(/^\.\.\./);
      expect(result).toContain("<mark>target</mark>");
    });

    it("should add ellipsis at the end when match is not at the end", () => {
      const longSuffix = "z".repeat(150);
      const body = `this is the target word ${longSuffix}`;
      const result = extractSnippetWithContext(body, "target");
      expect(result).toContain("<mark>target</mark>");
      expect(result).toMatch(/\.\.\.$/);
    });

    it("should add ellipsis at both ends for match in the middle of long text", () => {
      const longPrefix = "a".repeat(150);
      const longSuffix = "z".repeat(150);
      const body = `${longPrefix} target ${longSuffix}`;
      const result = extractSnippetWithContext(body, "target");
      expect(result).toMatch(/^\.\.\./);
      expect(result).toContain("<mark>target</mark>");
      expect(result).toMatch(/\.\.\.$/);
    });

    it("should not add ellipsis when match is at the beginning", () => {
      const body = "target word at the start with more text";
      const result = extractSnippetWithContext(body, "target");
      expect(result).not.toMatch(/^\.\.\./);
      expect(result).toContain("<mark>target</mark>");
    });

    it("should not add ellipsis when match is at the end", () => {
      const body = "Some text ending with the target";
      const result = extractSnippetWithContext(body, "target");
      expect(result).toContain("<mark>target</mark>");
      expect(result).not.toMatch(/\.\.\.$/);
    });

    it("should respect custom context character limit", () => {
      const body = "This is some text before TARGET and some text after.";
      const result = extractSnippetWithContext(body, "target", 10);
      // Should only include ~10 chars before and after
      expect(result.length).toBeLessThan(100);
      expect(result).toContain("<mark>TARGET</mark>");
    });
  });

  describe("with query - edge cases", () => {
    it("should handle match at position 0", () => {
      const body = "target is at the beginning";
      const result = extractSnippetWithContext(body, "target");
      expect(result).toBe("<mark>target</mark> is at the beginning");
    });

    it("should handle match at the very end", () => {
      const body = "at the very end is target";
      const result = extractSnippetWithContext(body, "target");
      expect(result).toBe("at the very end is <mark>target</mark>");
    });

    it("should handle single word body that matches", () => {
      const body = "target";
      const result = extractSnippetWithContext(body, "target");
      expect(result).toBe("<mark>target</mark>");
    });

    it("should handle multi-word query", () => {
      const body = "This is a test with multiple words in the query.";
      const result = extractSnippetWithContext(body, "multiple words");
      expect(result).toContain("<mark>multiple words</mark>");
    });

    it("should handle query with special characters", () => {
      const body = "Testing with C++ programming language.";
      const result = extractSnippetWithContext(body, "c++");
      expect(result).toContain("<mark>C++</mark>");
    });

    it("should handle newlines in body", () => {
      const body = "First line\nSecond line with target word\nThird line";
      const result = extractSnippetWithContext(body, "target");
      expect(result).toContain("<mark>target</mark>");
    });

    it("should handle very short body", () => {
      const body = "hi";
      const result = extractSnippetWithContext(body, "xyz");
      expect(result).toBe("hi");
    });
  });

  describe("with query - international languages", () => {
    it("should handle Chinese characters", () => {
      const body = "这是一个测试文本，包含目标词汇。";
      const result = extractSnippetWithContext(body, "目标");
      expect(result).toContain("<mark>目标</mark>");
    });

    it("should handle Arabic characters", () => {
      const body = "هذا نص تجريبي يحتوي على كلمة مستهدفة.";
      const result = extractSnippetWithContext(body, "مستهدفة");
      expect(result).toContain("<mark>مستهدفة</mark>");
    });

    it("should handle emojis", () => {
      const body = "This text has 🎯 target emoji in it.";
      const result = extractSnippetWithContext(body, "🎯");
      expect(result).toContain("<mark>🎯</mark>");
    });
  });
});
