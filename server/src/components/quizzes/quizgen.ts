import { sendMessage } from "../ai/Anthropic";

type Question = {
  question: string;
  answers: [string, string, string, string];
  correctIndex: number;
};

type Result = [Question[], null] | [null, string];

function validateQuiz(data: unknown): string | null {
  if (!Array.isArray(data)) {
    return "Response is not an array";
  }

  for (let i = 0; i < data.length; i++) {
    const q = data[i];
    if (typeof q.question !== "string") {
      return `Question ${i}: missing or invalid question text`;
    }
    if (!Array.isArray(q.answers) || q.answers.length !== 4) {
      return `Question ${i}: answers must be an array of 4 strings`;
    }
    if (!q.answers.every((a: unknown) => typeof a === "string")) {
      return `Question ${i}: all answers must be strings`;
    }
    if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex > 3) {
      return `Question ${i}: correctIndex must be a number between 0 and 3`;
    }
  }

  return null;
}

export async function generateQuiz(
  text: string,
  numberOfQuestions: number,
): Promise<Result> {
  const prompt = `Based on the following text, generate a quiz with exactly ${numberOfQuestions} multiple choice questions. Each question should have exactly 4 answers.

Return ONLY a valid JSON array with no additional text. Each object should have:
- "question": the question text
- "answers": array of exactly 4 answer strings
- "correctIndex": index (0-3) of the correct answer

Text:
${text}

JSON:`;

  const response = await sendMessage("claude-sonnet-4-5", prompt);

  let parsed: unknown;
  try {
    parsed = JSON.parse(response);
  } catch {
    return [null, "Failed to parse response as JSON"];
  }

  const validationError = validateQuiz(parsed);
  if (validationError) {
    return [null, validationError];
  }

  return [parsed as Question[], null];
}
