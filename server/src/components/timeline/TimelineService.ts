import { Note, NoteStore } from "../notes/NotesStore";
import { extractTitle } from "../notes/utils";

export type TimelineItem = {
  date: string;
  content: string;
  note_sid: number;
  note_title: string;
  color: string | null;
};

// Helper function to extract color from tags like #Color=green
function extractColor(tags: string[]): string | null {
  for (const tag of tags) {
    const match = tag.match(/^color=(.+)$/i);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

const createTimelineService = (noteStore: NoteStore) => {
  async function getTimeline() {
    // Get all notes with #timeline tag
    const allNotes = await noteStore.getNotes("", false, false);
    const timelineNotes = allNotes.filter((note) =>
      note.tags.map((t) => t.toLowerCase()).includes("timeline"),
    );

    return buildTimeline(timelineNotes);
  }

  return {
    getTimeline,
  };
};

// export for testing purposes
export function buildTimeline(timelineNotes: Note[]): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const n of timelineNotes) {
    const lines = n.body.split("\n");
    const noteTitle = extractTitle(n.body);
    const color = extractColor(n.tags);

    for (const l of lines) {
      // Match lines starting with YYYY-MM-DD, YYYY-MM, or YYYY followed by a space
      const dateMatch = l.match(/^(\d{4}(-\d{2}(-\d{2})?)?) (.+)/);

      if (dateMatch) {
        const dateStr = dateMatch[1];
        const content = dateMatch[4];

        if (dateStr && content) {
          items.push({
            date: dateStr,
            content,
            note_sid: parseInt(n.id, 10),
            note_title: noteTitle,
            color,
          });
        }
      }
    }
  }

  // Sort chronologically: specific dates before their parent periods
  // e.g. 2024-05-10 before 2024-05 before 2024
  items.sort((a, b) => {
    const padDate = (d: string) => {
      const parts = d.split("-");
      return [
        parts[0],
        parts[1] ?? "99",
        parts[2] ?? "99",
      ].join("-");
    };
    return padDate(a.date).localeCompare(padDate(b.date));
  });

  return items;
}

export default createTimelineService;
