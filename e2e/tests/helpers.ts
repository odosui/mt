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

// Helpers

export async function expectTag(page: Page, tag: string, count: number) {
  await expect(
    page.locator(".menu-tags div", { hasText: [tag, count].join("") }),
  ).toBeVisible();
}
