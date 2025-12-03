import { NoteStore } from "../notes/NotesStore";

export type TimelineItem = {
  date: string;
  content: string;
  note_sid: number;
  note_title: string;
  color: string | null;
};

const createTimelineService = (noteStore: NoteStore) => {
  async function getTimeline() {
    // Get all notes with #timeline tag
    const allNotes = await noteStore.getNotes("", false, false);
    const timelineNotes = allNotes.filter((note) =>
      note.tags.map((t) => t.toLowerCase()).includes("timeline"),
    );

    const items: TimelineItem[] = [];

    for (const n of timelineNotes) {
      const lines = n.body.split("\n");
      const noteTitle = extractTitle(n.body);

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
              color: null,
            });
          }
        }
      }
    }

    return items;
  }

  return {
    getTimeline,
  };
};

function extractTitle(body: string): string {
  const lines = body.split("\n");

  return (
    lines.find((l) => l.trim().length > 0)?.replace(/^#+\s*/, "") || "Untitled"
  );
}

export default createTimelineService;
