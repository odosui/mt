export type Flashcard = {
  note_id: string;
  question: string;
  answer: string;
  level: number;
  reviewed_at: string | null;
};

export type Note = {
  id: string;
  body: string;
  tags: string[];
  favorite: boolean;
  flashcards: Flashcard[];

  // spaced repetition
  level: number;
  last_reviewed_at: string;

  // timestamps
  created_at: string;
  updated_at: string;
};

export interface NoteStore {
  noteCounts(): Promise<{ total_notes: number }>;
  getNotes(tags: string, isReview: boolean, favOnly: boolean): Promise<Note[]>;
  getNote(id: string): Promise<Note | null>;
  createNote(body: string): Promise<Note>;
  updateNote(
    id: string,
    data: Partial<Note>,
    skipUpdatedAt: boolean,
  ): Promise<Note>;
}
