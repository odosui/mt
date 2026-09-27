import { describe, expect, it } from "vitest";
import { isCrossOriginWrite } from "./crossOrigin.ts";

const DEV_CLIENT = "http://localhost:5173";

function check(method: string, headers: Record<string, string>) {
  return isCrossOriginWrite({ method, headers }, [DEV_CLIENT]);
}

describe("isCrossOriginWrite", () => {
  it("allows reads from anywhere", () => {
    expect(
      check("GET", {
        origin: "https://evil.example",
        "sec-fetch-site": "cross-site",
      }),
    ).toBe(false);
  });

  it("allows same-origin writes", () => {
    expect(
      check("POST", {
        origin: "http://localhost:3000",
        host: "localhost:3000",
        "sec-fetch-site": "same-origin",
      }),
    ).toBe(false);
  });

  it("rejects cross-site writes", () => {
    expect(
      check("POST", {
        origin: "https://evil.example",
        host: "localhost:3000",
        "sec-fetch-site": "cross-site",
      }),
    ).toBe(true);
  });

  it("rejects same-site writes from another port", () => {
    expect(
      check("DELETE", {
        origin: "http://localhost:8080",
        host: "localhost:3000",
        "sec-fetch-site": "same-site",
      }),
    ).toBe(true);
  });

  it("allows trusted origins", () => {
    expect(
      check("PATCH", {
        origin: DEV_CLIENT,
        host: "localhost:3000",
        "sec-fetch-site": "same-site",
      }),
    ).toBe(false);
  });

  it("trusts Sec-Fetch-Site over a rewritten Host (reverse proxy)", () => {
    expect(
      check("POST", {
        origin: "https://mt.example.com",
        host: "127.0.0.1:3042",
        "sec-fetch-site": "same-origin",
      }),
    ).toBe(false);
  });

  it("falls back to comparing Origin with Host", () => {
    expect(
      check("POST", {
        origin: "http://localhost:3000",
        host: "localhost:3000",
      }),
    ).toBe(false);
    expect(
      check("POST", { origin: "https://evil.example", host: "localhost:3000" }),
    ).toBe(true);
    expect(check("POST", { origin: "null", host: "localhost:3000" })).toBe(
      true,
    );
  });

  it("allows non-browser clients", () => {
    expect(check("POST", { host: "localhost:3000" })).toBe(false);
  });
});
