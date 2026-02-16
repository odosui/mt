import { sendMessage } from "../ai/Anthropic";

type QuizItem = {
  question: string;
  answers: [string, string, string, string];
  correctIndex: number;
};

type Result = [QuizItem[], null] | [null, string];

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
    if (
      typeof q.correctIndex !== "number" ||
      q.correctIndex < 0 ||
      q.correctIndex > 3
    ) {
      return `Question ${i}: correctIndex must be a number between 0 and 3`;
    }
  }

  return null;
}

export async function generateQuiz(
  text: string,
  numberOfQuestions: number,
  extraInstructions?: string,
  model?: string,
): Promise<Result> {
  const extra = extraInstructions
    ? `\n\nAdditional instructions:\n${extraInstructions}\n`
    : "";

  const prompt = `Based on the following text, generate a quiz with exactly ${numberOfQuestions} multiple choice questions. Each question should have exactly 4 answers.

    Take the important information from the text. We need to check not only facts, but also general understanding. Use whatever language is used in the text itself.

Return ONLY a valid JSON array with no additional text. Nothing extra, because I'm going to use JSON.parse on it. Each object should have:
- "question": the question text
- "answers": array of exactly 4 answer strings
- "correctIndex": index (0-3) of the correct answer
${extra}
Text:
${text}

JSON:`;

  const response = await sendMessage(model || "claude-haiku-4-5", prompt);

  const cleaned = response
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse quiz generation response:", response);
    return [null, "Failed to parse response as JSON"];
  }

  const err = validateQuiz(parsed);
  if (err) {
    console.error("Quiz validation error:", err, parsed);
    return [null, err];
  }

  return [parsed as QuizItem[], null];
}
