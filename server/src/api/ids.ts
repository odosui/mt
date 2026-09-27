const NOTE_ID = /^\d+$/;
const QUIZ_ID = /^\d+$/;
const IMAGE_ID = /^\d+__[a-zA-Z0-9._-]+$/;

export function isNoteId(value: unknown): value is string {
  return typeof value === "string" && NOTE_ID.test(value);
}

export function isQuizId(value: unknown): value is string {
  return typeof value === "string" && QUIZ_ID.test(value);
}

export function isImageId(value: unknown): value is string {
  return typeof value === "string" && IMAGE_ID.test(value);
}
