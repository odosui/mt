import { expect, Page, test } from "@playwright/test";
import { createNote, noteItem } from "./helpers";

// Each payload sets a flag on window if the browser ever parses it as HTML.
function injected(p: Page) {
  return p.evaluate(() => (window as unknown as { __xss?: number }).__xss);
}

test.describe("HTML in notes is rendered as text", () => {
  test("note list, search snippets and tags", async ({ page: p }) => {
    await p.goto("/app/notes");

    // A tag split across lines used to slip past the client-side escaper.
    await createNote(
      p,
      "# Split payload <img src=x onerror=window.__xss=1//\n> tail",
    );
    await expect(noteItem(p, "Split payload")).toBeVisible();

    await createNote(
      p,
      "# Searchable note\n\nfind me <img src=x onerror=window.__xss=2> here",
    );
    await createNote(p, "# Tagged note\n\n#<img/src=x/onerror=window.__xss=3>");
    await expect(noteItem(p, "Tagged note")).toBeVisible();

    const searchInput = p.getByRole("searchbox", { name: "Search notes" });
    await searchInput.fill("find me");
    await p.waitForTimeout(600);

    const snippet = p.locator(".notes-items .snippet-body").first();
    await expect(snippet.locator("mark")).toHaveText("find me");
    await expect(snippet).toContainText("<img src=x onerror=window.__xss=2>");

    // Regex characters in the tag filter used to crash the sidebar.
    const tagSearch = p.getByPlaceholder("Search tags");
    await tagSearch.fill("(");
    await expect(tagSearch).toBeVisible();
    await tagSearch.fill("img");
    await expect(p.locator(".menu-tags .tag-name mark").first()).toHaveText(
      "img",
    );

    expect(await injected(p)).toBeUndefined();
  });

  test("soundcloud embed fields", async ({ page: p }) => {
    await p.goto("/app/notes");

    await createNote(
      p,
      [
        "# Sound note",
        "",
        "```soundcloud",
        "track_id: 1",
        "user: someone",
        "track_title: <img src=x onerror=window.__xss=4>",
        "```",
      ].join("\n"),
    );

    await expect(p.locator(".soundcloud-embed")).toContainText(
      "<img src=x onerror=window.__xss=4>",
    );
    expect(await injected(p)).toBeUndefined();
  });
});
