import { expect, Page, test } from "@playwright/test";
import {
  createNote,
  editBtn,
  newNoteBtn,
  noteArea,
  noteItem,
  noteTA,
  saveBtn,
} from "./helpers";

function backlinksToggler(p: Page) {
  return noteArea(p).getByText("Backlinks");
}

function backlinks(p: Page) {
  return p.getByRole("navigation", { name: "Linked from" });
}

function linkOption(p: Page, title: string) {
  return p.getByRole("option", { name: new RegExp(title) });
}

async function currentNoteId(p: Page) {
  const text = await noteArea(p).getByText(/^#\d+$/).textContent();
  return (text ?? "").replace("#", "");
}

test.describe("Links", () => {
  test("[[ autocomplete inserts a link that shows up as a backlink", async ({
    page: p,
  }) => {
    await p.goto("/app/notes");

    await createNote(p, "# Linking Target Alpha\n\nThe note being linked to.");
    await expect(noteItem(p, "Linking Target Alpha")).toBeVisible();
    const targetId = await currentNoteId(p);

    await createNote(p, "# Linking Decoy Delta\n\nShould be filtered out.");
    await expect(noteItem(p, "Linking Decoy Delta")).toBeVisible();

    // a link inside a code block must not count as a backlink
    await createNote(
      p,
      `# Code Sample Gamma\n\n\`\`\`\n[x](${targetId})\n\`\`\``,
    );
    await expect(noteItem(p, "Code Sample Gamma")).toBeVisible();

    await newNoteBtn(p).click();
    await noteTA(p).fill("# Linking Source Beta\n\nSee ");
    await noteTA(p).pressSequentially("[[Linking");

    await expect(linkOption(p, "Linking Target Alpha")).toBeVisible();
    await expect(linkOption(p, "Linking Decoy Delta")).toBeVisible();

    await noteTA(p).pressSequentially(" alp");
    await expect(linkOption(p, "Linking Decoy Delta")).not.toBeVisible();
    await noteTA(p).press("Enter");

    await expect(linkOption(p, "Linking Target Alpha")).not.toBeVisible();
    await expect(noteTA(p)).toHaveValue(
      `# Linking Source Beta\n\nSee [Linking Target Alpha](${targetId})`,
    );

    // the caret lands right after the link
    await noteTA(p).pressSequentially(" for details.");
    await expect(noteTA(p)).toHaveValue(
      `# Linking Source Beta\n\nSee [Linking Target Alpha](${targetId}) for details.`,
    );

    // Escape closes the list without inserting anything
    await noteTA(p).press("Enter");
    await noteTA(p).pressSequentially("[[");
    await expect(linkOption(p, "Linking Target Alpha")).toBeVisible();
    await noteTA(p).press("Escape");
    await expect(linkOption(p, "Linking Target Alpha")).not.toBeVisible();
    await noteTA(p).press("Backspace");
    await noteTA(p).press("Backspace");
    await noteTA(p).press("Backspace");

    await saveBtn(p).click();
    await expect(noteItem(p, "Linking Source Beta")).toBeVisible();

    // nobody links to the source note
    await expect(backlinksToggler(p)).toHaveText(/^\s*Backlinks$/);
    await backlinksToggler(p).click();
    await expect(p.getByText("No notes link here yet.")).toBeVisible();

    // the drawer stays open while switching notes
    await noteItem(p, "# Linking Target Alpha").click();
    await expect(backlinksToggler(p)).toHaveText(/Backlinks\s*1/);
    await expect(p.getByText("No notes link here yet.")).not.toBeVisible();
    await expect(
      backlinks(p).getByRole("link", { name: /Linking Source Beta/ }),
    ).toBeVisible();
    await expect(
      backlinks(p).getByRole("link", { name: /Code Sample Gamma/ }),
    ).not.toBeVisible();

    await backlinks(p)
      .getByRole("link", { name: /Linking Source Beta/ })
      .click();
    await expect(
      noteArea(p).getByRole("heading", { name: "Linking Source Beta" }),
    ).toBeVisible();
  });

  test("[[ autocomplete filters by note id and picks on click", async ({
    page: p,
  }) => {
    await p.goto("/app/notes");

    await createNote(p, "# Id Lookup Epsilon\n\nFind me by id.");
    await expect(noteItem(p, "Id Lookup Epsilon")).toBeVisible();
    const targetId = await currentNoteId(p);

    await newNoteBtn(p).click();
    await noteTA(p).fill("# Id Lookup Zeta\n\n");
    await noteTA(p).pressSequentially(`[[${targetId}`);

    await linkOption(p, "Id Lookup Epsilon").click();
    await expect(noteTA(p)).toHaveValue(
      `# Id Lookup Zeta\n\n[Id Lookup Epsilon](${targetId})`,
    );
    await saveBtn(p).click();
    await expect(noteItem(p, "Id Lookup Zeta")).toBeVisible();

    // the note being edited is never offered
    await editBtn(p).click();
    await noteTA(p).fill(
      `# Id Lookup Zeta\n\n[Id Lookup Epsilon](${targetId}) `,
    );
    await noteTA(p).pressSequentially("[[Id Lookup");
    await expect(linkOption(p, "Id Lookup Epsilon")).toBeVisible();
    await expect(linkOption(p, "Id Lookup Zeta")).not.toBeVisible();
  });
});
