import { expect, test } from "@playwright/test";
import {
  createNote,
  dateOffset,
  notesLink,
  timelineEventCard,
  timelineGroup,
  timelineLink,
} from "./helpers";

test.describe("Timeline", () => {
  test("F5/F6: open timeline from sidebar, empty state, and see events from #timeline notes", async ({
    page: p,
  }) => {
    await p.goto("/app/notes");

    // F5: navigate via the sidebar link
    await timelineLink(p).click();
    await expect(p.getByText("No activity yet")).toBeVisible();

    // F6: create a note tagged #timeline with dated lines
    await notesLink(p).click();
    await createNote(
      p,
      "# Holidays\n\n2099-12-25 Christmas dinner\n2099-01-01 New Year toast\n\n#timeline",
    );

    // Back to timeline — events appear, empty state is gone
    await timelineLink(p).click();
    await expect(p.getByText("No activity yet")).not.toBeVisible();
    await expect(p.getByText("Christmas dinner")).toBeVisible();
    await expect(p.getByText("New Year toast")).toBeVisible();

    // Each event shows its raw date
    await expect(p.getByText("2099-12-25", { exact: true })).toBeVisible();

    // Hovering the date reveals a relative-time tooltip (via title attr)
    await expect(
      p.getByText("2099-12-25", { exact: true }),
    ).toHaveAttribute("title", /years|months|days/);

    // Each event links back to the source note
    const noteLink = p.getByRole("link", { name: "Holidays" }).first();
    await expect(noteLink).toBeVisible();
    await noteLink.click();
    await expect(p).toHaveURL(/\/app\/notes\/\d+/);
  });

  test("F7: events are grouped into time-period sections and groups can collapse", async ({
    page: p,
  }) => {
    await p.goto("/app/notes");

    const today = dateOffset(0);
    const tomorrow = dateOffset(1);

    await createNote(
      p,
      `# Schedule\n\n${today} Standup today\n${tomorrow} Standup tomorrow\n2099-06-15 Far future trip\n2000-01-01 Old retro\n\n#timeline`,
    );

    await timelineLink(p).click();

    // Each event lands in its own group (scoped to the section heading)
    await expect(
      timelineGroup(p, /^Today/).getByText("Standup today"),
    ).toBeVisible();
    await expect(
      timelineGroup(p, /^Tomorrow/).getByText("Standup tomorrow"),
    ).toBeVisible();
    await expect(
      timelineGroup(p, /^Future Events/).getByText("Far future trip"),
    ).toBeVisible();
    await expect(
      timelineGroup(p, /^Passed Events/).getByText("Old retro"),
    ).toBeVisible();

    // Collapse "Today" by clicking its heading
    const todayHeading = p.getByRole("heading", { level: 2, name: /^Today/ });
    await todayHeading.click();
    await expect(timelineGroup(p, /^Today/)).toHaveClass(/collapsed/);

    // Re-expand
    await todayHeading.click();
    await expect(timelineGroup(p, /^Today/)).not.toHaveClass(/collapsed/);
  });

  test("F8: filter timeline by year", async ({ page: p }) => {
    await p.goto("/app/notes");

    await createNote(
      p,
      "# Timeline by year\n\n2042-05-10 Event in forty-two\n2099-05-10 Event in ninety-nine\n\n#timeline",
    );

    await timelineLink(p).click();

    // Default ALL — both visible
    await expect(p.getByText("Event in forty-two")).toBeVisible();
    await expect(p.getByText("Event in ninety-nine")).toBeVisible();

    // Filter to 2042
    await p.getByRole("button", { name: "2042", exact: true }).click();
    await expect(p.getByText("Event in forty-two")).toBeVisible();
    await expect(p.getByText("Event in ninety-nine")).not.toBeVisible();

    // Filter to 2099
    await p.getByRole("button", { name: "2099", exact: true }).click();
    await expect(p.getByText("Event in ninety-nine")).toBeVisible();
    await expect(p.getByText("Event in forty-two")).not.toBeVisible();

    // Back to ALL
    await p.getByRole("button", { name: "ALL", exact: true }).click();
    await expect(p.getByText("Event in forty-two")).toBeVisible();
    await expect(p.getByText("Event in ninety-nine")).toBeVisible();
  });

  test("F9: #color tag drives the event border color", async ({ page: p }) => {
    await p.goto("/app/notes");

    await createNote(
      p,
      "# Red trips\n\n2099-01-01 Red marker event\n\n#timeline #color=red",
    );

    await timelineLink(p).click();

    // The card carrying the event has a red left border applied inline
    await expect(timelineEventCard(p, "Red marker event")).toHaveAttribute(
      "style",
      /red/,
    );
  });
});
