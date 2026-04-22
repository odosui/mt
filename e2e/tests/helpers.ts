import { expect, Page } from "@playwright/test";

// Locators

export function saveBtn(p: Page) {
  return p.locator('button:has-text("Save")').first();
}

export function cancelBtn(p: Page) {
  return p.locator('button:has-text("Cancel")').first();
}

export function editBtn(p: Page) {
  return p.locator('button:has-text("Edit")').first();
}

export function newNoteBtn(p: Page) {
  return p.locator(".newNote").first();
}

export function noteTA(p: Page) {
  return p.locator("textarea").first();
}

export function noteItem(p: Page, title: string) {
  return p.locator(".notes-items").locator(`text=${title}`);
}

export function tagItem(p: Page, tag: string) {
  return p.locator(".menu-tags .tag-name", { hasText: tag });
}

export function moreMenuBtn(p: Page) {
  return p.locator('.menu-action-more[title="More menu items"]').first();
}

export function delBtn(p: Page) {
  return p.locator('.dropdown-menu .menu-item:has-text("Delete note")');
}

export function favBtn(p: Page) {
  return p.locator('.menu-action[title*="favorites"]');
}

// Area locators — scoping helpers for note panels
export function noteArea(p: Page) {
  return p.locator(".note-area");
}

export function quizzesPanel(p: Page) {
  return p.locator(".quizzes-panel");
}

export function flashcardsPanel(p: Page) {
  return p.locator(".flashcards-panel");
}

// Timeline locators

export function timelineLink(p: Page) {
  return p.locator("aside").getByRole("link", { name: /Timeline/ });
}

export function notesLink(p: Page) {
  return p.locator("aside").getByRole("link", { name: /Notes/ });
}

// Section wrapping a timeline group, identified by its heading text.
export function timelineGroup(p: Page, title: string | RegExp) {
  return p
    .getByRole("heading", { level: 2, name: title })
    .locator("xpath=..");
}

// Card wrapping a single event — used when we need to inspect inline styling
// like the per-note border color.
export function timelineEventCard(p: Page, content: string) {
  return p.locator(".timeline-item-content").filter({ hasText: content });
}

// Returns YYYY-MM-DD string offset from today by `days` (negative for past).
export function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Returns YYYY-MM-DD for (first of next calendar month) + `days`.
// Picking days >= 15 guarantees the result lands in the "Next Month"
// section, regardless of what weekday/day-of-month it's run on.
export function firstOfNextMonthPlus(days: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + 1);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Full English month name for a YYYY-MM-DD date string.
export function monthNameOf(date: string): string {
  const [y, m, d] = date.split("-").map((v) => parseInt(v, 10));
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1).toLocaleString("en-US", {
    month: "long",
  });
}

// Helpers

export async function createNote(p: Page, content: string) {
  await newNoteBtn(p).click();
  await noteTA(p).fill(content);
  await saveBtn(p).click();
}

export async function expectTag(page: Page, tag: string, count: number) {
  await expect(
    page.locator(".menu-tags div", { hasText: [tag, count].join("") }),
  ).toBeVisible();
}
