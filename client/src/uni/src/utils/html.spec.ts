import { describe, it, expect } from "vitest";

import { escapeHTML } from "./html";

describe("escapeHTML", () => {
  it("should work", () => {
    expect(escapeHTML("test")).toEqual("test");
    expect(escapeHTML("<a>test</a>")).toEqual("&lt;a&gt;test&lt;/a&gt;");
    expect(escapeHTML("Hello <i>the</i>re <a>test</a>")).toEqual(
      "Hello <i>the</i>re &lt;a&gt;test&lt;/a&gt;"
    );
    expect(
      escapeHTML("Hello <i>the</i>re <a>test</a> and again <i>this</i>")
    ).toEqual(
      "Hello <i>the</i>re &lt;a&gt;test&lt;/a&gt; and again <i>this</i>"
    );
  });
});
