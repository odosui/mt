import { type NoteStore } from "../notes/NotesStore.ts";

type Tag = {
  id: string;
  title: string;
  count: number;
};

export const createTagsService = (noteStore: NoteStore) => {
  async function allTags(): Promise<Tag[]> {
    const notes = await noteStore.getNotes("", false, false);
    return Object.values(notes)
      .reduce((acc, n) => {
        const uniqueTags = [...new Set(n.tags)];
        uniqueTags.forEach((tag) => {
          const canTag = tag.trim().toLowerCase();

          const t = acc.find((t) => t.id === canTag);
          if (t) {
            t.count++;
          } else {
            acc.push({ id: canTag, title: canTag, count: 1 });
          }
        });

        return acc;
      }, [] as Tag[])
      .sort((a, b) => b.count - a.count);
  }

  return {
    allTags,
  };
};
