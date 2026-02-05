import fs from "fs/promises";
import path from "path";

export type QuizItem = {
  question: string;
  answers: [string, string, string, string];
  correctIndex: number;
};

export type Quiz = {
  id: number;
  noteId: string;
  title: string;
  items: QuizItem[];
  created_at: string;
};

export interface QuizStore {
  listByNote(noteId: string): Promise<Quiz[]>;
  getOne(noteId: string, quizId: number): Promise<Quiz | null>;
  save(noteId: string, title: string, items: QuizItem[]): Promise<Quiz>;
}

export function createFSQuizStore(mtHome: string): QuizStore {
  const quizzesDir = path.join(mtHome, "quizzes");

  async function ensureDir() {
    await fs.mkdir(quizzesDir, { recursive: true });
  }

  async function getNextSeqId(noteId: string): Promise<number> {
    await ensureDir();
    const files = await fs.readdir(quizzesDir);
    const prefix = `${noteId}__`;
    const ids = files
      .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
      .map((f) => {
        const m = f.match(new RegExp(`^${noteId}__(\\d+)\\.json$`));
        return m ? parseInt(m?.[1] ?? "", 10) : 0;
      })
      .filter((id) => id > 0);

    return ids.length > 0 ? Math.max(...ids) + 1 : 1;
  }

  function quizFilename(noteId: string, seqId: number): string {
    return `${noteId}__${seqId}.json`;
  }

  async function listByNote(noteId: string): Promise<Quiz[]> {
    await ensureDir();
    const files = await fs.readdir(quizzesDir);
    const prefix = `${noteId}__`;
    const quizFiles = files
      .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
      .sort();

    const quizzes: Quiz[] = [];
    for (const file of quizFiles) {
      const filePath = path.join(quizzesDir, file);
      const content = await fs.readFile(filePath, "utf-8");
      try {
        quizzes.push(JSON.parse(content));
      } catch {
        console.warn(`Skipping invalid quiz file: ${file}`);
      }
    }

    return quizzes;
  }

  async function save(
    noteId: string,
    title: string,
    items: QuizItem[],
  ): Promise<Quiz> {
    const seqId = await getNextSeqId(noteId);
    const quiz: Quiz = {
      id: seqId,
      noteId,
      title,
      items,
      created_at: new Date().toISOString(),
    };

    await ensureDir();
    const filePath = path.join(quizzesDir, quizFilename(noteId, seqId));
    await fs.writeFile(filePath, JSON.stringify(quiz, null, 2), "utf-8");

    return quiz;
  }

  async function getOne(
    noteId: string,
    quizId: number,
  ): Promise<Quiz | null> {
    const filePath = path.join(quizzesDir, quizFilename(noteId, quizId));
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  return { listByNote, getOne, save };
}
