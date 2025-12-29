import { describe, expect, it } from "vitest";
import { buildTimeline } from "./TimelineService";
import { Note } from "../notes/NotesStore";

// helper function to create a note
const n = (id: string, body: string, tags: string[] = []): Note => ({
  id,
  body,
  tags,
  level: 0,
  last_reviewed_at: "2024-01-01",
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  favorite: false,
  flashcards: [],
});

describe("buildTimeline", () => {
  describe("date extraction logic", () => {
    it("should extract full date format YYYY-MM-DD", () => {
      const note = n("1", "# Test Note\n2024-12-25 Christmas celebration");
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.date).toBe("2024-12-25");
      expect(items[0]?.content).toBe("Christmas celebration");
    });

    it("should extract year-month format YYYY-MM", () => {
      const note = n("1", "# Test Note\n2024-12 Holiday season");
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.date).toBe("2024-12");
      expect(items[0]?.content).toBe("Holiday season");
    });

    it("should extract year-only format YYYY", () => {
      const note = n("1", "# Test Note\n2024 A great year");
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.date).toBe("2024");
      expect(items[0]?.content).toBe("A great year");
    });

    it("should extract multiple date entries from a single note", () => {
      const note = n(
        "1",
        "# Test Note\n2024-01-01 New Year\n2024-06-15 Mid year\n2024-12-31 Year end",
      );
      const items = buildTimeline([note]);

      expect(items).toHaveLength(3);
      expect(items[0]?.date).toBe("2024-01-01");
      expect(items[0]?.content).toBe("New Year");
      expect(items[1]?.date).toBe("2024-06-15");
      expect(items[1]?.content).toBe("Mid year");
      expect(items[2]?.date).toBe("2024-12-31");
      expect(items[2]?.content).toBe("Year end");
    });

    it("should ignore lines without date format", () => {
      const note = n(
        "1",
        "# Test Note\nSome random text\n2024-01-01 Valid entry\nAnother random line",
      );
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.date).toBe("2024-01-01");
      expect(items[0]?.content).toBe("Valid entry");
    });

    it("should ignore dates that are not at the start of the line", () => {
      const note = n(
        "1",
        "# Test Note\nMeeting on 2024-01-01 was great\n2024-01-02 Valid entry",
      );
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.date).toBe("2024-01-02");
      expect(items[0]?.content).toBe("Valid entry");
    });

    it("should handle empty note body", () => {
      const note = n("1", "");
      const items = buildTimeline([note]);

      expect(items).toHaveLength(0);
    });

    it("should handle note with only title", () => {
      const note = n("1", "# Test Note");
      const items = buildTimeline([note]);

      expect(items).toHaveLength(0);
    });
  });

  describe("tags and color extraction logic", () => {
    it("should extract color from Color tag (case insensitive)", () => {
      const note = n("1", "# Test Note\n2024-01-01 Event", [
        "timeline",
        "Color=green",
      ]);
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.color).toBe("green");
    });

    it("should extract color from lowercase color tag", () => {
      const note = n("1", "# Test Note\n2024-01-01 Event", [
        "timeline",
        "color=blue",
      ]);
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.color).toBe("blue");
    });

    it("should extract color from uppercase COLOR tag", () => {
      const note = n("1", "# Test Note\n2024-01-01 Event", [
        "timeline",
        "COLOR=red",
      ]);
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.color).toBe("red");
    });

    it("should return null color when no color tag is present", () => {
      const note = n("1", "# Test Note\n2024-01-01 Event", [
        "timeline",
        "important",
      ]);
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.color).toBe(null);
    });

    it("should return null color when tags array is empty", () => {
      const note = n("1", "# Test Note\n2024-01-01 Event", []);
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.color).toBe(null);
    });

    it("should use the same color for all timeline items from a note", () => {
      const note = n(
        "1",
        "# Test Note\n2024-01-01 First event\n2024-02-01 Second event",
        ["timeline", "Color=purple"],
      );
      const items = buildTimeline([note]);

      expect(items).toHaveLength(2);
      expect(items[0]?.color).toBe("purple");
      expect(items[1]?.color).toBe("purple");
    });

    it("should support hex color codes", () => {
      const note = n("1", "# Test Note\n2024-01-01 Event", [
        "timeline",
        "Color=#FF5733",
      ]);
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.color).toBe("#FF5733");
    });
  });

  describe("edge cases", () => {
    it("should handle date at end of line with no space", () => {
      const note = n("1", "# Test\n2024-01-01");
      const items = buildTimeline([note]);

      // This should not match because there's no content after the date
      expect(items).toHaveLength(0);
    });

    it("should handle very long content after date", () => {
      const longContent = "A".repeat(1000);
      const note = n("1", `# Test\n2024-01-01 ${longContent}`);
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.content).toBe(longContent);
    });

    it("should handle special characters in content", () => {
      const note = n(
        "1",
        "# Test\n2024-01-01 Event with #hashtag and @mention",
      );
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.content).toBe("Event with #hashtag and @mention");
    });

    it("should handle unicode characters in content", () => {
      const note = n(
        "1",
        "# Test\n2024-01-01 Event with emoji 🎉 and unicode 你好",
      );
      const items = buildTimeline([note]);

      expect(items).toHaveLength(1);
      expect(items[0]?.content).toBe("Event with emoji 🎉 and unicode 你好");
    });
  });
});
