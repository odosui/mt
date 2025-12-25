import { test as base, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const TEST_NOTES_DIR = '/tmp/mt-e2e-test-notes/notes';

/**
 * Extended test fixture with helper utilities for E2E testing
 */
export const test = base.extend({
  /**
   * Ensures a clean test notes directory before each test
   */
  cleanNotesDir: async ({}, use) => {
    // Clean up notes directory before test
    if (fs.existsSync(TEST_NOTES_DIR)) {
      fs.rmSync(TEST_NOTES_DIR, { recursive: true, force: true });
    }

    await use();

    // Clean up after test (optional - can be commented out for debugging)
    if (fs.existsSync(TEST_NOTES_DIR)) {
      fs.rmSync(TEST_NOTES_DIR, { recursive: true, force: true });
    }
  },
});

/**
 * Helper to create a test note file directly in the filesystem
 * Useful for setting up test data
 */
export function createTestNote(filename: string, content: string, metadata?: {
  level?: number;
  favorite?: boolean;
  last_reviewed_at?: string;
}) {
  if (!fs.existsSync(TEST_NOTES_DIR)) {
    fs.mkdirSync(TEST_NOTES_DIR, { recursive: true });
  }

  const now = new Date().toISOString();
  const frontmatter = `---
level: ${metadata?.level ?? 0}
created_at: ${now}
updated_at: ${now}
${metadata?.last_reviewed_at ? `last_reviewed_at: ${metadata.last_reviewed_at}` : ''}
${metadata?.favorite ? 'favorite: true' : ''}
---

`;

  const fullContent = frontmatter + content;
  const filepath = path.join(TEST_NOTES_DIR, filename);
  fs.writeFileSync(filepath, fullContent, 'utf-8');

  return filepath;
}

/**
 * Helper to wait for an element to be visible with a custom timeout
 */
export async function waitForElement(page: any, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Helper to check if a note exists in the notes list
 */
export async function expectNoteInList(page: any, noteTitle: string) {
  const noteElement = page.locator(`text=${noteTitle}`).first();
  await expect(noteElement).toBeVisible();
}

export { expect };
