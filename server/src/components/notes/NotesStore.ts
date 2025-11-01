export type Note = {
  id: string;
  body: string;
  tags: string[];

  // spaced repetition
  level: number;
  last_reviewed_at: string;

  // timestamps
  created_at: string;
  updated_at: string;
};

export interface NoteStore {
  noteCounts(): Promise<{ total_notes: number }>;
  getNotes(tags: string, isReview: boolean): Promise<Note[]>;
  getNote(id: string): Promise<Note | null>;
  createNote(body: string): Promise<Note>;
  updateNote(
    id: string,
    data: Partial<Note>,
    skipUpdatedAt: boolean,
  ): Promise<Note>;
}
