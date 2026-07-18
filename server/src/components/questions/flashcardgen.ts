import { sendMessage } from "../ai/Anthropic.ts";

const MODEL = "claude-haiku-4-5";

type FlashcardItem = {
  question: string;
  answer: string;
};

type Result = [FlashcardItem[], null] | [null, string];

export async function generateFlashcards(text: string): Promise<Result> {
  const prompt = `Based on the following text, generate flashcards for spaced repetition study. Each flashcard should have a question and a concise answer.

Focus on the key concepts, facts, and understanding from the text. Use whatever language is used in the text itself.

Return ONLY a valid JSON array with no additional text. Nothing extra, because I'm going to use JSON.parse on it. Each object should have:
- "question": the question text
- "answer": the answer text

Text:
${text}

JSON:`;

  const response = await sendMessage(MODEL, prompt);

  const cleaned = response
    .replace(/^```(?:json)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse flashcard generation response:", response);
    return [null, "Failed to parse response as JSON"];
  }

  if (!Array.isArray(parsed)) {
    return [null, "Response is not an array"];
  }

  for (let i = 0; i < parsed.length; i++) {
    const item = parsed[i];
    if (typeof item.question !== "string" || typeof item.answer !== "string") {
      return [null, `Flashcard ${i}: missing question or answer`];
    }
  }

  return [parsed as FlashcardItem[], null];
}
