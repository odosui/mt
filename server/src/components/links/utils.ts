const FENCED_CODE = /(```|~~~)[\s\S]*?(\1|$)/g;
const INLINE_CODE = /`[^`\n]*`/g;
const NOTE_LINK = /\]\((\d+)\)/g;

function stripCode(body: string): string {
  return body.replace(FENCED_CODE, "").replace(INLINE_CODE, "");
}

export function extractLinkedNoteIds(body: string): string[] {
  const ids = [...stripCode(body).matchAll(NOTE_LINK)].map((m) => m[1]!);
  return [...new Set(ids)];
}
