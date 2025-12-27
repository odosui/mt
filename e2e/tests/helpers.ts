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

// Helpers

export async function expectNoteItem(page: Page, title: string) {
  await expect(
    page.locator(".notes-items").locator(`text=${title}`),
  ).toBeVisible();
}

export async function expectNoNoteItem(page: Page, title: string) {
  await expect(
    page.locator(".notes-items").locator(`text=${title}`),
  ).not.toBeVisible();
}

export async function expectTag(page: Page, tag: string, count: number) {
  await expect(
    page.locator(".menu-tags div", { hasText: [tag, count].join("") }),
  ).toBeVisible();
}

export async function clickTag(page: Page, tag: string) {
  await page.locator(".menu-tags .tag-name", { hasText: tag }).click();
}
